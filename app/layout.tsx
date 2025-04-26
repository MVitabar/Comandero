"use client"

import React, { useEffect, useState } from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/components/i18n-provider"
import { AuthProvider } from "@/components/auth-provider"
import { FirebaseProvider } from "@/components/firebase-provider"
import { FirebaseError } from "@/components/firebase-error"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { useAuth } from "@/components/auth-provider"
import { usePathname } from "next/navigation"
import LoginPage from "@/app/login/page"
import RegisterPage from "@/app/register/page"
import { UserProvider } from '@/contexts/UserContext';
import "./globals.css"
import { PermissionsProvider } from "@/components/permissions-provider"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseProvider>
            <FirebaseError />
            <AuthProvider>
              <I18nProvider>
                <UserProvider>
                  <PermissionsProvider>
                  <LayoutContent>{children}</LayoutContent>
                  <Toaster />
                  </PermissionsProvider>
                </UserProvider>
              </I18nProvider>
            </AuthProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Comprehensive debug logging
  React.useEffect(() => {
    console.group('🔍 Authentication State');
    console.log('User:', user ? { 
      uid: user.uid, 
      email: user.email, 
      displayName: user.displayName 
    } : null);
    console.log('Loading:', loading);
    console.groupEnd();
  }, [user, loading])

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  // Allow access to login and register pages when not authenticated
  if (!user && (pathname === "/login" || pathname === "/register")) {
    return pathname === "/login" ? <LoginPage /> : <RegisterPage />
  }

  // Redirect to login if no user and not on login/register pages
  return !user ? (
    <LoginPage />
  ) : (
    <div className="flex min-h-screen">
      <main className="flex-1 overflow-x-hidden pl-0 md:pl-[250px] transition-all duration-300 pt-16 md:pt-0 pb-20 md:pb-0">
        {children}
      </main>
      <CollapsibleSidebar />
    </div>
  )
}