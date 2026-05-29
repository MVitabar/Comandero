import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders Management - Restaurant POS System',
  description: 'Efficient order management system for restaurants. Mobile orders, real-time updates, staff management, and fast processing to improve your restaurant operations.',
  keywords: ['restaurant orders', 'POS system', 'mobile ordering', 'restaurant management', 'order processing'],
  openGraph: {
    title: 'Orders Management - Restaurant POS System',
    description: 'Efficient order management system for restaurants. Mobile orders, real-time updates, staff management, and fast processing.',
    url: 'https://www.comanderoweb.shop/features/orders',
  },
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
