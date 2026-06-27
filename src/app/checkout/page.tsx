'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

declare global {
  interface Window { Razorpay: any }
}

type Shipping = {
  name: string; phone: string; address1: string; address2: string
  city: string; state: string; pincode: string
}

const STEPS = ['Address', 'Payment', 'Processing']

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [payMethod, setPayMethod] = useState<'cod' | 'online'>('cod')
  const [loading, setLoading] = useState(false)
  const [ship, setShip] = useState<Shipping>({
    name: '', phone: '', address1: '', address2: '', city: '', state: 'Tamil Nadu', pincode: '',
  })
  const set = (k: keyof Shipping) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setShip(s => ({ ...s, [k]: e.target.value }))

  const hasRazorpay = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

  const valid = ship.name && ship.phone.length === 10 && ship.address1 &&
    ship.city && ship.state && ship.pincode.length === 6

  const placeCOD = async () => {
    setStep(2)
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipping: { name: ship.name, phone: ship.phone, address1: ship.address1, address2: ship.address2, city: ship.city, state: ship.state, pincode: ship.pincode },
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        payment_method: 'cod',
      }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Order failed'); setStep(1); return }
    clearCart()
    router.replace(`/orders/success/${data.order_number}`)
  }

  const placeOnline = async () => {
    setStep(2)
    const orderRes = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_paise: Math.round(total * 100), receipt: `TRZ-${Date.now()}` }),
    })
    const rzp = await orderRes.json()
    if (!orderRes.ok) { toast.error('Payment init failed'); setStep(1); return }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    document.body.appendChild(script)
    script.onload = () => {
      const handler = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzp.amount, currency: rzp.currency,
        order_id: rzp.id, name: 'TRENZO',
        description: 'Order payment',
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_data: {
                shipping: ship, items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
              },
            }),
          })
          const vData = await verifyRes.json()
          if (verifyRes.ok) { clearCart(); router.replace(`/orders/success/${vData.order_number}`) }
          else { toast.error('Payment verification failed'); setStep(1) }
        },
        modal: { ondismiss: () => { toast('Payment cancelled'); setStep(1) } },
        prefill: { name: ship.name, contact: ship.phone },
        theme: { color: '#4F3FD4' },
      })
      handler.open()
    }
  }

  const handlePlace = () => {
    if (payMethod === 'cod') placeCOD()
    else placeOnline()
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    borderRadius: 14, border: '1.5px solid var(--line)',
    fontSize: 14, background: 'var(--bg)', color: 'var(--ink)',
  }

  return (
    <div style={{ minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--line)',
        padding: '26px 14px 12px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          style={{ background: 'none', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>Checkout</h1>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 14px' }}>
        {STEPS.slice(0, 2).map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              background: i === step ? 'var(--i)' : i < step ? 'var(--green)' : 'var(--line)',
              color: i <= step ? '#fff' : 'var(--muted)',
              borderRadius: 999, padding: '6px 0', fontSize: 11, fontWeight: 700,
            }}>
              {i < step ? '✓ ' : `${i + 1}. `}{s}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 14px' }}>
        {/* Step 0: Address */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 900, color: 'var(--ink)' }}>Delivery Address</h2>
            <input placeholder="Full name *" value={ship.name} onChange={set('name')} style={inputStyle} />
            <div style={{ position: 'relative' }}>
              <input placeholder="Phone *" value={ship.phone}
                onChange={e => setShip(s => ({ ...s, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                style={{ ...inputStyle, paddingRight: 36 }} />
              {ship.phone.length === 10 && (
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--green)', fontSize: 16 }}>✓</span>
              )}
            </div>
            <input placeholder="House/Flat, Building *" value={ship.address1} onChange={set('address1')} style={inputStyle} />
            <input placeholder="Street, Landmark (optional)" value={ship.address2} onChange={set('address2')} style={inputStyle} />
            <input placeholder="City *" value={ship.city} onChange={set('city')} style={inputStyle} />
            <input placeholder="State" value={ship.state} onChange={set('state')} style={inputStyle} />
            <div style={{ position: 'relative' }}>
              <input placeholder="Pincode *" value={ship.pincode}
                onChange={e => setShip(s => ({ ...s, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                style={{ ...inputStyle, paddingRight: 36 }} />
              {ship.pincode.length === 6 && (
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--green)', fontSize: 16 }}>✓</span>
              )}
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={!valid}
              style={{
                background: valid ? 'var(--ig)' : 'var(--line)', color: '#fff',
                borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700,
                opacity: valid ? 1 : .6,
              }}>Continue →</button>
          </div>
        )}

        {/* Step 1: Payment */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Summary */}
            <div style={{ background: 'var(--is)', borderRadius: 16, padding: '12px 14px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                {items.length} items · ₹{total.toLocaleString('en-IN')}
              </div>
              {items.map(i => (
                <div key={i.id} style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 2 }}>
                  {i.name} × {i.quantity} — ₹{(i.price * i.quantity).toLocaleString('en-IN')}
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 15, fontWeight: 900, color: 'var(--ink)' }}>Payment Method</h2>

            {/* COD */}
            <div
              onClick={() => setPayMethod('cod')}
              style={{
                background: payMethod === 'cod' ? 'var(--is)' : '#fff',
                border: `1.5px solid ${payMethod === 'cod' ? 'var(--i)' : 'var(--line)'}`,
                borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
              }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>💵 Cash on Delivery</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Pay when your order arrives · No extra charge</div>
            </div>

            {/* Online */}
            {hasRazorpay && (
              <div
                onClick={() => setPayMethod('online')}
                style={{
                  background: payMethod === 'online' ? 'var(--is)' : '#fff',
                  border: `1.5px solid ${payMethod === 'online' ? 'var(--i)' : 'var(--line)'}`,
                  borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
                }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>📱 Online Payment</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>UPI · Cards via Razorpay</div>
              </div>
            )}

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
              🔒 Secure checkout · TRENZO Buyer Protection
            </div>

            <button
              onClick={handlePlace} disabled={loading}
              style={{
                background: 'var(--rg)', color: '#fff',
                borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700,
              }}>Place Order · ₹{total.toLocaleString('en-IN')}</button>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', marginBottom: 8 }}>Creating your order…</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Please wait, do not close this page</p>
          </div>
        )}
      </div>
    </div>
  )
}
