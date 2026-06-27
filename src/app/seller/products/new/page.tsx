'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import UploadArea from '@/components/UploadArea'
import EarningsPreview from '@/components/EarningsPreview'

type Category = { id: number; name: string; icon: string; color: string; slug: string }

const STEPS = ['Photos', 'Details']

export default function NewProductPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', brand: '', description: '',
    category_id: '', price: '', mrp: '', stock: '0',
  })
  const supabase = createClient()

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePublish = async () => {
    if (!user) return
    if (!form.name || !form.price || !form.category_id) { toast.error('Fill all required fields'); return }
    setLoading(true)
    const price = parseFloat(form.price)
    const mrp = form.mrp ? parseFloat(form.mrp) : null
    if (mrp && mrp <= price) { toast.error('MRP must be greater than price'); setLoading(false); return }
    const { error } = await supabase.from('products').insert({
      seller_id: user.id,
      name: form.name,
      brand: form.brand || null,
      description: form.description || null,
      category_id: parseInt(form.category_id),
      price, mrp,
      stock: parseInt(form.stock),
      images,
      status: 'active',
    })
    if (error) { toast.error('Failed to publish'); setLoading(false); return }
    toast.success('Product published! ✅')
    router.replace('/seller/products')
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    borderRadius: 14, border: '1.5px solid var(--line)',
    fontSize: 14, background: 'var(--bg)', color: 'var(--ink)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => step > 0 ? setStep(0) : router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>
          {step === 0 ? 'Add Photos' : 'Product Details'}
        </h1>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 14px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              background: i === step ? 'var(--i)' : i < step ? 'var(--green)' : 'var(--line)',
              color: i <= step ? '#fff' : 'var(--muted)',
              borderRadius: 999, padding: '6px 0', fontSize: 11, fontWeight: 700, textAlign: 'center',
            }}>
              {i < step ? '✓ ' : `${i + 1}. `}{s}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 14px' }}>
        {step === 0 && (
          <>
            <UploadArea images={images} onAdd={url => setImages(p => [...p, url])} onRemove={url => setImages(p => p.filter(u => u !== url))} />
            <button onClick={() => setStep(1)} disabled={images.length === 0}
              style={{
                width: '100%', marginTop: 16,
                background: images.length > 0 ? 'var(--ig)' : 'var(--line)',
                color: '#fff', borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700,
                opacity: images.length > 0 ? 1 : .6,
              }}>Next →</button>
          </>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input placeholder="Product name *" value={form.name} onChange={set('name')} required style={inputStyle} />

            <select value={form.category_id} onChange={set('category_id')} style={inputStyle}>
              <option value="">Select category *</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>

            <input placeholder="Brand (optional)" value={form.brand} onChange={set('brand')} style={inputStyle} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input type="number" placeholder="Price ₹ *" value={form.price} onChange={set('price')} min="1" required style={inputStyle} />
              <input type="number" placeholder="MRP ₹ (optional)" value={form.mrp} onChange={set('mrp')} min="0" style={inputStyle} />
            </div>

            {form.price && form.mrp && parseFloat(form.mrp) > parseFloat(form.price) && (
              <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>
                Showing {Math.round((1 - parseFloat(form.price) / parseFloat(form.mrp)) * 100)}% off!
              </div>
            )}

            <input type="number" placeholder="Stock quantity" value={form.stock} onChange={set('stock')} min="0" style={inputStyle} />

            <div>
              <textarea
                placeholder="Description (min 20 characters)"
                value={form.description} onChange={set('description')} rows={4}
                style={{ ...inputStyle, resize: 'none' }}
              />
              <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 2 }}>
                {form.description.length} chars
              </div>
            </div>

            {form.price && parseFloat(form.price) > 0 && (
              <EarningsPreview price={parseFloat(form.price)} />
            )}

            <button onClick={handlePublish} disabled={loading}
              style={{ background: 'var(--rg)', color: '#fff', borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700, opacity: loading ? .7 : 1 }}>
              {loading ? 'Publishing…' : 'Publish Product ✓'}
            </button>
            <button onClick={() => router.push('/seller/products')}
              style={{ background: 'transparent', border: '1.5px solid var(--line)', color: 'var(--ink2)', borderRadius: 999, height: 46, fontSize: 14, fontWeight: 700 }}>
              Save Draft
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
