import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { upgradeSubscription, recordPayment } from '@/lib/subscription-manager';
import { SubscriptionPlan } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    console.log('Webhook received:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract payment details
        const userId = session.metadata?.userId;
        const establishmentId = session.metadata?.establishmentId;
        const plan = session.metadata?.plan as SubscriptionPlan;
        const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents
        const currency = session.currency?.toUpperCase() || 'USD';
        const paymentId = session.payment_intent as string;
        
        if (!userId || !establishmentId || !plan) {
          console.error('Missing required metadata in webhook');
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }
        
        // Record the payment
        const paymentResult = await recordPayment({
          userId,
          establishmentId,
          amount,
          currency,
          plan,
          status: 'completed',
          paymentMethod: 'stripe',
          paymentId
        });
        
        if (!paymentResult.success) {
          console.error('Failed to record payment:', paymentResult.error);
          return NextResponse.json({ error: paymentResult.error }, { status: 500 });
        }
        
        // Upgrade the subscription
        const upgradeResult = await upgradeSubscription(userId, establishmentId, plan);
        
        if (!upgradeResult.success) {
          console.error('Failed to upgrade subscription:', upgradeResult.error);
          return NextResponse.json({ error: upgradeResult.error }, { status: 500 });
        }
        
        console.log(`Successfully upgraded user ${userId} to ${plan}`);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        
        // Extract subscription details
        const userId = invoice.metadata?.userId;
        const establishmentId = invoice.metadata?.establishmentId;
        const plan = invoice.metadata?.plan as SubscriptionPlan;
        const amount = invoice.amount_paid / 100;
        const currency = invoice.currency.toUpperCase();
        const subscriptionId = invoice.subscription?.id || invoice.subscription;
        const paymentIntentId = invoice.payment_intent?.id || invoice.payment_intent;
        
        if (!userId || !establishmentId || !plan) {
          console.error('Missing required metadata in invoice webhook');
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }
        
        // Record the payment
        await recordPayment({
          userId,
          establishmentId,
          amount,
          currency,
          plan,
          status: 'completed',
          paymentMethod: 'stripe',
          paymentId: paymentIntentId
        });
        
        console.log(`Recurring payment succeeded for user ${userId}`);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const userId = invoice.metadata?.userId;
        
        if (userId) {
          // Update subscription status to past_due
          console.log(`Payment failed for user ${userId}`);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;
        const establishmentId = subscription.metadata?.establishmentId;
        
        if (userId && establishmentId) {
          // Cancel subscription in our system
          console.log(`Subscription cancelled for user ${userId}`);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Manual payment endpoint (for testing or manual payment processing)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, establishmentId, plan, amount, currency, paymentMethod } = body;
    
    if (!userId || !establishmentId || !plan || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Record the payment
    const paymentResult = await recordPayment({
      userId,
      establishmentId,
      amount,
      currency: currency || 'USD',
      plan,
      status: 'completed',
      paymentMethod: paymentMethod || 'manual'
    });
    
    if (!paymentResult.success) {
      return NextResponse.json({ error: paymentResult.error }, { status: 500 });
    }
    
    // Upgrade the subscription
    const upgradeResult = await upgradeSubscription(userId, establishmentId, plan);
    
    if (!upgradeResult.success) {
      return NextResponse.json({ error: upgradeResult.error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, paymentId: paymentResult.paymentId });
  } catch (error) {
    console.error('Manual payment error:', error);
    return NextResponse.json({ error: 'Manual payment failed' }, { status: 500 });
  }
}
