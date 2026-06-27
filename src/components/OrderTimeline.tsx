type Step = 'placed' | 'confirmed' | 'shipped' | 'delivered'

const STEPS: { key: Step; label: string }[] = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

const ORDER: Step[] = ['placed', 'confirmed', 'shipped', 'delivered']

export default function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = ORDER.indexOf(currentStatus as Step)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 0' }}>
      {STEPS.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
            {/* Connector line */}
            {i > 0 && (
              <div style={{
                position: 'absolute',
                top: 12,
                right: '50%',
                left: '-50%',
                height: 2,
                background: i <= currentIdx ? 'var(--green)' : 'var(--line)',
              }} />
            )}
            {/* Circle */}
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '999px',
              background: done ? 'var(--green)' : active ? 'var(--i)' : 'var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: done || active ? '#fff' : 'var(--muted)',
              fontWeight: 900,
              position: 'relative',
              zIndex: 1,
              boxShadow: active ? 'var(--shi)' : 'none',
            }}>
              {done ? '✓' : active ? (
                <span style={{ animation: 'pulse-dot 1.5s ease-in-out infinite', display: 'block', width: 8, height: 8, borderRadius: '999px', background: '#fff' }} />
              ) : ''}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: done ? 'var(--green)' : active ? 'var(--i)' : 'var(--muted)',
              marginTop: 4,
              textAlign: 'center',
            }}>{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}
