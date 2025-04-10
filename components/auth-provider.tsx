"use client"

import type React from "react"
import { AuthContextType, User, UserRole } from "@/types"

import { createContext, useContext, useEffect, useState } from "react"
import { 
  type User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { useToast } from "@/components/ui/use-toast"
import { doc, getDoc } from "firebase/firestore"

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: function (email: string, password: string): Promise<void> {
    throw new Error("Function not implemented.")
  },
  logout: function (): Promise<void> {
    throw new Error("Function not implemented.")
  },
  signUp: function (email: string, password: string): Promise<void> {
    throw new Error("Function not implemented.")
  }
})

export const useAuth = () => useContext(AuthContext)

const publicRoutes = ["/login", "/register", "/forgot-password"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { db, auth, isInitialized, error } = useFirebase()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Debug method to check authentication state
  const debugAuthState = () => {
    console.group('🔍 Authentication State Debug')
    console.log('Firebase Context:', {
      isInitialized,
      authAvailable: !!auth,
      dbAvailable: !!db,
      error: error?.message
    })

    console.log('Current Auth State:', {
      user: user ? {
        id: user.uid,
        email: user.email,
        username: user.username,
        role: user.role
      } : 'No User',
      loading,
      pathname
    })

    // Check Firebase Auth current user
    if (auth) {
      const currentUser = auth.currentUser
      console.log('Firebase Auth Current User:', currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified
      } : 'No Current User')
    }

    console.groupEnd()

    return {
      isAuthenticated: !!user,
      user,
      loading,
      authAvailable: !!auth
    }
  }

  // Expose debug method globally for easier debugging
  useEffect(() => {
    // @ts-ignore
    window.debugAuthState = debugAuthState
  }, [user, auth, loading])

  // Comprehensive initial state logging
  useEffect(() => {
    console.group('🔐 AuthProvider Initial State');
    console.log('User:', user ? { 
      uid: user.uid, 
      email: user.email 
    } : null);
    console.log('Loading:', loading);
    console.log('Firebase Initialized:', isInitialized);
    console.log('Auth Available:', !!auth);
    console.log('Error:', error);
    console.groupEnd();
  }, [])

  // Fetch additional user details from Firestore
  const fetchUserDetails = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    console.group('🔍 Fetch User Details')
    console.log('Firebase User Input:', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName
    })

    if (!db) {
      console.warn('Firestore database not available')
      console.groupEnd()
      return null
    }

    try {
      const userDocRef = doc(db, 'restaurants', firebaseUser.uid, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)

      // Default implementation of authentication methods
      const authMethods = {
        login: async (email: string, password: string) => {
          try {
            await signInWithEmailAndPassword(auth, email, password)
          } catch (error) {
            console.error("Login failed:", error)
            throw error
          }
        },
        logout: async () => {
          try {
            await signOut(auth)
          } catch (error) {
            console.error("Logout failed:", error)
            throw error
          }
        },
        signUp: async (email: string, password: string) => {
          try {
            await createUserWithEmailAndPassword(auth, email, password)
          } catch (error) {
            console.error("Sign up failed:", error)
            throw error
          }
        }
      }

      // Prepare user data with fallback values
      const userData = userDoc.exists() ? userDoc.data() : {}
      
      const customUser: User = {
        // Always include Firebase user properties
        ...firebaseUser,
        
        // Ensure required properties exist
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        
        // Username fallback
        username: userData.username 
          || firebaseUser.displayName 
          || firebaseUser.email?.split('@')[0] 
          || 'Unknown',
        
        // Role fallback
        role: userData.role || 'staff',
        
        // Optional properties with fallbacks
        phoneNumber: userData.phoneNumber || firebaseUser.phoneNumber || null,
        position: userData.position || '',
        
        // Add authentication methods
        ...authMethods,
        
        // Additional flags
        loading: false
      }

      console.log('Transformed Custom User:', {
        uid: customUser.uid,
        email: customUser.email,
        username: customUser.username,
        role: customUser.role
      })

      console.groupEnd()
      return customUser
    } catch (error) {
      console.error("Error fetching user details:", error)
      console.groupEnd()
      return null
    }
  }

  useEffect(() => {
    // Immediate loading state if Firebase is not initialized
    if (!isInitialized || !auth) {
      console.warn('🚨 Firebase not fully initialized', { 
        isInitialized, 
        authAvailable: !!auth 
      });
      setLoading(true)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true)
        if (firebaseUser) {
          const customUser = await fetchUserDetails(firebaseUser)
          setUser(customUser)
        } else {
          setUser(null)
        }
        setLoading(false)

        // Redirect logic
        if (!firebaseUser && !publicRoutes.includes(pathname)) {
          console.log('🚪 Redirecting to login');
          router.push("/login")
        }
      },
      (authError) => {
        console.error("🔥 Auth state change error:", authError)
        setLoading(false)
        toast({
          title: "Authentication Error",
          description: authError.message || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    )

    return () => unsubscribe()
  }, [auth, isInitialized, pathname, router, toast])

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      const customUser = await fetchUserDetails(firebaseUser)
      setUser(customUser)
      
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      const customUser = await fetchUserDetails(firebaseUser)
      setUser(customUser)
      
      toast({
        title: "Sign Up Successful",
        description: "Your account has been created successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Sign up error:", error)
      toast({
        title: "Sign Up Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
      throw error
    }
  }

  return <AuthContext.Provider value={{ 
    user, 
    loading, 
    login, 
    logout, 
    signUp 
  }}>{children}</AuthContext.Provider>
}
