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
  sendEmailVerification 
} from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import { useFirebase } from "@/components/firebase-provider"
import { useToast } from "@/components/ui/use-toast"
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

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: function (email: string, password: string): Promise<{ success: boolean, error?: string }> {
    throw new Error("Function not implemented.")
  },
  logout: function (): Promise<{ success: boolean, error?: string }> {
    throw new Error("Function not implemented.")
  },
  signUp: function (
    email: string, 
    password: string, 
    options?: { 
      establishmentName?: string; 
      role?: UserRole 
    }
  ): Promise<{ success: boolean, error?: string, userId?: string }> {
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
  const signUp = async (
    email: string, 
    password: string, 
    options?: {
      establishmentName?: string;
      role?: UserRole;
    }
  ): Promise<{ success: boolean, error?: string, userId?: string }> => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Default establishment name if not provided
      const baseSlug = options?.establishmentName || 'restaurante-milenio';
      
      // Initialize user profile with the new method
      const newUser = await initializeUserProfile(
        firebaseUser, 
        baseSlug, 
        db,
        options
      );

      if (!newUser) {
        return {
          success: false,
          error: 'Failed to create user profile'
        };
      }

      // Send email verification
      await sendEmailVerification(firebaseUser);

      toast({
        title: "Sign Up Successful",
        description: "Your account has been created. Please verify your email.",
        variant: "default",
      });

      return {
        success: true,
        userId: firebaseUser.uid
      };
    } catch (error) {
      console.error("Sign Up error:", error);
      
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        switch (error.message) {
          case 'auth/email-already-in-use':
            errorMessage = "Email is already registered";
            break;
          case 'auth/invalid-email':
            errorMessage = "Invalid email address";
            break;
          case 'auth/weak-password':
            errorMessage = "Password is too weak";
            break;
          default:
            errorMessage = error.message;
        }
      }

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

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
        console.error('❌ No establishment ID found for user');
        return null;
      }

      // Try to fetch from establishment-specific users collection first
      const establishmentUserRef = doc(db, 'restaurants', establishmentId, 'users', firebaseUser.uid);
      const establishmentUserDoc = await getDoc(establishmentUserRef);

      if (establishmentUserDoc.exists()) {
        const establishmentUserData = establishmentUserDoc.data() as User;
        userDetails = {
          ...establishmentUserData,
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          emailVerified: firebaseUser.emailVerified
        };
      } else {
        // Fallback to global users collection
        const globalUserRef = doc(db, 'users', firebaseUser.uid);
        const globalUserDoc = await getDoc(globalUserRef);

        if (globalUserDoc.exists()) {
          const globalUserData = globalUserDoc.data() as User;
          userDetails = {
            ...globalUserData,
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            emailVerified: firebaseUser.emailVerified
          };
        } else {
          console.error('❌ User document not found in any collection');
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
      console.error('❌ Error fetching user details:', error);
      return null;
    }
  };

  // Helper function to get establishment name
  const getEstablishmentName = async (db: Firestore, establishmentId: string): Promise<string | undefined> => {
    try {
      const restaurantDoc = await getDoc(doc(db, 'restaurants', establishmentId));
      return restaurantDoc.exists() ? restaurantDoc.data().name : undefined;
    } catch (error) {
      console.error('Error retrieving establishment name:', error);
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
    role: UserRole.Owner,
    currentEstablishmentName: baseSlug,
    establishmentId: establishmentId,
    status: 'active',
    loading: false,
    login: async () => {
      console.warn('Temporary login method')
      throw new Error('Temporary method')
    },
    logout: async () => {
      console.warn('Temporary logout method')
      throw new Error('Temporary method')
    },
    signUp: async () => {
      console.warn('Temporary signUp method')
      throw new Error('Temporary method')
    },
    emailVerified: false
  });

  // Función de inicialización de perfil de usuario
  const generateEstablishmentId = (baseSlug: string): string => {
    // Sanitize the base slug to create a consistent identifier
    const sanitizedSlug = baseSlug
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
        (usersSnapshot.empty ? UserRole.Owner : UserRole.WAITER);
      
      const username = options?.username || 
        await generateUniqueUsername(firebaseUser.email || '', baseSlug);
      
      // Generate a consistent establishment ID
      const establishmentId = generateEstablishmentId(baseSlug);

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
            status: 'active'
          }, { merge: true });
        }

        // Create establishment document
        const establishmentRef = doc(db, 'restaurants', establishmentId);
        transaction.set(establishmentRef, {
          name: baseSlug,
          ownerId: firebaseUser.uid,
          createdAt: serverTimestamp(),
          status: 'active'
        }, { merge: true });

        // Create user document in establishment's users subcollection only if it doesn't exist
        if (!userInEstablishmentSnap.exists()) {
          transaction.set(userInEstablishmentRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username: username,
            role: userRole, // Use the passed role
            createdAt: serverTimestamp(),
            status: 'active'
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

      // Initialize default inventory categories
      await initializeInventoryCategories(db, establishmentId);

      return userCreationResult;
    } catch (error) {
      console.error('Error initializing user profile:', error);
      return null;
    }
  };

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

  // Helper function to get device and location information
  const getUserActivityContext = () => {
    // Note: In a real-world scenario, you'd use more sophisticated methods
    // to detect device, location, and browser information
    return {
      ipAddress: 'TODO: Implement IP tracking',
      device: {
        type: navigator.userAgent.match(/mobile/i) ? 'mobile' : 'desktop',
        os: navigator.platform,
        browser: navigator.userAgent
      },
      location: {
        // This would typically come from a geolocation service
        country: 'Unknown',
        city: 'Unknown'
      }
    };
  };

  // Enhanced login method with detailed error handling and activity tracking
  const login = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
    const activityContext = getUserActivityContext();
    
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      // Check for empty password
      if (!password) {
        return {
          success: false,
          error: 'Password cannot be empty'
        };
      }

      // Attempt authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Verify email is verified
      if (!firebaseUser.emailVerified) {
        // Optional: Send verification email again
        await sendEmailVerification(firebaseUser);
        
        return {
          success: false,
          error: 'Please verify your email. A new verification email has been sent.'
        };
      }

      // Fetch user details
      const customUser = await fetchUserDetails(firebaseUser);
      
      if (!customUser) {
        return {
          success: false,
          error: 'User profile not found. Please contact support.'
        };
      }

      // Check user account status
      if (customUser.status === 'suspended') {
        return {
          success: false,
          error: 'Your account has been suspended. Please contact support.'
        };
      }

      // Update last login timestamp, status, and activity
      if (db) {
        const userRef = doc(db, 'users', firebaseUser.email?.toLowerCase().replace(/[^a-z0-9]/g, '_') || '')
        
        // Prepare login attempt record
        const loginAttempt: LoginAttempt = {
          timestamp: new Date(),
          success: true,
          ipAddress: activityContext.ipAddress,
          device: activityContext.device,
          location: activityContext.location
        };

        // Update user document with login activity
        await updateDoc(userRef, {
          status: 'active',
          'activity.lastSuccessfulLogin': serverTimestamp(),
          'activity.loginAttempts': arrayUnion(loginAttempt),
          'activity.failedLoginCount': 0 // Reset failed login count on successful login
        });
      }

      // Update user state
      setUser(customUser);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${customUser.username || 'User'}!`,
        variant: "default",
      });

      return {
        success: true
      };
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        switch (error.message) {
          case 'auth/user-not-found':
            errorMessage = "No user found with this email";
            break;
          case 'auth/wrong-password':
            errorMessage = "Incorrect password";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many login attempts. Please try again later.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Invalid email address";
            break;
          case 'auth/user-disabled':
            errorMessage = "This account has been disabled";
            break;
          default:
            errorMessage = error.message;
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

        // Update user document with failed login attempt
        await updateDoc(userRef, {
          'activity.loginAttempts': arrayUnion(failedLoginAttempt),
          'activity.failedLoginCount': increment(1)
        });
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Enhanced logout method
  const logout = async (): Promise<{ success: boolean, error?: string }> => {
    try {
      // Update user status before logout
      if (db && user) {
        const userRef = doc(db, 'users', user.email?.toLowerCase().replace(/[^a-z0-9]/g, '_') || '')
        await updateDoc(userRef, {
          status: 'inactive'
        });
      }

      await signOut(auth);
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
        variant: "default",
      });

      return {
        success: true
      };
    } catch (error) {
      console.error("Logout error:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred during logout";

      toast({
        title: "Logout Failed",
        description: errorMessage,
        variant: "destructive",
      });

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

  return <AuthContext.Provider value={{ 
    user, 
    loading, 
    login, 
    logout, 
    signUp 
  }}>{children}</AuthContext.Provider>
}
