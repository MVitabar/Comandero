import { Order, OrderItem } from '@/types/index';
import { UserRole } from '@/types/permissions';
import { isFoodCategory, isDrinkCategory } from '@/types/index';
import { OrderItemStatus } from '@/types/index';

// Filtra órdenes según el rol del usuario
type FilterOrdersByRoleArgs = {
  orders: Order[];
  role: UserRole;
};

export function filterOrdersByRole({ orders, role }: FilterOrdersByRoleArgs): Order[] {
  if (role === 'chef' || role === 'barman') {
    // Solo órdenes pendientes para chef y barman (no ready, no finished, no delivered)
    return orders.filter(order => order.status === 'pending');
  }
  // Otros roles ven todas las órdenes
  return orders;
}

// Separa los ítems de una orden en comidas y bebidas
export function splitOrderItemsByCategory(items: OrderItem[]) {
  const comidas = items.filter(item => isFoodCategory(item.category));
  const bebidas = items.filter(item => isDrinkCategory(item.category));
  return { comidas, bebidas };
}

// Helper para saber si el rol puede ver ambas secciones
export function canViewBothSections(role?: UserRole): boolean {
  if (role === undefined) return false;
  return (
    role === 'owner' ||
    role === 'manager' ||
    role === 'admin' ||
    role === 'waiter'
  );
}

// Helper para saber si el rol solo ve comidas
export function canViewOnlyFood(role?: UserRole): boolean {
  if (role === undefined) return false;
  return role === 'chef';
}

// Helper para saber si el rol solo ve bebidas
export function canViewOnlyDrinks(role?: UserRole): boolean {
  if (role === undefined) return false;
  return role === 'barman';
}

// --- Nuevo helper: actualizar status global de la orden según status de ítems ---
/**
 * Calcula el status global de la orden según el status de todos los ítems.
 * - Si todos los ítems están 'ready' o 'delivered', la orden pasa a ese estado.
 * - Si al menos uno está 'preparing', la orden queda 'preparing'.
 * - Si al menos uno está 'pending', la orden queda 'pending'.
 */
export function getOrderStatusFromItems(items: OrderItem[]): OrderItemStatus {
  if (items.every(item => item.status === 'ready' || item.status === 'delivered')) {
    // Si todos están listos o entregados, la orden está lista o entregada
    return items.every(item => item.status === 'delivered') ? 'delivered' : 'ready';
  }
  if (items.some(item => item.status === 'preparing')) {
    return 'preparing';
  }
  // Si hay al menos uno pendiente
  return 'pending';
}

// Calcula el status global de la orden basado en los ítems
export function calculateOrderStatusFromItems(items: OrderItem[], currentStatus: string): string {
  if (items.length === 0) return currentStatus;

  // Si todos los ítems están 'finished', la orden pasa a 'ready'
  if (items.every(i => i.status === 'finished' as OrderItemStatus)) {
    return 'ready';
  }

  // Si hay algún ítem pendiente o en preparación, la orden está pendiente
  if (items.some(i => i.status === 'pending' || i.status === 'preparing')) {
    return 'pending';
  }

  // Si tienes otros estados globales, agrégalos aquí según tu flujo
  return currentStatus; // fallback: mantiene el status anterior si no hay coincidencia
}