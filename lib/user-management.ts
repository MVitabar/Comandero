import { 
  createUserWithEmailAndPassword, 
  getAuth,
  signInWithEmailAndPassword,
  signOut 
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
    skipAutoLogin?: boolean;
  }
) {
  const auth = getAuth();
  const db = getFirestore();

  // Guardar las credenciales del admin actual
  const adminEmail = auth.currentUser?.email;
  const adminUid = auth.currentUser?.uid;

  // Validate owner role creation
  if (userData.role === UserRole.OWNER && 
      (!currentUser || currentUser.role !== UserRole.OWNER)) {
    throw new Error('Only owners can create owner accounts');
  }

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
      }
    }

    // Fallback to using establishment name if no ID found
    if (!establishmentId && userData.establishmentName) {
      establishmentId = userData.establishmentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

  } catch (error) {
    console.error('Error retrieving establishment information:', error);
  }

  // Final check and error handling
  if (!establishmentId) {
    throw new Error(`No establishment ID found for user ${currentUser.uid}. 
      Please ensure the user is associated with an establishment.`);
  }

  // Proceed with user creation using the retrieved establishment ID
  // Crear el usuario y obtener sus credenciales
  const userCredential = await createUserWithEmailAndPassword(
    auth, 
    userData.email, 
    userData.password
  );
  
  // Si skipAutoLogin es true, cerrar la sesión del usuario recién creado y restaurar la del admin
  if (userData.skipAutoLogin && adminEmail) {
    try {
      // Obtener la sesión actual antes de cerrarla
      const currentSession = auth.currentUser;
      
      // Solo cerrar sesión si el usuario actual no es el admin
      if (currentSession?.uid !== adminUid) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error managing session:', error);
    }
  }

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