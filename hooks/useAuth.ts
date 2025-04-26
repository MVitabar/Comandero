import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { auth } from '@/lib/firebase';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';

const firestore = getFirestore();
import { UserContext } from '@/contexts/UserContext';
import { UserRole } from '@/types/permissions';

export interface User {
  uid: string;
  email: string | null;
  role: UserRole;
  restaurantName?: string;
  currentEstablishmentName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDocRef = doc(collection(firestore, 'users'), firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: userData?.role || UserRole.WAITER, // Default role
          restaurantName: userData?.restaurantName,
          currentEstablishmentName: userData?.currentEstablishmentName
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user
  };
}