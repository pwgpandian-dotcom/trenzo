'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import UploadArea from '@/components/UploadArea'
import EarningsPreview from '@/components/EarningsPreview'

type Category = { id: number; name: string; icon: string; color: string }

const STEPS = ['Photos', 'Details']

export default function AdminNewProductPage() {
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

    // Admin needs a sellers row (FK constraint on products.seller_id)
    const { error: sellerErr } = await supabase.from('sellers').upsert({
      id: user.id,
      shop_name: 'TRENZO Store',
      shop_description: 'Official TRENZO marketplace products',
      status: 'approved',
    }, { onConflict: 'id', ignoreDuplicates: true })
    if (sellerErr) { toast.error('Setup failed: ' + sellerErr.message); setLoading(false); return }

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
      is_admin_product: true,
    })
    if (error) { toast.error('Failed to publish: ' + error.message); setLoading(false); return }
    toast.success('Product published! ✅')
    router.replace('/admin/products')
  }

  const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid var(--line)', fontSize: 14, background: 'var(--bg)', color: 'var(--ink)' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => step > 0 ? setStep(0) : router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>Add TRENZO Product</h1>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '12px 14px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              background: i === step ? 'var(--i)' : i < step ? 'var(--green)' : 'var(--line)',
              color: i <= step ? '#fff' : 'var(--muted)',
              borderRadius: 999, padding: '6px 0', fontSize: 11, fontWeight: 700, textAlign: 'center',
            }}>{i < step ? '✓ ' : `${i + 1}. `}{s}</div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 14px' }}>
        {step === 0 && (
          <>
            <UploadArea images={images} onAdd={url => setImages(p => [...p, url])} onRemove={url => setImages(p => p.filter(u => u !== url))} />
            <button onClick={() => setStep(1)}
              style={{ width: '100%', marginTop: 16, background: 'var(--ig)', color: '#fff', borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700 }}>
              {images.length > 0 ? 'Next →' : 'Skip photos & continue →'}
            </button>
          </>
        )}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--is)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: 'var(--i)', fontWeight: 700 }}>
              🏪 This product will show as "TRENZO Store"
            </div>
            <input placeholder="Product name *" value={form.name} onChange={set('name')} required style={inputStyle} />
            <select value={form.category_id} onChange={set('category_id')} style={inputStyle}>
              <option value="">Select category *</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <input placeholder="Brand (optional)" value={form.brand} onChange={set('brand')} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input type="number" placeholder="Price ₹ *" value={form.price} onChange={set('price')} min="1" required style={inputStyle} />
              <input type="number" placeholder="MRP ₹" value={form.mrp} onChange={set('mrp')} style={inputStyle} />
            </div>
            <input type="number" placeholder="Stock" value={form.stock} onChange={set('stock')} min="0" style={inputStyle} />
            <textarea placeholder="Description" value={form.description} onChange={set('description')} rows={4}
              style={{ ...inputStyle, resize: 'none' }} />
            {form.price && parseFloat(form.price) > 0 && <EarningsPreview price={parseFloat(form.price)} />}
            <button onClick={handlePublish} disabled={loading}
              style={{ background: 'var(--rg)', color: '#fff', borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700, opacity: loading ? .7 : 1 }}>
              {loading ? 'Publishing…' : 'Publish Product ✓'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
