import { 
  createUserWithEmailAndPassword, 
  getAuth 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";
import { UserRole } from "@/types/permissions";

interface UserCreationOptions {
  email: string;
  password: string;
  username: string;
  role?: UserRole;
  establishmentName: string; 
  additionalData?: Record<string, any>;
}

export interface CurrentUser {
  uid: string;
  currentEstablishmentName?: string;
  role?: UserRole;
  establishmentId?: string;
  email?: string | null;
}

export async function createTeamMember(
  currentUser: CurrentUser, 
  userData: {
    email: string;
    password: string;
    username: string;
    role?: UserRole;
    establishmentName?: string;
    establishmentId?: string;
    additionalData?: any;
  }
) {
  const auth = getAuth();
  const db = getFirestore();

  // Validate owner role creation
  if (userData.role === UserRole.OWNER && 
      (!currentUser || currentUser.role !== UserRole.OWNER)) {
    throw new Error('Only owners can create owner accounts');
  }

  // Comprehensive logging for debugging
  console.group('🔍 Create Team Member Debug');
  console.log('Current User Object:', JSON.stringify(currentUser, null, 2));
  console.log('User Data:', JSON.stringify(userData, null, 2));

  // Dynamically retrieve establishment information
  let establishmentId: string | undefined;
  let establishmentName: string | undefined;

  try {
    // Find the user's document in the global users collection
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      establishmentId = userData.establishmentId;
      establishmentName = userData.currentEstablishmentName;
      
      console.log('Establishment Info from User Document:', {
        establishmentId,
        establishmentName
      });
    }

    // If no establishment ID found, try querying restaurants
    if (!establishmentId) {
      const restaurantsRef = collection(db, 'restaurants');
      const q = query(
        restaurantsRef, 
        where('users', 'array-contains', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const restaurantDoc = querySnapshot.docs[0];
        establishmentId = restaurantDoc.id;
        establishmentName = restaurantDoc.data().name;
        
        console.log('Establishment Info from Restaurants Collection:', {
          establishmentId,
          establishmentName
        });
      }
    }

    // Fallback to using establishment name if no ID found
    if (!establishmentId && userData.establishmentName) {
      establishmentId = userData.establishmentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      console.log('Fallback Establishment ID:', establishmentId);
    }

  } catch (error) {
    console.error('Error retrieving establishment information:', error);
  }

  // Final check and error handling
  if (!establishmentId) {
    console.error('Establishment ID retrieval failed', {
      currentUser: {
        uid: currentUser.uid,
        role: currentUser.role
      },
      userData: {
        establishmentName: userData.establishmentName,
        establishmentId: userData.establishmentId
      }
    });
    console.groupEnd(); // Close the debug group
    throw new Error(`No establishment ID found for user ${currentUser.uid}. 
      Please ensure the user is associated with an establishment.`);
  }

  console.log('Final Establishment ID:', establishmentId);
  console.groupEnd(); // Close the debug group

  // Proceed with user creation using the retrieved establishment ID
  const userCredential = await createUserWithEmailAndPassword(
    auth, 
    userData.email, 
    userData.password
  );

  // Create user document in Firestore
  const newUserDocRef = doc(db, 'users', userCredential.user.uid);
  await setDoc(newUserDocRef, {
    uid: userCredential.user.uid,
    email: userData.email,
    username: userData.username,
    role: userData.role || UserRole.WAITER,
    establishmentId: establishmentId,
    currentEstablishmentName: establishmentName,
    createdAt: serverTimestamp(),
    status: 'active'
  });

  // Add user to the restaurant's users array
  const restaurantDocRef = doc(db, 'restaurants', establishmentId);
  await updateDoc(restaurantDocRef, {
    users: arrayUnion(userCredential.user.uid)
  });

  // Create user document in the establishment's internal users collection
  const establishmentUserDocRef = doc(
    db, 
    'restaurants', 
    establishmentId, 
    'users', 
    userCredential.user.uid
  );
  await setDoc(establishmentUserDocRef, {
    uid: userCredential.user.uid,
    username: userData.username,
    email: userData.email,
    role: userData.role || UserRole.WAITER,
    status: 'active',
    addedBy: currentUser.uid,
    createdAt: serverTimestamp(),
    ...userData.additionalData
  });

  return userCredential.user;
}

export async function updateUserProfile(
  userId: string, 
  updateData: Partial<UserCreationOptions>,
  restaurantId?: string
) {
  const db = getFirestore();
  
  // If restaurantId is provided, update user in the specific restaurant's users collection
  if (restaurantId) {
    const userRef = doc(db, 'restaurants', restaurantId, 'users', userId);
    await setDoc(userRef, updateData, { merge: true });
  }
}

export async function deleteUser(
  userId: string, 
  restaurantId?: string
) {
  const db = getFirestore();
  
  // If restaurantId is provided, soft delete user in the specific restaurant's users collection
  if (restaurantId) {
    const userRef = doc(db, 'restaurants', restaurantId, 'users', userId);
    await setDoc(userRef, { status: 'deleted' }, { merge: true });
  }
}