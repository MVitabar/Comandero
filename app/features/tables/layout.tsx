import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Table Management - Restaurant Layout System',
  description: 'Visual table management system for restaurants. Create table maps, bulk table creation, real-time status tracking, and mobile access to optimize your restaurant seating.',
  keywords: ['restaurant tables', 'table management', 'restaurant layout', 'table maps', 'seating management'],
  openGraph: {
    title: 'Table Management - Restaurant Layout System',
    description: 'Visual table management system for restaurants. Create table maps, bulk table creation, real-time status tracking, and mobile access.',
    url: 'https://www.comanderoweb.shop/features/tables',
  },
}

export default function TablesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
