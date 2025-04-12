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
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore'

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

  // Función para generar nombre de usuario
  const generateUsername = (email: string): string => {
    if (!email) return 'user' + Math.floor(Math.random() * 10000)
    
    // Extraer parte antes del @ 
    const baseUsername = email.split('@')[0]
    
    // Reemplazar caracteres no permitidos
    const sanitizedUsername = baseUsername
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      
    // Si queda vacío, generar uno aleatorio
    return sanitizedUsername || 'user' + Math.floor(Math.random() * 10000)
  }

  // Función para verificar si un nombre de usuario ya existe
  const isUsernameTaken = async (username: string, establishmentName: string): Promise<boolean> => {
    if (!db) return false

    const baseSlug = establishmentName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim()

    try {
      const usersRef = collection(db, 'establishments', baseSlug, 'users')
      const q = query(usersRef, where('username', '==', username))
      const querySnapshot = await getDocs(q)
      
      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    }
  }

  // Función para generar nombre de usuario único
  const generateUniqueUsername = async (email: string, establishmentName: string): Promise<string> => {
    let baseUsername = generateUsername(email)
    let uniqueUsername = baseUsername
    let counter = 1

    while (await isUsernameTaken(uniqueUsername, establishmentName)) {
      uniqueUsername = `${baseUsername}${counter}`
      counter++
    }

    return uniqueUsername
  }

  // Función de registro actualizada
  const signUp = async (email: string, password: string, establishmentName?: string): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Sign up failed:", error)
      throw error
    }
  }

  // Función de obtención de detalles de usuario
  const fetchUserDetails = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    if (!db) return null

    try {
      const globalUserRef = doc(db, 'users', firebaseUser.uid)
      const globalUserDoc = await getDoc(globalUserRef)

      if (!globalUserDoc.exists()) {
        // Migración o primer inicio de sesión
        await initializeUserProfile(firebaseUser)
      }

      const userData = globalUserDoc.data()
      const currentEstablishmentName = userData?.currentEstablishmentName || 'restaurante-milenio'

      // Fetch establishment details
      let establishmentName = currentEstablishmentName
      const establishmentRef = doc(db, 'establishments', establishmentName, 'info', 'details')
      const establishmentDoc = await getDoc(establishmentRef)
      
      if (establishmentDoc.exists()) {
        // Prioritize the name from the establishment document
        establishmentName = establishmentDoc.data()?.name || establishmentName
      }

      const customUser: User = {
        ...firebaseUser,
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        username: userData?.username || await generateUniqueUsername(firebaseUser.email || '', currentEstablishmentName),
        role: userData?.role || UserRole.Staff,
        currentEstablishmentName,
        name: establishmentName, // Use the fetched establishment name
        restaurantName: establishmentName, // Add this for compatibility
        status: userData?.status || 'active',
        createdAt: userData?.createdAt || new Date(),
        phoneNumber: userData?.phoneNumber || firebaseUser.phoneNumber,
        position: userData?.position || '',
        loading: false,
        login: async (email: string, password: string) => {
          await signInWithEmailAndPassword(auth, email, password)
        },
        logout: async () => {
          await signOut(auth)
        },
        signUp: async (email: string, password: string, establishmentName?: string) => {
          await signUp(email, password, establishmentName)
        }
      }

      console.log('Fetched User Details:', customUser)

      return customUser
    } catch (error) {
      console.error("Error fetching user details:", error)
      return null
    }
  }

  // Función de inicialización de perfil de usuario
  const initializeUserProfile = async (firebaseUser: FirebaseUser) => {
    const establishmentName = firebaseUser.uid

    // Crear perfil global
    const globalUserRef = doc(db, 'users', firebaseUser.uid)
    await setDoc(globalUserRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '', // Manejar caso de email nulo
      username: await generateUniqueUsername(
        firebaseUser.email ?? `user_${firebaseUser.uid}`, // Manejar caso de email nulo
        establishmentName
      ),
      currentEstablishmentName: establishmentName,
      role: UserRole.Owner,
      status: 'active',
      createdAt: new Date()
    })

    // Crear documento en establecimiento
    const establishmentUserRef = doc(db, 'establishments', establishmentName, 'users', firebaseUser.uid)
    await setDoc(establishmentUserRef, {
      uid: firebaseUser.uid,
      username: await generateUniqueUsername(
        firebaseUser.email ?? `user_${firebaseUser.uid}`, // Manejar caso de email nulo
        establishmentName
      ),
      email: firebaseUser.email,
      role: UserRole.Owner,
      status: 'active',
      createdAt: new Date()
    })
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

  return <AuthContext.Provider value={{ 
    user, 
    loading, 
    login, 
    logout, 
    signUp 
  }}>{children}</AuthContext.Provider>
}
