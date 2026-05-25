import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription'],
    })

    const paymentIntent = session.payment_intent
    const subscription = session.subscription

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      payment_intent_id: paymentIntent && typeof paymentIntent === 'object' ? paymentIntent.id : null,
      payment_intent_status: paymentIntent && typeof paymentIntent === 'object' ? paymentIntent.status : null,
      subscription_id: subscription && typeof subscription === 'object' ? subscription.id : null,
      subscription_status: subscription && typeof subscription === 'object' ? subscription.status : null,
      metadata: session.metadata,
    })
  } catch (error) {
    console.error('Error retrieving session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}
