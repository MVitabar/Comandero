"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import { useFirebase } from "./firebase-provider"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

const publicRoutes = ["/login", "/register", "/forgot-password"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { auth, isInitialized, error } = useFirebase()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    // If Firebase failed to initialize, don't proceed with auth
    if (error || !isInitialized) {
      setLoading(false)
      return
    }

    if (!auth) return

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user)
        setLoading(false)

        if (!user && !publicRoutes.includes(pathname)) {
          router.push("/login")
        }
      },
      (error) => {
        console.error("Auth state change error:", error)
        setLoading(false)
        toast({
          title: "Authentication Error",
          description: "There was a problem with authentication. Please try again.",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [auth, isInitialized, error, pathname, router, toast])

  // If Firebase failed to initialize and we're not on a public route, redirect to login
  useEffect(() => {
    if (error && !publicRoutes.includes(pathname)) {
      router.push("/login")
    }
  }, [error, pathname, router])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

