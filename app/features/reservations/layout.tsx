import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reservations Management - Restaurant Booking System',
  description: 'Easy restaurant reservation system with scheduling, capacity management, automatic notifications, and mobile booking. Reduce no-shows and optimize your restaurant capacity.',
  keywords: ['restaurant reservations', 'booking system', 'reservation management', 'table booking', 'restaurant scheduling'],
  openGraph: {
    title: 'Reservations Management - Restaurant Booking System',
    description: 'Easy restaurant reservation system with scheduling, capacity management, automatic notifications, and mobile booking.',
    url: 'https://www.comanderoweb.shop/features/reservations',
  },
}

export default function ReservationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
