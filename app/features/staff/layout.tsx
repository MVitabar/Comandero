import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Staff Management - Restaurant Team System',
  description: 'Complete restaurant staff management with role-based permissions, shift scheduling, performance tracking, and mobile access. Improve team productivity and operational efficiency.',
  keywords: ['restaurant staff', 'team management', 'employee scheduling', 'role management', 'restaurant operations'],
  openGraph: {
    title: 'Staff Management - Restaurant Team System',
    description: 'Complete restaurant staff management with role-based permissions, shift scheduling, performance tracking, and mobile access.',
    url: 'https://www.comanderoweb.shop/features/staff',
  },
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
