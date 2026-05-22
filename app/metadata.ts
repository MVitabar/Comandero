import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comandero',
  description: 'Restaurant Management App',
  manifest: '/manifest.webmanifest',
  themeColor: '#000000',
  icons: [
    { rel: 'icon', href: '/icons/icon-192x192.png' },
    { rel: 'apple-touch-icon', href: '/icons/icon-512x512.png' }
  ],
  applicationName: 'Comandero',
  appleWebApp: {
    capable: true,
    title: 'Comandero',
    statusBarStyle: 'black'
  }
}