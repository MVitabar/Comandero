"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"
import { FirebaseContextType, User } from "@/types"
import { useAuth } from "@/components/auth-provider"

// Firebase configuration
// NOTE: These values should be replaced with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBkGY3e9bRalT30VKf9cV-VUlKY5gSx_MQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "restaurante-ad850.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "restaurante-ad850",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "restaurante-ad850.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "80588710474",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:80588710474:web:93a4177a5de638610f3cb3",
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  db: null,
  auth: null,
  user: null,
  isInitialized: false,
  error: null,
})

export const useFirebase = () => useContext(FirebaseContext)

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth()
  const [firebaseState, setFirebaseState] = useState<FirebaseContextType>({
    app: null,
    db: null,
    auth: null,
    user: null,
    isInitialized: false,
    error: null,
  })

  useEffect(() => {
    console.group('🔥 Firebase Initialization');
    console.log('Environment Variables:');
    console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Not Set');
    console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.groupEnd();

    let app: FirebaseApp | null = null
    let db: Firestore | null = null
    let auth: Auth | null = null
    let initializationError: Error | null = null

    try {
      // Validate configuration
      if (!firebaseConfig.apiKey) {
        throw new Error('❌ Firebase API Key is missing. Check your .env configuration.')
      }

      // Initialize Firebase
      app = getApps().length === 0 
        ? initializeApp(firebaseConfig) 
        : getApps()[0]

      console.log('🟢 Firebase App Initialized:', app.name);

      // Initialize Firestore and Auth
      db = getFirestore(app)
      auth = getAuth(app)

      console.log('🔐 Authentication Service:', auth ? '✅ Available' : '❌ Not Available');
      console.log('📊 Firestore Service:', db ? '✅ Available' : '❌ Not Available');

      // Additional auth configuration
      if (auth) {
        auth.useDeviceLanguage()
      }
    } catch (error) {
      console.error('❌ Firebase Initialization Error:', error);
      
      initializationError = error instanceof Error 
        ? error 
        : new Error('Unknown Firebase initialization error')
    } finally {
      setFirebaseState(prev => ({
        ...prev,
        app: app || null,
        db: db || null,
        auth: auth || null,
        isInitialized: true,
        error: initializationError,
      }))
    }
  }, [])

  const validateAndPropagateUser = (user: User | null) => {
    console.group('🔍 User State Validation')
    
    // Detailed logging of all potential user sources
    console.log('Incoming User:', user ? {
      id: user.uid,
      email: user.email,
      username: user.username,
      role: user.role
    } : '❌ No User')

    console.log('Current Authentication Context:', {
      windowUser: (window as any).user,
      authProviderUser: authUser,
      firebaseStateUser: firebaseState.user
    })

    // Comprehensive user validation with fallback mechanisms
    const isValidUser = user && (
      // Primary validation
      (user.uid && user.email) || 
      // Fallback validation using Firebase Auth properties
      (user.uid && user.email)
    )

    // Attempt to reconstruct user if validation fails
    let reconstructedUser: User | null = null
    if (!isValidUser && authUser) {
      reconstructedUser = {
        uid: authUser.uid || authUser.uid,
        email: authUser.email || '',
        username: authUser.displayName || authUser.username || '',
        role: authUser.role || 'user',
        phoneNumber: authUser.phoneNumber,
        position: '',
        status: authUser.status || 'active',
        emailVerified: authUser.emailVerified ?? false,
        loading: false,
        login: async (email: string, password: string) => {
          // Placeholder implementation
          console.warn('Login method called on reconstructed user')
          return { success: false, error: 'Not implemented' }
        },
        logout: async () => {
          // Placeholder implementation
          console.warn('Logout method called on reconstructed user')
          return { success: false, error: 'Not implemented' }
        },
        signUp: async (email: string, password: string) => {
          // Placeholder implementation
          console.warn('SignUp method called on reconstructed user')
          return { success: false, error: 'Not implemented' }
        }
      } as User
    }

    console.log('User Validation:', {
      isValid: !!isValidUser,
      hasId: !!user?.uid,
      hasEmail: !!user?.email,
      reconstructed: !!reconstructedUser
    })

    console.groupEnd()

    // Return validated or reconstructed user
    return isValidUser ? user : reconstructedUser
  }

  useEffect(() => {
    setFirebaseState(prev => {
      const validatedUser = validateAndPropagateUser(authUser)
      
      return {
        ...prev,
        user: validatedUser
      }
    })
  }, [authUser])

  useEffect(() => {
    console.group('🔍 Firebase Provider State');
    console.log('App:', firebaseState.app ? '✅ Initialized' : '❌ Not Initialized');
    console.log('Auth:', firebaseState.auth ? '✅ Available' : '❌ Not Available');
    console.log('User:', firebaseState.user ? '✅ Logged In' : '❌ Not Logged In', 
      firebaseState.user ? {
        id: firebaseState.user.uid,
        email: firebaseState.user.email
      } : null
    );
    console.log('Error:', firebaseState.error?.message || 'No Errors');
    console.groupEnd();
  }, [firebaseState])

  return <FirebaseContext.Provider value={firebaseState}>{children}</FirebaseContext.Provider>
}
