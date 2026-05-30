import { 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  runTransaction,
  getFirestore,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { SubscriptionPlan, UserRole, SubscriptionPaymentMethod, Payment, Subscription } from '@/types';

/**
 * Upgrade user's subscription plan
 */
export async function upgradeSubscription(
  userId: string,
  establishmentId: string,
  newPlan: SubscriptionPlan
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirestore();
    
    await runTransaction(db, async (transaction) => {
      // Update global user document
      const globalUserRef = doc(db, 'users', userId);
      const globalUserDoc = await transaction.get(globalUserRef);
      
      if (globalUserDoc.exists()) {
        transaction.update(globalUserRef, {
          subscriptionPlan: newPlan,
          updatedAt: serverTimestamp()
        });
      }
      
      // Update establishment document
      const establishmentRef = doc(db, 'restaurants', establishmentId);
      const establishmentDoc = await transaction.get(establishmentRef);
      
      if (establishmentDoc.exists()) {
        transaction.update(establishmentRef, {
          subscriptionPlan: newPlan,
          updatedAt: serverTimestamp()
        });
      }
      
      // Update user in establishment subcollection
      const userInEstablishmentRef = doc(db, 'restaurants', establishmentId, 'users', userId);
      const userInEstablishmentDoc = await transaction.get(userInEstablishmentRef);
      
      if (userInEstablishmentDoc.exists()) {
        transaction.update(userInEstablishmentRef, {
          subscriptionPlan: newPlan,
          updatedAt: serverTimestamp()
        });
      }
      
      // Create or update subscription record
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const subscriptionDoc = await transaction.get(subscriptionRef);
      
      const subscriptionData: Partial<Subscription> = {
        userId,
        establishmentId,
        plan: newPlan,
        status: 'active',
        startDate: serverTimestamp(),
        autoRenew: true,
        updatedAt: serverTimestamp()
      };
      
      if (subscriptionDoc.exists()) {
        transaction.update(subscriptionRef, subscriptionData);
      } else {
        transaction.set(subscriptionRef, subscriptionData);
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return { success: false, error: 'Failed to upgrade subscription' };
  }
}

/**
 * Downgrade user's subscription plan
 */
export async function downgradeSubscription(
  userId: string,
  establishmentId: string,
  newPlan: SubscriptionPlan
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirestore();
    
    await runTransaction(db, async (transaction) => {
      // Update global user document
      const globalUserRef = doc(db, 'users', userId);
      const globalUserDoc = await transaction.get(globalUserRef);
      
      if (globalUserDoc.exists()) {
        transaction.update(globalUserRef, {
          subscriptionPlan: newPlan,
          updatedAt: serverTimestamp()
        });
      }
      
      // Update establishment document
      const establishmentRef = doc(db, 'restaurants', establishmentId);
      const establishmentDoc = await transaction.get(establishmentRef);
      
      if (establishmentDoc.exists()) {
        transaction.update(establishmentRef, {
          subscriptionPlan: newPlan,
          updatedAt: serverTimestamp()
        });
      }
      
      // Update user in establishment subcollection
      const userInEstablishmentRef = doc(db, 'restaurants', establishmentId, 'users', userId);
      const userInEstablishmentDoc = await transaction.get(userInEstablishmentRef);
      
      if (userInEstablishmentDoc.exists()) {
        transaction.update(userInEstablishmentRef, {
          subscriptionPlan: newPlan,
          updatedAt: serverTimestamp()
        });
      }
      
      // Update subscription record
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const subscriptionDoc = await transaction.get(subscriptionRef);
      
      if (subscriptionDoc.exists()) {
        transaction.update(subscriptionRef, {
          plan: newPlan,
          updatedAt: serverTimestamp()
        });
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    return { success: false, error: 'Failed to downgrade subscription' };
  }
}

/**
 * Cancel user's subscription
 */
export async function cancelSubscription(
  userId: string,
  establishmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirestore();
    
    await runTransaction(db, async (transaction) => {
      // Update subscription record
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const subscriptionDoc = await transaction.get(subscriptionRef);
      
      if (subscriptionDoc.exists()) {
        transaction.update(subscriptionRef, {
          status: 'cancelled',
          autoRenew: false,
          updatedAt: serverTimestamp()
        });
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}

/**
 * Record a payment
 */
export async function recordPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    const db = getFirestore();
    const paymentsRef = collection(db, 'payments');
    
    const paymentData = {
      ...payment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(paymentsRef, paymentData);
    
    return { success: true, paymentId: docRef.id };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { success: false, error: 'Failed to record payment' };
  }
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const db = getFirestore();
    const subscriptionRef = doc(db, 'subscriptions', userId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (subscriptionDoc.exists()) {
      return subscriptionDoc.data() as Subscription;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Get payment history for a user
 */
export async function getUserPaymentHistory(userId: string): Promise<Payment[]> {
  try {
    const db = getFirestore();
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const payments: Payment[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      payments.push({ 
        id: doc.id, 
        userId: data.userId,
        establishmentId: data.establishmentId,
        amount: data.amount,
        currency: data.currency,
        plan: data.plan,
        status: data.status,
        paymentMethod: data.paymentMethod,
        paymentId: data.paymentId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Payment);
    });
    
    return payments.sort((a, b) => {
      const dateA = a.createdAt && typeof a.createdAt === 'object' && 'toMillis' in a.createdAt 
        ? a.createdAt.toMillis() 
        : a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt && typeof b.createdAt === 'object' && 'toMillis' in b.createdAt 
        ? b.createdAt.toMillis() 
        : b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    return [];
  }
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  return subscription.status === 'active';
}

/**
 * Check if trial is still active
 */
export function isTrialActive(trialEndDate: any): boolean {
  if (!trialEndDate) return false;
  const endDate = trialEndDate.toDate ? trialEndDate.toDate() : new Date(trialEndDate);
  return endDate > new Date();
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(trialEndDate: any): number {
  if (!trialEndDate) return 0;
  const endDate = trialEndDate.toDate ? trialEndDate.toDate() : new Date(trialEndDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Check if user has valid access (trial active or subscription active)
 */
export function hasValidAccess(
  isTrialActive: boolean,
  subscription: Subscription | null
): boolean {
  // User has access if trial is active OR subscription is active
  return isTrialActive || isSubscriptionActive(subscription);
}
