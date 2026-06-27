import Link from 'next/link'

type CategoryCircleProps = {
  name: string
  icon: string
  color: string
  slug: string
  active?: boolean
}

export default function CategoryCircle({ name, icon, color, slug, active }: CategoryCircleProps) {
  return (
    <Link href={`/search?category=${slug}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 60 }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '999px',
          background: color + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          border: active ? `3px solid ${color}` : '3px solid transparent',
          transition: 'border .15s',
        }}>{icon}</div>
        <span style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: 'var(--ink2)',
          textAlign: 'center',
          lineHeight: 1.2,
        }}>{name}</span>
      </div>
    </Link>
  )
}
