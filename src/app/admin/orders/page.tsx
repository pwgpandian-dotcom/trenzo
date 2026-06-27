'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import EmptyState from '@/components/EmptyState'
import SkeletonCard from '@/components/SkeletonCard'

type Order = {
  id: number; order_number: string; buyer_id: string; total_amount: number
  platform_commission: number; payment_method: string; order_status: string; created_at: string
}

const STATUS_TABS = ['All', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled']

const statusColor: Record<string, { bg: string; color: string }> = {
  placed: { bg: 'var(--is)', color: 'var(--i)' },
  confirmed: { bg: '#EEF9FF', color: '#0EA5E9' },
  shipped: { bg: '#FFF4EC', color: '#F97316' },
  delivered: { bg: 'var(--grs)', color: 'var(--green)' },
  cancelled: { bg: 'var(--rds)', color: 'var(--red)' },
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false) })
  }, [])

  const filtered = orders.filter(o => {
    const matchTab = tab === 'All' || o.order_status === tab
    const matchSearch = !search || o.order_number.includes(search)
    return matchTab && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>All Orders</h1>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px' }}>
        <input placeholder="Search order number…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px 18px', borderRadius: 999, border: '1.5px solid var(--line)', fontSize: 14, background: '#fff', marginBottom: 12 }} />

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 16 }}>
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                borderRadius: 999, padding: '7px 14px', fontSize: 11, fontWeight: 700,
                background: tab === t ? 'var(--i)' : '#fff',
                color: tab === t ? '#fff' : 'var(--ink2)',
                border: '1.5px solid ' + (tab === t ? 'var(--i)' : 'var(--line)'),
                whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'capitalize',
              }}>{t === 'All' ? 'All' : t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState emoji="🧾" title="No orders" subtitle="Orders will appear here" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(o => {
              const sc = statusColor[o.order_status] ?? { bg: 'var(--is)', color: 'var(--i)' }
              return (
                <Link key={o.id} href={`/orders/${o.order_number}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--sh1)', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>#{o.order_number}</span>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '3px 10px', textTransform: 'capitalize' }}>{o.order_status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>
                        {new Date(o.created_at).toLocaleDateString('en-IN')} · {o.payment_method.toUpperCase()}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, color: 'var(--i)' }}>₹{o.total_amount.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: 10, color: 'var(--green)' }}>Fee ₹{o.platform_commission.toFixed(0)}</div>
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
  )
}
