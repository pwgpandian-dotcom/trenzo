'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import UploadArea from '@/components/UploadArea'
import EarningsPreview from '@/components/EarningsPreview'
import Modal from '@/components/Modal'

type Category = { id: number; name: string; icon: string }

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [form, setForm] = useState({
    name: '', brand: '', description: '',
    category_id: '', price: '', mrp: '', stock: '0',
  })
  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([{ data: p }, { data: cats }]) => {
      if (p) {
        setForm({
          name: p.name ?? '', brand: p.brand ?? '', description: p.description ?? '',
          category_id: p.category_id?.toString() ?? '', price: p.price?.toString() ?? '',
          mrp: p.mrp?.toString() ?? '', stock: p.stock?.toString() ?? '0',
        })
        setImages(p.images ?? [])
      }
      setCategories(cats ?? [])
    })
  }, [id])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setLoading(true)
    const price = parseFloat(form.price)
    const mrp = form.mrp ? parseFloat(form.mrp) : null
    const { error } = await supabase.from('products').update({
      name: form.name, brand: form.brand || null, description: form.description || null,
      category_id: parseInt(form.category_id), price, mrp,
      stock: parseInt(form.stock), images,
    }).eq('id', id)
    if (error) { toast.error('Failed to save'); setLoading(false); return }
    toast.success('Changes saved!')
    router.replace('/seller/products')
  }

  const handleDelete = async () => {
    await supabase.from('products').delete().eq('id', id)
    toast.success('Product deleted')
    router.replace('/seller/products')
  }

  const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid var(--line)', fontSize: 14, background: 'var(--bg)', color: 'var(--ink)' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>Edit Product</h1>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <UploadArea images={images} onAdd={url => setImages(p => [...p, url])} onRemove={url => setImages(p => p.filter(u => u !== url))} />
        <input placeholder="Product name *" value={form.name} onChange={set('name')} required style={inputStyle} />
        <select value={form.category_id} onChange={set('category_id')} style={inputStyle}>
          <option value="">Select category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <input placeholder="Brand (optional)" value={form.brand} onChange={set('brand')} style={inputStyle} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input type="number" placeholder="Price ₹" value={form.price} onChange={set('price')} style={inputStyle} />
          <input type="number" placeholder="MRP ₹" value={form.mrp} onChange={set('mrp')} style={inputStyle} />
        </div>
        <input type="number" placeholder="Stock" value={form.stock} onChange={set('stock')} style={inputStyle} />
        <textarea placeholder="Description" value={form.description} onChange={set('description')} rows={4}
          style={{ ...inputStyle, resize: 'none' }} />
        {form.price && parseFloat(form.price) > 0 && <EarningsPreview price={parseFloat(form.price)} />}
        <button onClick={handleSave} disabled={loading}
          style={{ background: 'var(--ig)', color: '#fff', borderRadius: 999, height: 52, fontSize: 15, fontWeight: 700, opacity: loading ? .7 : 1 }}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
        <button onClick={() => setDeleteModal(true)}
          style={{ background: 'transparent', border: '1.5px solid var(--red)', color: 'var(--red)', borderRadius: 999, height: 46, fontSize: 14, fontWeight: 700 }}>
          Delete Product
        </button>
      </div>

      <Modal open={deleteModal} title="Delete product?" onClose={() => setDeleteModal(false)}>
        <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 16 }}>This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleDelete}
            style={{ flex: 1, background: 'var(--red)', color: '#fff', borderRadius: 999, padding: '12px 0', fontSize: 14, fontWeight: 700 }}>Delete</button>
          <button onClick={() => setDeleteModal(false)}
            style={{ flex: 1, background: 'transparent', border: '1.5px solid var(--line)', color: 'var(--ink2)', borderRadius: 999, padding: '12px 0', fontSize: 14, fontWeight: 700 }}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
