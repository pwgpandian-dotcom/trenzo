'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import EmptyState from '@/components/EmptyState'
import SkeletonCard from '@/components/SkeletonCard'

type Product = {
  id: number; name: string; price: number; stock: number; images: string[]
  status: string; is_admin_product: boolean
  sellers?: { shop_name: string }
  categories?: { name: string }
}

const FILTERS = ['All', 'TRENZO Store', 'By Seller']

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('products')
      .select('id,name,price,stock,images,status,is_admin_product,sellers(shop_name),categories(name)')
      .order('created_at', { ascending: false })
    setProducts((data ?? []) as unknown as Product[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleStatus = async (id: number, current: string) => {
    const newStatus = current === 'active' ? 'inactive' : 'active'
    await supabase.from('products').update({ status: newStatus }).eq('id', id)
    toast.success(`Product ${newStatus}`)
    load()
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Deleted')
    load()
  }

  const filtered = products.filter(p => {
    if (filter === 'TRENZO Store') return p.is_admin_product
    if (filter === 'By Seller') return !p.is_admin_product
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
          <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>All Products</h1>
        </div>
        <Link href="/admin/products/new">
          <button style={{ background: 'var(--rg)', color: '#fff', borderRadius: 999, padding: '8px 14px', fontSize: 12, fontWeight: 700 }}>+ Add</button>
        </Link>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px' }}>
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

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState emoji="📦" title="No products" subtitle="Add your first product" ctaLabel="Add Product" ctaHref="/admin/products/new" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--sh1)', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <span style={{ fontSize: 20 }}>📦</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {p.is_admin_product ? 'TRENZO Store' : p.sellers?.shop_name ?? '—'} · ₹{p.price} · Stock: {p.stock}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => toggleStatus(p.id, p.status)}
                    style={{ background: p.status === 'active' ? 'var(--grs)' : 'var(--line)', color: p.status === 'active' ? 'var(--green)' : 'var(--muted)', borderRadius: 999, padding: '4px 10px', fontSize: 10, fontWeight: 700 }}>
                    {p.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => deleteProduct(p.id)}
                    style={{ background: 'var(--rds)', color: 'var(--red)', borderRadius: 999, padding: '4px 10px', fontSize: 10, fontWeight: 700 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
