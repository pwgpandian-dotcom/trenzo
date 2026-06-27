'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import EmptyState from '@/components/EmptyState'

type EarningRow = {
  id: number; order_id: number; order_number: string; created_at: string
  product_name: string; quantity: number; item_total: number
  commission_amount: number; seller_payout: number; item_status: string
  orders: { created_at: string }
}

const FILTERS = ['This Week', 'This Month', 'All Time']

export default function SellerEarningsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<EarningRow[]>([])
  const [filter, setFilter] = useState('This Month')
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    supabase.from('order_items')
      .select('*, orders(created_at)')
      .eq('seller_id', user.id)
      .neq('item_status', 'cancelled')
      .order('id', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [user])

  const now = new Date()
  const filtered = items.filter(i => {
    const d = new Date(i.orders?.created_at)
    if (filter === 'This Week') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
      return d >= weekAgo
    }
    if (filter === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return true
  })

  const gross = filtered.reduce((s, i) => s + i.item_total, 0)
  const commission = filtered.reduce((s, i) => s + i.commission_amount, 0)
  const net = filtered.reduce((s, i) => s + i.seller_payout, 0)

  const downloadCSV = () => {
    const rows = [
      ['Order', 'Date', 'Product', 'Qty', 'Gross', 'Fee', 'Net', 'Status'],
      ...filtered.map(i => [
        i.order_number ?? i.order_id,
        new Date(i.orders?.created_at).toLocaleDateString('en-IN'),
        i.product_name, i.quantity, i.item_total, i.commission_amount, i.seller_payout, i.item_status,
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'trenzo-earnings.csv'; a.click()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
          <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>Earnings</h1>
        </div>
        <button onClick={downloadCSV} style={{ background: 'transparent', border: '1.5px solid var(--line)', color: 'var(--ink2)', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>
          Download CSV ↓
        </button>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px' }}>
        {/* Earnings hero */}
        <div style={{ background: 'linear-gradient(135deg,#0D0A2B,#1A1040)', borderRadius: 20, padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 700 }}>GROSS SALES</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>₹{gross.toFixed(0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 700 }}>TRENZO FEE (8%)</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>− ₹{commission.toFixed(0)}</span>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.1)', marginBottom: 8 }} />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 700, marginBottom: 4 }}>NET PAYOUT</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--rl)' }}>₹{net.toFixed(0)}</div>
          <div style={{ fontSize: 11, color: '#FBBF24', marginTop: 8 }}>⚠ Next settlement: Manual · Contact admin</div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                flex: 1, borderRadius: 999, padding: '8px 0', fontSize: 11, fontWeight: 700,
                background: filter === f ? 'var(--i)' : '#fff',
                color: filter === f ? '#fff' : 'var(--ink2)',
                border: '1.5px solid ' + (filter === f ? 'var(--i)' : 'var(--line)'),
              }}>{f}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState emoji="💰" title="No earnings yet" subtitle="Complete orders to see earnings here" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(item => (
              <div key={item.id} style={{ background: '#fff', borderRadius: 16, padding: '12px 14px', boxShadow: 'var(--sh1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{item.product_name}</span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(item.orders?.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--ink2)' }}>Gross ₹{item.item_total.toFixed(0)} · Fee ₹{item.commission_amount.toFixed(0)}</span>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>₹{item.seller_payout.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
