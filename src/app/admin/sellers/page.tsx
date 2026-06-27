'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'

type Seller = {
  id: string; shop_name: string; city: string; status: string; created_at: string
  rejection_reason?: string; total_sales: number; total_orders: number
}

const TABS = ['All', 'Pending', 'Approved', 'Rejected']

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#FFFBEB', color: '#D97706' },
  approved: { bg: 'var(--grs)', color: 'var(--green)' },
  rejected: { bg: 'var(--rds)', color: 'var(--red)' },
}

export default function AdminSellersPage() {
  const router = useRouter()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [rejectModal, setRejectModal] = useState<{ open: boolean; sellerId: string }>({ open: false, sellerId: '' })
  const [rejectReason, setRejectReason] = useState('')
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('sellers').select('*').order('created_at', { ascending: false })
    setSellers(data ?? [])
  }

  useEffect(() => { load() }, [])

  const filtered = sellers.filter(s => {
    const matchTab = tab === 'All' || s.status === tab.toLowerCase()
    const matchSearch = !search || s.shop_name.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const approve = async (id: string) => {
    await supabase.from('sellers').update({ status: 'approved' }).eq('id', id)
    toast.success('Approved!')
    load()
  }

  const reject = async () => {
    await supabase.from('sellers').update({ status: 'rejected', rejection_reason: rejectReason }).eq('id', rejectModal.sellerId)
    toast.success('Rejected')
    setRejectModal({ open: false, sellerId: '' }); setRejectReason(''); load()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>Sellers</h1>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px' }}>
        <input placeholder="Search by shop name…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px 18px', borderRadius: 999, border: '1.5px solid var(--line)', fontSize: 14, background: '#fff', marginBottom: 12 }} />

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                borderRadius: 999, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                background: tab === t ? 'var(--i)' : '#fff',
                color: tab === t ? '#fff' : 'var(--ink2)',
                border: '1.5px solid ' + (tab === t ? 'var(--i)' : 'var(--line)'),
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{t}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState emoji="🏪" title="No sellers" subtitle="No sellers in this category" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(s => {
              const sc = statusColors[s.status] ?? { bg: 'var(--is)', color: 'var(--i)' }
              return (
                <div key={s.id} style={{ background: '#fff', borderRadius: 18, boxShadow: 'var(--sh1)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '999px', background: 'var(--is)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--i)' }}>
                      {s.shop_name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{s.shop_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.city} · Joined {new Date(s.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                    <span style={{ background: sc.bg, color: sc.color, borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '4px 10px', textTransform: 'capitalize' }}>{s.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                    Orders: {s.total_orders} · Sales: ₹{(s.total_sales ?? 0).toLocaleString('en-IN')}
                  </div>
                  {s.rejection_reason && (
                    <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>Reason: {s.rejection_reason}</div>
                  )}
                  {s.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => approve(s.id)}
                        style={{ flex: 1, background: 'var(--rg)', color: '#fff', borderRadius: 999, padding: '8px 0', fontSize: 12, fontWeight: 700 }}>Approve</button>
                      <button onClick={() => setRejectModal({ open: true, sellerId: s.id })}
                        style={{ flex: 1, background: 'transparent', border: '1.5px solid var(--red)', color: 'var(--red)', borderRadius: 999, padding: '8px 0', fontSize: 12, fontWeight: 700 }}>Reject</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={rejectModal.open} title="Rejection reason" onClose={() => setRejectModal({ open: false, sellerId: '' })}>
        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="Enter reason…"
          style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--line)', fontSize: 14, resize: 'none', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={reject}
            style={{ flex: 1, background: 'var(--red)', color: '#fff', borderRadius: 999, padding: '12px 0', fontSize: 14, fontWeight: 700 }}>Confirm Reject</button>
          <button onClick={() => setRejectModal({ open: false, sellerId: '' })}
            style={{ flex: 1, background: 'transparent', border: '1.5px solid var(--line)', color: 'var(--ink2)', borderRadius: 999, padding: '12px 0', fontSize: 14, fontWeight: 700 }}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
