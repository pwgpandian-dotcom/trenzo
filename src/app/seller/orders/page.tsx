'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import EmptyState from '@/components/EmptyState'
import SkeletonCard from '@/components/SkeletonCard'

type OrderItem = {
  id: number; product_name: string; product_image?: string
  quantity: number; price_at_order: number; seller_payout: number
  item_status: string; tracking_id?: string
  orders: { order_number: string; buyer_id: string; shipping_name: string }
}

const TABS = ['New', 'Shipped', 'Delivered']

const statusMap: Record<string, string[]> = {
  New: ['placed', 'confirmed'],
  Shipped: ['shipped'],
  Delivered: ['delivered'],
}

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('New')
  const [trackingMap, setTrackingMap] = useState<Record<number, string>>({})
  const supabase = createClient()

  const load = async () => {
    if (!user) return
    const { data } = await supabase.from('order_items')
      .select('*, orders(order_number,buyer_id,shipping_name)')
      .eq('seller_id', user.id)
      .order('id', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const updateStatus = async (itemId: number, status: string, tracking?: string) => {
    const res = await fetch(`/api/seller/orders/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tracking_id: tracking }),
    })
    if (res.ok) { toast.success('Updated!'); load() }
    else toast.error('Failed to update')
  }

  const filtered = items.filter(i => statusMap[tab]?.includes(i.item_status))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>Seller Orders</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 14px', background: '#fff', borderBottom: '1px solid var(--line)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, borderRadius: 999, padding: '8px 0', fontSize: 12, fontWeight: 700,
              background: tab === t ? 'var(--i)' : 'var(--bg)',
              color: tab === t ? '#fff' : 'var(--ink2)',
              border: '1.5px solid ' + (tab === t ? 'var(--i)' : 'var(--line)'),
            }}>
            {t} ({items.filter(i => statusMap[t]?.includes(i.item_status)).length})
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState emoji="📦" title="No orders here" subtitle="Orders in this category will appear here" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(item => (
              <div key={item.id} style={{ background: '#fff', borderRadius: 18, boxShadow: 'var(--sh1)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.product_image ? <img src={item.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : <span style={{ fontSize: 24 }}>📦</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 2 }}>{item.product_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Order #{item.orders?.order_number}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                      Buyer: {item.orders?.shipping_name?.split(' ')?.[0]} {item.orders?.shipping_name?.split(' ')?.[1]?.[0]}.
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Qty {item.quantity} × ₹{item.price_at_order.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>You earn: ₹{item.seller_payout.toFixed(0)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: 12 }}>
                  {item.item_status === 'placed' && (
                    <button onClick={() => updateStatus(item.id, 'confirmed')}
                      style={{ background: 'var(--ig)', color: '#fff', borderRadius: 999, padding: '8px 18px', fontSize: 12, fontWeight: 700 }}>
                      Confirm
                    </button>
                  )}
                  {item.item_status === 'confirmed' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        placeholder="Tracking ID (optional)"
                        value={trackingMap[item.id] ?? ''}
                        onChange={e => setTrackingMap(m => ({ ...m, [item.id]: e.target.value }))}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 999, border: '1.5px solid var(--line)', fontSize: 12 }}
                      />
                      <button onClick={() => updateStatus(item.id, 'shipped', trackingMap[item.id])}
                        style={{ background: 'var(--ig)', color: '#fff', borderRadius: 999, padding: '8px 18px', fontSize: 12, fontWeight: 700 }}>
                        Mark Shipped
                      </button>
                    </div>
                  )}
                  {item.item_status === 'shipped' && (
                    <button onClick={() => updateStatus(item.id, 'delivered')}
                      style={{ background: 'var(--green)', color: '#fff', borderRadius: 999, padding: '8px 18px', fontSize: 12, fontWeight: 700 }}>
                      Mark Delivered
                    </button>
                  )}
                  {item.item_status === 'delivered' && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>Delivered ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
