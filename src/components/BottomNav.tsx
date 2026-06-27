'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'

const NAV = [
  {
    label: 'Home', href: '/',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z"
          stroke={active ? '#5B4FCF' : '#9E9BB5'} strokeWidth="1.8"
          fill={active ? '#EEF0FF' : 'none'} strokeLinejoin="round"/>
        <path d="M9 21v-7h6v7" stroke={active ? '#5B4FCF' : '#9E9BB5'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Search', href: '/search',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={active ? '#5B4FCF' : '#9E9BB5'} strokeWidth="1.8"
          fill={active ? '#EEF0FF' : 'none'}/>
        <path d="M21 21l-4-4" stroke={active ? '#5B4FCF' : '#9E9BB5'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Orders', href: '/orders',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="8" width="18" height="13" rx="2"
          stroke={active ? '#5B4FCF' : '#9E9BB5'} strokeWidth="1.8"
          fill={active ? '#EEF0FF' : 'none'}/>
        <path d="M16 8V6a4 4 0 00-8 0v2" stroke={active ? '#5B4FCF' : '#9E9BB5'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Profile', href: '/profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={active ? '#5B4FCF' : '#9E9BB5'} strokeWidth="1.8"
          fill={active ? '#EEF0FF' : 'none'}/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? '#5B4FCF' : '#9E9BB5'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { count } = useCart()

  if (pathname.startsWith('/admin') || pathname.startsWith('/seller')) return null

  const [first, second, ...rest] = NAV

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '8px 0 max(10px, env(safe-area-inset-bottom))',
      zIndex: 50,
    }}>
      {[first, second].map(item => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 48 }}>
              {item.icon(active)}
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'var(--brand)' : 'var(--text-muted)' }}>
                {item.label}
              </span>
            </div>
          </Link>
        )
      })}

      {/* Centre cart button */}
      <Link href="/cart" style={{ textDecoration: 'none', position: 'relative' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '999px',
          background: 'linear-gradient(135deg,#FF5C5C,#FF8080)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: -20,
          border: '3px solid #fff',
          boxShadow: 'var(--shr)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#fff" strokeWidth="1.8"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="#fff" strokeWidth="1.8"/>
            <path d="M16 10a4 4 0 01-8 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          {count > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: 'var(--brand)', color: '#fff',
              borderRadius: '999px', fontSize: 9, fontWeight: 800,
              minWidth: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px',
            }}>{count}</span>
          )}
        </div>
        <span style={{ display: 'block', textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 3 }}>
          Cart
        </span>
      </Link>

      {rest.map(item => {
        const active = pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 48 }}>
              {item.icon(active)}
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'var(--brand)' : 'var(--text-muted)' }}>
                {item.label}
              </span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
