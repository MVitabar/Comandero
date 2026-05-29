import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventory Management - Restaurant Stock System',
  description: 'Complete restaurant inventory management with real-time stock tracking, low stock alerts, cost control, and usage analytics. Reduce waste by up to 40% and optimize your inventory.',
  keywords: ['restaurant inventory', 'stock management', 'inventory control', 'cost tracking', 'restaurant supplies'],
  openGraph: {
    title: 'Inventory Management - Restaurant Stock System',
    description: 'Complete restaurant inventory management with real-time stock tracking, low stock alerts, cost control, and usage analytics.',
    url: 'https://www.comanderoweb.shop/features/inventory',
  },
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
