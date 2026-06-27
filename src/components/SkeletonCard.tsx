export default function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--surf)',
      borderRadius: 20,
      boxShadow: 'var(--sh1)',
      overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ height: 140 }} />
      <div style={{ padding: '10px 12px 14px' }}>
        <div className="skeleton" style={{ height: 10, width: '50%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 4 }} />
        <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 10, width: '40%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 30, borderRadius: 999 }} />
      </div>
    </div>
  )
}
