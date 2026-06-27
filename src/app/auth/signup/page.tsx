'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const fullName = nameRef.current?.value?.trim() || ''
    const email = emailRef.current?.value?.trim() || ''
    const phone = phoneRef.current?.value?.trim() || ''
    const password = passwordRef.current?.value || ''

    console.log('[signup] values:', JSON.stringify({ fullName, email, phone: phone.length, role, passwordLen: password.length }))

    if (!fullName) { toast.error('Name required'); return }
    if (!email || !email.includes('@')) { toast.error('Valid email required'); return }
    if (phone.length !== 10) { toast.error('Phone must be 10 digits'); return }
    if (password.length < 6) { toast.error('Password min 6 characters'); return }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, role, phone } },
      })

      const status = (error as any)?.status
      console.log('[signup] raw:', JSON.stringify({ userId: data?.user?.id, session: !!data?.session, errorMsg: error?.message, errorStatus: status }))

      if (error) {
        const errMsg = error.message && error.message !== '{}'
          ? error.message
          : status === 500
            ? 'Server error: database trigger missing. Ask admin to run SQL trigger fix.'
            : `Signup failed (${status ?? 'unknown'})`
        setErrorMsg(errMsg)
        toast.error(errMsg)
        return
      }

      if (!data.user) { setErrorMsg('Signup failed — no user returned. Try again.'); return }

      if (data.session) {
        toast.success('Account created! Welcome to TRENZO 🎉')
        if (role === 'seller') router.replace('/become-seller')
        else router.replace('/')
      } else {
        toast.success('Check your email to confirm, then log in.', { duration: 8000 })
        router.replace('/auth/login')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error'
      console.error('[signup] unexpected:', err)
      setErrorMsg(msg)
      toast.error(msg)
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 20,
            background: 'linear-gradient(135deg,#2D1F8C,#5B4FCF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff',
            boxShadow: 'var(--shi)', marginBottom: 16,
          }}>T</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Join TRENZO</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Tamil Nadu's trending marketplace</p>
        </div>

        {/* Error banner — only shown when there's a real error */}
        {errorMsg && (
          <div style={{
            background: '#FFF0F0', border: '1.5px solid #FFCDD2',
            borderRadius: 12, padding: '12px 14px',
            fontSize: 13, color: '#C62828', fontWeight: 600, marginBottom: 16,
          }}>{errorMsg}</div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input ref={nameRef} type="text" placeholder="Full name" defaultValue="" autoComplete="name" required style={inp} />
          <input ref={emailRef} type="email" placeholder="Email address" defaultValue="" autoComplete="email" required style={inp} />
          <input ref={phoneRef} type="tel" placeholder="Phone (10 digits)" defaultValue="" autoComplete="tel" maxLength={10} required style={inp} />
          <div style={{ position: 'relative' }}>
            <input
              ref={passwordRef} type={showPw ? 'text' : 'password'}
              placeholder="Password (min 6 chars)" defaultValue=""
              autoComplete="new-password" required
              style={{ ...inp, paddingRight: 48 }}
            />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', fontSize: 16,
            }}>{showPw ? '🙈' : '👁️'}</button>
          </div>

          {/* Role segmented control */}
          <div style={{ display: 'flex', gap: 0, background: '#F4F2FF', borderRadius: 14, padding: 4 }}>
            {([['buyer', '🛍️ I want to Buy'], ['seller', '🏪 I want to Sell']] as const).map(([r, label]) => (
              <button key={r} type="button" onClick={() => setRole(r)} style={{
                flex: 1, padding: '12px 8px', borderRadius: 11,
                fontSize: 13, fontWeight: 700,
                background: role === r ? 'var(--brand)' : 'transparent',
                color: role === r ? '#fff' : 'var(--text-muted)',
                transition: 'all .15s',
              }}>{label}</button>
            ))}
          </div>

          <button type="submit" disabled={loading} style={{
            background: 'linear-gradient(135deg,#2D1F8C,#5B4FCF)',
            color: '#fff', borderRadius: 999, height: 52,
            fontSize: 15, fontWeight: 700, opacity: loading ? .7 : 1,
            boxShadow: 'var(--shi)', marginTop: 4,
          }}>{loading ? 'Creating account…' : 'Create Account'}</button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 20 }}>
          Already have account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
