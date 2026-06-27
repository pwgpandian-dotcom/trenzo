'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function TopBar() {
  const { count } = useCart()

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        maxWidth: 480, margin: '0 auto',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{
            width: 28, height: 28, borderRadius: 10,
            background: 'var(--ig)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14,
          }}>T</span>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--ink)', letterSpacing: '-0.5px' }}>
            TRENZO
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button style={{
            width: 38, height: 38, borderRadius: '999px',
            background: 'var(--brand-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="#5B4FCF" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#5B4FCF" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          <Link href="/cart" style={{ position: 'relative', display: 'flex' }}>
            <button style={{
              width: 38, height: 38, borderRadius: '999px',
              background: 'var(--brand-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#5B4FCF" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="#5B4FCF" strokeWidth="1.8"/>
                <path d="M16 10a4 4 0 01-8 0" stroke="#5B4FCF" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            {count > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                background: 'var(--accent)', color: '#fff',
                borderRadius: '999px', fontSize: 9, fontWeight: 800,
                minWidth: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>{count}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
