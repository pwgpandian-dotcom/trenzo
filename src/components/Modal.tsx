'use client'

import { useEffect } from 'react'

type ModalProps = {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}

export default function Modal({ open, title, children, onClose }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.5)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 32px',
          width: '100%',
          maxWidth: 480,
          animation: 'slideUp .25s ease',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '999px',
              background: 'var(--bg)', border: 'none',
              fontSize: 16, color: 'var(--muted)',
            }}>✕</button>
        </div>
        {children}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  )
}
