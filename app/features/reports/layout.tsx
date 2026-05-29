import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reports & Analytics - Restaurant Business Intelligence',
  description: 'Comprehensive restaurant reporting system with sales analytics, detailed reports, data export, and custom periods. Make data-driven decisions to optimize your restaurant business.',
  keywords: ['restaurant reports', 'sales analytics', 'business intelligence', 'restaurant analytics', 'data export'],
  openGraph: {
    title: 'Reports & Analytics - Restaurant Business Intelligence',
    description: 'Comprehensive restaurant reporting system with sales analytics, detailed reports, data export, and custom periods.',
    url: 'https://www.comanderoweb.shop/features/reports',
  },
}

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
