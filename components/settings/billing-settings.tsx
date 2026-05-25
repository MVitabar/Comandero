"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  Building2, 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight,
  Crown
} from "lucide-react"
import { 
  getUserSubscription, 
  getUserPaymentHistory, 
  isSubscriptionActive, 
  isTrialActive, 
  getTrialDaysRemaining 
} from "@/lib/subscription-manager"
import { SubscriptionPlan, Payment, Subscription } from "@/types"
import { SUBSCRIPTION_PLANS } from "@/types"
import { toast } from "sonner"
import Link from "next/link"

export function BillingSettings() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      loadSubscriptionData()
    }
  }, [user])

  const loadSubscriptionData = async () => {
    if (!user?.uid) return

    try {
      const [subData, paymentData] = await Promise.all([
        getUserSubscription(user.uid),
        getUserPaymentHistory(user.uid)
      ])
      setSubscription(subData)
      setPayments(paymentData)
    } catch (error) {
      console.error('Error loading subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!user?.uid || !user?.establishmentId) {
      toast.error("User information not available")
      return
    }

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userId: user.uid,
          establishmentId: user.establishmentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout URL
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error(String(error))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t("settings.billing.title")}</h2>
          <p className="text-muted-foreground">{t("settings.billing.description")}</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  const currentPlan = user?.subscriptionPlan || 'basic'
  const planLimits = SUBSCRIPTION_PLANS[currentPlan]
  const trialActive = user?.isTrialActive && user?.trialEndDate ? isTrialActive(user.trialEndDate) : false
  const trialDaysLeft = user?.trialEndDate ? getTrialDaysRemaining(user.trialEndDate) : 0
  const subActive = subscription ? isSubscriptionActive(subscription) : false

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("settings.billing.title")}</h2>
        <p className="text-muted-foreground">{t("settings.billing.description")}</p>
      </div>

      {/* Trial Banner */}
      {trialActive && (
        <Alert className="bg-blue-50 border-blue-200">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <span className="font-semibold">Trial Period Active</span> You have {trialDaysLeft} days left in your trial.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan
          </h3>
          <Badge variant={subActive ? "default" : "secondary"}>
            {subActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Plan</span>
            <span className="font-semibold capitalize">{currentPlan}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Monthly Price</span>
            <span className="font-semibold">
              {currentPlan === 'basic' ? '$19' : currentPlan === 'professional' ? '$49' : '$99'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Max Users</span>
            <span className="font-semibold">
              {planLimits.maxUsers === -1 ? 'Unlimited' : planLimits.maxUsers}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Max Inventory Items</span>
            <span className="font-semibold">
              {planLimits.maxInventoryItems === -1 ? 'Unlimited' : planLimits.maxInventoryItems}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/subscription">
            <Button variant="outline" className="w-full">
              Manage Subscription
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Upgrade Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upgrade Your Plan</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(SUBSCRIPTION_PLANS).map(([plan, limits]) => (
            <Card 
              key={plan} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                plan === currentPlan ? 'border-blue-500 border-2' : ''
              }`}
            >
              <div className="p-4">
                <h4 className="font-semibold capitalize mb-2">{plan}</h4>
                <div className="mb-3">
                  <span className="text-2xl font-bold">
                    {plan === 'basic' ? '$19' : plan === 'professional' ? '$49' : '$99'}
                  </span>
                  <span className="text-gray-600 text-sm">/month</span>
                </div>
                <ul className="space-y-1 mb-4 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    {limits.maxUsers === -1 ? 'Unlimited users' : `Up to ${limits.maxUsers} users`}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    {limits.maxInventoryItems === -1 ? 'Unlimited inventory' : `Up to ${limits.maxInventoryItems} items`}
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan === currentPlan ? "secondary" : "default"}
                  size="sm"
                  onClick={() => handleUpgrade(plan as SubscriptionPlan)}
                  disabled={plan === currentPlan}
                >
                  {plan === currentPlan ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {t("settings.billing.billingHistory")}
        </h3>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payment history available
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center">
                  {payment.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  ) : payment.status === 'failed' ? (
                    <XCircle className="h-4 w-4 text-red-500 mr-3" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500 mr-3" />
                  )}
                  <div>
                    <div className="font-semibold capitalize">
                      {payment.plan} Plan
                    </div>
                    <div className="text-sm text-gray-600">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {payment.currency} {payment.amount.toFixed(2)}
                  </div>
                  <Badge 
                    variant={payment.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}