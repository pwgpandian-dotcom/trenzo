'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [loading, user])

  const handleLogout = () => router.push('/auth/signout')

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 14px' }}>
        {/* Avatar + name */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '999px',
            background: 'var(--ig)', color: '#fff',
            fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)' }}>{profile?.full_name ?? 'User'}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</p>
          <span style={{
            display: 'inline-block', marginTop: 6,
            background: 'var(--is)', color: 'var(--i)',
            borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
          }}>{profile?.role ?? 'buyer'}</span>
        </div>

        {/* Menu items */}
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--sh1)', overflow: 'hidden', marginBottom: 16 }}>
          {[
            { icon: '📦', label: 'My Orders', href: '/orders' },
            { icon: '📍', label: 'Saved Addresses', href: '/addresses' },
            { icon: '❤️', label: 'Wishlist', href: '/wishlist' },
          ].map((item, i, arr) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.label}</span>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>›</span>
              </div>
            </Link>
          ))}
        </div>

        {profile?.role === 'seller' && (
          <Link href="/seller" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
            <div style={{ background: 'var(--is)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🏪</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--i)' }}>Seller Hub</span>
              <span style={{ marginLeft: 'auto', color: 'var(--i)', fontSize: 14 }}>›</span>
            </div>
          </Link>
        )}

        <button
          onClick={handleLogout}
          style={{
            width: '100%', background: 'transparent', border: '1.5px solid var(--line)',
            color: 'var(--red)', borderRadius: 999, padding: '14px 0',
            fontSize: 14, fontWeight: 700,
          }}>Logout</button>
      </div>
      <BottomNav />
    </div>
  )
}
