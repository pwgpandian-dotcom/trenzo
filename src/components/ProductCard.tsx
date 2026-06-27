'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import toast from 'react-hot-toast'

type ProductCardProps = {
  id: number
  name: string
  shop_name?: string
  price: number
  mrp?: number
  images?: string[]
  stock: number
  category?: string
  seller_id: string
  is_admin_product?: boolean
  brand?: string
}

const categoryBg: Record<string, string> = {
  fashion: '#FDF0F8', electronics: '#EFF9FF',
  groceries: '#EDFBF1', home: '#FFFBEB',
  beauty: '#F9F0FF', handmade: '#FFF4EC',
}
const categoryEmoji: Record<string, string> = {
  fashion: '👗', electronics: '🎧',
  groceries: '🥦', home: '🏠',
  beauty: '💄', handmade: '🪔',
}

export default function ProductCard({
  id, name, shop_name, price, mrp, images, stock,
  category = '', seller_id, is_admin_product,
}: ProductCardProps) {
  const { addItem } = useCart()
  const cat = category?.toLowerCase() ?? ''
  const bg = categoryBg[cat] ?? '#EEF0FF'
  const emoji = categoryEmoji[cat] ?? '📦'
  const discount = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (stock === 0) return
    addItem({ id, name, price, mrp, image: images?.[0], category, shop_name, seller_id, stock })
    toast.success('Added to cart!')
  }

  return (
    <Link href={`/product/${id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          transition: 'box-shadow .2s, transform .2s',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.boxShadow = 'var(--sh2)'
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.boxShadow = 'var(--shadow-card)'
          el.style.transform = 'translateY(0)'
        }}
      >
        {/* Image */}
        <div style={{ background: bg, height: 160, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {images?.[0]
            ? <img src={images[0]} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>{emoji}</div>
          }

          {/* Discount badge */}
          {discount > 0 && (
            <span style={{
              position: 'absolute', top: 8, left: 8,
              background: 'var(--accent)', color: '#fff',
              borderRadius: 999, fontSize: 9, fontWeight: 700,
              padding: '3px 8px', letterSpacing: '0.3px',
            }}>{discount}% OFF</span>
          )}

          {/* Wishlist heart */}
          <button
            onClick={e => e.preventDefault()}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 30, height: 30, borderRadius: '999px',
              background: 'rgba(255,255,255,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 6px rgba(0,0,0,.12)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                stroke="#FF5C5C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Stock warnings */}
          {stock > 0 && stock < 5 && (
            <span style={{
              position: 'absolute', bottom: 6, left: 6,
              background: '#FFFBEB', color: '#D97706',
              borderRadius: 999, fontSize: 9, fontWeight: 700,
              padding: '3px 8px', border: '1px solid #FCD34D',
            }}>Only {stock} left!</span>
          )}
          {stock === 0 && (
            <span style={{
              position: 'absolute', bottom: 6, left: 6,
              background: 'rgba(0,0,0,.55)', color: '#fff',
              borderRadius: 999, fontSize: 9, fontWeight: 700,
              padding: '3px 8px',
            }}>Out of Stock</span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 3 }}>
            {is_admin_product ? 'TRENZO Store' : (shop_name ?? '')}
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            lineHeight: 1.4, marginBottom: 4, flex: 1,
          }}>{name}</div>
          <div style={{ fontSize: 10, color: 'var(--gold)', marginBottom: 6 }}>
            ⭐ 4.5 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(124)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--brand)' }}>₹{price.toLocaleString('en-IN')}</span>
            {mrp && mrp > price && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={stock === 0}
            style={{
              width: '100%', borderRadius: 999, fontSize: 12, fontWeight: 700,
              padding: '9px 0',
              background: stock === 0 ? 'var(--border)' : 'var(--ig)',
              color: stock === 0 ? 'var(--text-muted)' : '#fff',
            }}
          >
            {stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
