"use client"

import { useState, useEffect, useMemo } from "react"
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
import { TFunction } from 'i18next';
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
import { AddItemsDialog } from "@/components/orders/add-items-dialog";
import { filterOrdersByRole } from '@/lib/orderFilters';
import { usePermissions } from '@/hooks/usePermissions';
import {
  splitOrderItemsByCategory,
  canViewBothSections,
  canViewOnlyFood,
  canViewOnlyDrinks,
} from '@/lib/orderFilters';

const ORDER_STATUS_KEYS: BaseOrderStatus[] = [
  "pending",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
  "closed",
  "ordering",
  "served",
  "finished",
  "null",
];

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
  const { t }: { t: TFunction } = useI18n()

  const translateStatus = (
    status: FlexibleOrderStatus | undefined | null | string
  ): string => {
    const validStatus =
      status && ORDER_STATUS_KEYS.includes(status.toString() as BaseOrderStatus)
        ? (status.toString() as BaseOrderStatus)
        : "null"
    return t(`orders.status.${validStatus}`)
  }

  const getOrderTypeLabel = (orderType?: string): string => {
    return orderType ? t(`orders.types.${orderType}`) : t("orders.types.unknown")
  }
  const { db } = useFirebase()
  const { user } = useAuth()
  const router = useRouter();
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

  const [categories, setCategories] = useState<{ id: string; type?: 'food' | 'drink' }[]>([]);

  useEffect(() => {
    if (!db || !user?.establishmentId) return;
    const fetchCategories = async () => {
      try {
        const inventoryRef = collection(db, "restaurants", user.establishmentId!, "inventory");
        const categoriesSnapshot = await getDocs(inventoryRef);
        const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: doc.data().type as 'food' | 'drink' | undefined,
        }));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories in orders page:", error);
      }
    };
    fetchCategories();
  }, [db, user?.establishmentId]);

  const categoryTypeMap = useMemo(() => {
    const map: Record<string, 'food' | 'drink'> = {
      drinks: 'drink',
      drink: 'drink',
      beverage: 'drink',
      beverages: 'drink',
      appetizers: 'food',
      appetizer: 'food',
      main_courses: 'food',
      main_course: 'food',
      desserts: 'food',
      dessert: 'food',
      salads: 'food',
      salad: 'food',
      sides: 'food',
      side: 'food',
    };
    categories.forEach(cat => {
      if (cat.type) {
        map[cat.id] = cat.type === 'drink' ? 'drink' : 'food';
      }
    });
    return map;
  }, [categories]);

  useEffect(() => {
    if (!db || !user) return;
    setLoading(true);

    // Verifica que el usuario tenga un establecimiento asignado
    if (!user.establishmentId) {
      console.error('No establishment ID found for user');
      toast.error(t("orders.error.establishmentIdNotFound"));
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'restaurants', user.establishmentId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders = querySnapshot.docs.map(doc => {
        const data = doc.data();

        // Normalización (puedes adaptar esto según tu helper)
        const normalizedItems = normalizeOrderItems(data.items);

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
          waiter: data.createdBy?.username || data.createdBy?.email || t("commons.unknown"),
          specialRequests: data.specialRequests || '',
          paymentInfo: {
            method: data.paymentInfo?.method || 'other',
            amount: data.paymentInfo?.amount || data.total || 0
          },
          debugContext: data.debugContext,
          createdBy: {
            uid: data.createdBy?.uid || data.uid,
            displayName: data.createdBy?.username || data.createdBy?.email || t("commons.unknown"),
            email: data.createdBy?.email || null,
            role: data.createdBy?.role || 'unknown'
          }
        };
      });

      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders in real-time:", error);
      toast.error(t("orders.errors.subscriptionFailed"));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, user]);


  const handleUpdateStatus = async () => {
    if (!db || !user || !selectedOrder || !selectedOrder.id) return

    // Validate establishmentId before proceeding
    if (!user.establishmentId) {
      console.error('No establishment ID found for user');
      toast.error(t("orders.error.establishmentIdNotFound"));
      return;
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
          status: translateStatus(validStatus)
        })
      )
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
      console.error('No establishment ID found for user');
      toast.error(t("orders.error.establishmentIdNotFound"));
      return;
    }

    try {
      await deleteDoc(doc(db, 'restaurants', user.establishmentId, 'orders', String(selectedOrder.id)))
      setOrders(orders => orders.filter(order => order.id !== selectedOrder.id))
      setIsDeleteDialogOpen(false)
      toast.success(t("orders.success.orderDeleted", { orderId: selectedOrder.id }))
    } catch (error) {
      toast.error(t("orders.error.deleteOrderFailed"))
      setIsDeleteDialogOpen(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!db || !user || !selectedOrder || !selectedOrder.id) return

    // Validate establishmentId before proceeding
    if (!user.establishmentId) {
      console.error('No establishment ID found for user');
      toast.error(t("orders.error.establishmentIdNotFound"));
      return;
    }

    try {
      const orderRef = doc(db, 'restaurants', user.establishmentId, 'orders', String(selectedOrder.id))
      await updateDoc(orderRef, { status: 'cancelled', updatedAt: new Date() })
      setOrders(orders => orders.map(order => order.id === selectedOrder.id ? { ...order, status: 'cancelled', updatedAt: new Date() } : order))
      setIsDeleteDialogOpen(false)
      toast.success(t("orders.success.orderCancelled", { orderId: selectedOrder.id }))
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

  // Normalizar items a un array
  const normalizeOrderItems = (items: Record<string, OrderItem> | OrderItem[] | undefined): OrderItem[] => {
    if (!items) return [];
    return Array.isArray(items) 
      ? items 
      : Object.values(items);
  };

  // Aplicar filtro de roles y luego filtro de búsqueda y status
  const filteredOrders = user?.role
    ? filterOrdersByRole({ orders, role: user.role }).filter(
        (order) => {
          // Normalizar items para búsqueda
          const normalizedItems = normalizeOrderItems(order.items);

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
            normalizedItems.some(item =>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-4 gap-2 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("orders.title")}</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("orders.newOrder")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 px-4">
        <div className="relative flex-1 w-full max-w-sm">
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
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("orders.filter.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("orders.filter.allStatuses")}</SelectItem>
            {ORDER_STATUS_KEYS.map((status) => (
              <SelectItem key={status} value={status}>
                {translateStatus(status)}
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
            <div className="grid gap-3 sm:gap-4 grid-cols-1">
              {filteredOrders.map((order) => {
                // Normalizar items para splitOrderItemsByCategory
                const normalizedItems = normalizeOrderItems(order.items);
                const { comidas, bebidas } = splitOrderItemsByCategory(normalizedItems, categoryTypeMap);
                
                return (
                  <Card key={order.id} className="w-full">
                    <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2 p-3 sm:p-6">
                      <Badge variant={getStatusBadgeVariant(order.status as BaseOrderStatus)}>
                        {translateStatus(order.status)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("commons.tableNumber")}</p>
                          <p className="text-sm sm:text-base">{order.tableNumber 
                            ? `${getOrderTypeLabel(order.orderType)} ${order.tableNumber}` 
                            : getOrderTypeLabel(order.orderType)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("orders.errors.headers.waiter")}</p>
                          <div>
                            <p className="text-sm sm:text-base font-semibold">
                              {((order.createdBy?.username || 
                               order.createdBy?.email?.split('@')[0] || 
                               t("orders.genericUser")).charAt(0).toUpperCase() + 
                               (order.createdBy?.username || 
                               order.createdBy?.email?.split('@')[0] || 
                               t("orders.genericUser")).slice(1))}
                            </p>
                            {order.createdBy?.role && (
                              <p className="text-xs text-muted-foreground">
                                ({t(`roles.${order.createdBy.role.toLowerCase()}`)})
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2">
                          {/* Reemplazado: Detalle de ítems por secciones */}
                          {(canViewBothSections(user?.role) || canViewOnlyFood(user?.role)) && (
                            <>
                              <h4 className="font-semibold mb-1 text-sm sm:text-base">{t("orders.types.food")}</h4>
                              <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
                                {comidas.map((item) => (
                                  <span key={item.id} className="text-xs sm:text-sm bg-muted rounded-md px-2 py-1">
                                    {item.name} x{item.quantity}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                          
                          {(canViewBothSections(user?.role) || canViewOnlyDrinks(user?.role)) && (
                            <>
                              <h4 className="font-semibold mb-1 mt-2 text-sm sm:text-base">{t("orders.types.drinks")}</h4>
                              <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
                                {bebidas.map((item) => (
                                  <span key={item.id} className="text-xs sm:text-sm bg-muted rounded-md px-2 py-1">
                                    {item.name} x{item.quantity}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("commons.table.headers.price")}</p>
                          <p className="text-sm sm:text-base">R$ {order.total.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)} title={t("orders.actions.viewOrder")}>
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            {canCreate('orders') && (
                              <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedOrder(order);
                                setIsAddItemsDialogOpen(true);
                              }} title={t("orders.actions.addItems")}>
                                <PlusSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                              </Button>
                            )}
                            {canUpdate('orders') && (
                              <Button variant="ghost" size="icon" onClick={() => openStatusDialog(order)} title={t("orders.actions.changeStatus")}>
                                <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
                              </Button>
                            )}
                            {canDelete('orders') && (
                              <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedOrder(order);
                                setIsDeleteDialogOpen(true);
                              }} title={t("orders.actions.delete")}>
                                <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
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
                  {ORDER_STATUS_KEYS.filter((s) => s !== "null").map((status) => (
                    <SelectItem key={status} value={status}>
                      {translateStatus(status)}
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