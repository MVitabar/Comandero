"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next' 
import { TableMap } from './table-maps-list'
import { useFirebase } from '@/components/firebase-provider'
import { doc, getDoc, collection, addDoc, setDoc, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore'
import { TableCard } from '@/components/table-card'
import { Order, OrderItem } from '@/types'
import { useAuth } from '@/components/auth-provider'
import {toast} from 'sonner'
import { OrderForm } from '@/components/orders/order-form'
import { v4 as uuidv4 } from 'uuid'

interface RestaurantTable {
  id?: string
  name: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  mapId: string
  restaurantId?: string
}

interface TableMapViewDialogProps {
  isOpen: boolean
  onClose: () => void
  tableMap: TableMap
}

export default function TableMapViewDialog({ 
  isOpen, 
  onClose, 
  tableMap 
}: TableMapViewDialogProps) {
  const { t } = useTranslation()
  const { db } = useFirebase()
  const { user } = useAuth()
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    async function fetchTables() {
      if (!db || !user || !isOpen) {
        setIsLoading(false)
        return
      }

      try {
        const restaurantId = user.establishmentId || user.uid
        
        // Fetch the entire table map document
        const tableMapRef = doc(db, `restaurants/${restaurantId}/tableMaps`, tableMap.id)
        const tableMapSnapshot = await getDoc(tableMapRef)
        
        if (!tableMapSnapshot.exists()) {
          setTables([])
          setIsLoading(false)
          return
        }

        const tableMapData = tableMapSnapshot.data()
        const tablesInMap = tableMapData?.layout?.tables || []

        // Ensure each table has a unique identifier and always attach mapId
        const processedTables = tablesInMap.map((table: any) => ({
          ...table,
          id: table.id || uuidv4(),
          status: table.status || 'available',
          mapId: table.mapId ?? tableMap.id
        }))

        setTables(processedTables)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching tables:', error)
        setTables([])
        setIsLoading(false)
        
        toast.error(t('tables.tableMaps.fetchError'), {
          description: error instanceof Error ? error.message : undefined
        })
      }
    }

    if (isOpen) {
      fetchTables()
    }
  }, [db, user, isOpen, tableMap.id, t])

  useEffect(() => {
    if (!db || !user || !isOpen) return;

    const restaurantId = user.establishmentId || user.uid;
    const ordersRef = collection(db, `restaurants/${restaurantId}/orders`);
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, [db, user, isOpen]);

  const handleCreateOrder = async (table: RestaurantTable) => {
    setSelectedTable(table)
    setIsOrderFormOpen(true)
  }

  const handleOrderCreation = async (order: Order) => {
    try {
      // Validate input parameters
      if (!order) {
        throw new Error('Cannot create order: Order data is missing')
      }

      // Validate critical order properties
      const requiredFields = ['items', 'restaurantId', 'tableId', 'orderType'] as const;
      const missingFields = requiredFields.filter(field => {
        switch (field) {
          case 'items':
            return !order.items || order.items.length === 0;
          case 'restaurantId':
            return !order.restaurantId;
          case 'tableId':
            return !order.tableId;
          case 'orderType':
            return !order.orderType;
          default:
            return false;
        }
      });

      if (missingFields.length > 0) {
        throw new Error(`Cannot create order: Missing fields - ${missingFields.join(', ')}`)
      }

      // Ensure we have a valid restaurant ID
      const restaurantId = user?.establishmentId || order.restaurantId
      if (!restaurantId) {
        throw new Error('Cannot create order: No restaurant ID')
      }

      // Prepare Firestore references
      const ordersRef = collection(db, 'restaurants', restaurantId, 'orders')
      
      // Remove undefined values from the order
      const cleanOrderData = (obj: any): any => {
        if (obj === null || obj === undefined) return undefined;
        
        if (Array.isArray(obj)) {
          return obj
            .map(cleanOrderData)
            .filter(item => item !== undefined);
        }
        
        if (typeof obj === 'object') {
          const cleanedObj: any = {};
          Object.entries(obj).forEach(([key, value]) => {
            const cleanedValue = cleanOrderData(value);
            if (cleanedValue !== undefined) {
              cleanedObj[key] = cleanedValue;
            }
          });
          
          return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined;
        }
        
        return obj;
      }

      // Sanitize and validate order data
      const itemsToProcess = order.items
        ? Array.isArray(order.items)
          ? order.items
          : Object.values(order.items)
        : [];

      const sanitizedOrderData: Order = {
        ...order,
        uid: user?.uid || order.uid || '',
        restaurantId: order.restaurantId || user?.establishmentId || user?.uid || selectedTable?.restaurantId || '',
        status: order.status || 'pending',
        
        // Normalize items to match OrderItem interface
        items: itemsToProcess.map((item: OrderItem) => {
          // Convert itemId to string, fallback to empty string
          const itemId = item.itemId
            ? String(item.itemId)
            : '';

          return {
            id: item.id || itemId || '',
            itemId: itemId,
            name: item.name,
            category: item.category || '',
            quantity: item.quantity,
            price: item.price,
            stock: item.stock || 0,
            unit: item.unit || 'pcs',
            notes: item.notes || '',
            description: item.description || '',
            customDietaryRestrictions: item.customDietaryRestrictions || [],
            isVegetarian: item.isVegetarian ?? false,
            isVegan: item.isVegan ?? false,
            isGlutenFree: item.isGlutenFree ?? false,
            isLactoseFree: item.isLactoseFree ?? false
          };
        }),
        
        // Validate total and payment info
        total: order.total || order.subtotal || 0,
        subtotal: order.subtotal || order.total || 0,
        discount: order.discount || 0,
        paymentInfo: {
          method: order.paymentInfo?.method || 'other',
          amount: order.total || order.subtotal || 0
        },

        // Ensure table-related information is preserved
        tableId: order.tableId || selectedTable?.id || '',
        tableNumber: (() => {
          // Type guard for string
          const extractNumberFromString = (input: string | null | undefined): number => {
            if (!input) return 0;
            
            const numberMatch = input.match(/\d+/);
            return numberMatch ? parseInt(numberMatch[0], 10) : 0;
          };
          
          // If order.tableNumber is already a number, use it
          if (typeof order.tableNumber === 'number' && !isNaN(order.tableNumber)) {
            return order.tableNumber;
          }
          
          // If order.tableNumber is a string, try to extract number
          if (typeof order.tableNumber === 'string') {
            return extractNumberFromString(order.tableNumber);
          }
          
          // If selectedTable.name is a string, try to extract number
          if (typeof selectedTable?.name === 'string') {
            return extractNumberFromString(selectedTable.name);
          }
          
          // Fallback to 0 if no number can be extracted
          return 0;
        })(),
        mapId: order.mapId || selectedTable?.mapId || '',
        waiter: order.waiter || user?.email || '',
        orderType: order.orderType || 'table',
        type: order.type || 'table',
        specialRequests: order.specialRequests || '',

        // Preserve debug context
        debugContext: {
          userInfo: {
            uid: user?.uid || order.uid || '',
            displayName: user?.displayName,
            email: user?.email,
            establishmentId: restaurantId
          },
          orderContext: {
            orderType: order.orderType || 'table',
            tableNumber: `Mesa ${selectedTable?.name || 1}`,
            tableId: order.tableId || selectedTable?.id || '',
            mapId: order.mapId || selectedTable?.mapId || '',
          },
          timestamp: new Date()
        }
      }

      // Asegura que cada item tenga su propio status (por defecto 'pending')
      if (Array.isArray(sanitizedOrderData.items)) {
        sanitizedOrderData.items = sanitizedOrderData.items.map((item: OrderItem) => ({
          ...item,
          status: item.status || 'pending'
        }));
      }

      // Clean the order data
      const cleanedOrderData = cleanOrderData(sanitizedOrderData);

      // Convierte el array de items a un objeto/mapa solo para guardar en Firestore
      const cleanedOrderDataForFirestore = {
        ...cleanedOrderData,
        items: Array.isArray(cleanedOrderData.items)
          ? Object.fromEntries(
              (cleanedOrderData.items as OrderItem[]).map((item: OrderItem, idx: number) => [idx, item])
            )
          : cleanedOrderData.items,
        createdAt: serverTimestamp(), // <-- Asegura el timestamp de Firestore
      };

      // Save order to Firestore
      const docRef = await addDoc(ordersRef, cleanedOrderDataForFirestore);
      // Actualiza el campo id con el id real del documento
      await updateDoc(docRef, { id: docRef.id });

      // Update table status
      if (selectedTable) {
        const tableRef = doc(db, 'restaurants', restaurantId, 'tables', selectedTable.id || '')
        await setDoc(tableRef, {
          status: 'occupied',
          activeOrderId: docRef.id
        }, { merge: true })  // Use merge to avoid overwriting existing data
      }

      toast.success(t('orders.orderCreated'), {
        description: t('orders.orderCreatedDescription', { orderId: docRef.id })
      })

      // Close order form
      handleCloseOrderForm()

      return docRef.id
    } catch (error) {
      console.error('❌ Order Creation Error:', error)
      
      toast.error(t('orders.orderCreationError'), {
        description: error instanceof Error ? error.message : undefined
      })

      throw error
    }
  }

  const handleCloseOrderForm = () => {
    setSelectedTable(null)
    setIsOrderFormOpen(false)
  }

  // Accesibilidad: ids únicos para descripciones de los diálogos
  const mainDescriptionId = `table-map-desc-${tableMap.id}`;
  const orderFormDescriptionId = selectedTable ? `order-form-desc-${selectedTable.id}` : 'order-form-desc';

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto" aria-describedby={mainDescriptionId}>
          <DialogHeader>
            <DialogTitle className="sr-only">{t('tables.tableMaps.loadingTitle')}</DialogTitle>
          </DialogHeader>
          <div>{t('commons.loading')}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto" aria-describedby={mainDescriptionId}>
          <DialogHeader>
            <DialogTitle>{tableMap.name}</DialogTitle>
            <DialogDescription id={mainDescriptionId}>{tableMap.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.length === 0 ? (
              <div>{t('tables.tableMaps.noTablesFound')}</div>
            ) : (
              tables
                .sort((a, b) => {
                  // Extract number from table name (assumes format "Mesa {number}")
                  const aNumber = parseInt(a.name.replace(/\D/g, ''), 10)
                  const bNumber = parseInt(b.name.replace(/\D/g, ''), 10)
                  return aNumber - bNumber
                })
                .map(table => {
                  // Encuentra la orden activa asociada a la mesa
                  const activeOrder = orders.find(order =>
                    order.tableId === table.id &&
                    order.status !== 'closed' &&
                    order.status !== 'cancelled' &&
                    order.status !== 'finished'
                  );
                  return (
                    <TableCard
                      key={table.id}
                      table={{
                        uid: table.id || '',
                        number: parseInt(table.name.replace(/\D/g, ''), 10),
                        seats: table.capacity,
                        shape: 'square', // Ajusta si tienes info real
                        width: 100,
                        height: 100,
                        x: 0,
                        y: 0,
                        status: activeOrder ? 'occupied' : 'available',
                        mapId: table.mapId,
                        name: table.name,
                        restaurantId: table.restaurantId,
                      }}
                      hasActiveOrder={!!activeOrder}
                      orderStatus={activeOrder?.status || ''}
                      activeOrder={activeOrder}
                      onViewOrder={activeOrder ? () => {/* Aquí puedes abrir el detalle de la orden */} : undefined}
                      onCreateOrder={() => handleCreateOrder(table)}
                    />
                  );
                })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isOrderFormOpen && selectedTable && (
        <Dialog open={isOrderFormOpen} onOpenChange={handleCloseOrderForm}>
          <DialogContent className="max-w-4xl" aria-describedby={orderFormDescriptionId}>
            <DialogHeader>
              <DialogTitle>{t('orders.createOrder')} - {selectedTable.name}</DialogTitle>
              <DialogDescription id={orderFormDescriptionId} className="sr-only">
                {t('orders.createOrder')} {t('commons.for')} {selectedTable.name}
              </DialogDescription>
            </DialogHeader>
            <OrderForm 
              initialTableNumber={selectedTable.name}
              onOrderCreated={(order) => handleOrderCreation(order)}
              table={selectedTable}
              aria-labelledby="order-form-title"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}