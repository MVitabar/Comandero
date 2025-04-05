"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"

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

interface FirebaseContextType {
  app: FirebaseApp | null
  db: Firestore | null
  auth: Auth | null
  isInitialized: boolean
  error: Error | null
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  db: null,
  auth: null,
  isInitialized: false,
  error: null,
})

export const useFirebase = () => useContext(FirebaseContext)

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [firebaseState, setFirebaseState] = useState<FirebaseContextType>({
    app: null,
    db: null,
    auth: null,
    isInitialized: false,
    error: null,
  })

  useEffect(() => {
    let app: FirebaseApp | null = null
    let db: Firestore | null = null
    let auth: Auth | null = null
    let initializationError: Error | null = null

    try {
      if (getApps().length === 0) {
        // Initialize Firebase if it hasn't been initialized yet
        app = initializeApp(firebaseConfig)
        console.log("Firebase initialized successfully")
      } else {
        // Use the existing Firebase app
        app = getApps()[0]
        console.log("Using existing Firebase app")
      }

      // Initialize Firestore and Auth
      db = getFirestore(app)
      auth = getAuth(app)

      // Configure persistence to local (this helps with auth state persistence)
      auth.useDeviceLanguage()
    } catch (error) {
      console.error("Error initializing Firebase:", error)
      initializationError = error instanceof Error ? error : new Error(String(error))
    } finally {
      setFirebaseState({
        app: app || null,
        db: db || null,
        auth: auth || null,
        isInitialized: true,
        error: initializationError,
      })
    }
  }, [])

  return <FirebaseContext.Provider value={firebaseState}>{children}</FirebaseContext.Provider>
}

