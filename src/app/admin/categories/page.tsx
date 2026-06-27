'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

type Category = { id: number; name: string; slug: string; icon: string; color: string; sort_order: number; is_active: boolean }

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [cats, setCats] = useState<Category[]>([])
  const [form, setForm] = useState({ name: '', icon: '', color: '#4F3FD4', sort_order: '0' })
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCats(data ?? [])
  }
  useEffect(() => { load() }, [])

  const addCategory = async () => {
    if (!form.name || !form.icon) { toast.error('Name and icon required'); return }
    const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const { error } = await supabase.from('categories').insert({
      name: form.name, slug, icon: form.icon, color: form.color, sort_order: parseInt(form.sort_order),
    })
    if (error) { toast.error('Failed'); return }
    toast.success('Category added!')
    setForm({ name: '', icon: '', color: '#4F3FD4', sort_order: '0' })
    load()
  }

  const toggleActive = async (id: number, current: boolean) => {
    await supabase.from('categories').update({ is_active: !current }).eq('id', id)
    load()
  }

  const deleteCategory = async (id: number) => {
    if (!confirm('Delete this category?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) toast.error('Cannot delete — has products')
    else { toast.success('Deleted'); load() }
  }

  const inputStyle = { padding: '10px 14px', borderRadius: 14, border: '1.5px solid var(--line)', fontSize: 14 }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '26px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', fontSize: 20 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>Categories</h1>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 14px' }}>
        {/* Add form */}
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--sh1)', padding: '16px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Add Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
            <input placeholder="Emoji icon *" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={inputStyle} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Color:</label>
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                style={{ width: 40, height: 36, borderRadius: 8, border: '1.5px solid var(--line)', padding: 2 }} />
            </div>
            <input type="number" placeholder="Sort order" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} style={inputStyle} />
          </div>
          <button onClick={addCategory}
            style={{ background: 'var(--rg)', color: '#fff', borderRadius: 999, padding: '10px 0', width: '100%', fontSize: 13, fontWeight: 700 }}>
            Add Category
          </button>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cats.map(c => (
            <div key={c.id} style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--sh1)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '999px', background: c.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {c.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Order: {c.sort_order}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => toggleActive(c.id, c.is_active)}
                  style={{
                    borderRadius: 999, padding: '5px 12px', fontSize: 11, fontWeight: 700,
                    background: c.is_active ? 'var(--grs)' : 'var(--line)',
                    color: c.is_active ? 'var(--green)' : 'var(--muted)',
                    border: 'none',
                  }}>{c.is_active ? 'Active' : 'Inactive'}</button>
                <button onClick={() => deleteCategory(c.id)}
                  style={{ background: 'var(--rds)', color: 'var(--red)', borderRadius: 999, padding: '5px 10px', fontSize: 13, fontWeight: 700 }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
