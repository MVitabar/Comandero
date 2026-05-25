"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/components/i18n-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard, 
  ArrowRight,
  AlertTriangle
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

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { t } = useI18n()
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
      toast.error('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    // This would integrate with Stripe checkout
    // For now, we'll show a message
    toast.info(`Redirecting to ${plan} plan checkout...`)
    // TODO: Implement Stripe checkout integration
  }

  const handleCancel = async () => {
    toast.info('Cancellation feature coming soon')
    // TODO: Implement cancellation
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription...</p>
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage your subscription and payment history</p>
      </div>

      {/* Trial Banner */}
      {trialActive && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <span className="font-semibold">Trial Period Active</span> You have {trialDaysLeft} days left in your trial. Your current plan: {currentPlan}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Plan</span>
            <Badge variant={subActive ? "default" : "secondary"}>
              {subActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {subActive ? "Your subscription is active and auto-renewing" : "Your subscription is inactive"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Plan</span>
              <span className="font-semibold capitalize">{currentPlan}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Monthly Price</span>
              <span className="font-semibold">
                {currentPlan === 'basic' ? '$19' : currentPlan === 'professional' ? '$49' : '$99'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Max Users</span>
              <span className="font-semibold">
                {planLimits.maxUsers === -1 ? 'Unlimited' : planLimits.maxUsers}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Max Inventory Items</span>
              <span className="font-semibold">
                {planLimits.maxInventoryItems === -1 ? 'Unlimited' : planLimits.maxInventoryItems}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Auto-renew</span>
              <span className="font-semibold">
                {subscription?.autoRenew ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={!subActive}
            >
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upgrade Your Plan</CardTitle>
          <CardDescription>
            Choose a plan that fits your restaurant's needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(SUBSCRIPTION_PLANS).map(([plan, limits]) => (
              <Card 
                key={plan} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  plan === currentPlan ? 'border-blue-500 border-2' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="capitalize">{plan}</CardTitle>
                  <CardDescription>
                    {plan === 'basic' ? 'For small restaurants' : 
                     plan === 'professional' ? 'For growing restaurants' : 
                     'For restaurant chains'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      {plan === 'basic' ? '$19' : plan === 'professional' ? '$49' : '$99'}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {limits.maxUsers === -1 ? 'Unlimited users' : `Up to ${limits.maxUsers} users`}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {limits.maxInventoryItems === -1 ? 'Unlimited inventory' : `Up to ${limits.maxInventoryItems} items`}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Order & table management
                    </li>
                    {plan !== 'basic' && (
                      <>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Advanced reports
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Delivery integrations
                        </li>
                      </>
                    )}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan === currentPlan ? "secondary" : "default"}
                    onClick={() => handleUpgrade(plan as SubscriptionPlan)}
                    disabled={plan === currentPlan}
                  >
                    {plan === currentPlan ? 'Current Plan' : 'Upgrade'}
                    {plan !== currentPlan && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            View your payment history and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payment history available
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center">
                    {payment.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    ) : payment.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-500 mr-3" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500 mr-3" />
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
        </CardContent>
      </Card>
    </div>
  )
}
