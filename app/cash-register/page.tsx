"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  User,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Loader2
} from "lucide-react"
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp, limit, onSnapshot } from "firebase/firestore"
import { UserRole } from "@/types/permissions"

interface CashRegister {
  id: string
  establishmentId: string
  openedBy: string
  openedByName: string
  openTime: Timestamp
  closeTime: Timestamp | null
  closedBy: string | null
  closedByName: string | null
  openingAmount: number
  closingAmount: number | null
  totalSales: number
  paymentBreakdown: {
    cash: number
    credit: number
    debit: number
    transfer: number
  }
  expectedPaymentBreakdown?: {
    cash: number
    credit: number
    debit: number
    transfer: number
  }
  notes: string
  closingNotes: string
  status: 'open' | 'closed'
  difference: number | null
}

export default function CashRegisterPage() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()

  const [loading, setLoading] = useState(false)
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null)
  const [history, setHistory] = useState<CashRegister[]>([])
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [ordersListener, setOrdersListener] = useState<(() => void) | null>(null)

  // Form states
  const [openingAmount, setOpeningAmount] = useState('')
  const [openingNotes, setOpeningNotes] = useState('')
  const [closingCash, setClosingCash] = useState('')
  const [closingCredit, setClosingCredit] = useState('')
  const [closingDebit, setClosingDebit] = useState('')
  const [closingTransfer, setClosingTransfer] = useState('')
  const [closingNotes, setClosingNotes] = useState('')

  const canManageCashRegister = user?.role === UserRole.OWNER || 
                                 user?.role === UserRole.ADMIN || 
                                 user?.role === UserRole.MANAGER

  useEffect(() => {
    if (user?.establishmentId && db && canManageCashRegister) {
      loadCurrentRegister()
      loadHistory()
    }

    // Cleanup listener on unmount
    return () => {
      if (ordersListener) {
        ordersListener()
      }
    }
  }, [user, db, canManageCashRegister])

  const loadCurrentRegister = async () => {
    if (!user?.establishmentId || !db) return

    setLoading(true)
    try {
      const registersRef = collection(db, 'restaurants', user.establishmentId, 'cashRegisters')
      const q = query(registersRef, where('status', '==', 'open'), orderBy('openTime', 'desc'), limit(1))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const registerData = querySnapshot.docs[0].data() as CashRegister
        const register = {
          ...registerData,
          id: querySnapshot.docs[0].id
        }
        setCurrentRegister(register)
        // Start listening to orders for this register
        listenToOrders(register)
      } else {
        setCurrentRegister(null)
      }
    } catch (error) {
      console.error('Error loading current register:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    if (!user?.establishmentId || !db) return

    try {
      const registersRef = collection(db, 'restaurants', user.establishmentId, 'cashRegisters')
      const q = query(registersRef, orderBy('openTime', 'desc'), limit(20))
      const querySnapshot = await getDocs(q)
      
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CashRegister))

      setHistory(historyData)
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const listenToOrders = (register: CashRegister) => {
    if (!user?.establishmentId || !db || !register.id) return

    // Clean up existing listener
    if (ordersListener) {
      ordersListener()
    }

    const ordersRef = collection(db, 'restaurants', user.establishmentId, 'orders')
    const q = query(
      ordersRef, 
      where('createdAt', '>=', register.openTime),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // Calculate total sales and payment breakdown from orders
      let totalSales = 0
      const paymentBreakdown = {
        cash: register.openingAmount, // Include opening amount in cash
        credit: 0,
        debit: 0,
        transfer: 0
      }
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data()
        const orderTotal = data.total || data.subtotal || 0
        const orderStatus = data.status
        // Check both paymentInfo.method and paymentMethod (different fields used in different parts of the app)
        const paymentMethod = data.paymentInfo?.method || data.paymentMethod || 'other'
        
        // Only count completed/closed orders
        if (orderStatus === 'closed' || orderStatus === 'finished' || orderStatus === 'delivered') {
          totalSales += orderTotal
          
          // Add to payment breakdown based on payment method
          switch (paymentMethod) {
            case 'cash':
              paymentBreakdown.cash += orderTotal
              break
            case 'credit':
              paymentBreakdown.credit += orderTotal
              break
            case 'debit':
              paymentBreakdown.debit += orderTotal
              break
            case 'transfer':
              paymentBreakdown.transfer += orderTotal
              break
          }
        }
      })

      // Update the cash register document with the new totals
      try {
        if (!user.establishmentId) return
        const registerRef = doc(db, 'restaurants', user.establishmentId, 'cashRegisters', register.id!)
        await updateDoc(registerRef, {
          totalSales,
          expectedPaymentBreakdown: paymentBreakdown
        })
        
        // Update local state
        setCurrentRegister(prev => prev ? { ...prev, totalSales, expectedPaymentBreakdown: paymentBreakdown } : null)
      } catch (error) {
        console.error('Error updating total sales:', error)
      }
    }, (error) => {
      console.error('Error listening to orders:', error)
    })

    setOrdersListener(() => unsubscribe)
  }

  const handleOpenRegister = async () => {
    if (!user?.establishmentId || !db || !openingAmount) return

    setLoading(true)
    try {
      const registersRef = collection(db, 'restaurants', user.establishmentId, 'cashRegisters')
      await addDoc(registersRef, {
        establishmentId: user.establishmentId,
        openedBy: user.uid,
        openedByName: user.username || user.email || 'Unknown',
        openTime: serverTimestamp(),
        closeTime: null,
        closedBy: null,
        closedByName: null,
        openingAmount: parseFloat(openingAmount),
        closingAmount: null,
        totalSales: 0,
        paymentBreakdown: {
          cash: 0,
          credit: 0,
          debit: 0,
          transfer: 0
        },
        notes: openingNotes,
        closingNotes: '',
        status: 'open',
        difference: null
      })

      setShowOpenDialog(false)
      setOpeningAmount('')
      setOpeningNotes('')
      await loadCurrentRegister()
      await loadHistory()
    } catch (error) {
      console.error('Error opening register:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseRegister = async () => {
    if (!user?.establishmentId || !db || !currentRegister) return

    setLoading(true)
    try {
      // Clean up orders listener before closing
      if (ordersListener) {
        ordersListener()
        setOrdersListener(null)
      }

      const registerRef = doc(db, 'restaurants', user.establishmentId, 'cashRegisters', currentRegister.id)
      
      const cash = parseFloat(closingCash) || 0
      const credit = parseFloat(closingCredit) || 0
      const debit = parseFloat(closingDebit) || 0
      const transfer = parseFloat(closingTransfer) || 0
      const totalClosing = cash + credit + debit + transfer
      const expectedAmount = currentRegister.openingAmount + currentRegister.totalSales
      const difference = totalClosing - expectedAmount

      await updateDoc(registerRef, {
        closeTime: serverTimestamp(),
        closedBy: user.uid,
        closedByName: user.username || user.email || 'Unknown',
        closingAmount: totalClosing,
        paymentBreakdown: {
          cash,
          credit,
          debit,
          transfer
        },
        closingNotes,
        status: 'closed',
        difference
      })

      setShowCloseDialog(false)
      setClosingCash('')
      setClosingCredit('')
      setClosingDebit('')
      setClosingTransfer('')
      setClosingNotes('')
      setCurrentRegister(null)
      await loadHistory()
    } catch (error) {
      console.error('Error closing register:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleString()
  }

  if (!canManageCashRegister) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("cashRegister.title")}</h1>
          <p className="text-muted-foreground">{t("cashRegister.description")}</p>
        </div>
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            {t("cashRegister.noPermission")}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("cashRegister.title")}</h1>
        <p className="text-muted-foreground">{t("cashRegister.description")}</p>
      </div>

      {/* Current Register Status */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : currentRegister ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h2 className="text-xl font-bold">{t("cashRegister.registerOpen")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("cashRegister.openedBy")}: {currentRegister.openedByName} - {formatDate(currentRegister.openTime)}
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">
                {t("cashRegister.open")}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">{t("cashRegister.openingAmount")}</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(currentRegister.openingAmount)}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">{t("cashRegister.totalSales")}</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(currentRegister.totalSales)}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  <span className="font-semibold">{t("cashRegister.expectedTotal")}</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(currentRegister.openingAmount + currentRegister.totalSales)}</p>
              </div>
            </div>

            {currentRegister.notes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">{t("cashRegister.notes")}:</span> {currentRegister.notes}
                </p>
              </div>
            )}

            <Button onClick={() => setShowCloseDialog(true)} className="w-full" size="lg">
              {t("cashRegister.closeRegister")}
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h2 className="text-xl font-bold">{t("cashRegister.registerClosed")}</h2>
              <p className="text-muted-foreground">{t("cashRegister.registerClosedDescription")}</p>
            </div>
            <Button onClick={() => setShowOpenDialog(true)} size="lg">
              {t("cashRegister.openRegister")}
            </Button>
          </div>
        )}
      </Card>

      {/* History */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">{t("cashRegister.history")}</h2>
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("cashRegister.noHistory")}</p>
        ) : (
          <div className="space-y-4">
            {history.map((register) => (
              <div key={register.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{register.openedByName}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(register.openTime)}</p>
                    </div>
                  </div>
                  <Badge variant={register.status === 'open' ? 'default' : 'secondary'}>
                    {register.status === 'open' ? t("cashRegister.open") : t("cashRegister.closed")}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("cashRegister.openingAmount")}</p>
                    <p className="font-semibold">{formatCurrency(register.openingAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("cashRegister.totalSales")}</p>
                    <p className="font-semibold">{formatCurrency(register.totalSales)}</p>
                  </div>
                  {register.closingAmount && (
                    <div>
                      <p className="text-muted-foreground">{t("cashRegister.closingAmount")}</p>
                      <p className="font-semibold">{formatCurrency(register.closingAmount)}</p>
                    </div>
                  )}
                  {register.difference !== null && (
                    <div>
                      <p className="text-muted-foreground">{t("cashRegister.difference")}</p>
                      <p className={`font-semibold ${register.difference !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {formatCurrency(register.difference)}
                      </p>
                    </div>
                  )}
                </div>

                {register.paymentBreakdown && (register.paymentBreakdown.cash > 0 || register.paymentBreakdown.credit > 0 || register.paymentBreakdown.debit > 0 || register.paymentBreakdown.transfer > 0) && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="flex items-center gap-1">
                        <Banknote className="h-3 w-3" />
                        <span>{t("cashRegister.cash")}: {formatCurrency(register.paymentBreakdown.cash)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        <span>{t("cashRegister.credit")}: {formatCurrency(register.paymentBreakdown.credit)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        <span>{t("cashRegister.debit")}: {formatCurrency(register.paymentBreakdown.debit)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowRightLeft className="h-3 w-3" />
                        <span>{t("cashRegister.transfer")}: {formatCurrency(register.paymentBreakdown.transfer)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Open Register Dialog */}
      {showOpenDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t("cashRegister.openRegister")}</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="openingAmount">{t("cashRegister.openingAmount")}</Label>
                <Input
                  id="openingAmount"
                  type="number"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="openingNotes">{t("cashRegister.notes")}</Label>
                <Textarea
                  id="openingNotes"
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  placeholder={t("cashRegister.notesPlaceholder")}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowOpenDialog(false)} className="flex-1">
                  {t("cashRegister.cancel")}
                </Button>
                <Button onClick={handleOpenRegister} disabled={!openingAmount || loading} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("cashRegister.confirm")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Close Register Dialog */}
      {showCloseDialog && currentRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t("cashRegister.closeRegister")}</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("cashRegister.openingAmount")}</p>
                <p className="text-2xl font-bold">{formatCurrency(currentRegister.openingAmount)}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("cashRegister.totalSales")}</p>
                <p className="text-2xl font-bold">{formatCurrency(currentRegister.totalSales)}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("cashRegister.expectedTotal")}</p>
                <p className="text-2xl font-bold">{formatCurrency(
                  (currentRegister.expectedPaymentBreakdown?.cash || 0) +
                  (currentRegister.expectedPaymentBreakdown?.credit || 0) +
                  (currentRegister.expectedPaymentBreakdown?.debit || 0) +
                  (currentRegister.expectedPaymentBreakdown?.transfer || 0)
                )}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">{t("cashRegister.paymentBreakdown")}</h3>
                
                {/* Expected totals */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{t("cashRegister.expectedTotals")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("cashRegister.cash")}</p>
                        <p className="font-semibold">{formatCurrency(currentRegister.expectedPaymentBreakdown?.cash || 0)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("cashRegister.credit")}</p>
                        <p className="font-semibold">{formatCurrency(currentRegister.expectedPaymentBreakdown?.credit || 0)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("cashRegister.debit")}</p>
                        <p className="font-semibold">{formatCurrency(currentRegister.expectedPaymentBreakdown?.debit || 0)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("cashRegister.transfer")}</p>
                        <p className="font-semibold">{formatCurrency(currentRegister.expectedPaymentBreakdown?.transfer || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actual inputs */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{t("cashRegister.actualAmounts")}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="closingCash">{t("cashRegister.cash")}</Label>
                      <Input
                        id="closingCash"
                        type="number"
                        value={closingCash}
                        onChange={(e) => setClosingCash(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="closingCredit">{t("cashRegister.credit")}</Label>
                      <Input
                        id="closingCredit"
                        type="number"
                        value={closingCredit}
                        onChange={(e) => setClosingCredit(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="closingDebit">{t("cashRegister.debit")}</Label>
                      <Input
                        id="closingDebit"
                        type="number"
                        value={closingDebit}
                        onChange={(e) => setClosingDebit(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="closingTransfer">{t("cashRegister.transfer")}</Label>
                      <Input
                        id="closingTransfer"
                        type="number"
                        value={closingTransfer}
                        onChange={(e) => setClosingTransfer(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Differences */}
                {(closingCash || closingCredit || closingDebit || closingTransfer) && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{t("cashRegister.differences")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("cashRegister.cash")}</p>
                        <p className={`font-semibold ${(parseFloat(closingCash) || 0) - (currentRegister.expectedPaymentBreakdown?.cash || 0) !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {formatCurrency((parseFloat(closingCash) || 0) - (currentRegister.expectedPaymentBreakdown?.cash || 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("cashRegister.credit")}</p>
                        <p className={`font-semibold ${(parseFloat(closingCredit) || 0) - (currentRegister.expectedPaymentBreakdown?.credit || 0) !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {formatCurrency((parseFloat(closingCredit) || 0) - (currentRegister.expectedPaymentBreakdown?.credit || 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("cashRegister.debit")}</p>
                        <p className={`font-semibold ${(parseFloat(closingDebit) || 0) - (currentRegister.expectedPaymentBreakdown?.debit || 0) !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {formatCurrency((parseFloat(closingDebit) || 0) - (currentRegister.expectedPaymentBreakdown?.debit || 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("cashRegister.transfer")}</p>
                        <p className={`font-semibold ${(parseFloat(closingTransfer) || 0) - (currentRegister.expectedPaymentBreakdown?.transfer || 0) !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {formatCurrency((parseFloat(closingTransfer) || 0) - (currentRegister.expectedPaymentBreakdown?.transfer || 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="closingNotes">{t("cashRegister.closingNotes")}</Label>
                <Textarea
                  id="closingNotes"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder={t("cashRegister.closingNotesPlaceholder")}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCloseDialog(false)} className="flex-1">
                  {t("cashRegister.cancel")}
                </Button>
                <Button onClick={handleCloseRegister} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("cashRegister.confirm")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
