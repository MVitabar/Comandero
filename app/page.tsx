"use client"

import { redirect } from 'next/navigation'
import { useAuth } from "@/components/auth-provider"

export default function RootPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return null // or a loading spinner
  }

  if (!user) {
    redirect('/login')
  }

  redirect('/dashboard') // or your default authenticated route
}