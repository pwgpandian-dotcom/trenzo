'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Order = {
  id: number; order_number: string; total_amount: number
  payment_method: string; payment_status: string
  shipping_name: string; shipping_phone: string
  shipping_address_line1: string; shipping_address_line2?: string
  shipping_city: string; shipping_state: string; shipping_pincode: string
  order_items: {
    id: number; product_name: string; quantity: number; price_at_order: number; product_image?: string
  }[]
}

export default function OrderSuccessPage() {
  const { order_number } = useParams<{ order_number: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('orders')
      .select('*, order_items(id,product_name,quantity,price_at_order,product_image)')
      .eq('order_number', order_number).single()
      .then(({ data }) => setOrder(data))
  }, [order_number])

  return (
    <div style={{ minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      {/* Split hero */}
      <div style={{
        background: 'var(--ig)',
        padding: '60px 24px 80px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '999px',
          background: 'var(--green)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 16px',
          animation: 'bounceIn .5s ease',
          boxShadow: '0 8px 24px rgba(16,185,129,.35)',
        }}>✅</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Order Confirmed! 🎉</h1>
        <span style={{
          background: 'rgba(255,255,255,.2)', color: '#fff',
          borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700,
        }}>#{order_number}</span>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, marginTop: 10 }}>
          Estimated delivery: 3-5 business days
        </p>
      </div>

      {/* White card */}
      <div style={{
        background: '#fff', borderRadius: '24px 24px 0 0',
        marginTop: -24, padding: '24px 20px 48px',
        boxShadow: 'var(--sh2)',
      }}>
        {order ? (
          <>
            {/* Items */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Items</h3>
            {order.order_items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--ink2)' }}>{item.product_name} × {item.quantity}</span>
                <span style={{ fontWeight: 700 }}>₹{(item.price_at_order * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />

            {/* Shipping */}
            <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>📍 Deliver to:</div>
              <div>{order.shipping_name}</div>
              <div>{order.shipping_address_line1}{order.shipping_address_line2 ? ', ' + order.shipping_address_line2 : ''}</div>
              <div>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 12 }}>
              {order.payment_method === 'cod'
                ? '💵 Pay on delivery'
                : '✓ Paid online'}
            </div>
            <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900 }}>
              <span>Total</span>
              <span style={{ color: 'var(--i)' }}>₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>Loading…</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
          <Link href={`/orders/${order_number}`} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', background: 'var(--ig)', color: '#fff',
              borderRadius: 999, height: 50, fontSize: 14, fontWeight: 700,
            }}>Track Order</button>
          </Link>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', background: 'transparent',
              border: '1.5px solid var(--line)', color: 'var(--ink2)',
              borderRadius: 999, height: 50, fontSize: 14, fontWeight: 700,
            }}>Continue Shopping</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
