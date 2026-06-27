import Link from 'next/link'

export default function SellerPendingPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#FFFBEB', border: '1.5px solid #FCD34D',
        borderRadius: 24, padding: 32, maxWidth: 360, width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#92400E', marginBottom: 8 }}>
          Application Under Review
        </h2>
        <p style={{ fontSize: 14, color: '#B45309', marginBottom: 24 }}>
          We'll notify you when approved. Usually takes 1-2 days.
        </p>
        <Link href="/">
          <button style={{
            background: 'var(--ig)', color: '#fff',
            borderRadius: 999, padding: '12px 28px',
            fontSize: 14, fontWeight: 700,
          }}>Back to Home</button>
        </Link>
      </div>
    </div>
  )
}
