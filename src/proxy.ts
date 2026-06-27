import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // Always pass through — never redirect these, even for logged-in users
  const bypassPaths = ['/auth/signout', '/auth/callback', '/api/']
  if (bypassPaths.some(p => pathname.startsWith(p))) return response

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return response

  let user: { id: string } | null = null

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })

    const { data } = await supabase.auth.getUser()
    user = data.user

    // Auth pages — redirect logged-in users to their home
    if (pathname.startsWith('/auth/') && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
      if (role === 'seller') return NextResponse.redirect(new URL('/seller', request.url))
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Protected routes — must be logged in
    const protectedPaths = ['/checkout', '/orders', '/cart']
    const isProtected = protectedPaths.some(p => pathname.startsWith(p))
    if (isProtected && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (!user) return response

    // Fetch profile for role-based routing
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // /admin/* — must be admin
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // /seller/* — must be seller (admin gets redirected to their own dashboard)
    if (pathname.startsWith('/seller') && role !== 'seller') {
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Seller-specific: check if approved
    if (pathname.startsWith('/seller') && !pathname.startsWith('/seller/pending')) {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('status')
        .eq('id', user.id)
        .single()

      if (sellerData?.status === 'pending') {
        return NextResponse.redirect(new URL('/seller/pending', request.url))
      }
    }
  } catch (err) {
    console.error('[proxy] auth check failed, passing through:', err)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
