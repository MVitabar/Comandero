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
import { doc, updateDoc, onSnapshot, deleteField } from 'firebase/firestore';
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
    // DEPURACIÓN INICIO
    console.log("=== DEPURACIÓN handleUpdateItemStatus ===");
    console.log("Items ANTES de actualizar:", liveOrder.items);
    console.log("Item a actualizar:", item);
    console.log("Nuevo status:", newStatus);

    // Normaliza items a array y tipa correctamente
    const itemsArray: OrderItem[] = Array.isArray(liveOrder.items)
      ? liveOrder.items
      : (liveOrder.items ? Object.values(liveOrder.items) as OrderItem[] : []);

    // Aplica el cambio de status
    const updatedItems = itemsArray.map(i =>
      i.id === item.id ? { ...i, status: newStatus as OrderItemStatus } : i
    );

    // Utiliza el helper para calcular el status global
    let newOrderStatus = calculateOrderStatusFromItems(updatedItems, liveOrder.status);

    console.log("Items DESPUÉS de actualizar:", updatedItems);
    console.log("Nuevo status global de la orden:", newOrderStatus);

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
      console.log("Actualización en Firestore EXITOSA (como array + status)");
    } catch (error) {
      console.error("Error al actualizar en Firestore:", error);
    }
  };
  // DEPURACIÓN FIN

  const { comidas, bebidas } = splitOrderItemsByCategory(liveOrder.items || []);

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
              {new Intl.NumberFormat(i18n.language, { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(liveOrder.total)}
            </span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">{t("orders.details.items")}:</span>
            <div className="col-span-3">
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