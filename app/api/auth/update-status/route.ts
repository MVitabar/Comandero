import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { uid, establishmentId, status } = await request.json()

    console.log('Update status request:', { uid, establishmentId, status })

    if (!uid || !establishmentId || !status) {
      console.error('Missing required fields:', { uid, establishmentId, status })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!db) {
      console.error('Database not initialized')
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
    }

    const userRef = doc(db, 'restaurants', establishmentId, 'users', uid)
    
    // Check if user exists
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      console.error('User not found:', { uid, establishmentId })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Updating user status to:', status)
    await updateDoc(userRef, {
      status,
      currentSessionId: null
    })

    console.log('User status updated successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
