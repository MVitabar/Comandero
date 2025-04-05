import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/components/i18n-provider"
import { AuthProvider } from "@/components/auth-provider"
import { FirebaseProvider } from "@/components/firebase-provider"
import { FirebaseError } from "@/components/firebase-error"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Comandero",
  description: "Comandero - Restaurant Management System",
  manifest: "/manifest.json",
    generator: 'MVitabar'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseProvider>
            <FirebaseError />
            <AuthProvider>
              <I18nProvider>
                <div className="flex flex-col md:grid min-h-screen md:grid-cols-[auto_1fr] w-full max-w-full overflow-x-hidden">
                  <CollapsibleSidebar />
                  <main className="flex-1 w-full min-h-screen overflow-x-hidden p-4 md:p-6">
                    {children}
                  </main>
                  <Toaster />
                </div>
              </I18nProvider>
            </AuthProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}