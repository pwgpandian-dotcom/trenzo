'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'
import SkeletonCard from '@/components/SkeletonCard'

type Order = {
  id: number; order_number: string; total_amount: number
  order_status: string; created_at: string
  order_items: { product_name: string }[]
}

const TABS = ['All', 'Active', 'Delivered', 'Cancelled']

const statusColor: Record<string, { bg: string; color: string }> = {
  placed: { bg: 'var(--is)', color: 'var(--i)' },
  confirmed: { bg: '#EEF9FF', color: '#0EA5E9' },
  shipped: { bg: '#FFF4EC', color: '#F97316' },
  delivered: { bg: 'var(--grs)', color: 'var(--green)' },
  cancelled: { bg: 'var(--rds)', color: 'var(--red)' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('orders')
        .select('id,order_number,total_amount,order_status,created_at,order_items(product_name)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = orders.filter(o => {
    if (tab === 'All') return true
    if (tab === 'Active') return ['placed', 'confirmed', 'shipped'].includes(o.order_status)
    if (tab === 'Delivered') return o.order_status === 'delivered'
    if (tab === 'Cancelled') return o.order_status === 'cancelled'
    return true
  })

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar />
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ padding: '16px 14px 0' }}>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', marginBottom: 14 }}>My Orders</h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  borderRadius: 999, padding: '8px 18px', fontSize: 12, fontWeight: 700,
                  background: tab === t ? 'var(--i)' : '#fff',
                  color: tab === t ? '#fff' : 'var(--ink2)',
                  border: '1.5px solid ' + (tab === t ? 'var(--i)' : 'var(--line)'),
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>{t}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState emoji="📦" title="No orders yet" subtitle="Start shopping to see your orders here" ctaLabel="Browse Products" ctaHref="/" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(order => {
                const sc = statusColor[order.order_status] ?? { bg: 'var(--is)', color: 'var(--i)' }
                return (
                  <Link key={order.id} href={`/orders/${order.order_number}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#fff', borderRadius: 18, boxShadow: 'var(--sh1)',
                      padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>#{order.order_number}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                        {order.order_items.map(i => i.product_name).join(', ').slice(0, 60)}
                        {order.order_items.length > 1 ? ` +${order.order_items.length - 1} more` : ''}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--i)' }}>
                          ₹{order.total_amount.toLocaleString('en-IN')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            background: sc.bg, color: sc.color,
                            borderRadius: 999, fontSize: 10, fontWeight: 700,
                            padding: '4px 10px', textTransform: 'capitalize',
                          }}>{order.order_status}</span>
                          <span style={{ fontSize: 11, color: 'var(--i)', fontWeight: 700 }}>View →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
