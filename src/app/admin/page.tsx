'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import StatCard from '@/components/StatCard'
import Modal from '@/components/Modal'

type Stats = {
  totalRevenue: number; totalOrders: number; totalProducts: number
  totalSellers: number; totalBuyers: number; commission: number
  avgOrderValue: number; pendingSellerCount: number
}

type Seller = { id: string; shop_name: string; city: string; created_at: string; status: string }
type Order = { id: number; order_number: string; total_amount: number; platform_commission: number; order_status: string; payment_method: string; created_at: string; profiles?: { full_name: string } }

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingSellers, setPendingSellers] = useState<Seller[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [rejectModal, setRejectModal] = useState<{ open: boolean; sellerId: string }>({ open: false, sellerId: '' })
  const [rejectReason, setRejectReason] = useState('')
  const [commissionEdit, setCommissionEdit] = useState(false)
  const [commissionRate, setCommissionRate] = useState('8.00')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const [
        { data: orders }, { data: products, count: pCount },
        { data: sellers, count: sCount },
        { data: buyers, count: bCount },
        { data: pendingSel }, { data: recentOrd },
        { data: commData },
      ] = await Promise.all([
        supabase.from('orders').select('total_amount,platform_commission'),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('sellers').select('id', { count: 'exact' }).eq('status', 'approved'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'buyer'),
        supabase.from('sellers').select('id,shop_name,city,created_at,status').eq('status', 'pending'),
        supabase.from('orders').select('id,order_number,total_amount,platform_commission,order_status,payment_method,created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('commission_settings').select('global_rate').eq('id', 1).single(),
      ])
      const totalRevenue = (orders ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0)
      const totalCommission = (orders ?? []).reduce((s, o) => s + (o.platform_commission ?? 0), 0)
      setStats({
        totalRevenue, totalOrders: orders?.length ?? 0,
        totalProducts: pCount ?? 0, totalSellers: sCount ?? 0, totalBuyers: bCount ?? 0,
        commission: totalCommission, avgOrderValue: orders?.length ? totalRevenue / orders.length : 0,
        pendingSellerCount: pendingSel?.length ?? 0,
      })
      setPendingSellers(pendingSel ?? [])
      setRecentOrders(recentOrd ?? [])
      if (commData) setCommissionRate(commData.global_rate.toString())
    }
    load()
  }, [])

  const handleLogout = () => router.push('/auth/signout')

  const approveSeller = async (sellerId: string) => {
    await supabase.from('sellers').update({ status: 'approved' }).eq('id', sellerId)
    toast.success('Seller approved!')
    setPendingSellers(p => p.filter(s => s.id !== sellerId))
  }

  const rejectSeller = async () => {
    await supabase.from('sellers').update({ status: 'rejected', rejection_reason: rejectReason }).eq('id', rejectModal.sellerId)
    toast.success('Seller rejected')
    setPendingSellers(p => p.filter(s => s.id !== rejectModal.sellerId))
    setRejectModal({ open: false, sellerId: '' })
    setRejectReason('')
  }

  const saveCommission = async () => {
    const rate = parseFloat(commissionRate)
    if (isNaN(rate) || rate < 0 || rate > 100) { toast.error('Invalid rate'); return }
    await supabase.from('commission_settings').update({ global_rate: rate, updated_at: new Date().toISOString() }).eq('id', 1)
    toast.success('Rate updated!')
    setCommissionEdit(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      {/* TopBar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 26, height: 26, borderRadius: 9, background: 'var(--rg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>T</span>
          <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--ink)' }}>TRENZO Admin</span>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Logout</button>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px' }}>
        {/* Hero stat */}
        <div style={{ background: 'linear-gradient(135deg,#0D0A2B,#1A1040)', borderRadius: 20, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 700, marginBottom: 4 }}>TOTAL PLATFORM REVENUE</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--rl)', marginBottom: 6 }}>₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            {stats?.totalOrders ?? 0} orders · {stats?.totalProducts ?? 0} products · {stats?.totalSellers ?? 0} sellers · {stats?.totalBuyers ?? 0} buyers
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <StatCard icon="💰" label="Commission Earned" value={`₹${(stats?.commission ?? 0).toFixed(0)}`} accent="var(--r)" />
          <StatCard icon="%" label="Current Rate" value={`${commissionRate}%`} accent="var(--i)" />
          <StatCard icon="📊" label="Avg Order Value" value={`₹${(stats?.avgOrderValue ?? 0).toFixed(0)}`} accent="var(--green)" />
          <StatCard icon="⏳" label="Pending Sellers" value={stats?.pendingSellerCount ?? 0} accent="#D97706" />
        </div>

        {/* Pending sellers */}
        {pendingSellers.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--sh1)', padding: '14px 16px', marginBottom: 16, border: '1.5px solid var(--rs)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--r)', marginBottom: 12 }}>
              ⚠️ {pendingSellers.length} seller{pendingSellers.length !== 1 ? 's' : ''} need approval
            </div>
            {pendingSellers.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '999px', background: 'var(--is)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--i)', flexShrink: 0 }}>
                  {s.shop_name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{s.shop_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.city} · {new Date(s.created_at).toLocaleDateString('en-IN')}</div>
                </div>
                <button onClick={() => approveSeller(s.id)}
                  style={{ background: 'var(--rg)', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 11, fontWeight: 700 }}>Approve</button>
                <button onClick={() => setRejectModal({ open: true, sellerId: s.id })}
                  style={{ background: 'transparent', border: '1.5px solid var(--red)', color: 'var(--red)', borderRadius: 999, padding: '6px 14px', fontSize: 11, fontWeight: 700 }}>Reject</button>
              </div>
            ))}
          </div>
        )}

        {/* Commission settings */}
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--sh1)', padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: commissionEdit ? 12 : 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Commission Rate: {commissionRate}%</span>
            <button onClick={() => setCommissionEdit(!commissionEdit)}
              style={{ background: 'none', color: 'var(--i)', fontSize: 13, fontWeight: 700 }}>✏️ Edit</button>
          </div>
          {commissionEdit && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} min="0" max="100" step="0.5"
                style={{ flex: 1, padding: '10px 14px', borderRadius: 14, border: '1.5px solid var(--line)', fontSize: 14 }} />
              <button onClick={saveCommission}
                style={{ background: 'var(--ig)', color: '#fff', borderRadius: 999, padding: '10px 18px', fontSize: 13, fontWeight: 700 }}>Save</button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: '+ TRENZO Product', href: '/admin/products/new', bg: 'var(--rg)' },
            { label: 'Sellers', href: '/admin/sellers', bg: 'var(--ig)' },
            { label: 'All Orders', href: '/admin/orders', bg: 'linear-gradient(135deg,#0EA5E9,#38BDF8)' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: a.bg, color: '#fff', borderRadius: 16, padding: '12px 10px',
                textAlign: 'center', fontSize: 11, fontWeight: 700, lineHeight: 1.3,
              }}>{a.label}</div>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Recent Orders</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentOrders.map(o => (
            <Link key={o.id} href={`/admin/orders`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: '10px 14px', boxShadow: 'var(--sh1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>#{o.order_number}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--i)' }}>₹{o.total_amount.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 10, color: 'var(--green)' }}>Fee ₹{o.platform_commission.toFixed(0)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Reject modal */}
      <Modal open={rejectModal.open} title="Reason for rejection" onClose={() => setRejectModal({ open: false, sellerId: '' })}>
        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="Enter reason…"
          style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--line)', fontSize: 14, resize: 'none', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={rejectSeller}
            style={{ flex: 1, background: 'var(--red)', color: '#fff', borderRadius: 999, padding: '12px 0', fontSize: 14, fontWeight: 700 }}>Confirm Reject</button>
          <button onClick={() => setRejectModal({ open: false, sellerId: '' })}
            style={{ flex: 1, background: 'transparent', border: '1.5px solid var(--line)', color: 'var(--ink2)', borderRadius: 999, padding: '12px 0', fontSize: 14, fontWeight: 700 }}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
