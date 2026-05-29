import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: {
    default: 'Comandero - Restaurant Management System',
    template: '%s | Comandero'
  },
  description: 'Complete restaurant management system with orders, tables, reservations, staff management, inventory, and detailed reports. Optimize your restaurant operations with our powerful tools.',
  keywords: ['restaurant management', 'POS system', 'orders', 'tables', 'reservations', 'staff management', 'inventory', 'reports', 'restaurant software'],
  authors: [{ name: 'Comandero' }],
  creator: 'Comandero',
  publisher: 'Comandero',
  manifest: '/manifest.webmanifest',
  themeColor: '#000000',
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  applicationName: 'Comandero',
  appleWebApp: {
    capable: true,
    title: 'Comandero',
    statusBarStyle: 'black'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.comanderoweb.shop',
    title: 'Comandero - Restaurant Management System',
    description: 'Complete restaurant management system with orders, tables, reservations, staff management, inventory, and detailed reports.',
    siteName: 'Comandero',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Comandero Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comandero - Restaurant Management System',
    description: 'Complete restaurant management system with orders, tables, reservations, staff management, inventory, and detailed reports.',
    images: ['/icons/icon-512x512.png'],
    creator: '@comandero'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'googleeeda35db8a6a88a1.html'
  }
}