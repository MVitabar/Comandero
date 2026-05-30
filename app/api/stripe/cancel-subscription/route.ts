import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, establishmentId } = body

    if (!userId || !establishmentId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, establishmentId' },
        { status: 400 }
      )
    }

    const db = getFirestore()

    // Get user's subscription from Firestore
    const subscriptionRef = doc(db, 'subscriptions', userId)
    const subscriptionDoc = await getDoc(subscriptionRef)

    if (!subscriptionDoc.exists()) {
      return NextResponse.json(
        { error: 'No subscription found for this user' },
        { status: 404 }
      )
    }

    const subscriptionData = subscriptionDoc.data()

    // If there's a Stripe subscription ID, cancel it in Stripe
    if (subscriptionData?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscriptionData.stripeSubscriptionId)
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError)
        // Continue with Firestore update even if Stripe cancellation fails
      }
    }

    // Update subscription in Firestore
    await updateDoc(subscriptionRef, {
      status: 'cancelled',
      autoRenew: false,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Also update the user's subscription plan in the global user document
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      subscriptionPlan: 'basic',
      updatedAt: serverTimestamp(),
    })

    // Update the establishment document
    const establishmentRef = doc(db, 'restaurants', establishmentId)
    await updateDoc(establishmentRef, {
      subscriptionPlan: 'basic',
      updatedAt: serverTimestamp(),
    })

    // Update user in establishment subcollection
    const userInEstablishmentRef = doc(db, 'restaurants', establishmentId, 'users', userId)
    await updateDoc(userInEstablishmentRef, {
      subscriptionPlan: 'basic',
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
