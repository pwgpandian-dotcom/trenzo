'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

export default function BecomeSellerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    shop_name: '', shop_description: '',
    shop_address: '', city: '',
    state: 'Tamil Nadu', pincode: '', phone: '',
  })
  const supabase = createClient()

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return }
    if (form.pincode.length !== 6) { toast.error('Pincode must be 6 digits'); return }
    if (form.phone.length !== 10) { toast.error('Phone must be 10 digits'); return }
    setLoading(true)
    const { error } = await supabase.from('sellers').upsert({
      id: user.id,
      ...form,
      status: 'pending',
    }, { onConflict: 'id' })
    if (error) {
      console.error('[become-seller]', JSON.stringify({ msg: error?.message, code: error?.code, details: error?.details, hint: error?.hint }))
      toast.error(error.message || error.details || error.code || 'Failed to submit')
      setLoading(false)
      return
    }
    setSubmitted(true)
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    borderRadius: 14, border: '1.5px solid var(--line)',
    fontSize: 14, background: 'var(--bg)', color: 'var(--ink)',
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          background: '#fff', borderRadius: 24, padding: 32,
          textAlign: 'center', boxShadow: 'var(--sh2)', maxWidth: 360, width: '100%',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: 'bounceIn .5s ease' }}>✅</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)', marginBottom: 8 }}>Application submitted!</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Admin will review in 1-2 days</p>
          <Link href="/">
            <button style={{
              background: 'transparent', border: '1.5px solid var(--i)',
              color: 'var(--i)', borderRadius: 999, padding: '12px 28px',
              fontSize: 14, fontWeight: 700,
            }}>Go to Home</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--ig)', padding: '48px 24px 72px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0 }}>Sell on TRENZO</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['✓ Free to list', '✓ COD available', '✓ Only 8% fee'].map(b => (
            <span key={b} style={{
              background: 'rgba(255,255,255,.2)', color: '#fff',
              borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 700,
            }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: 'var(--bg)', borderRadius: '24px 24px 0 0', marginTop: -24,
        padding: '32px 20px 64px', maxWidth: 480, margin: '-24px auto 0',
      }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 20px', boxShadow: 'var(--sh2)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="text" placeholder="Shop name *" value={form.shop_name}
              onChange={set('shop_name')} required style={inputStyle} />
            <textarea placeholder="Shop description (optional)" value={form.shop_description}
              onChange={set('shop_description')} rows={3}
              style={{ ...inputStyle, resize: 'none' }} />
            <input type="text" placeholder="Address Line 1 *" value={form.shop_address}
              onChange={set('shop_address')} required style={inputStyle} />
            <input type="text" placeholder="City *" value={form.city}
              onChange={set('city')} required style={inputStyle} />
            <input type="text" placeholder="State" value={form.state}
              onChange={set('state')} style={inputStyle} />
            <input type="text" placeholder="Pincode (6 digits) *" value={form.pincode}
              onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              required maxLength={6} style={inputStyle} />
            <input type="tel" placeholder="Shop phone (10 digits) *" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              required maxLength={10} style={inputStyle} />
            <button type="submit" disabled={loading}
              style={{
                background: 'var(--rg)', color: '#fff',
                borderRadius: 999, height: 52,
                fontSize: 15, fontWeight: 700, opacity: loading ? .7 : 1,
              }}>{loading ? 'Submitting…' : 'Submit Application'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
