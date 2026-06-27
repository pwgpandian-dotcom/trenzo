'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import OrderTimeline from '@/components/OrderTimeline'
import BottomNav from '@/components/BottomNav'

type Order = {
  id: number; order_number: string; total_amount: number; subtotal: number
  payment_method: string; payment_status: string; order_status: string
  shipping_name: string; shipping_phone: string; shipping_address_line1: string
  shipping_address_line2?: string; shipping_city: string; shipping_state: string
  shipping_pincode: string; created_at: string
  order_items: {
    id: number; product_name: string; product_image?: string
    quantity: number; price_at_order: number; item_status: string
  }[]
}

const statusColor: Record<string, string> = {
  placed: 'var(--is)', confirmed: '#EEF9FF',
  shipped: '#FFF4EC', delivered: 'var(--grs)', cancelled: 'var(--rds)',
}

export default function OrderDetailPage() {
  const { order_number } = useParams<{ order_number: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('orders')
      .select('*, order_items(id,product_name,product_image,quantity,price_at_order,item_status)')
      .eq('order_number', order_number).single()
      .then(({ data }) => setOrder(data))
  }, [order_number])

  return (
    <div style={{ paddingBottom: 80, maxWidth: 480, margin: '0 auto' }}>
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--line)',
        padding: '26px 14px 12px', position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>Order Details</h1>
      </div>

      {!order ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
      ) : (
        <div style={{ padding: '16px 14px' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
            #{order.order_number} · {new Date(order.created_at).toLocaleDateString('en-IN')}
          </div>

          <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--sh1)', padding: '12px 14px', marginBottom: 14 }}>
            <OrderTimeline currentStatus={order.order_status} />
          </div>

          {/* Shipping */}
          <div style={{ background: 'var(--is)', borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 8 }}>📍 Delivery to:</div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700 }}>{order.shipping_name}</div>
              <div>{order.shipping_address_line1}</div>
              {order.shipping_address_line2 && <div>{order.shipping_address_line2}</div>}
              <div>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</div>
              <div>📞 {order.shipping_phone}</div>
            </div>
          </div>

          {/* Items */}
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--sh1)', overflow: 'hidden', marginBottom: 14 }}>
            {order.order_items.map((item, idx) => (
              <div key={item.id} style={{
                display: 'flex', gap: 12, padding: '12px 14px',
                borderBottom: idx < order.order_items.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, background: 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.product_image
                    ? <img src={item.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                    : <span style={{ fontSize: 24 }}>📦</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 2 }}>{item.product_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Qty: {item.quantity} × ₹{item.price_at_order.toLocaleString('en-IN')}</div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, borderRadius: 999,
                    padding: '3px 10px', background: statusColor[item.item_status] ?? 'var(--is)',
                    color: 'var(--ink)',
                  }}>{item.item_status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment */}
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--sh1)', padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--ink2)' }}>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: 'var(--ink2)' }}>Delivery</span>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>FREE</span>
            </div>
            <div style={{ height: 1, background: 'var(--line)', marginBottom: 10 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900 }}>
              <span>Total</span>
              <span style={{ color: 'var(--i)' }}>₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
              Payment: {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '✓ Paid online'}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button style={{
              background: 'transparent', border: '1.5px solid var(--line)',
              color: 'var(--ink2)', borderRadius: 999, padding: '12px 28px',
              fontSize: 13, fontWeight: 700,
            }}>Contact Support</button>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
}
