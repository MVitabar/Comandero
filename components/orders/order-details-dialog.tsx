// components/orders/order-details-dialog.tsx
import React, { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Order, OrderDetailsDialogProps, OrderItem, OrderItemStatus } from '@/types'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/i18n-provider'
import { splitOrderItemsByCategory, canViewBothSections, canViewOnlyFood, canViewOnlyDrinks, getOrderStatusFromItems, calculateOrderStatusFromItems } from '@/lib/orderFilters';
import { useAuth } from '@/components/auth-provider';
import { doc, updateDoc, onSnapshot, deleteField, collection, getDocs } from 'firebase/firestore';
import { useFirebase } from '@/components/firebase-provider';
import { toast } from 'sonner';

export function OrderDetailsDialog({ 
  order, 
  open, 
  onOpenChange 
}: OrderDetailsDialogProps) {
  const router = useRouter();
  const { t, i18n } = useI18n();
  const { user } = useAuth();
  const { db } = useFirebase();

  // Estado local para la orden en vivo
  const [liveOrder, setLiveOrder] = useState(order);

  const [categories, setCategories] = useState<{ id: string; type?: 'food' | 'drink' }[]>([]);

  useEffect(() => {
    if (!db || !order.restaurantId || !open) return;
    const fetchCategories = async () => {
      try {
        const inventoryRef = collection(db, "restaurants", order.restaurantId, "inventory");
        const categoriesSnapshot = await getDocs(inventoryRef);
        const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: doc.data().type as 'food' | 'drink' | undefined,
        }));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories in dialog:", error);
      }
    };
    fetchCategories();
  }, [db, order.restaurantId, open]);

  const categoryTypeMap = React.useMemo(() => {
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

  // Suscripción en tiempo real al documento de la orden
  useEffect(() => {
    if (!db || !order.id || !order.restaurantId || !open) return;

    const orderRef = doc(db, `restaurants/${order.restaurantId}/orders/${order.id}`);
    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists()) {
        setLiveOrder({ ...order, ...docSnap.data() });
      }
    });

    return () => unsubscribe();
  }, [db, order.id, order.restaurantId, open]);

  // Helpers para el status de ítem
  function getNextStatus(current: OrderItemStatus = 'pending'): OrderItemStatus {
    if (current === 'pending') return 'preparing';
    if (current === 'preparing') return 'ready';
    if (current === 'ready') return 'delivered';
    return 'delivered';
  }

  function getStatusButtonLabel(current: OrderItemStatus = 'pending') {
    if (current === 'pending') return t('orders.markAsPreparing');
    if (current === 'preparing') return t('orders.markAsReady');
    if (current === 'ready') return t('orders.markAsDelivered');
    return t('orders.delivered');
  }

  function getAvailableStatusActions(current: OrderItemStatus = 'pending') {
    // Solo permitir avanzar a "finished" desde cualquier estado menos "finished"
    const actions = [];
    if (current !== 'finished') {
      actions.push({ status: 'finished', label: t('orders.markAsFinished') });
    }
    return actions;
  }

  const handleUpdateItemStatus = async (item: OrderItem, newStatus: string) => {
    // Normaliza items a array y tipa correctamente
    const itemsArray: OrderItem[] = liveOrder.items 
      ? (Array.isArray(liveOrder.items) 
          ? liveOrder.items 
          : Object.keys(liveOrder.items).map(key => 
              (liveOrder.items as Record<string, OrderItem>)[key]
            )
        )
      : [];

    // Deduplicate items by itemId (merge quantities)
    const deduplicatedItems = itemsArray.reduce((acc: OrderItem[], item) => {
      const existingIndex = acc.findIndex(existing => 
        existing.itemId === item.itemId || existing.id === item.itemId
      );
      if (existingIndex >= 0) {
        // Merge quantities
        acc[existingIndex] = {
          ...acc[existingIndex],
          quantity: (Number(acc[existingIndex].quantity) || 0) + (Number(item.quantity) || 0)
        };
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

    // Aplica el cambio de status
    const updatedItems = deduplicatedItems.map(i =>
      i.id === item.id ? { ...i, status: newStatus as OrderItemStatus } : i
    );

    // Utiliza el helper para calcular el status global
    let newOrderStatus = calculateOrderStatusFromItems(updatedItems, liveOrder.status);

    // Referencia al documento de la orden (asegura que liveOrder.id esté presente y válido)
    if (!liveOrder.id || !liveOrder.restaurantId) {
      console.error("No se puede actualizar: faltan datos de la orden (id o restaurantId)");
      return;
    }
    const orderRef = doc(
      db,
      "restaurants",
      liveOrder.restaurantId,
      "orders",
      liveOrder.id
    );

    // Solución: Borra primero el campo items, luego actualiza como array
    try {
      await updateDoc(orderRef, { items: deleteField() });
      await updateDoc(orderRef, { items: updatedItems, status: newOrderStatus });
    } catch (error) {
      console.error("Error al actualizar en Firestore:", error);
    }
  };

  // Convierte los ítems a array de forma segura antes de dividir por categoría
  const itemsArray = liveOrder.items 
    ? (Array.isArray(liveOrder.items) 
        ? liveOrder.items 
        : Object.keys(liveOrder.items).map(key => 
            (liveOrder.items as Record<string, OrderItem>)[key]
          )
      )
    : [];
  
  // Deduplicate items by itemId (merge quantities)
  const deduplicatedItems = itemsArray.reduce((acc: OrderItem[], item) => {
    const existingIndex = acc.findIndex(existing => 
      existing.itemId === item.itemId || existing.id === item.itemId
    );
    if (existingIndex >= 0) {
      // Merge quantities
      acc[existingIndex] = {
        ...acc[existingIndex],
        quantity: (Number(acc[existingIndex].quantity) || 0) + (Number(item.quantity) || 0)
      };
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
  
  const { comidas, bebidas } = splitOrderItemsByCategory(deduplicatedItems, categoryTypeMap);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby="order-details-description">
        <DialogHeader>
          <DialogTitle>{t("orders.details.title")}</DialogTitle>
          <DialogDescription id="order-details-description">
            {t("orders.details.description")}
          </DialogDescription>
        </DialogHeader>

        {/* Restricción: Solo roles que NO sean chef ni barman pueden ver acciones globales */}
        {!['chef', 'barman'].includes(user?.role ?? '') && (
          <div className="flex gap-2 mb-4">
            {/* Ejemplo: Botón para cambiar status global (si existe) */}
            {/* <Button onClick={handleGlobalStatusUpdate}>
              {t("orders.changeGlobalStatus")}
            </Button> */}
            {/* Ejemplo: Botón para borrar orden (si existe) */}
            {/* <Button onClick={handleDeleteOrder} variant="destructive">
              {t("orders.deleteOrder")}
            </Button> */}
            {/* Puedes descomentar y adaptar según tus handlers reales */}
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">{t("orders.details.tableNumber")}:</span>
            <span className="col-span-3">{liveOrder.tableNumber || t("commons.notAvailable")}</span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">{t("orders.details.status")}:</span>
            <span className="col-span-3">{liveOrder.status}</span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">{t("orders.details.total")}:</span>
            <span className="col-span-3">
              ${new Intl.NumberFormat(i18n.language).format(liveOrder.total)}
            </span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">{t("orders.details.items")}:</span>
            <div className="col-span-3">
              {(canViewBothSections(user?.role) || canViewOnlyFood(user?.role)) && (
                <>
                  <h4 className="font-semibold mb-1">{t("orders.types.food")}</h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    {comidas.map((item, idx) => (
                      <span key={`${item.itemId || item.id}-${idx}`} className="text-sm bg-muted rounded-md px-2 py-1">
                        {item.name} x{item.quantity}
                        {item.customDietaryRestrictions && item.customDietaryRestrictions.length > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({item.customDietaryRestrictions.map((restriction, index) => (
                              <React.Fragment key={`${item.itemId || item.id}-${idx}-restriction-${index}`}>
                                {index > 0 && ', '}
                                {t(restriction)}
                              </React.Fragment>
                            ))})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {(canViewBothSections(user?.role) || canViewOnlyDrinks(user?.role)) && (
                <>
                  <h4 className="font-semibold mb-1 mt-2">{t("orders.types.drinks")}</h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    {bebidas.map((item, idx) => (
                      <span key={`${item.itemId || item.id}-${idx}`} className="text-sm bg-muted rounded-md px-2 py-1">
                        {item.name} x{item.quantity}
                        {item.customDietaryRestrictions && item.customDietaryRestrictions.length > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({item.customDietaryRestrictions.map((restriction, index) => (
                              <React.Fragment key={`${item.itemId || item.id}-${idx}-restriction-${index}`}>
                                {index > 0 && ', '}
                                {t(restriction)}
                              </React.Fragment>
                            ))})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange?.(false)}
          >
            {t("commons.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}