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
import { Order, OrderStatus, FlexibleOrderStatus, BaseOrderStatus } from "@/types"
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
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

  // Construct translation key
  const translationKey = validStatus !== 'null' 
    ? `ordersPage.status.${validStatus}`
    : 'ordersPage.status.unknown';

  // Use safeTranslate to handle translation
  return safeTranslate(
    (key) => t(key), 
    translationKey, 
    validStatus !== 'null' ? validStatus : 'Unknown'
  );
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
  const [newStatus, setNewStatus] = useState<FlexibleOrderStatus>("pending")

  useEffect(() => {
    fetchOrders()
  }, [db, user])

  const fetchOrders = async () => {
    if (!db || !user) return

    setLoading(true)
    try {
      // Use restaurant-specific orders subcollection
      const ordersRef = collection(db, 'restaurants', user.uid, 'orders')
      const q = query(ordersRef, orderBy('createdAt', 'desc'))
      
      const querySnapshot = await getDocs(q)
      const fetchedOrders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tableId: data.tableId || '',
          tableMapId: data.tableMapId || '',
          tableNumber: data.tableNumber || 0,
          status: data.status || 'pending',
          waiter: data.waiter || '',
          items: data.items || [],
          total: data.total || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          uid: data.uid || user.uid
        } as Order;
      });

      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: t("commons.error"),
        description: t("orders.error.fetchFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!db || !user || !selectedOrder || !selectedOrder.id) return

    try {
      // Use restaurant-specific orders subcollection
      const orderRef = doc(db, 'restaurants', user.uid, 'orders', String(selectedOrder.id))
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id 
            ? { ...order, status: newStatus, updatedAt: new Date() } 
            : order
        ),
      )

      toast({
        title: t("orders.success.statusUpdated"),
        description: `${t("orders.table.id")} #${String(selectedOrder.id).substring(0, 6)} ${t("orders.action.updateStatus")} ${translateStatus(newStatus, i18n?.language)}`,
      })

      setIsStatusDialogOpen(false)
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

    try {
      // Use restaurant-specific orders subcollection
      const orderRef = doc(db, 'restaurants', user.uid, 'orders', String(selectedOrder.id))
      await deleteDoc(orderRef)

      // Update local state
      setOrders(orders.filter((order) => order.id !== selectedOrder.id))

      toast({
        title: t("orders.success.orderDeleted"),
        description: `${t("orders.table.id")} #${String(selectedOrder.id).substring(0, 6)} ${t("orders.action.delete")}`,
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: t("commons.error"),
        description: t("orders.error.deleteOrderFailed"),
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status?: FlexibleOrderStatus): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "delivered":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "finished":
        return "bg-green-200 text-green-900 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.tableNumber?.toString() || '').includes(searchQuery) ||
      (order.waiter || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.status || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleStatusChange = (status: FlexibleOrderStatus) => {
    if (!selectedOrder) return

    // Provide default values or fallbacks
    const currentStatus = selectedOrder.status || 'pending'
    const currentTableNumber = selectedOrder.tableNumber || 0
    const currentTableId = selectedOrder.tableId

    setNewStatus(status)
    setIsStatusDialogOpen(true)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailsDialogOpen(true)
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("ordersPage.orders")}</h1>
          <Link href="/orders/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("ordersPage.newOrder")}
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("ordersPage.search.placeholder")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("ordersPage.filter.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("ordersPage.filter.allStatuses")}</SelectItem>
              {Object.keys(STATUS_TRANSLATIONS).map((status) => (
                <SelectItem key={status} value={status}>
                  {translateStatus(status, i18n?.language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("ordersPage.orders")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">{t("commons.loading")}</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-4">{t("ordersPage.noOrdersFound")}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ordersPage.table.id")}</TableHead>
                    <TableHead>{t("ordersPage.table.table")}</TableHead>
                    <TableHead>{t("ordersPage.table.waiter")}</TableHead>
                    <TableHead>{t("ordersPage.table.items")}</TableHead>
                    <TableHead>{t("ordersPage.table.status")}</TableHead>
                    <TableHead>{t("ordersPage.table.total")}</TableHead>
                    <TableHead>{t("ordersPage.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id || crypto.randomUUID()}>
                      <TableCell>#{(order.id || '').substring(0, 6)}</TableCell>
                      <TableCell>
                        {order.tableMapId ? `Map ${order.tableMapId}` : 'N/A'} #{order.tableNumber || 'N/A'}
                      </TableCell>
                      <TableCell>{order.waiter || 'N/A'}</TableCell>
                      <TableCell>
                        {order.items.map((item) => `${item.name} (${item.quantity})`).join(", ") || 'No items'}
                      </TableCell>
                      <TableCell>
                        {translateStatus(order.status || 'pending', i18n?.language)}
                      </TableCell>
                      <TableCell>
                        {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewOrder(order)}
                          >
                            {t("ordersPage.actions.view")}
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            {t("ordersPage.actions.updateStatus")}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            {t("ordersPage.actions.delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("ordersPage.action.updateStatus")}</DialogTitle>
              <DialogDescription>
                {t("ordersPage.action.updateStatusDescription", { 
                  orderId: selectedOrder && selectedOrder.id 
                    ? `#${String(selectedOrder.id).substring(0, 6)}` 
                    : '' 
                })}
              </DialogDescription>
            </DialogHeader>
            <Select 
              value={newStatus} 
              onValueChange={(value: FlexibleOrderStatus) => setNewStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("ordersPage.action.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(STATUS_TRANSLATIONS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {translateStatus(status, i18n?.language)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsStatusDialogOpen(false)}
              >
                {t("commons.button.cancel")}
              </Button>
              <Button onClick={handleUpdateStatus}>
                {t("commons.button.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("ordersPage.action.deleteOrder")}</DialogTitle>
              <DialogDescription>
                {t("ordersPage.action.deleteOrderConfirmation", { 
                  orderId: selectedOrder && selectedOrder.id 
                    ? `#${String(selectedOrder.id).substring(0, 6)}` 
                    : '' 
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {t("commons.cancel")}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteOrder}
              >
                {t("commons.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Details Dialog */}
        {selectedOrder && (
          <OrderDetailsDialog 
            order={selectedOrder}
            open={isOrderDetailsDialogOpen}
            onOpenChange={setIsOrderDetailsDialogOpen}
          />
        )}
      </div>
    </>
  )
}
