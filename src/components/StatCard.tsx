type StatCardProps = {
  icon: string
  label: string
  value: string | number
  accent?: string
}

export default function StatCard({ icon, label, value, accent = 'var(--i)' }: StatCardProps) {
  const softBg = accent.includes('#') ? accent + '15' : 'var(--is)'

  return (
    <div style={{
      background: 'var(--surf)',
      borderRadius: 18,
      boxShadow: 'var(--sh1)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '999px',
        background: softBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 900, color: accent, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}
