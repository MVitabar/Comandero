import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Comandero',
  description: 'Restaurant Management App',
  manifest: '/manifest.webmanifest',
  themeColor: '#000000',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-512x512.png',
  },
  applicationName: 'Comandero',
  appleWebApp: {
    capable: true,
    title: 'Comandero',
    statusBarStyle: 'black'
  }
}