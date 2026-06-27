'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/ProductCard'
import SkeletonCard from '@/components/SkeletonCard'
import EmptyState from '@/components/EmptyState'
import BottomNav from '@/components/BottomNav'

type Product = {
  id: number; name: string; price: number; mrp?: number; stock: number
  images: string[]; seller_id: string; is_admin_product: boolean
  sellers?: { shop_name: string }
  categories?: { name: string; slug: string; color: string }
}

type Category = { id: number; name: string; slug: string; icon: string; color: string }

const SORTS = ['Newest', 'Price↑', 'Price↓', '★4+']

export default function SearchPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const q = sp.get('q') ?? ''
  const catParam = sp.get('category') ?? ''
  const [query, setQuery] = useState(q)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeSort, setActiveSort] = useState('Newest')
  const [activeCategory, setActiveCategory] = useState(catParam)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadCats = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
        if (!error) setCategories(data ?? [])
      } catch {}
    }
    loadCats()
  }, [])

  useEffect(() => {
    const doFetch = async () => {
      setLoading(true)
      try {
        let qb = supabase.from('products')
          .select('*, sellers(shop_name), categories(name,slug,color)')
          .eq('status', 'active')

        if (query) qb = qb.ilike('name', `%${query}%`)
        if (activeCategory) {
          const cat = categories.find(c => c.slug === activeCategory)
          if (cat) qb = qb.eq('category_id', cat.id)
        }
        if (activeSort === 'Price↑') qb = qb.order('price', { ascending: true })
        else if (activeSort === 'Price↓') qb = qb.order('price', { ascending: false })
        else qb = qb.order('created_at', { ascending: false })

        const { data, error } = await qb.limit(40)
        if (error) {
          console.error('Search fetch error:', error.message)
          setProducts([])
        } else {
          setProducts((data ?? []) as unknown as Product[])
        }
      } catch (err) {
        console.error('Search fetch failed:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    doFetch()
  }, [query, activeCategory, activeSort, categories])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--line)',
        padding: '26px 14px 12px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
          <Link href="/" style={{ fontSize: 20, textDecoration: 'none' }}>←</Link>
          <form onSubmit={handleSearch} style={{ flex: 1 }}>
            <input
              type="search" placeholder="Search TRENZO…" value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '11px 18px',
                borderRadius: 999, border: '1.5px solid var(--line)',
                fontSize: 14, background: 'var(--bg)', color: 'var(--ink)',
              }}
            />
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px 0' }}>
        {!loading && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
            {products.length} result{products.length !== 1 ? 's' : ''}
            {query ? ` for "${query}"` : ''}
          </p>
        )}

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 12, scrollbarWidth: 'none' }}>
          <button onClick={() => setActiveCategory('')}
            style={{
              borderRadius: 999, padding: '7px 14px', fontSize: 12, fontWeight: 700,
              background: !activeCategory ? 'var(--i)' : '#fff',
              color: !activeCategory ? '#fff' : 'var(--ink2)',
              border: '1.5px solid ' + (!activeCategory ? 'var(--i)' : 'var(--line)'),
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>All</button>
          {categories.map(c => (
            <button key={c.slug} onClick={() => setActiveCategory(c.slug)}
              style={{
                borderRadius: 999, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                background: activeCategory === c.slug ? 'var(--i)' : '#fff',
                color: activeCategory === c.slug ? '#fff' : 'var(--ink2)',
                border: '1.5px solid ' + (activeCategory === c.slug ? 'var(--i)' : 'var(--line)'),
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{c.icon} {c.name}</button>
          ))}
        </div>

        {/* Sort chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {SORTS.map(s => (
            <button key={s} onClick={() => setActiveSort(s)}
              style={{
                borderRadius: 999, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                background: activeSort === s ? 'var(--ink)' : '#fff',
                color: activeSort === s ? '#fff' : 'var(--ink2)',
                border: '1.5px solid ' + (activeSort === s ? 'var(--ink)' : 'var(--line)'),
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{s}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length === 0
              ? <div style={{ gridColumn: '1/-1' }}>
                  <EmptyState emoji="🔍" title="No results found" subtitle="Try a different search" ctaLabel="Browse all" ctaHref="/" />
                </div>
              : products.map(p => (
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
