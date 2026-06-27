import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TRENZO - Tamil Nadu Marketplace',
    short_name: 'TRENZO',
    description: "Tamil Nadu's trending marketplace — local sellers, trending deals",
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#5B4FCF',
    background_color: '#F8F7FF',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png',          sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png',          sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/apple-icon-180.png',    sizes: '180x180', type: 'image/png' },
    ],
    screenshots: [],
  }
}
