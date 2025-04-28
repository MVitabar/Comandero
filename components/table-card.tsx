"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Users,
  Square,
  Circle,
  RectangleVerticalIcon as Rectangle,
  Edit,
  Trash,
  ClipboardList,
  CheckCircle,
  Receipt,
  Settings,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc, updateDoc, collection, query, where, getDocs, limit, serverTimestamp } from "firebase/firestore"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { OrderDetailsDialog } from './orders/order-details-dialog'
import { TableCardProps, Order, TableItem, PaymentInfo, PaymentMethod } from '@/types'
import { DialogDescription } from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { UserRole } from '@/types'

export function TableCard({
  table,
  hasActiveOrder = false,
  orderStatus = "",
  onEdit,
  onDelete,
  onCreateOrder,
  onViewOrder,
  onMarkAsServed,
  onCloseOrder,
  isEditing = false,
}: TableCardProps) {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)

  // Determine restaurant ID
  const restaurantId = user?.establishmentId || user?.uid || table.restaurantId || ''

  // Comprehensive order preparation with robust type handling
  const prepareOrderForDialog = (activeOrder: Order | null): Order => {
    // Create a base order object with required properties
    const createBaseOrder = (): Order => ({
      id: crypto.randomUUID(),
      status: 'pending',
      total: 0,
      items: [],
      tableNumber: table.number || 0,
      orderType: 'table',
      restaurantId: user?.uid || table.restaurantId || '',
      subtotal: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: {
        uid: user?.uid || 'system',
        displayName: user?.displayName || '',
        email: user?.email || null,
        role: user?.role || UserRole.WAITER
      },
      paymentInfo: {
        method: 'cash' as PaymentMethod,
        amount: 0,
        tip: 0,
        processedAt: new Date()
      }
    })

    // If no active order, return a base order
    if (!activeOrder) {
      return createBaseOrder()
    }

    // Prepare extended order properties with comprehensive fallbacks
    const extendedOrderProperties: Partial<Order> = {
      // Table-related properties with precise fallback
      tableNumber: 
        activeOrder.tableNumber !== undefined 
          ? activeOrder.tableNumber 
          : (table.number || 0),
      
      orderType: 
        activeOrder.orderType || 
        (table.status === 'occupied' ? 'table' : 'counter'),
      
      restaurantId: 
        activeOrder.restaurantId || 
        user?.uid || 
        table.restaurantId || 
        '',
      
      // Financial details with comprehensive fallback
      subtotal: 
        activeOrder.subtotal !== undefined 
          ? activeOrder.subtotal 
          : (activeOrder.total || 0),
      
      // Timestamp handling with current time as default
      createdAt: 
        activeOrder.createdAt || 
        new Date(),
      
      updatedAt: 
        activeOrder.updatedAt || 
        new Date(),
      
      // Payment information with safe defaults
      paymentInfo: 
        activeOrder.paymentInfo || ({
          method: 'cash' as PaymentMethod,
          amount: activeOrder.total || 0,
          tip: 0,
          processedAt: new Date()
        } as PaymentInfo),
      
      // Additional metadata with multiple fallback sources
      tableId: 
        activeOrder.tableId || 
        table.uid || 
        table.id || 
        '',
      
      tableMapId: 
        activeOrder.tableMapId || 
        table.mapId || 
        table.id || 
        undefined,
      
      waiter: 
        activeOrder.waiter || 
        user?.username || 
        '',
      
      // Optional additional details with safe defaults
      specialRequests: 
        activeOrder.specialRequests || 
        '',
      
      dietaryRestrictions: 
        activeOrder.dietaryRestrictions || 
        [],
      
      // Closure tracking
      closedAt: 
        activeOrder.closedAt || 
        null
    }

    // Merge original order with extended properties
    const preparedOrder: Order = {
      ...createBaseOrder(), // Start with a base order
      ...activeOrder, // Overlay original order properties
      ...extendedOrderProperties, // Add extended properties
      
      // Ensure critical properties are always present
      id: activeOrder.id || crypto.randomUUID(),
      items: activeOrder.items || [],
      total: activeOrder.total || 0,
      status: activeOrder.status || 'pending'
    }

    return preparedOrder
  }

  // Fetch active order details
  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        const restaurantId = user?.establishmentId || user?.uid || table.restaurantId || ''
        if (!restaurantId) {
          return
        }

        // Query for active orders for this table
        const ordersRef = collection(db, `restaurants/${restaurantId}/orders`)
        
        const q = query(
          ordersRef, 
          where('tableId', '==', table.uid),
          where('status', '!=', 'finished'),
          limit(1)
        )

        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0]
          const orderData = {
            id: orderDoc.id,
            ...orderDoc.data()
          } as Order

          setActiveOrder(orderData)
        } else {
          setActiveOrder(null)
        }
      } catch (error) {
        console.error('Error fetching active order:', error)
        setActiveOrder(null)
      }
    }

    // Always attempt to fetch and sync
    fetchActiveOrder()
  }, [table.uid, user?.uid, db])

  // Determine table and order status
  const getTableStatusColor = () => {
    switch (table.status) {
      case 'available': return 'bg-green-50 border-green-200 text-green-700'
      case 'occupied': return 'bg-red-50 border-red-200 text-red-700'
      case 'ordering': return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      default: return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  // Payment method types
  const paymentMethods: PaymentMethod[] = [
    'cash', 
    'credit', 
    'debit', 
    'transfer', 
    'other'
  ]

  const handleTableOrderSync = async (order?: Order | null) => {
    try {
      if (!db || !user) return

      const restaurantId = user.currentEstablishmentName || user.uid

      // Fetch the table map that contains this table
      const tableMapRef = doc(db, 'restaurants', restaurantId, 'tableMaps', table.mapId || '')
      const tableMapSnapshot = await getDoc(tableMapRef)

      if (!tableMapSnapshot.exists()) {
        return
      }

      const tableMapData = tableMapSnapshot.data()
      const tablesInMap = tableMapData?.layout?.tables || []

      // Status mapping logic
      const tableStatusMap: Record<string, string> = {
        'pending': 'occupied',
        'preparing': 'occupied',
        'ready': 'occupied',
        'served': 'occupied',
        'finished': 'available'
      }

      // Determine new table status
      const newTableStatus = order 
        ? (tableStatusMap[order.status] || 'available')
        : 'available'

      // Update the table in the table map's layout
      const updatedTables = tablesInMap.map((t: TableItem) => 
        t.id === table.uid 
          ? { 
              ...t, 
              status: newTableStatus,
              activeOrderId: order && order.status !== 'finished' ? order.id : null 
            }
          : t
      )

      // Update the entire table map document
      await updateDoc(tableMapRef, {
        'layout.tables': updatedTables,
        updatedAt: new Date()
      })

      // Optional toast notification
      toast(`Table ${table.number} is now ${newTableStatus}`, {
        description: undefined,
      })
    } catch (error) {
      console.error('Table Sync Error:', error)
      toast(t("tableCard.errors.sync"), {
        description: undefined,
      })
    }
  }

  const confirmCloseOrder = async () => {
    if (!selectedPaymentMethod) {
      toast(t("orders.errors.selectPaymentMethod"), {
        description: undefined,
      })
      return
    }

    try {
      if (!db || !user || !activeOrder) return

      const restaurantId = user.currentEstablishmentName || user.uid

      // Update order with payment method
      const orderRef = doc(db, `restaurants/${restaurantId}/orders`, activeOrder.id)
      await updateDoc(orderRef, {
        status: 'closed',
        'paymentInfo.method': selectedPaymentMethod,
        closedAt: serverTimestamp()
      })

      // Fetch the table map that contains this table
      const tableMapRef = doc(db, `restaurants/${restaurantId}/tableMaps`, table.mapId || '')
      const tableMapSnapshot = await getDoc(tableMapRef)

      if (!tableMapSnapshot.exists()) {
        return
      }

      const tableMapData = tableMapSnapshot.data()
      const tablesInMap = tableMapData?.layout?.tables || []

      // Update the table in the table map's layout
      const updatedTables = tablesInMap.map((t: TableItem) => 
        t.id === table.uid 
          ? { 
              ...t, 
              status: 'available',
              activeOrderId: null 
            }
          : t
      )

      // Update the entire table map document
      await updateDoc(tableMapRef, {
        'layout.tables': updatedTables,
        updatedAt: new Date()
      })

      toast(t("orders.success.orderClosed"), {
        description: `${t("orders.paymentMethod")}: ${t(`orders.paymentMethods.${selectedPaymentMethod}`)}`,
      })

      // Reset states
      setIsPaymentDialogOpen(false)
      setSelectedPaymentMethod(null)
    } catch (error) {
      console.error('Error closing order:', error)
      toast(t("orders.errors.closeOrderFailed"), {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    }
  }

  const handleCloseTableAndOrder = () => {
    setIsPaymentDialogOpen(true)
  }

  return (
    <>
      <Card 
        className={cn(
          "transition-all hover:shadow-md",
          getTableStatusColor()
        )}
        onClick={() => {}}
      >
        <CardHeader className="pb-2">
          <CardTitle>
            <span>
              {t("commons.tableNumber")} {table.number}
            </span>
            <Badge variant="outline" className={cn("font-normal", getTableStatusColor())}>
              {t(`tableCard.label.${table.status || 'available'}`)}
            </Badge>
          </CardTitle>
          <CardDescription>
            {hasActiveOrder 
              ? t(`tableCard.label.${table.status || 'occupied'}`)
              : t("tableCard.status.noActiveOrder")
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeOrder 
                  ? `Active Order: ${activeOrder.status}` 
                  : 'No active order'}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {table.status === 'available' && (
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => {
                onCreateOrder && onCreateOrder()
              }}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              {t("tableCard.actions.createOrder")}
            </Button>
          )}

          {activeOrder && (
            <>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsOrderDetailsOpen(true)
                }}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                {t("tableCard.actions.viewOrder")}
              </Button>
              {activeOrder.status === 'ready' && (
                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={handleCloseTableAndOrder}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  {t("tableCard.actions.closeOrder")}
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      {/* Order Details Dialog with comprehensive type handling */}
      {activeOrder && (
        <OrderDetailsDialog 
          order={prepareOrderForDialog(activeOrder)}
          open={isOrderDetailsOpen}
          onOpenChange={(open) => setIsOrderDetailsOpen(open)}
          onClose={() => setIsOrderDetailsOpen(false)}
        />
      )}

      {/* Payment Method Dialog */}
      {isPaymentDialogOpen && (
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("orders.selectPaymentMethod")}</DialogTitle>
              <DialogDescription>
                {t("orders.paymentMethodDescription")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {paymentMethods.map((method) => (
                <Button
                  key={method}
                  variant={selectedPaymentMethod === method ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedPaymentMethod(method)}
                >
                  {t(`orders.paymentMethods.${method}`)}
                </Button>
              ))}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                {t("commons.cancel")}
              </Button>
              <Button 
                disabled={!selectedPaymentMethod}
                onClick={confirmCloseOrder}
              >
                {t("orders.confirmPayment")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
