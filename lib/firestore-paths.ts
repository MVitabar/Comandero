// lib/firestore-paths.ts
import { User } from '@/types';
import { doc, getDoc } from 'firebase/firestore';

export const getEstablishmentId = async (
  user: User | null, 
  db?: any  // Add optional Firestore db parameter
): Promise<string> => {
  if (!user) {
    throw new Error('No user authenticated');
  }

  // Priority 1: Explicitly set establishmentId
  if (user.establishmentId) {
    return user.establishmentId;
  }

  // Priority 2: Current establishment name
  if (user.currentEstablishmentName) {
    // Convert establishment name to a slug-like identifier
    return user.currentEstablishmentName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Priority 3: Retrieve from Firestore if db is provided
  if (db && user.uid) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.establishmentId) {
          return userData.establishmentId;
        }
      }
    } catch (error) {
      console.error('Error retrieving establishment ID:', error);
    }
  }

  // Fallback: Use user's UID
  return user.uid;
};

export const getFirestorePaths = (user: User | null, establishmentId?: string) => {
  const getEstablishmentIdSync = (user: User | null): string => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return establishmentId || 
      user.establishmentId || 
      user.currentEstablishmentName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 
      user.uid;
  };

  const establishmentIdentifier = getEstablishmentIdSync(user);

  return {
    users: (userId?: string) => 
      userId 
        ? ['restaurants', establishmentIdentifier, 'users', userId]
        : ['restaurants', establishmentIdentifier, 'users'],
    
    inventory: (category?: string, itemId?: string) => {
      const basePath = ['restaurants', establishmentIdentifier, 'inventory'];
      return category 
        ? [...basePath, category, 'items', ...(itemId ? [itemId] : [])]
        : basePath;
    },
    
    orders: (orderId?: string) => 
      orderId
        ? ['restaurants', establishmentIdentifier, 'orders', orderId]
        : ['restaurants', establishmentIdentifier, 'orders'],
    
    tableMaps: (tableMapId?: string) => 
      tableMapId
        ? ['restaurants', establishmentIdentifier, 'tableMaps', tableMapId]
        : ['restaurants', establishmentIdentifier, 'tableMaps']
  };
};