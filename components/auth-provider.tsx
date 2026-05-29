"use client"

import type React from "react"
import { AuthContextType, User, UserRole, LoginAttempt } from "@/types"

import { createContext, useContext, useEffect, useState } from "react"
import { 
  type User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import {toast} from "sonner"
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Firestore,
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp, 
  writeBatch, 
  increment,
  runTransaction,
  limit
} from 'firebase/firestore'
import { getFirestorePaths } from '@/lib/firestore-paths';
import { nanoid } from 'nanoid';
import { useI18n } from '@/components/i18n-provider';

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  loading: true,
  login: async () => ({ success: false, needsPasswordChange: false, user: null }),
  logout: async () => ({ success: false }),
  signUp: async (email, password, options) => {
    console.warn('Default signUp method called');
    return {
      success: false,
      error: 'Sign up method not implemented',
      userId: undefined,
      needsPasswordChange: false
    };
  },
  signInWithGoogle: async () => ({ success: false, error: 'Google sign-in not implemented', user: null }),
  completeSetup: async (establishmentName: string) => ({ success: false, error: 'Setup completion not implemented' }),
  refreshUser: async () => {}
})

export const useAuth = () => useContext(AuthContext)

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/invitation/register", "/setup", "/privacy-policy", "/terms-and-conditions", "/features/"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { db, auth, isInitialized, error } = useFirebase()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useI18n()

  // Debug method to check authentication state
  const debugAuthState = () => {
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
  const signUp = async (
    email: string, 
    password: string, 
    options?: {
      establishmentName?: string;
      role?: UserRole;
      username?: string;
      subscriptionPlan?: string;
      trialStartDate?: Date;
      trialEndDate?: Date;
      isTrialActive?: boolean;
    }
  ): Promise<{ success: boolean, error?: string, userId?: string, needsPasswordChange?: boolean }> => {
    try {
      // Validate inputs
      if (!email) {
        return {
          success: false,
          error: t('auth.errors.emailRequired'),
          needsPasswordChange: false
        };
      }

      if (!password) {
        return {
          success: false,
          error: t('auth.errors.passwordRequired'),
          needsPasswordChange: false
        };
      }

      // Detailed logging for debugging
      console.log('Sign Up Attempt:', {
        email,
        establishmentName: options?.establishmentName,
        role: options?.role
      });

      // Check if this email was previously deleted to prevent trial reset
      let previousTrialInfo = null
      if (db) {
        try {
          const deletedAccountRef = doc(db, 'deletedAccounts', email)
          const deletedAccountDoc = await getDoc(deletedAccountRef)
          
          if (deletedAccountDoc.exists()) {
            previousTrialInfo = deletedAccountDoc.data()
            console.log('Found previous trial info for deleted account:', previousTrialInfo)
          }
        } catch (error) {
          console.error('Error checking deleted accounts:', error)
        }
      }

      // Check if this is a Google sign-in user completing setup
      const pendingFirebaseUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('pendingFirebaseUser') || 'null') : null
      let firebaseUser: FirebaseUser

      if (pendingFirebaseUser && pendingFirebaseUser.email === email) {
        // User is completing setup after Google sign-in - use the existing Firebase user
        if (!auth.currentUser) {
          // Need to sign in with Google again to get the Firebase user
          const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
          const provider = new GoogleAuthProvider()
          const result = await signInWithPopup(auth, provider)
          firebaseUser = result.user
        } else {
          firebaseUser = auth.currentUser
        }
      } else {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        firebaseUser = userCredential.user
      }

      // Default establishment name if not provided
      const baseSlug = options?.establishmentName || 'restaurante-milenio';
      
      // Use previous trial info if available, otherwise use provided options or defaults
      const signUpOptions = {
        ...options,
        trialStartDate: previousTrialInfo?.trialStartDate || options?.trialStartDate,
        trialEndDate: previousTrialInfo?.trialEndDate || options?.trialEndDate,
        isTrialActive: previousTrialInfo?.isTrialActive || options?.isTrialActive || false,
        subscriptionPlan: previousTrialInfo?.subscriptionPlan || options?.subscriptionPlan || 'basic'
      }
      
      // Initialize user profile with the new method
      const newUser = await initializeUserProfile(
        firebaseUser, 
        baseSlug, 
        db,
        signUpOptions
      );

      if (!newUser) {
        return {
          success: false,
          error: t('auth.errors.profileNotFound'),
          needsPasswordChange: false
        };
      }

      // Automatically sign in the user
      await signInWithEmailAndPassword(auth, email, password);

      // Send email verification only if not verified
      if (!firebaseUser.emailVerified) {
        try {
          await sendEmailVerification(firebaseUser);
        } catch (verificationError) {
          console.error('Email verification error:', verificationError);
          // Non-critical error, so we'll continue
        }
      }

      // Log successful user creation
      console.log('User created successfully:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        previousTrialRestored: !!previousTrialInfo
      });

      // Update the user state in the context
      setUser(newUser);

      return {
        success: true,
        userId: firebaseUser.uid,
        needsPasswordChange: false
      };
    } catch (error) {
      // Comprehensive error logging
      console.error('Complete Sign Up Error:', error);
      
      let errorMessage = t('auth.errors.unexpectedError');
      let errorName = "Unknown";
      let errorStack = "No stack";
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
        if ('name' in error) {
          errorName = String((error as { name: unknown }).name);
        }
        if ('stack' in error) {
          errorStack = String((error as { stack: unknown }).stack);
        }
        
        console.error('Error Name:', errorName);
        console.error('Error Message:', errorMessage);
        console.error('Error Stack:', errorStack);

        switch (errorMessage) {
          case 'auth/email-already-in-use':
            errorMessage = t('auth.errors.emailAlreadyRegistered');
            break;
          case 'auth/invalid-email':
            errorMessage = t('auth.errors.invalidEmail');
            break;
          case 'auth/weak-password':
            errorMessage = t('auth.errors.weakPassword');
            break;
          default:
            // Keep the original error message
            break;
        }
      }

      return {
        success: false,
        error: errorMessage,
        needsPasswordChange: false
      };
    }
  };

  // Función de obtención de detalles de usuario
  const fetchUserDetails = async (firebaseUser: FirebaseUser) => {
    try {
      const db = getFirestore();
      let establishmentId: string | undefined;
      let userDetails: User | null = null;

      // First, try to find the establishment ID
      const restaurantsRef = collection(db, 'restaurants');
      const q = query(
        restaurantsRef, 
        where('users', 'array-contains', firebaseUser.uid)
      );
      const restaurantSnapshot = await getDocs(q);

      // Find the first restaurant where the user is a member
      for (const restaurantDoc of restaurantSnapshot.docs) {
        const userSnapshot = await getDocs(
          query(
            collection(restaurantDoc.ref, 'users'), 
            where('uid', '==', firebaseUser.uid)
          )
        );
        
        if (!userSnapshot.empty) {
          establishmentId = restaurantDoc.id;
          break;
        }
      }

      // If no establishment ID found from restaurants, check global users collection
      if (!establishmentId) {
        const globalUserRef = doc(db, 'users', firebaseUser.uid);
        const globalUserDoc = await getDoc(globalUserRef);
        
        if (globalUserDoc.exists()) {
          const globalUserData = globalUserDoc.data();
          establishmentId = globalUserData.establishmentId;
        }
      }

      // If still no establishment ID, return null
      if (!establishmentId) {
        return null;
      }

      // Try to fetch from establishment-specific users collection first
      const establishmentUserRef = doc(db, 'restaurants', establishmentId, 'users', firebaseUser.uid);
      const establishmentUserDoc = await getDoc(establishmentUserRef);

      if (establishmentUserDoc.exists()) {
        const establishmentUserData = establishmentUserDoc.data() as User;
        // Helper to convert Firestore Timestamp or string to Date
        const convertToDate = (value: any): Date | undefined => {
          if (!value) return undefined;
          if (value.toDate && typeof value.toDate === 'function') {
            return value.toDate();
          }
          if (typeof value === 'string') {
            return new Date(value);
          }
          if (value instanceof Date) {
            return value;
          }
          return new Date(value);
        };

        userDetails = {
          ...establishmentUserData,
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          emailVerified: firebaseUser.emailVerified,
          // Convert Firestore Timestamps to Dates
          trialStartDate: convertToDate(establishmentUserData.trialStartDate),
          trialEndDate: convertToDate(establishmentUserData.trialEndDate),
        };
      } else {
        // Fallback to global users collection
        const globalUserRef = doc(db, 'users', firebaseUser.uid);
        const globalUserDoc = await getDoc(globalUserRef);

        if (globalUserDoc.exists()) {
          const globalUserData = globalUserDoc.data() as User;
          // Helper to convert Firestore Timestamp or string to Date
          const convertToDate = (value: any): Date | undefined => {
            if (!value) return undefined;
            if (value.toDate && typeof value.toDate === 'function') {
              return value.toDate();
            }
            if (typeof value === 'string') {
              return new Date(value);
            }
            if (value instanceof Date) {
              return value;
            }
            return new Date(value);
          };

          userDetails = {
            ...globalUserData,
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            emailVerified: firebaseUser.emailVerified,
            // Convert Firestore Timestamps to Dates
            trialStartDate: convertToDate(globalUserData.trialStartDate),
            trialEndDate: convertToDate(globalUserData.trialEndDate),
          };
        } else {
          return null;
        }
      }

      // Ensure establishment information is complete
      if (userDetails) {
        userDetails.establishmentId = establishmentId;
        userDetails.currentEstablishmentName = 
          userDetails.currentEstablishmentName || 
          (await getEstablishmentName(db, establishmentId));
      }

      return userDetails;
    } catch (error) {
      return null;
    }
  };

  // Helper function to get establishment name
  const getEstablishmentName = async (db: Firestore, establishmentId: string): Promise<string | undefined> => {
    try {
      const restaurantDoc = await getDoc(doc(db, 'restaurants', establishmentId));
      return restaurantDoc.exists() ? restaurantDoc.data().name : undefined;
    } catch (error) {
      return undefined;
    }
  };

  // Helper function to safely convert phoneNumber
  const safePhoneNumber = (
    userPhone: string | null, 
    firebasePhone: string | null
  ): string | undefined => {
    // If userPhone is a non-empty string, return it
    if (userPhone) return userPhone;
    
    // If firebasePhone is a non-empty string, return it
    return firebasePhone || undefined;
  }

  // Helper function to create a valid User object for path generation
  const createTemporaryUser = (
    firebaseUser: FirebaseUser, 
    username: string, 
    baseSlug: string, 
    establishmentId: string
  ): User => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    username: username,
    role: UserRole.OWNER,
    currentEstablishmentName: baseSlug,
    establishmentId: establishmentId,
    status: 'active',
    loading: false,
    login: async () => {
      throw new Error('Temporary method')
    },
    logout: async () => {
      throw new Error('Temporary method')
    },
    signUp: async () => {
      throw new Error('Temporary method')
    },
    emailVerified: false
  });

  // Función de inicialización de perfil de usuario
  const generateEstablishmentId = (baseSlug: string): string => {
    // If the baseSlug already looks like a full path, extract the last part
    const extractedSlug = baseSlug.includes('/') 
      ? baseSlug.split('/').pop() || baseSlug  // Fallback to original slug if pop() returns undefined
      : baseSlug;

    // Sanitize the base slug to create a consistent identifier
    const sanitizedSlug = extractedSlug
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric chars with dash
      .replace(/-+/g, '-')         // Replace multiple dashes with single dash
      .trim()                      // Remove leading/trailing whitespace
      .substring(0, 30);           // Limit length to prevent extremely long IDs

    // Use a consistent hash to ensure same input always produces same output
    const crypto = require('crypto');
    const hash = crypto
      .createHash('md5')
      .update(sanitizedSlug)
      .digest('hex')
      .substring(0, 6);  // Use first 6 characters of hash

    return `${sanitizedSlug}-${hash}`;
  };

  const initializeUserProfile = async (
    firebaseUser: FirebaseUser, 
    baseSlug: string, 
    db: Firestore,
    options?: {
      role?: UserRole;
      username?: string;
      subscriptionPlan?: string;
      trialStartDate?: Date;
      trialEndDate?: Date;
      isTrialActive?: boolean;
    }
  ) => {
    try {
      // Validate input
      if (!firebaseUser.uid) {
        throw new Error('Invalid user: No UID provided');
      }

      // Check if this is the first user in the system
      const usersRef = collection(db, 'restaurants');
      const usersQuery = query(usersRef, limit(1));
      const usersSnapshot = await getDocs(usersQuery);

      // Determine role: 
      // 1. If options specify a role, use that
      // 2. If no users exist yet, default to OWNER
      // 3. Otherwise, default to WAITER
      const userRole = options?.role || 
        (usersSnapshot.empty ? UserRole.OWNER : UserRole.WAITER);
      
      const username = options?.username || 
        await generateUniqueUsername(firebaseUser.email || '', baseSlug);
      
      // Generate a consistent establishment ID
      const establishmentId = generateEstablishmentId(baseSlug);

      // Si el rol solicitado es OWNER, verifica que no exista ya un OWNER para este establecimiento
      if (userRole === UserRole.OWNER) {
        const establishmentUsersRef = collection(db, 'restaurants', establishmentId, 'users');
        const ownerQuery = query(establishmentUsersRef, where('role', '==', UserRole.OWNER), limit(1));
        const ownerSnapshot = await getDocs(ownerQuery);
        if (!usersSnapshot.empty && !ownerSnapshot.empty) {
          throw new Error(t('auth.errors.ownerAlreadyExists'));
        }
      }

      // Use a transaction to ensure atomic document creation
      const userCreationResult = await runTransaction(db, async (transaction) => {
        // Check global users collection
        const globalUserRef = doc(db, 'users', firebaseUser.uid);
        const globalUserSnap = await transaction.get(globalUserRef);

        // Check establishment users subcollection
        const userInEstablishmentRef = doc(
          db, 
          'restaurants', 
          establishmentId, 
          'users', 
          firebaseUser.uid
        );
        const userInEstablishmentSnap = await transaction.get(userInEstablishmentRef);

        // Create global user document only if it doesn't exist
        if (!globalUserSnap.exists()) {
          transaction.set(globalUserRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username: username,
            role: userRole, // Use the passed role
            currentEstablishmentName: baseSlug,
            establishmentId: establishmentId,
            createdAt: serverTimestamp(),
            status: 'active',
            subscriptionPlan: options?.subscriptionPlan || 'basic',
            trialStartDate: options?.trialStartDate || null,
            trialEndDate: options?.trialEndDate || null,
            isTrialActive: options?.isTrialActive || false
          }, { merge: true });
        }

        // Create establishment document
        const establishmentRef = doc(db, 'restaurants', establishmentId);
        transaction.set(establishmentRef, {
          name: baseSlug,
          ownerId: firebaseUser.uid,
          createdAt: serverTimestamp(),
          status: 'active',
          subscriptionPlan: options?.subscriptionPlan || 'basic',
          trialStartDate: options?.trialStartDate || null,
          trialEndDate: options?.trialEndDate || null,
          isTrialActive: options?.isTrialActive || false
        }, { merge: true });

        // Create user document in establishment's users subcollection only if it doesn't exist
        if (!userInEstablishmentSnap.exists()) {
          transaction.set(userInEstablishmentRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username: username,
            role: userRole, // Use the passed role
            createdAt: serverTimestamp(),
            status: 'active',
            subscriptionPlan: options?.subscriptionPlan || 'basic',
            trialStartDate: options?.trialStartDate || null,
            trialEndDate: options?.trialEndDate || null,
            isTrialActive: options?.isTrialActive || false
          }, { merge: true });
        }

        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: username,
          role: userRole,
          currentEstablishmentName: baseSlug,
          establishmentId: establishmentId
        } as User;
      });

      // Initialize default inventory categories (disabled - categories are now managed by owners)
      // await initializeInventoryCategories(db, establishmentId);

      return userCreationResult;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    // Immediate loading state if Firebase is not initialized
    if (!isInitialized || !auth) {
      setLoading(true)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true)
        if (firebaseUser) {
          const customUser = await fetchUserDetails(firebaseUser)
          
          // If user is authenticated but has no Firestore profile and is on setup page, allow access
          if (!customUser && pathname === '/setup') {
            setUser(null)
            setLoading(false)
            return
          }
          
          setUser(customUser)
        } else {
          setUser(null)
        }
        setLoading(false)

        // Redirect logic
        if (!firebaseUser && !publicRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
          router.push("/login")
        }
      },
      (authError) => {
        setLoading(false)
        toast.error(t("auth.errors.stateChange"))
      }
    )

    return () => unsubscribe()
  }, [auth, isInitialized, pathname, router, toast])

  // Update user status to inactive when closing browser/tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && user.establishmentId) {
        // Use sendBeacon to ensure the request is sent even when the page is closing
        const data = JSON.stringify({
          uid: user.uid,
          establishmentId: user.establishmentId,
          status: 'inactive'
        });
        
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('/api/auth/update-status', blob);
      }
    };

    const handlePageHide = () => {
      if (user && user.establishmentId) {
        // Use sendBeacon on pagehide as well (more reliable than beforeunload)
        const data = JSON.stringify({
          uid: user.uid,
          establishmentId: user.establishmentId,
          status: 'inactive'
        });
        
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('/api/auth/update-status', blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [user]);

  // Helper function to get device and location information
  const getUserActivityContext = () => {
    return {
      ipAddress: 'TODO: Implement IP tracking',
      device: {
        type: navigator.userAgent.match(/mobile/i) ? 'mobile' : 'desktop',
        os: navigator.platform,
        browser: navigator.userAgent
      },
      location: {
        country: 'Unknown',
        city: 'Unknown'
      }
    };
  };

  // Enhanced login method with detailed error handling and activity tracking
  const login = async (email: string, password: string): Promise<{ success: boolean, error?: string, needsPasswordChange: boolean, user?: User | null }> => {
    const activityContext = getUserActivityContext();
    
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        return {
          success: false,
          error: t('auth.errors.invalidEmailFormat'),
          needsPasswordChange: false,
          user: null
        };
      }

      // Check for empty password
      if (!password) {
        return {
          success: false,
          error: t('auth.errors.passwordEmpty'),
          needsPasswordChange: false,
          user: null
        };
      }

      // Attempt authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Permitir login sin requerir email verificado (solo mostrar aviso, pero no bloquear)
      // Puedes comentar o eliminar este bloque si quieres que sea opcional
      // if (!firebaseUser.emailVerified) {
      //   await sendEmailVerification(firebaseUser);
      //   return {
      //     success: false,
      //     error: 'Please verify your email. A new verification email has been sent.'
      //   };
      // }

      // Fetch user details
      const customUser = await fetchUserDetails(firebaseUser);
      
      if (!customUser) {
        return {
          success: false,
          error: t('auth.errors.userProfileNotFound'),
          needsPasswordChange: false,
          user: null
        };
      }

      // Check user account status
      if (customUser.status === 'suspended') {
        return {
          success: false,
          error: t('auth.errors.accountSuspended'),
          needsPasswordChange: false,
          user: null
        };
      }

      // Update last login timestamp, status, and activity
      if (db && customUser.establishmentId) {
        const userRef = doc(db, 'restaurants', customUser.establishmentId, 'users', firebaseUser.uid)
        
        // Prepare login attempt record
        const loginAttempt: LoginAttempt = {
          timestamp: new Date(),
          success: true,
          ipAddress: activityContext.ipAddress,
          device: activityContext.device,
          location: activityContext.location
        };

        // Create session record for work hours tracking
        const sessionRef = doc(collection(db, 'restaurants', customUser.establishmentId, 'sessions'));
        const sessionId = sessionRef.id;
        
        // Check if document exists before updating
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          // Update user document with login activity
          await updateDoc(userRef, {
            status: 'active',
            'activity.lastSuccessfulLogin': serverTimestamp(),
            'activity.loginAttempts': arrayUnion(loginAttempt),
            'activity.failedLoginCount': 0, // Reset failed login count on successful login
            currentSessionId: sessionId
          });
        }

        // Create session record
        await setDoc(sessionRef, {
          sessionId,
          userId: firebaseUser.uid,
          username: customUser.username,
          email: firebaseUser.email,
          role: customUser.role,
          establishmentId: customUser.establishmentId,
          loginTime: serverTimestamp(),
          logoutTime: null,
          duration: null,
          device: activityContext.device,
          ipAddress: activityContext.ipAddress,
          location: activityContext.location,
          status: 'active'
        });
      }

      // Update user state
      setUser(customUser);
      
      toast.success(t("auth.login.success", { username: customUser.username || '' }))

      return {
        success: true,
        needsPasswordChange: false,
        user: customUser
      };
    } catch (error) {
      let errorMessage = t('auth.errors.unexpectedError');
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = String((error as { message: unknown }).message);
        
        switch (errorMsg) {
          case 'auth/user-not-found':
            errorMessage = t('auth.errors.userNotFound');
            break;
          case 'auth/wrong-password':
            errorMessage = t('auth.errors.wrongPassword');
            break;
          case 'auth/too-many-requests':
            errorMessage = t('auth.errors.tooManyRequests');
            break;
          case 'auth/invalid-email':
            errorMessage = t('auth.errors.invalidEmail');
            break;
          case 'auth/user-disabled':
            errorMessage = t('auth.errors.userDisabled');
            break;
          default:
            errorMessage = errorMsg;
        }
      }

      // Log failed login attempt
      if (db) {
        const userRef = doc(db, 'users', email.toLowerCase().replace(/[^a-z0-9]/g, '_'));
        
        // Prepare failed login attempt record
        const failedLoginAttempt: LoginAttempt = {
          timestamp: new Date(),
          success: false,
          error: errorMessage,
          ipAddress: activityContext.ipAddress,
          device: activityContext.device,
          location: activityContext.location
        };

        // Check if document exists before updating
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          // Update user document with failed login attempt
          await updateDoc(userRef, {
            'activity.loginAttempts': arrayUnion(failedLoginAttempt),
            'activity.failedLoginCount': increment(1)
          });
        }
      }

      toast.error(t("auth.login.error", { username: errorMessage }))

      return {
        success: false,
        error: errorMessage,
        needsPasswordChange: false,
        user: null
      };
    }
  };

  // Function to update user status to inactive
  const updateUserStatusToInactive = async () => {
    if (db && user && user.establishmentId) {
      try {
        console.log('Updating user status to inactive:', user.uid);
        const userRef = doc(db, 'restaurants', user.establishmentId, 'users', user.uid)
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentSessionId = userData.currentSessionId;
          
          console.log('Current session ID:', currentSessionId);
          
          // Update user document
          await updateDoc(userRef, {
            status: 'inactive',
            currentSessionId: null
          });

          console.log('User status updated to inactive');

          // Update session record if exists
          if (currentSessionId) {
            const sessionRef = doc(db, 'restaurants', user.establishmentId, 'sessions', currentSessionId);
            const sessionDoc = await getDoc(sessionRef);
            
            if (sessionDoc.exists()) {
              const sessionData = sessionDoc.data();
              const loginTime = sessionData.loginTime;
              
              // Calculate duration
              const logoutTime = serverTimestamp();
              let duration = null;
              
              if (loginTime) {
                duration = {
                  loginTime,
                  logoutTime
                };
              }

              await updateDoc(sessionRef, {
                logoutTime,
                status: 'completed',
                duration
              });

              console.log('Session updated to completed');
            }
          }
        } else {
          console.error('User document does not exist');
        }
      } catch (error) {
        console.error('Error updating user status to inactive:', error);
      }
    } else {
      console.log('Cannot update status: missing db, user, or establishmentId', { db: !!db, user: !!user, establishmentId: user?.establishmentId });
    }
  };

  // Enhanced logout method
  const logout = async (): Promise<{ success: boolean, error?: string }> => {
    try {
      console.log('Starting logout process for user:', user?.uid);
      await updateUserStatusToInactive();
      console.log('User status updated to inactive, proceeding with signOut');

      await signOut(auth);
      setUser(null);
      
      toast.success(t("auth.logout.success", { username: user?.username || "Guest" }))

      console.log('Logout completed successfully');

      return {
        success: true
      };
    } catch (error) {
      console.error('Error during logout:', error);
      let errorMessage = t('auth.errors.logoutUnexpected');
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
      }

      toast.error(t("auth.logout.error", { username: errorMessage }))

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  function initializeInventoryCategories(db: Firestore, establishmentId: string) {
    const defaultCategories = [
      { 
        name: 'drinks', 
        description: 'Beverages and liquid refreshments',
        color: '#3498db' 
      },
      { 
        name: 'appetizers', 
        description: 'Starters and small dishes',
        color: '#2ecc71' 
      },
      { 
        name: 'main_courses', 
        description: 'Primary dishes and entrees',
        color: '#e74c3c' 
      },
      { 
        name: 'desserts', 
        description: 'Sweet endings and pastries',
        color: '#f1c40f' 
      },
      { 
        name: 'salads', 
        description: 'Fresh green and mixed salads',
        color: '#27ae60' 
      },
      { 
        name: 'sides', 
        description: 'Extra portions and side dishes',
        color: '#9b59b6' 
      }
    ];

    const batch = writeBatch(db);

    defaultCategories.forEach((category, index) => {
      const categoryRef = doc(
        db, 
        'restaurants', 
        establishmentId, 
        'inventory', 
        category.name  // Use category name as document ID
      );

      batch.set(categoryRef, {
        ...category,
        id: category.name,  // Ensure id matches the document ID
        createdAt: serverTimestamp(),
        order: index + 1,
        items: []  // Initialize with an empty items array
      });
    });

    return batch.commit();
  }

  // Google Sign In function
  const signInWithGoogle = async (): Promise<{ success: boolean, error?: string, userId?: string, isNewUser?: boolean, user?: User | null }> => {
    try {
      if (!auth) {
        return {
          success: false,
          error: 'Firebase auth not initialized'
        };
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if this email was previously deleted to prevent trial reset
      let previousTrialInfo = null
      if (db && firebaseUser.email) {
        try {
          const deletedAccountRef = doc(db, 'deletedAccounts', firebaseUser.email)
          const deletedAccountDoc = await getDoc(deletedAccountRef)
          
          if (deletedAccountDoc.exists()) {
            previousTrialInfo = deletedAccountDoc.data()
            console.log('Found previous trial info for deleted account:', previousTrialInfo)
          }
        } catch (error) {
          console.error('Error checking deleted accounts:', error)
        }
      }

      // Check if user already exists in Firestore
      let customUser = await fetchUserDetails(firebaseUser);
      
      if (!customUser) {
        // User doesn't exist - store Firebase user info and redirect to setup
        localStorage.setItem('pendingFirebaseUser', JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        }))
        
        return {
          success: true,
          userId: firebaseUser.uid,
          isNewUser: true,
          user: null
        };
      }

      setUser(customUser);
      
      toast.success(t("auth.login.success", { username: customUser.username || '' }))

      return {
        success: true,
        userId: firebaseUser.uid,
        isNewUser: false,
        user: customUser
      };
    } catch (error) {
      let errorMessage = t('auth.errors.unexpectedError');
      let shouldShowError = true;
      let shouldLogError = true;
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = String((error as { message: unknown }).message);
        
        switch (errorMsg) {
          case 'auth/popup-closed-by-user':
            // User closed the popup - don't show error, don't log to console
            shouldShowError = false;
            shouldLogError = false;
            break;
          case 'auth/popup-blocked':
            errorMessage = t('auth.errors.popupBlocked');
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = t('auth.errors.accountExistsWithDifferentCredential');
            break;
          default:
            errorMessage = errorMsg;
        }
      }

      if (shouldLogError) {
        console.error('Google sign-in error:', error);
      }

      if (shouldShowError) {
        toast.error(t("auth.login.error", { username: errorMessage }))
      }
      
      return {
        success: false,
        error: shouldShowError ? errorMessage : undefined
      };
    }
  };

  // Complete Setup function for Google sign-in users
  const completeSetup = async (establishmentName: string): Promise<{ success: boolean, error?: string, userId?: string }> => {
    try {
      if (!auth || !auth.currentUser) {
        return {
          success: false,
          error: 'Firebase auth not initialized or no user logged in'
        };
      }

      const firebaseUser = auth.currentUser;
      
      // Check if this email was previously deleted to prevent trial reset
      let previousTrialInfo = null
      if (db && firebaseUser.email) {
        try {
          const deletedAccountRef = doc(db, 'deletedAccounts', firebaseUser.email)
          const deletedAccountDoc = await getDoc(deletedAccountRef)
          
          if (deletedAccountDoc.exists()) {
            previousTrialInfo = deletedAccountDoc.data()
            console.log('Found previous trial info for deleted account:', previousTrialInfo)
          }
        } catch (error) {
          console.error('Error checking deleted accounts:', error)
        }
      }

      const baseSlug = establishmentName.trim();
      
      const signUpOptions = {
        establishmentName: baseSlug,
        role: UserRole.OWNER,
        trialStartDate: previousTrialInfo?.trialStartDate,
        trialEndDate: previousTrialInfo?.trialEndDate,
        isTrialActive: previousTrialInfo?.isTrialActive || false,
        subscriptionPlan: previousTrialInfo?.subscriptionPlan || 'basic'
      };
      
      const newUser = await initializeUserProfile(
        firebaseUser,
        baseSlug,
        db,
        signUpOptions
      );

      if (!newUser) {
        return {
          success: false,
          error: t('auth.errors.profileNotFound')
        };
      }

      // Clear pending Firebase user from localStorage
      localStorage.removeItem('pendingFirebaseUser');

      setUser(newUser);
      
      toast.success(t("auth.login.success", { username: newUser.username || '' }))

      return {
        success: true,
        userId: firebaseUser.uid
      };
    } catch (error) {
      console.error('Complete setup error:', error);
      let errorMessage = t('auth.errors.unexpectedError');
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Refresh user data from Firestore
  const refreshUser = async () => {
    if (auth && auth.currentUser) {
      const customUser = await fetchUserDetails(auth.currentUser)
      setUser(customUser)
    }
  };

  return <AuthContext.Provider value={{ 
    user, 
    currentUser: user, 
    loading, 
    login, 
    logout, 
    signUp,
    signInWithGoogle,
    completeSetup,
    refreshUser
  }}>{children}</AuthContext.Provider>
}
