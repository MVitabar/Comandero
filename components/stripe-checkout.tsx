"use client"

import { useState, useEffect } from "react"
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { CheckoutForm } from "./checkout-form"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  clientSecret: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function StripeCheckout({ clientSecret, onSuccess, onCancel }: StripeCheckoutProps) {
  const [options, setOptions] = useState<StripeElementsOptions>({
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1a1a1a',
      },
    },
  })

  return (
    <div className="w-full">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </div>
  )
}
