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
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-512x512.png',
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