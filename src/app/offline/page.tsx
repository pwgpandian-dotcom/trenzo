export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F8F7FF', padding: 24, textAlign: 'center',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24,
        background: 'linear-gradient(135deg,#2D1F8C,#5B4FCF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, fontWeight: 800, color: '#fff',
        boxShadow: '0 6px 20px rgba(91,79,207,.28)', marginBottom: 24,
      }}>T</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F0A2A', marginBottom: 8 }}>
        You're offline
      </h1>
      <p style={{ fontSize: 14, color: '#64607A', maxWidth: 280, lineHeight: 1.6 }}>
        No internet connection. Check your network and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 24, background: 'linear-gradient(135deg,#2D1F8C,#5B4FCF)',
          color: '#fff', borderRadius: 999, padding: '13px 32px',
          fontSize: 14, fontWeight: 700,
        }}
      >Try again</button>
    </div>
  )
}
