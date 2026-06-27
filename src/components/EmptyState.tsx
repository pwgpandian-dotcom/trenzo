import Link from 'next/link'

type EmptyStateProps = {
  emoji: string
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
}

export default function EmptyState({ emoji, title, subtitle, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 24px', textAlign: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 48 }}>{emoji}</span>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 240 }}>{subtitle}</p>}
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} style={{ textDecoration: 'none', marginTop: 8 }}>
          <button style={{
            background: 'var(--ig)', color: '#fff',
            borderRadius: 999, padding: '12px 28px',
            fontSize: 13, fontWeight: 700,
          }}>{ctaLabel}</button>
        </Link>
      )}
    </div>
  )
}
