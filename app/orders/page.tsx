"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { safeTranslate } from '@/components/i18n-provider';
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal, Edit, Trash, X } from "lucide-react"
import Link from "next/link"
import { t, TFunction } from 'i18next';
import { Order, OrderStatus, FlexibleOrderStatus, BaseOrderStatus, OrderItem } from "@/types"
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import * as crypto from 'crypto';
import { useRouter } from "next/navigation";
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog"

// Language codes
type LanguageCode = 'en' | 'es' | 'pt';

// Status Translation Type
type StatusTranslation = {
  [key in LanguageCode]: string;
};

// Comprehensive Status Translation Mapping
const STATUS_TRANSLATIONS: Record<BaseOrderStatus, StatusTranslation> = {
  "pending": {
    en: "Pending",
    es: "Pendiente", 
    pt: "Pendente"
  },
  "preparing": {
    en: "In Preparation",
    es: "En preparación", 
    pt: "Em Preparação"
  },
  "ready": {
    en: "Ready",
    es: "Listo", 
    pt: "Pronto"
  },
  "delivered": {
    en: "Delivered",
    es: "Entregado", 
    pt: "Entregue"
  },
  "cancelled": {
    en: "Cancelled",
    es: "Cancelado", 
    pt: "Cancelado"
  },
  "closed": {
    en: "Closed",
    es: "Cerrado", 
    pt: "Fechado"
  },
  "ordering": {
    en: "Ordering",
    es: "Ordenando", 
    pt: "Ordenando"
  },
  "served": {
    en: "Served",
    es: "Servido", 
    pt: "Servido"
  },
  "finished": {
    en: "Finished",
    es: "Finalizado", 
    pt: "Finalizado"
  },
  "null": {
    en: "Unknown",
    es: "Desconocido", 
    pt: "Desconhecido"
  }
};

// Translation Utility
const translateStatus = (
  status: FlexibleOrderStatus | undefined | null | string, 
  language: LanguageCode = 'en'
): string => {
  // Check if status is a valid OrderStatus
  const validStatus = status && Object.keys(STATUS_TRANSLATIONS).includes(status.toString())
    ? status.toString() as BaseOrderStatus
    : 'null';

  // Directly return the translation from STATUS_TRANSLATIONS
  return STATUS_TRANSLATIONS[validStatus][language];
};

// Define a type for Badge variants to ensure type safety
type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

// Fix Badge variant type issue by creating a type-safe badge variant function
const getStatusBadgeVariant = (status?: BaseOrderStatus): BadgeVariant => {
  if (!status || status === 'null') return 'outline';

  switch (status) {
    case 'pending':
      return 'outline';
    case 'preparing':
      return 'secondary';
    case 'ready':
    case 'served':
    case 'delivered':
    case 'closed':
    case 'finished':
      return 'default';
    case 'cancelled':
      return 'destructive';
    case 'ordering':
    default:
      return 'outline';
  }
}

// Función auxiliar para obtener la etiqueta de tipo de pedido
const getOrderTypeLabel = (orderType?: string): string => {
  const orderTypeLabels: Record<string, string> = {
    'table': 'Mesa',
    'delivery': 'Delivery',
    'counter': 'Mostrador',
    'takeaway': 'Para llevar'
  };

  return orderType && orderTypeLabels[orderType] 
    ? orderTypeLabels[orderType] 
    : 'Desconocido';
};

