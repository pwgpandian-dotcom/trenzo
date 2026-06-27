'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type SellerData = {
  shop_name: string; city: string; status: string
  total_sales: number; total_orders: number
}

export default function SellerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [seller, setSeller] = useState<SellerData | null>(null)
  const [productCount, setProductCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('sellers').select('*').eq('id', user.id).single(),
      supabase.from('products').select('id', { count: 'exact' }).eq('seller_id', user.id),
    ]).then(([{ data: s }, { count }]) => {
      setSeller(s)
      setProductCount(count ?? 0)
    })
  }, [user])

  const stats = [
    { label: 'Products', value: productCount, icon: '📦', color: '#5B4FCF', bg: '#EEF0FF' },
    { label: 'Orders', value: seller?.total_orders ?? 0, icon: '🧾', color: '#FF5C5C', bg: '#FFF0F0' },
    { label: 'Gross Sales', value: `₹${(seller?.total_sales ?? 0).toLocaleString('en-IN')}`, icon: '💰', color: '#10B981', bg: '#ECFDF5' },
    { label: 'Rating', value: '4.8 ⭐', icon: '⭐', color: '#FBBF24', bg: '#FFFBEB' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--border)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 10,
            background: 'linear-gradient(135deg,#2D1F8C,#5B4FCF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14,
          }}>T</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Seller Hub</span>
        </div>
        <button onClick={() => router.push('/auth/signout')}
          style={{ background: 'none', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          Logout
        </button>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px' }}>

        {/* Shop identity card */}
        {seller && (
          <div style={{
            background: '#fff', borderRadius: 18,
            padding: '16px', boxShadow: 'var(--shadow-card)',
            display: 'flex', alignItems: 'center', gap: 14,
            marginBottom: 16,
            borderLeft: '4px solid var(--brand)',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '999px',
              background: 'var(--brand-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 20, color: 'var(--brand)', flexShrink: 0,
            }}>{seller.shop_name?.[0]?.toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{seller.shop_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{seller.city}</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: '#ECFDF5', color: '#10B981',
              borderRadius: 999, padding: '4px 12px',
            }}>● Active</span>
          </div>
        )}

        {/* Net earnings card */}
        <div style={{
          background: 'linear-gradient(135deg, #0D0A2B 0%, #1E1660 100%)',
          borderRadius: 20, padding: '20px',
          marginBottom: 16, position: 'relative', overflow: 'hidden',
        }}>
          <span style={{ position: 'absolute', top: 10, right: 20, fontSize: 36, opacity: .1 }}>₹</span>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Net payout this month
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#FF8080', marginBottom: 4 }}>
            ₹{((seller?.total_sales ?? 0) * 0.92).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>After 8% TRENZO commission</div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 16,
              padding: '14px 16px', boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: s.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, marginBottom: 8,
              }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <Link href="/seller/orders" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{
              width: '100%', background: 'var(--brand-light)', color: 'var(--brand)',
              borderRadius: 999, padding: '13px 0', fontSize: 13, fontWeight: 700,
            }}>My Orders</button>
          </Link>
          <Link href="/seller/earnings" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{
              width: '100%', background: '#ECFDF5', color: '#10B981',
              borderRadius: 999, padding: '13px 0', fontSize: 13, fontWeight: 700,
            }}>Earnings</button>
          </Link>
          <Link href="/seller/products" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{
              width: '100%', background: '#FFF0F0', color: 'var(--accent)',
              borderRadius: 999, padding: '13px 0', fontSize: 13, fontWeight: 700,
            }}>Products</button>
          </Link>
        </div>

        {/* Add product CTA */}
        <Link href="/seller/products/new" style={{ textDecoration: 'none', display: 'block' }}>
          <button style={{
            width: '100%',
            background: 'linear-gradient(135deg,#FF5C5C,#FF8080)',
            color: '#fff', borderRadius: 999, height: 52,
            fontSize: 15, fontWeight: 700,
            boxShadow: 'var(--shr)',
          }}>+ Add New Product</button>
        </Link>
      </div>
    </div>
  )
}
