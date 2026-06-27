'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import EmptyState from '@/components/EmptyState'
import BottomNav from '@/components/BottomNav'

const categoryBg: Record<string, string> = {
  fashion: '#FDF0F8', electronics: '#EFF9FF', groceries: '#EDFBF1',
  home: '#FFFBEB', beauty: '#F9F0FF', handmade: '#FFF4EC',
}

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart()

  return (
    <div style={{ paddingBottom: 80, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--line)',
        padding: '26px 14px 12px', position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Link href="/" style={{ fontSize: 20, textDecoration: 'none' }}>←</Link>
        <h1 style={{ flex: 1, fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>
          My Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
        </h1>
      </div>

      {items.length === 0 ? (
        <EmptyState emoji="🛒" title="Your cart is empty"
          subtitle="Discover trending products" ctaLabel="Browse Products" ctaHref="/" />
      ) : (
        <div style={{ padding: '16px 14px' }}>
          {/* Items */}
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--sh1)', overflow: 'hidden', marginBottom: 16 }}>
            {items.map((item, idx) => {
              const bg = categoryBg[item.category ?? ''] ?? '#F8F7FF'
              return (
                <div key={item.id} style={{
                  display: 'flex', gap: 12, padding: '14px 16px',
                  borderBottom: idx < items.length - 1 ? '1px solid var(--line)' : 'none',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 12, background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden',
                  }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 28 }}>📦</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{item.shop_name}</div>
                    <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--ink)', marginBottom: 8 }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--line)', borderRadius: 999 }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)}
                          style={{ width: 30, height: 30, background: 'none', fontSize: 16, color: 'var(--ink2)' }}>−</button>
                        <span style={{ width: 28, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)}
                          style={{ width: 30, height: 30, background: 'none', fontSize: 16, color: 'var(--i)' }}>+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)}
                        style={{ background: 'none', color: 'var(--r)', fontSize: 12, fontWeight: 700 }}>🗑 Remove</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Promo banner */}
          <div style={{
            background: total >= 499 ? 'var(--grs)' : '#FFFBEB',
            border: `1.5px solid ${total >= 499 ? 'var(--green)' : '#FCD34D'}`,
            borderRadius: 14, padding: '10px 14px', fontSize: 13, fontWeight: 600,
            color: total >= 499 ? 'var(--green)' : '#92400E', marginBottom: 16,
          }}>
            {total >= 499
              ? '🎉 You qualify for FREE delivery!'
              : `Add ₹${(499 - total).toLocaleString('en-IN')} more for FREE delivery`}
          </div>

          {/* Trust logos */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
              {['UPI', 'Visa', 'MC', 'Paytm'].map(logo => (
                <span key={logo} style={{
                  background: '#fff', border: '1px solid var(--line)', borderRadius: 8,
                  padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--ink2)',
                }}>{logo}</span>
              ))}
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>🔒 100% Secure Payments</span>
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--is)', borderRadius: 18, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--ink2)' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: 'var(--ink2)' }}>Delivery</span>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>FREE</span>
            </div>
            <div style={{ height: 1, background: 'var(--line)', marginBottom: 10 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900 }}>
              <span style={{ color: 'var(--ink)' }}>Total</span>
              <span style={{ color: 'var(--i)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Link href="/checkout" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', background: 'var(--rg)', color: '#fff',
              borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700,
            }}>Proceed to Checkout →</button>
          </Link>
        </div>
      )}
      <BottomNav />
    </div>
  )
}
