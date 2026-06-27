import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TRENZO',
    short_name: 'TRENZO',
    description: 'Trending deals · Local sellers',
    start_url: '/',
    display: 'standalone',
    theme_color: '#4F3FD4',
    background_color: '#F4F2FF',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
