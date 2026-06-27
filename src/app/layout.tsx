import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

export const dynamic = 'force-dynamic'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TRENZO — Trending deals · Local sellers',
  description: "Tamil Nadu's trending marketplace",
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'TRENZO' },
}

export const viewport: Viewport = {
  themeColor: '#5B4FCF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.className}>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#fff',
                  color: '#0F0A2A',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(91,79,207,.12)',
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '12px 20px',
                },
                success: { style: { borderLeft: '4px solid #10B981' } },
                error:   { style: { borderLeft: '4px solid #FF5C5C' } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
