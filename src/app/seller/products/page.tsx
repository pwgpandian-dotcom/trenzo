'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import EmptyState from '@/components/EmptyState'
import SkeletonCard from '@/components/SkeletonCard'

type Product = {
  id: number; name: string; price: number; stock: number
  images: string[]; status: string; categories?: { name: string; color: string }
}

export default function SellerProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = async () => {
    if (!user) return
    const { data } = await supabase.from('products')
      .select('id,name,price,stock,images,status,categories(name,color)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
    setProducts((data ?? []) as unknown as Product[])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const toggleStatus = async (id: number, current: string) => {
    const newStatus = current === 'active' ? 'inactive' : 'active'
    await supabase.from('products').update({ status: newStatus }).eq('id', id)
    toast.success(`Product ${newStatus}`)
    load()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
          <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>My Products</h1>
        </div>
        <Link href="/seller/products/new">
          <button style={{ background: 'var(--rg)', color: '#fff', borderRadius: 999, padding: '8px 16px', fontSize: 12, fontWeight: 700 }}>+ Add</button>
        </Link>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState emoji="📦" title="No products yet" subtitle="Add your first product to start selling" ctaLabel="Add Product" ctaHref="/seller/products/new" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.map(p => {
              const stockColor = p.stock > 10 ? 'var(--green)' : p.stock > 0 ? '#D97706' : 'var(--red)'
              const stockBg = p.stock > 10 ? 'var(--grs)' : p.stock > 0 ? '#FFFBEB' : 'var(--rds)'
              const stockLabel = p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'
              return (
                <div key={p.id} style={{ background: '#fff', borderRadius: 18, boxShadow: 'var(--sh1)', padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : <span style={{ fontSize: 24 }}>📦</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 900, fontSize: 14, color: 'var(--i)' }}>₹{p.price.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, background: stockBg, color: stockColor, borderRadius: 999, padding: '2px 8px' }}>{stockLabel}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/seller/products/${p.id}/edit`}>
                      <button style={{ background: 'var(--is)', color: 'var(--i)', borderRadius: 999, padding: '6px 12px', fontSize: 11, fontWeight: 700 }}>Edit</button>
                    </Link>
                    <button
                      onClick={() => toggleStatus(p.id, p.status)}
                      style={{ background: p.status === 'active' ? 'var(--rds)' : 'var(--grs)', color: p.status === 'active' ? 'var(--red)' : 'var(--green)', borderRadius: 999, padding: '6px 12px', fontSize: 11, fontWeight: 700 }}>
                      {p.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
