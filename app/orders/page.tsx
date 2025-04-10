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
    ? `orders.status.${validStatus}`
    : 'orders.status.unknown';

  // Use safeTranslate to handle translation
  return safeTranslate(
    (key) => t(key), 
    translationKey, 
    validStatus !== 'null' ? validStatus : 'Unknown'
  );
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
        status: selectedStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id 
            ? { ...order, status: selectedStatus, updatedAt: new Date() } 
            : order
        ),
      )

      toast({
        title: t("orders.success.statusUpdated"),
        description: `${t("orders.table.headers.id")} #${String(selectedOrder.id).substring(0, 6)} ${t("orders.action.updated")} ${translateStatus(selectedStatus, i18n?.language)}`,
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
        description: `${t("orders.table.headers.id")} #${String(selectedOrder.id).substring(0, 6)} ${t("orders.action.deleted")}`,
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

  const filteredOrders = orders.filter(
    (order) =>
      (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.tableNumber?.toString() || '').includes(searchQuery) ||
      (order.waiter || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.status || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
          <Link href="/orders/new">
            <Button asChild>
              <Link href="/orders/new">
                <Plus className="mr-2 h-4 w-4" /> {t("orders.newOrder")}
              </Link>
            </Button>
          </Link>
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
                  {translateStatus(status, i18n?.language)}
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
                    <TableHead>{t("orders.table.headers.id")}</TableHead>
                    <TableHead>{t("orders.table.headers.tableNumber")}</TableHead>
                    <TableHead>{t("orders.table.headers.waiter")}</TableHead>
                    <TableHead>{t("orders.table.headers.items")}</TableHead>
                    <TableHead>{t("orders.table.headers.status")}</TableHead>
                    <TableHead>{t("orders.table.headers.total")}</TableHead>
                    <TableHead>{t("orders.table.headers.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.tableNumber}</TableCell>
                      <TableCell>{order.waiter}</TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {t(`orders.status.${order.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewOrder(order)}
                          >
                            {t("orders.actions.view")}
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            {t("orders.actions.updateStatus")}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            {t("orders.actions.delete")}
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
                      {t(`orders.status.${status}`)}
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
    </>
  )
}
