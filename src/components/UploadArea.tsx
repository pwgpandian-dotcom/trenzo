'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type UploadAreaProps = {
  images: string[]
  onAdd: (url: string) => void
  onRemove: (url: string) => void
}

export default function UploadArea({ images, onAdd, onRemove }: UploadAreaProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return
    const file = files[0]
    if (!file) return
    if (images.length >= 5) return

    setUploading(true)
    setProgress(0)
    const path = `${user.id}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (!error && data) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path)
      onAdd(urlData.publicUrl)
    }
    setUploading(false)
    setProgress(0)
  }

  return (
    <div>
      {images.length === 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed var(--line)',
            borderRadius: 18,
            padding: '32px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--bg)',
          }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink2)', marginBottom: 4 }}>Tap to add photos</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Up to 5 · Max 5MB</div>
          {uploading && (
            <div style={{ marginTop: 12, background: 'var(--line)', borderRadius: 999, height: 4 }}>
              <div style={{ background: 'var(--i)', height: 4, borderRadius: 999, width: `${progress}%`, transition: 'width .2s' }} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {images.map(url => (
            <div key={url} style={{ position: 'relative' }}>
              <img src={url} alt="" style={{ width: 58, height: 58, borderRadius: 14, objectFit: 'cover' }} />
              <button
                onClick={() => onRemove(url)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '999px',
                  background: 'var(--r)', color: '#fff',
                  fontSize: 10, fontWeight: 900, border: '2px solid #fff',
                }}>×</button>
            </div>
          ))}
          {images.length < 5 && (
            <div
              onClick={() => inputRef.current?.click()}
              style={{
                width: 58, height: 58, borderRadius: 14,
                border: '2px dashed var(--line)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 20, color: 'var(--muted)',
              }}>+</div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}
