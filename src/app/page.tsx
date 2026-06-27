'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import SkeletonCard from '@/components/SkeletonCard'
import EmptyState from '@/components/EmptyState'
import { useCart } from '@/context/CartContext'

type Product = {
  id: number; name: string; price: number; mrp?: number; stock: number
  images: string[]; seller_id: string; is_admin_product: boolean
  sellers?: { shop_name: string }
  categories?: { name: string; slug: string; color: string }
}

const STATIC_CATEGORIES = [
  { slug: 'fashion',     name: 'Fashion',     icon: '👗', bg: '#FDF0F8' },
  { slug: 'electronics', name: 'Electronics', icon: '🎧', bg: '#EFF9FF' },
  { slug: 'groceries',   name: 'Groceries',   icon: '🥦', bg: '#EDFBF1' },
  { slug: 'home',        name: 'Home',        icon: '🏠', bg: '#FFFBEB' },
  { slug: 'beauty',      name: 'Beauty',      icon: '💄', bg: '#F9F0FF' },
  { slug: 'handmade',    name: 'Handmade',    icon: '🪔', bg: '#FFF4EC' },
]

const FILTERS = ['All', 'New Arrivals', 'Price: Low', 'Price: High']

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const { count } = useCart()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      try {
        const { data: prods, error } = await supabase
          .from('products')
          .select('*, sellers(shop_name), categories(name,slug,color)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(40)
        if (error) { console.error('Products fetch error:', error.message); setProducts([]) }
        else setProducts((prods ?? []) as unknown as Product[])
      } catch (err) {
        console.error('Products fetch failed:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = [...products].sort((a, b) => {
    if (filter === 'Price: Low') return a.price - b.price
    if (filter === 'Price: High') return b.price - a.price
    return 0
  })

  return (
    <div style={{ background: 'var(--bg)', paddingBottom: 90, minHeight: '100vh' }}>

      {/* ── Dark indigo header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #2D1F8C 0%, #5B4FCF 100%)',
        padding: '0 0 24px',
      }}>
        {/* Top row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '52px 16px 16px',
          maxWidth: 480, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 11,
              background: 'linear-gradient(135deg,#FF5C5C,#FF8080)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 16,
              boxShadow: 'var(--shr)',
            }}>T</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>TRENZO</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{
              width: 36, height: 36, borderRadius: '999px',
              background: 'rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <Link href="/cart" style={{ position: 'relative' }}>
              <button style={{
                width: 36, height: 36, borderRadius: '999px',
                background: 'rgba(255,255,255,.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#fff" strokeWidth="1.8"/>
                  <line x1="3" y1="6" x2="21" y2="6" stroke="#fff" strokeWidth="1.8"/>
                  <path d="M16 10a4 4 0 01-8 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  background: 'var(--accent)', color: '#fff',
                  borderRadius: '999px', fontSize: 9, fontWeight: 800,
                  minWidth: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                }}>{count}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar — inside dark section */}
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
          <Link href="/search" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#fff', borderRadius: 999,
              padding: '13px 18px',
              boxShadow: '0 4px 20px rgba(0,0,0,.15)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="var(--brand)" strokeWidth="2"/>
                <path d="M21 21l-4-4" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
                Search products, shops...
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 14px' }}>

        {/* Category circles */}
        <div style={{
          display: 'flex', gap: 14, overflowX: 'auto',
          padding: '20px 0 4px',
          scrollbarWidth: 'none', msOverflowStyle: 'none' as const,
        }}>
          {STATIC_CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/search?category=${cat.slug}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: cat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
                boxShadow: '0 2px 10px rgba(0,0,0,.08)',
                border: '1.5px solid rgba(0,0,0,.04)',
              }}>{cat.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Promo banner */}
        <div style={{
          marginTop: 20,
          background: 'linear-gradient(135deg, #3D31A0 0%, #7B5CF0 100%)',
          borderRadius: 20, padding: '20px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <span style={{ position: 'absolute', top: -10, right: 60, fontSize: 40, opacity: .15 }}>✦</span>
          <span style={{ position: 'absolute', bottom: 4, right: 24, fontSize: 24, opacity: .2 }}>✦</span>
          <span style={{ position: 'absolute', top: 10, right: 30, fontSize: 18, opacity: .1 }}>★</span>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.5px' }}>
              🔥 TAMIL NADU'S BEST DEALS
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.2 }}>
              Up to 60% off
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginBottom: 14 }}>
              New sellers every week
            </div>
            <Link href="/search">
              <button style={{
                background: '#fff', color: 'var(--brand)',
                borderRadius: 999, padding: '9px 20px',
                fontSize: 12, fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,.12)',
              }}>Explore →</button>
            </Link>
          </div>
          <span style={{ fontSize: 56, flexShrink: 0 }}>🛍️</span>
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 12px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>✨ Featured Products</h2>
          <Link href="/search" style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              borderRadius: 999, padding: '7px 16px', fontSize: 12, fontWeight: 600,
              background: filter === f ? 'var(--brand)' : '#fff',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              border: '1.5px solid ' + (filter === f ? 'var(--brand)' : 'var(--border)'),
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>{f}</button>
          ))}
        </div>

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
              ? <div style={{ gridColumn: '1/-1' }}>
                  <EmptyState emoji="📦" title="No products yet" subtitle="Check back soon!" ctaLabel="Browse all" ctaHref="/search" />
                </div>
              : filtered.map(p => (
                <ProductCard
                  key={p.id} id={p.id} name={p.name} price={p.price} mrp={p.mrp}
                  images={p.images} stock={p.stock} seller_id={p.seller_id}
                  is_admin_product={p.is_admin_product}
                  shop_name={p.sellers?.shop_name}
                  category={p.categories?.slug}
                />
              ))
          }
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
