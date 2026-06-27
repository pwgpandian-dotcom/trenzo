'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/context/CartContext'
import BottomNav from '@/components/BottomNav'

const categoryBg: Record<string, string> = {
  fashion: '#FDF0F8', electronics: '#EFF9FF', groceries: '#EDFBF1',
  home: '#FFFBEB', beauty: '#F9F0FF', handmade: '#FFF4EC',
}

type Product = {
  id: number; name: string; brand?: string; description?: string
  price: number; mrp?: number; stock: number; images: string[]
  seller_id: string; is_admin_product: boolean
  sellers?: { shop_name: string; city: string; total_sales: number; total_orders: number }
  categories?: { name: string; slug: string; color: string }
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [pincode, setPincode] = useState('')
  const [deliveryMsg, setDeliveryMsg] = useState<{ ok: boolean; msg: string } | null>(null)
  const [expanded, setExpanded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('products')
      .select('*, sellers(shop_name,city,total_sales,total_orders), categories(name,slug,color)')
      .eq('id', id).single()
      .then(({ data }) => setProduct(data))
  }, [id])

  if (!product) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 200, height: 200, borderRadius: 20, margin: '0 auto 16px' }} />
        </div>
      </div>
    )
  }

  const cat = product.categories?.slug ?? ''
  const bg = categoryBg[cat] ?? '#F8F7FF'
  const discount = product.mrp && product.mrp > product.price
    ? Math.round((1 - product.price / product.mrp) * 100) : 0

  const handleAddToCart = () => {
    if (product.stock === 0) return
    addItem({
      id: product.id, name: product.name, price: product.price, mrp: product.mrp,
      image: product.images?.[0], category: cat,
      shop_name: product.sellers?.shop_name, seller_id: product.seller_id,
      stock: product.stock,
    }, qty)
    toast.success('Added to cart!')
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) { toast.error('Enter valid 6-digit pincode'); return }
    setDeliveryMsg({ ok: true, msg: '✓ Delivery available · Expected in 3-5 days' })
  }

  return (
    <div style={{ paddingBottom: 80, maxWidth: 480, margin: '0 auto' }}>
      {/* Custom header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--line)',
        padding: '26px 14px 12px', position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </span>
        <Link href="/cart" style={{ fontSize: 20, textDecoration: 'none' }}>🛒</Link>
      </div>

      {/* Image gallery */}
      <div style={{ background: bg, height: 200, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {product.images?.[activeImg] ? (
          <img src={product.images[activeImg]} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 64 }}>📦</span>
        )}
        {product.categories && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--rg)', color: '#fff',
            borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '4px 10px',
          }}>{product.categories.name}</span>
        )}
        <button style={{
          position: 'absolute', top: 10, left: 10,
          width: 32, height: 32, borderRadius: '999px',
          background: '#fff', fontSize: 16, boxShadow: 'var(--sh1)',
        }}>♡</button>
      </div>

      {/* Thumbnails */}
      {product.images?.length > 1 && (
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px', overflowX: 'auto' }}>
          {product.images.map((img, i) => (
            <img key={i} src={img} alt=""
              onClick={() => setActiveImg(i)}
              style={{
                width: 52, height: 52, borderRadius: 10, objectFit: 'cover', cursor: 'pointer',
                border: i === activeImg ? '2px solid var(--i)' : '2px solid transparent',
              }} />
          ))}
        </div>
      )}

      <div style={{ padding: '16px 14px' }}>
        {product.categories && (
          <div style={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 700, color: product.categories.color, marginBottom: 4 }}>
            {product.categories.name}
          </div>
        )}
        <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.3 }}>{product.name}</h1>
        <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 4 }}>⭐ 4.5 <span style={{ color: 'var(--muted)' }}>(70 reviews)</span></div>
        {product.brand && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>by {product.brand}</div>}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--ink)' }}>₹{product.price.toLocaleString('en-IN')}</span>
          {product.mrp && product.mrp > product.price && (
            <span style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'line-through' }}>₹{product.mrp.toLocaleString('en-IN')}</span>
          )}
          {discount > 0 && (
            <span style={{ background: 'var(--rs)', color: 'var(--r)', borderRadius: 999, fontSize: 11, fontWeight: 900, padding: '3px 10px' }}>
              {discount}% off
            </span>
          )}
        </div>
        {discount > 0 && (
          <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 12, fontWeight: 700 }}>
            You save ₹{((product.mrp ?? 0) - product.price).toLocaleString('en-IN')}!
          </div>
        )}

        {/* Stock */}
        <div style={{ marginBottom: 16 }}>
          {product.stock > 10 ? (
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>● In Stock</span>
          ) : product.stock > 0 ? (
            <span style={{ fontSize: 12, color: '#D97706', fontWeight: 700 }}>⚡ Only {product.stock} left!</span>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>✕ Out of Stock</span>
          )}
        </div>

        {/* Delivery check */}
        <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)', marginBottom: 8 }}>📍 Check delivery availability</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" placeholder="Enter pincode" value={pincode}
              onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 14,
                border: '1.5px solid var(--line)', fontSize: 13,
              }}
            />
            <button onClick={checkDelivery}
              style={{ background: 'var(--ig)', color: '#fff', borderRadius: 999, padding: '10px 18px', fontSize: 13, fontWeight: 700 }}>
              Check
            </button>
          </div>
          {deliveryMsg && (
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: deliveryMsg.ok ? 'var(--green)' : 'var(--red)' }}>
              {deliveryMsg.msg}
            </div>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Description</h3>
            <p style={{
              fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6,
              display: expanded ? 'block' : '-webkit-box',
              WebkitLineClamp: expanded ? undefined : 3,
              WebkitBoxOrient: 'vertical' as const,
              overflow: expanded ? 'visible' : 'hidden',
            }}>{product.description}</p>
            <button onClick={() => setExpanded(!expanded)}
              style={{ background: 'none', color: 'var(--i)', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
              {expanded ? 'Show less ▲' : 'Read more ▼'}
            </button>
          </div>
        )}

        {/* Qty + Add to Cart */}
        {product.stock > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--line)', borderRadius: 999, overflow: 'hidden' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: 36, height: 36, background: 'none', fontSize: 18, color: 'var(--ink2)' }}>−</button>
              <span style={{ width: 32, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                style={{ width: 36, height: 36, background: 'none', fontSize: 18, color: 'var(--i)' }}>+</button>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Max: {product.stock}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <button onClick={handleAddToCart} disabled={product.stock === 0}
            style={{
              background: product.stock === 0 ? 'var(--line)' : 'var(--ig)', color: product.stock === 0 ? 'var(--red)' : '#fff',
              borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700,
            }}>{product.stock === 0 ? '✕ Out of Stock' : 'Add to Cart'}</button>
          <button onClick={handleBuyNow} disabled={product.stock === 0}
            style={{
              background: product.stock === 0 ? 'var(--line)' : 'var(--rg)', color: '#fff',
              borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700,
              opacity: product.stock === 0 ? .5 : 1,
            }}>Buy Now →</button>
        </div>

        {/* Seller card */}
        {product.sellers && (
          <div style={{ background: 'var(--is)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 20, background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: 'var(--i)', flexShrink: 0,
            }}>{product.sellers.shop_name?.[0]?.toUpperCase() ?? '🏪'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{product.sellers.shop_name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{product.sellers.city}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                ★ 4.8 · {product.sellers.total_orders ?? 0} sales
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'var(--grs)', borderRadius: 999, padding: '2px 8px', display: 'inline-block', marginTop: 4 }}>
                TRENZO Verified ✓
              </span>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
