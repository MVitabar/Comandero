"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { safeTranslate } from '@/components/i18n-provider';
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import {toast} from "sonner"
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
import { Plus, Search, MoreHorizontal, Edit, Trash, X, Eye, PlusSquare, Repeat } from "lucide-react"
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
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";
import * as crypto from 'crypto';
import { useRouter } from "next/navigation";
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog"
import { UserRole } from "@/types/permissions";
import { useNotifications } from "@/hooks/useNotifications";
import { AddItemsDialog } from "@/components/orders/add-items-dialog";
import { filterOrdersByRole } from '@/lib/orderFilters';
import { usePermissions } from '@/hooks/usePermissions';
import {
  splitOrderItemsByCategory,
  canViewBothSections,
  canViewOnlyFood,
  canViewOnlyDrinks,
} from '@/lib/orderFilters';

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
  const router = useRouter();
  const { sendNotification } = useNotifications();
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isAddItemsDialogOpen, setIsAddItemsDialogOpen] = useState(false)
  // Estados separados para filtro global y status dialog
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedStatus, setSelectedStatus] = useState<BaseOrderStatus>('pending');

  useEffect(() => {
    if (!db || !user) return;
    setLoading(true);

    // Verifica que el usuario tenga un establecimiento asignado
    if (!user.establishmentId) {
      console.error('No establishment ID found for user');
      toast.error("Establishment ID not found");
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'restaurants', user.establishmentId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders = querySnapshot.docs.map(doc => {
        const data = doc.data();

        // Normalización (puedes adaptar esto según tu helper)
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
            }))
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
                }))
              : []);

        return {
          id: doc.id,
          tableNumber: data.tableNumber,
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
          mapId: data.mapId || data.debugContext?.orderContext?.mapId,
          waiter: data.createdBy?.username || data.createdBy?.email || data.waiter || 'Unknown',
          specialRequests: data.specialRequests || '',
          paymentInfo: {
            method: data.paymentInfo?.method || 'other',
            amount: data.paymentInfo?.amount || data.total || 0
          },
          debugContext: data.debugContext,
          createdBy: {
            uid: data.createdBy?.uid || data.uid,
            displayName: data.createdBy?.username || data.createdBy?.email || 'Unknown',
            email: data.createdBy?.email || null,
            role: data.createdBy?.role || 'unknown'
          }
        };
      });

      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders in real-time:", error);
      toast.error("Error en la suscripción de órdenes");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, user]);


  const handleUpdateStatus = async () => {
    if (!db || !user || !selectedOrder || !selectedOrder.id) return

    // Validate establishmentId before proceeding
    if (!user.establishmentId) {
      console.error('No establishment ID found for user')
      toast.error(t("orders.error.establishmentIdNotFound"))
      return
    }

    try {
      const STATUS_OPTIONS: BaseOrderStatus[] = [
        'pending', 'preparing', 'ready', 'delivered', 'cancelled', 'closed', 'ordering', 'served', 'finished'
      ]; // Excluye 'null' para no mostrar opción inválida

      if (!selectedStatus || !STATUS_OPTIONS.includes(selectedStatus as BaseOrderStatus)) {
        toast.error(t("orders.error.selectStatus"));
        return;
      }
      const validStatus = selectedStatus as BaseOrderStatus;
      const orderRef = doc(db, 'restaurants', user.establishmentId, 'orders', String(selectedOrder.id))
      await updateDoc(orderRef, { status: validStatus, updatedAt: new Date() })

      // Si la orden es de mesa y el status es "finished" o "closed", liberar la mesa
      const tableMapId = selectedOrder.mapId || selectedOrder.debugContext?.orderContext?.mapId;
      const tableId = selectedOrder.tableId || selectedOrder.debugContext?.orderContext?.tableId;
      if (
        (validStatus === "finished" || validStatus === "closed") &&
        tableId &&
        tableMapId
      ) {
        const tableMapRef = doc(db, 'restaurants', user.establishmentId, 'tableMaps', tableMapId)
        const tableMapSnap = await getDoc(tableMapRef)
        if (tableMapSnap.exists()) {
          const tableMapData = tableMapSnap.data()
          const tables = (tableMapData.layout?.tables || []).map((t: any) =>
            t.id === tableId ? { ...t, status: "available", activeOrderId: null } : t
          )
          await updateDoc(tableMapRef, {
            "layout.tables": tables,
            updatedAt: new Date()
          })
        }
      }

      setOrders(orders => orders.map(order => order.id === selectedOrder.id ? { ...order, status: validStatus, updatedAt: new Date() } : order))
      setIsStatusDialogOpen(false)
      toast.success(
        t("orders.success.statusUpdated", {
          orderId: selectedOrder.id,
          status: translateStatus(validStatus, i18n?.language as LanguageCode)
        })
      )
      await sendNotification({
        title: t("orders.push.statusUpdatedTitle"),
        message: t("orders.push.statusUpdatedMessage", { orderId: selectedOrder.id, status: translateStatus(validStatus, i18n?.language as LanguageCode) }),
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error(t("orders.error.updateStatusFailed"))
      setIsStatusDialogOpen(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!db || !user || !selectedOrder || !selectedOrder.id) return

    // Validate establishmentId before proceeding
    if (!user.establishmentId) {
      toast.error(t("orders.error.establishmentIdNotFound"))
      return
    }

    try {
      await deleteDoc(doc(db, 'restaurants', user.establishmentId, 'orders', String(selectedOrder.id)))
      setOrders(orders => orders.filter(order => order.id !== selectedOrder.id))
      setIsDeleteDialogOpen(false)
      toast.success(t("orders.success.orderDeleted", { orderId: selectedOrder.id }))
      await sendNotification({
        title: t("orders.push.orderDeletedTitle"),
        message: t("orders.push.orderDeletedMessage", { orderId: selectedOrder.id }),
        url: window.location.href,
      });
    } catch (error) {
      toast.error(t("orders.error.deleteOrderFailed"))
      setIsDeleteDialogOpen(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!db || !user || !selectedOrder || !selectedOrder.id) return

    // Validate establishmentId before proceeding
    if (!user.establishmentId) {
      toast.error(t("orders.error.establishmentIdNotFound"))
      return
    }

    try {
      const orderRef = doc(db, 'restaurants', user.establishmentId, 'orders', String(selectedOrder.id))
      await updateDoc(orderRef, { status: 'cancelled', updatedAt: new Date() })
      setOrders(orders => orders.map(order => order.id === selectedOrder.id ? { ...order, status: 'cancelled', updatedAt: new Date() } : order))
      setIsDeleteDialogOpen(false)
      toast.success(t("orders.success.orderCancelled", { orderId: selectedOrder.id }))
      await sendNotification({
        title: t("orders.push.orderCancelledTitle"),
        message: t("orders.push.orderCancelledMessage", { orderId: selectedOrder.id }),
        url: window.location.href,
      });
    } catch (error) {
      toast.error(t("orders.error.cancelOrderFailed"))
      setIsDeleteDialogOpen(false)
    }
  }

  // Definir categorías de cocina y bar con múltiples variantes
  const KITCHEN_CATEGORIES = [
    'appetizers', 'appetizer', 
    'main_courses', 'main_course', 
    'salads', 'salad',
    'sides', 'side', 
    'desserts', 'dessert'
  ];

  const BAR_CATEGORIES = [
    'drinks', 'drink', 
    'beverage', 'beverages'
  ];

  // Definir un tipo que incluya 'all' junto con BaseOrderStatus
  type FilterStatus = BaseOrderStatus | 'all';

  // Aplicar filtro de roles y luego filtro de búsqueda y status
  const filteredOrders = user?.role
    ? filterOrdersByRole({ orders, role: user.role }).filter(
        (order) => {
          // Verificar si coincide con el status seleccionado
          const statusMatch =
            statusFilter === 'all' ||
            order.status === statusFilter;

          // Verificar si coincide con la búsqueda
          const searchMatch =
            searchQuery === '' ||
            (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.tableNumber?.toString() || '').includes(searchQuery) ||
            (order.waiter || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.status || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            // Buscar en los nombres de los items
            order.items.some(item =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

          // Retornar true si coincide con status Y con búsqueda
          return statusMatch && (searchQuery === '' || searchMatch);
        }
      )
    : [];

  // Helper para roles administrativos y mozo
  const isAdminOrWaiter = (
    user?.role === UserRole.WAITER ||
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.MANAGER ||
    user?.role === UserRole.OWNER
  );

  // Función para abrir el diálogo de status correctamente
  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status as BaseOrderStatus);
    setIsStatusDialogOpen(true);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailsDialogOpen(true)
  }

  // Genera un id único para la descripción del diálogo de status
  const statusDescriptionId = selectedOrder ? `dialog-status-description-${selectedOrder.id}` : 'dialog-status-description';

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] overflow-hidden">
      <div className="flex justify-between items-center mb-4 px-4">
        <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("orders.newOrder")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4 px-4">
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
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
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

      <div className="flex-grow overflow-y-auto px-4">
        {loading ? (
          <div className="text-center py-4">{t("table.loading")}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center">
            <h3 className="text-lg font-semibold">{t("table.emptyState.title")}</h3>
            <p className="text-muted-foreground">{t("table.emptyState.description")}</p>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas para móviles y desktop: ocupar todo el ancho disponible */}
            <div className="grid gap-4 grid-cols-1 ">
              {filteredOrders.map((order) => {
                const { comidas, bebidas } = splitOrderItemsByCategory(order.items || []);
                return (
                  <Card key={order.id} className="w-full">
                    <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
                      <Badge variant={getStatusBadgeVariant(order.status as BaseOrderStatus)}>
                        {translateStatus(order.status, i18n?.language as LanguageCode)}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("commons.tableNumber")}</p>
                          <p>{order.tableNumber 
                            ? `${getOrderTypeLabel(order.orderType)} ${order.tableNumber}` 
                            : getOrderTypeLabel(order.orderType)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("orders.errors.headers.waiter")}</p>
                          <p>
                            {order.createdBy?.displayName || order.createdBy?.email || t("orders.unknownUser")}
                            {order.createdBy?.role && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({t(`roles.${order.createdBy.role.toLowerCase()}`)})</span>
                            )}
                          </p>
                        </div>
                        <div className="col-span-2">
                          {/* Reemplazado: Detalle de ítems por secciones */}
                          {/* Sección de comidas */}
                          {(canViewBothSections(user?.role) || canViewOnlyFood(user?.role)) && (
                            <>
                              <h4 className="font-semibold mb-1">Comidas</h4>
                              {comidas.length > 0 ? (
                                <ul className="mb-2">
                                  {comidas.map(item => (
                                    <li key={item.id}>{item.name} x{item.quantity}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground mb-2">Sin comidas</p>
                              )}
                            </>
                          )}
                          {/* Sección de bebidas */}
                          {(canViewBothSections(user?.role) || canViewOnlyDrinks(user?.role)) && (
                            <>
                              <h4 className="font-semibold mb-1">Bebidas</h4>
                              {bebidas.length > 0 ? (
                                <ul>
                                  {bebidas.map(item => (
                                    <li key={item.id}>{item.name} x{item.quantity}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground">Sin bebidas</p>
                              )}
                            </>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("commons.table.headers.price")}</p>
                          <p>R$ {order.total.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)} title="Ver pedido">
                              <Eye className="h-5 w-5" />
                            </Button>
                            {canCreate('orders') && (
                              <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedOrder(order);
                                setIsAddItemsDialogOpen(true);
                              }} title="Agregar ítems">
                                <PlusSquare className="h-5 w-5" />
                              </Button>
                            )}
                            {canUpdate('orders') && (
                              <Button variant="ghost" size="icon" onClick={() => openStatusDialog(order)} title="Cambiar status">
                                <Repeat className="h-5 w-5" />
                              </Button>
                            )}
                            {canDelete('orders') && (
                              <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedOrder(order);
                                setIsDeleteDialogOpen(true);
                              }} title="Eliminar">
                                <Trash className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

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
          <DialogContent aria-describedby={statusDescriptionId}>
            <DialogHeader>
              <DialogTitle>{t("orders.changeStatusTitle")}</DialogTitle>
              <DialogDescription id={statusDescriptionId}>{t("orders.changeStatusDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as BaseOrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("orders.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'pending', 'preparing', 'ready', 'delivered', 'cancelled', 'closed', 'ordering', 'served', 'finished'
                  ].map(status => (
                    <SelectItem key={status} value={status}>
                      {translateStatus(status, i18n?.language as LanguageCode)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateStatus} className="w-full">
                {t("orders.changeStatusButton")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isAddItemsDialogOpen && selectedOrder && (
        <AddItemsDialog
          order={selectedOrder}
          open={isAddItemsDialogOpen}
          onClose={() => setIsAddItemsDialogOpen(false)}
          onItemsAdded={() => {
            setIsAddItemsDialogOpen(false);
            // Opcional: recargar la orden o mostrar un toast
          }}
        />
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <OrderDetailsDialog 
          order={selectedOrder}
          open={isOrderDetailsDialogOpen}
          onOpenChange={setIsOrderDetailsDialogOpen} onClose={function (): void {
            throw new Error("Function not implemented.");
          } }        />
      )}
    </div>
  )
}