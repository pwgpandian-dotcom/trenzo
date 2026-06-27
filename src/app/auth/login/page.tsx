'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = emailRef.current?.value?.trim() || ''
    const password = passwordRef.current?.value || ''
    console.log('[login] attempting:', email)
    if (!email || !password) { toast.error('Email and password required'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { toast.error(error.message); return }
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
      const role = profile?.role
      console.log('[login] success, role:', role)
      if (role === 'admin') router.replace('/admin')
      else if (role === 'seller') router.replace('/seller')
      else router.replace('/')
    } catch (err) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    borderRadius: 14, border: '1.5px solid var(--border)',
    fontSize: 14, background: '#FAFAFE', color: 'var(--text-primary)',
    fontWeight: 500,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 20,
            background: 'linear-gradient(135deg,#2D1F8C,#5B4FCF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff',
            boxShadow: 'var(--shi)', marginBottom: 16,
          }}>T</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Welcome back 👋</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Sign in to continue shopping</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            ref={emailRef} type="email" placeholder="Email address"
            defaultValue="" autoComplete="email" required style={inp}
          />
          <div style={{ position: 'relative' }}>
            <input
              ref={passwordRef} type={showPw ? 'text' : 'password'}
              placeholder="Password" defaultValue=""
              autoComplete="current-password" required
              style={{ ...inp, paddingRight: 48 }}
            />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', fontSize: 16,
            }}>{showPw ? '🙈' : '👁️'}</button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Link href="/auth/forgot" style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading} style={{
            background: 'linear-gradient(135deg,#2D1F8C,#5B4FCF)',
            color: '#fff', borderRadius: 999, height: 52,
            fontSize: 15, fontWeight: 700, opacity: loading ? .7 : 1,
            boxShadow: 'var(--shi)',
          }}>{loading ? 'Signing in…' : 'Continue'}</button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', margin: '20px 0 0' }}>
          🏆 Join 10,000+ Tamil Nadu shoppers
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          New to TRENZO?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
            Create account →
          </Link>
        </p>
      </div>
    </div>
  )
}
