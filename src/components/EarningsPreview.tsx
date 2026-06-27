export default function EarningsPreview({ price }: { price: number }) {
  const fee = price * 0.08
  const earnings = price * 0.92

  return (
    <div style={{
      background: 'var(--grs)',
      borderRadius: 12,
      padding: '10px 13px',
      fontSize: 12,
      color: 'var(--ink2)',
      lineHeight: 1.8,
    }}>
      <div>Customer pays: ₹{price.toLocaleString('en-IN')}</div>
      <div>TRENZO fee (8%): ₹{fee.toFixed(0)}</div>
      <div style={{ fontWeight: 700, color: 'var(--green)' }}>
        Your earnings: ₹{earnings.toFixed(0)}/sale
      </div>
    </div>
  )
}