export default function OrdersPage() {
  const { t, i18n }: { t: TFunction, i18n: any } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<FlexibleOrderStatus>("pending")

  useEffect(() => {
    fetchOrders()
  }, [db, user])

  const fetchOrders = async () => {
    if (!db || !user) return

    // Validate establishmentId before proceeding
    if (!user.establishmentId) {
      console.error('No establishment ID found for user')
      toast({
        title: "Orders Fetch Error",
        description: "Unable to fetch orders: No establishment ID found",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Use restaurant-specific orders subcollection with establishmentId
      const ordersRef = collection(db, 'restaurants', user.establishmentId, 'orders')
      const q = query(ordersRef, orderBy('createdAt', 'desc'))
      
      console.group('🍽️ Order Fetching Debug')
      console.log('Establishment ID:', user.establishmentId)
      console.log('Orders Collection Path:', `restaurants/${user.establishmentId}/orders`)
      
      const querySnapshot = await getDocs(q)
      
      console.log('Total Orders Found:', querySnapshot.docs.length)
      
      const fetchedOrders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Precise table number extraction
        const extractTableNumber = (input: any, orderType?: string): number | undefined => {
          // Si no hay tipo de orden, devolver undefined
          if (!orderType) return undefined;

          // Mapeo de tipos de orden a etiquetas
          const orderTypeLabels: Record<string, string> = {
            'table': t('orders.type.table'),
            'delivery': t('orders.type.delivery'),
            'counter': t('orders.type.counter'),
            'takeaway': t('orders.type.takeaway')
          };

          // Si el tipo de orden no está en el mapeo, devolver undefined
          if (!orderTypeLabels[orderType]) return undefined;

          // Para pedidos de mesa, extraer número de mesa
          if (orderType === 'table') {
            // Lógica original de extracción de número de mesa
            const tableNumber = typeof input === 'number' 
              ? input 
              : (typeof input === 'string' 
                ? parseInt(input, 10) 
                : undefined);
            
            return tableNumber;
          }

          // Para otros tipos de pedido, devolver undefined
          return undefined;
        };

        // Normalize items to match Firebase structure
        const normalizedItems = Array.isArray(data.items) 
          ? Object.values(data.items).map((item: any) => ({
              id: item.id || `temp-${Date.now()}`,
              itemId: item.itemId,
              name: item.name,
              category: item.category,
              quantity: Number(item.quantity),
              price: Number(item.price),
              stock: Number(item.stock),
              unit: item.unit,
              notes: item.notes || '',
              customDietaryRestrictions: Array.isArray(item.customDietaryRestrictions) 
                ? item.customDietaryRestrictions 
                : []
            } as OrderItem))
          : (data.items 
              ? Object.values(data.items).map((item: any) => ({
                  id: item.id || `temp-${Date.now()}`,
                  itemId: item.itemId,
                  name: item.name,
                  category: item.category,
                  quantity: Number(item.quantity),
                  price: Number(item.price),
                  stock: Number(item.stock),
                  unit: item.unit,
                  notes: item.notes || '',
                  customDietaryRestrictions: Array.isArray(item.customDietaryRestrictions) 
                    ? item.customDietaryRestrictions 
                    : []
                } as OrderItem))
              : []);

        return {
          id: doc.id,
          tableNumber: extractTableNumber(data.tableNumber, data.orderType),
          orderType: data.orderType || data.type || 'table',
          type: data.type || data.orderType || 'table',
          status: data.status || 'pending',
          userId: data.userId || data.uid,
          uid: data.uid || data.userId,
          restaurantId: data.restaurantId || user.establishmentId,
          items: normalizedItems,
          subtotal: data.subtotal || data.total || 0,
          total: data.total || data.subtotal || 0,
          discount: data.discount || 0,
          tax: data.tax,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          tableId: data.tableId || data.debugContext?.orderContext?.tableId,
          tableMapId: data.tableMapId || data.debugContext?.orderContext?.tableMapId,
          waiter: data.waiter || data.debugContext?.userInfo?.uid || user.email,
          specialRequests: data.specialRequests || '',
          paymentInfo: {
            method: data.paymentInfo?.method || 'other',
            amount: data.paymentInfo?.amount || data.total || 0
          },
          debugContext: data.debugContext
        } as Order;
      });

      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      console.groupEnd()
      toast({
        title: t("commons.error"),
        description: t("orders.error.fetchFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch a specific order by ID
  const fetchOrderById = async (orderId: string) => {
    try {
      // Validate inputs
      if (!orderId) {
        toast({
          title: t("commons.error"),
          description: t("orders.error.invalidOrderId"),
          variant: "destructive"
        });
        return null;
      }

      // Ensure user and establishment ID exist
      if (!user || !user.establishmentId) {
        toast({
          title: t("commons.error"),
          description: t("commons.userNotAuthenticated"),
          variant: "destructive"
        });
        return null;
      }

      // Construct the reference to the specific order document
      const orderRef = doc(
        db, 
        'restaurants', 
        user.establishmentId, 
        'orders', 
        orderId
      );

      // Fetch the specific order document
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        toast({
          title: t("commons.error"),
          description: t("orders.error.notFound"),
          variant: "destructive"
        });
        return null;
      }

      const data = orderDoc.data();

      // Use the same normalization logic as in fetchOrders
      const extractTableNumber = (input: any, orderType?: string): number | undefined => {
        // Si no hay tipo de orden, devolver undefined
        if (!orderType) return undefined;

        // Mapeo de tipos de orden a etiquetas
        const orderTypeLabels: Record<string, string> = {
          'table': t('orders.type.table'),
          'delivery': t('orders.type.delivery'),
          'counter': t('orders.type.counter'),
          'takeaway': t('orders.type.takeaway')
        };

        // Si el tipo de orden no está en el mapeo, devolver undefined
        if (!orderTypeLabels[orderType]) return undefined;

        // Para pedidos de mesa, extraer número de mesa
        if (orderType === 'table') {
          // Lógica original de extracción de número de mesa
          const tableNumber = typeof input === 'number' 
            ? input 
            : (typeof input === 'string' 
              ? parseInt(input, 10) 
              : undefined);
          
          return tableNumber;
        }

        // Para otros tipos de pedido, devolver undefined
        return undefined;
      };

      const normalizedItems = Array.isArray(data.items) 
        ? Object.values(data.items).map((item: any) => ({
            id: item.id || `temp-${Date.now()}`,
            itemId: item.itemId,
            name: item.name,
            category: item.category,
            quantity: Number(item.quantity),
            price: Number(item.price),
            stock: Number(item.stock),
            unit: item.unit,
            notes: item.notes || '',
            customDietaryRestrictions: Array.isArray(item.customDietaryRestrictions) 
              ? item.customDietaryRestrictions 
              : []
          } as OrderItem))
        : (data.items ? Object.values(data.items).map((item: any) => ({
            id: item.id || `temp-${Date.now()}`,
            itemId: item.itemId,
            name: item.name,
            category: item.category,
            quantity: Number(item.quantity),
            price: Number(item.price),
            stock: Number(item.stock),
            unit: item.unit,
            notes: item.notes || '',
            customDietaryRestrictions: Array.isArray(item.customDietaryRestrictions) 
              ? item.customDietaryRestrictions 
              : []
          } as OrderItem)) : []);

      const normalizedOrder: Order = {
        id: orderDoc.id,
        tableNumber: extractTableNumber(data.tableNumber, data.orderType),
        orderType: data.orderType || data.type || 'table',
        type: data.type || data.orderType || 'table',
        status: data.status || 'pending',
        userId: data.userId || data.uid,
        uid: data.uid || data.userId,
        restaurantId: data.restaurantId || user.establishmentId,
        items: normalizedItems,
        subtotal: data.subtotal || data.total || 0,
        total: data.total || data.subtotal || 0,
        discount: data.discount || 0,
        tax: data.tax,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        tableId: data.tableId || data.debugContext?.orderContext?.tableId,
        tableMapId: data.tableMapId || data.debugContext?.orderContext?.tableMapId,
        waiter: data.waiter || data.debugContext?.userInfo?.uid || user.email,
        specialRequests: data.specialRequests || '',
        paymentInfo: {
          method: data.paymentInfo?.method || 'other',
          amount: data.paymentInfo?.amount || data.total || 0
        },
        debugContext: data.debugContext
      };

      return normalizedOrder;
    } catch (error) {
      console.error("Error fetching specific order:", error);
      toast({
        title: t("commons.error"),
        description: t("orders.error.fetchFailed"),
        variant: "destructive"
      });
      return null;
    }
  }

  const handleUpdateStatus = async () => {
    if (!db || !user || !selectedOrder || !selectedOrder.id) return

    // Validate establishmentId before proceeding
    if (!user.establishmentId) {
      console.error('No establishment ID found for user')
      toast({
        title: "Order Update Error",
        description: "Unable to update order status: No establishment ID found",
        variant: "destructive"
      })
      return
    }

    try {
      // Use restaurant-specific orders subcollection with establishmentId
      const orderRef = doc(db, 'restaurants', user.establishmentId, 'orders', String(selectedOrder.id))
      await updateDoc(orderRef, {
        status: selectedStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id 
            ? { ...order, status: selectedStatus, updatedAt: new Date() } 
            : order
        )
      )

      // Close the status dialog
      setIsStatusDialogOpen(false)

      // Show success toast
      toast({
        title: "Order Status Updated",
        description: `Order status changed to ${translateStatus(selectedStatus)}`,
        variant: "default"
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: t("commons.error"),
        description: t("orders.error.updateStatusFailed"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = async () => {
    if (!db || !user || !selectedOrder || !selectedOrder.id) return

    // Validate establishmentId before proceeding
    if (!user.establishmentId) {
      console.error('No establishment ID found for user')
      toast({
        title: "Order Delete Error",
        description: "Unable to delete order: No establishment ID found",
        variant: "destructive"
      })
      setIsDeleteDialogOpen(false)
      return
    }

    try {
      // Use restaurant-specific orders subcollection
      const orderRef = doc(db, 'restaurants', user.establishmentId, 'orders', String(selectedOrder.id))
      await deleteDoc(orderRef)

      // Update local state
      setOrders(orders.filter((order) => order.id !== selectedOrder.id))

      // Close the delete dialog
      setIsDeleteDialogOpen(false)

      toast({
        title: t("orders.success.orderDeleted"),
        description: `${t("orders.table.headers.id")} #${String(selectedOrder.id).substring(0, 6)} ${t("orders.action.deleted")}`,
        variant: "default"
      })
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: t("commons.error"),
        description: t("orders.error.deleteFailed"),
        variant: "destructive",
      })
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.tableNumber?.toString() || '').includes(searchQuery) ||
      (order.waiter || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.status || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  console.log("Filtered Orders:", filteredOrders.map(order => ({
    id: order.id,
    itemsCount: order.items.length,
    itemsType: typeof order.items,
    itemsExample: order.items.length > 0 ? order.items[0] : null
  })))

  const handleStatusChange = (status: FlexibleOrderStatus) => {
    if (!selectedOrder) return

    setSelectedStatus(status)
    setIsStatusDialogOpen(true)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailsDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("orders.newOrder")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("orders.search.placeholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("orders.filter.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("orders.filter.allStatuses")}</SelectItem>
            {Object.keys(STATUS_TRANSLATIONS).map((status) => (
              <SelectItem key={status} value={status}>
                {translateStatus(status, i18n?.language as LanguageCode)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("orders.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">{t("table.loading")}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t("table.emptyState.title")}</h3>
              <p className="text-muted-foreground">{t("table.emptyState.description")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("orders.errors.headers.id")}</TableHead>
                  <TableHead>{t("commons.tableNumber")}</TableHead>
                  <TableHead>{t("orders.errors.headers.waiter")}</TableHead>
                  <TableHead>{t("orders.errors.headers.items")}</TableHead>
                  <TableHead>{t("commons.table.headers.status")}</TableHead>
                  <TableHead className="text-right">{t("commons.table.headers.price")}</TableHead>
                  <TableHead className="text-right">{t("orders.errors.headers.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      {order.tableNumber 
                        ? `${getOrderTypeLabel(order.orderType)} ${order.tableNumber}` 
                        : getOrderTypeLabel(order.orderType)}
                    </TableCell>
                    <TableCell>{order.waiter}</TableCell>
                    <TableCell>
                      {(() => {
                        const orderItems = Array.isArray(order.items) 
                          ? order.items 
                          : (order.items ? Object.values(order.items).map(item => item as OrderItem) : [])
                        
                        return orderItems.length > 0 
                          ? orderItems.map(item => item.name).join(", ") 
                          : t("orders.noItemsInOrder")
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status as BaseOrderStatus)}>
                        {translateStatus(order.status, i18n?.language as LanguageCode)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t("commons.openMenu")}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            {t("orders.actions.view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedOrder(order);
                            setIsStatusDialogOpen(true);
                          }}>
                            {t("orders.actions.updateStatus")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedOrder(order);
                            setIsDeleteDialogOpen(true);
                          }}>
                            {t("orders.actions.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isDeleteDialogOpen && selectedOrder && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialog.delete.title")}</DialogTitle>
              <DialogDescription>
                {t("dialog.delete.description")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {t("dialog.delete.cancelButton")}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteOrder}
              >
                {t("dialog.delete.confirmButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isStatusDialogOpen && selectedOrder && (
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialog.confirm.title")}</DialogTitle>
              <DialogDescription>
                {t("dialog.confirm.description")}
              </DialogDescription>
            </DialogHeader>
            <Select 
              value={selectedStatus} 
              onValueChange={(value: string) => {
                // Type guard to ensure only valid statuses are set
                if (Object.keys(STATUS_TRANSLATIONS).includes(value)) {
                  setSelectedStatus(value as BaseOrderStatus)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("orders.dialogs.updateStatus.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(STATUS_TRANSLATIONS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {translateStatus(status, i18n?.language as LanguageCode)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsStatusDialogOpen(false)}
              >
                {t("dialog.confirm.cancelButton")}
              </Button>
              <Button onClick={handleUpdateStatus}>
                {t("dialog.confirm.confirmButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <OrderDetailsDialog 
          order={selectedOrder}
          open={isOrderDetailsDialogOpen}
          onOpenChange={setIsOrderDetailsDialogOpen}
        />
      )}
    </div>
  )
}
