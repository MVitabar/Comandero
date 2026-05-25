import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { initializeFirebase } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { uid, establishmentId, status } = await request.json()

    if (!uid || !establishmentId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { db } = initializeFirebase()

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
    }

    const userRef = doc(db, 'restaurants', establishmentId, 'users', uid)
    await updateDoc(userRef, {
      status,
      currentSessionId: null
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
