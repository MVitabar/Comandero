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
import { UserRole } from "@/types/permissions";

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
  // Estado para filtrar status, incluyendo 'all'
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');

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
        debugContext: data.debugContext,
        createdBy: {
          uid: data.createdBy?.uid || user.uid,
          displayName: data.createdBy?.displayName || user.displayName || 'Unknown',
          email: data.createdBy?.email || user.email || null,
          role: data.createdBy?.role || user.role || 'unknown'
        }
      };

      return normalizedOrder;
    } catch (error) {
      console.error("Error fetching specific order:", error);
      toast({
        title: t("commons.error"),
        description: t("orders.error.fetchFailed"),
        variant: "destructive",
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
      const orderRef = doc(db, 'restaurants', user.establishmentId, 'orders', String(selectedOrder.id))
      
      // Ignorar 'all' y usar un status válido de BaseOrderStatus
      const validStatus = selectedStatus === 'all' 
        ? 'pending' // O cualquier otro status por defecto
        : selectedStatus as BaseOrderStatus;

      await updateDoc(orderRef, {
        status: validStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id 
            ? { ...order, status: validStatus, updatedAt: new Date() } 
            : order
        )
      )

      // Close the status dialog
      setIsStatusDialogOpen(false)

      // Show success toast
      toast({
        title: t("commons.success"),
        description: t("orders.statusUpdated")
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

  // Función para filtrar órdenes basada en el rol del usuario
  const filterOrdersByUserRole = (orders: Order[], user: any): Order[] => {
    if (!user || !user.role) return orders;

    switch (user.role) {
      case UserRole.CHEF:
        // Mostrar solo pedidos con ítems de cocina
        return orders.filter(order => 
          order.items.some(item => 
            KITCHEN_CATEGORIES.includes(item.category?.toLowerCase())
          )
        );
      case UserRole.BARMAN:
        // Mostrar pedidos que contengan al menos un ítem de bebidas
        return orders.filter(order => 
          order.items.some(item => 
            BAR_CATEGORIES.includes(item.category?.toLowerCase())
          )
        );
      case UserRole.OWNER:
      case UserRole.ADMIN:
      case UserRole.MANAGER:
        // Administradores ven todas las órdenes
        return orders;
      default:
        // Rol desconocido: no mostrar órdenes
        return [];
    }
  };

  // Definir un tipo que incluya 'all' junto con BaseOrderStatus
  type FilterStatus = BaseOrderStatus | 'all';

  // Aplicar filtro de roles y luego filtro de búsqueda y status
  const filteredOrders = filterOrdersByUserRole(orders, user).filter(
    (order) => {
      // Verificar si coincide con el status seleccionado
      const statusMatch = 
        selectedStatus === 'all' || 
        order.status === selectedStatus;

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
  );

  console.log("Filtered Orders Debug:", {
    totalOrders: orders.length,
    filteredOrdersCount: filteredOrders.length,
    selectedStatus,
    searchQuery,
    allStatuses: [...new Set(orders.map(order => order.status))],
    filteredOrderStatuses: [...new Set(filteredOrders.map(order => order.status))]
  });

  // Modificar handleStatusChange para usar el nuevo tipo
  const handleStatusChange = (status: FilterStatus) => {
    if (!selectedOrder) return;
    setSelectedStatus(status);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailsDialogOpen(true)
  }

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
            {/* Vista de tabla para escritorio */}
            <Table className="hidden md:table w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t("orders.errors.headers.id")}</TableHead>
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
                    <TableCell>
                      {order.createdBy?.displayName || order.createdBy?.email || t("orders.unknownUser")}
                      {order.createdBy?.role && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({t(`roles.${order.createdBy.role.toLowerCase()}`)})</span>
                      )}
                    </TableCell>
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

            {/* Vista de tarjetas para móviles */}
            <div className="grid gap-4 md:hidden">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("orders.errors.headers.id")}: {order.id}</CardTitle>
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
                        <p className="text-xs text-muted-foreground">{t("orders.errors.headers.items")}</p>
                        <p>{(() => {
                          const orderItems = Array.isArray(order.items) 
                            ? order.items 
                            : (order.items ? Object.values(order.items).map(item => item as OrderItem) : [])
                          
                          return orderItems.length > 0 
                            ? orderItems.map(item => item.name).join(", ") 
                            : t("orders.noItemsInOrder")
                        })()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("commons.table.headers.price")}</p>
                        <p>R$ {order.total.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              {t("orders.errors.headers.actions")}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
