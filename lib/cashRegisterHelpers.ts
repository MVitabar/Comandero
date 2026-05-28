import { doc, getDoc, query, where, getDocs, collection } from 'firebase/firestore'
import { Firestore } from 'firebase/firestore'

/**
 * Verifica si hay una caja activa para el establecimiento
 * @param db - Instancia de Firestore
 * @param establishmentId - ID del establecimiento
 * @returns true si hay una caja abierta, false en caso contrario
 */
export async function hasActiveCashRegister(db: Firestore, establishmentId: string): Promise<boolean> {
  try {
    const cashRegistersRef = collection(db, 'restaurants', establishmentId, 'cashRegisters')
    const q = query(cashRegistersRef, where('status', '==', 'open'))
    const querySnapshot = await getDocs(q)
    
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error checking active cash register:', error)
    return false
  }
}
