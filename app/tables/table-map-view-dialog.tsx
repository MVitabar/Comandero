"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/components/i18n-provider'
import { TableMap } from './table-maps-list'
import { useFirebase } from '@/components/firebase-provider'
import { doc, getDoc, collection, addDoc, setDoc, serverTimestamp, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore'
import { TableCard } from '@/components/table-card'
import { Order, OrderItem } from '@/types'
import { useAuth } from '@/components/auth-provider'
import {toast} from 'sonner'
import { OrderForm } from '@/components/orders/order-form'
import { v4 as uuidv4 } from 'uuid'
import { hasActiveCashRegister } from '@/lib/cashRegisterHelpers'

interface RestaurantTable {
  id?: string
  name: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  mapId: string
  restaurantId?: string
  x?: number
  y?: number
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
  const { t } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false)
  const [bulkTableCount, setBulkTableCount] = useState(20)
  const [bulkTableCapacity, setBulkTableCapacity] = useState(2)
  const [bulkTablePrefix, setBulkTablePrefix] = useState('')
  const [isBulkCreating, setIsBulkCreating] = useState(false)

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
        
        let description = undefined
        if (error && typeof error === 'object' && 'message' in error) {
          description = String((error as { message: unknown }).message)
        }
        
        toast.error(t('tables.tableMaps.fetchError'), {
          description
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
    if (!db || !user) {
      toast.error("Database or user not found")
      return
    }

    // Check if there's an active cash register
    const hasActiveRegister = await hasActiveCashRegister(db, user.establishmentId || user.uid)
    if (!hasActiveRegister) {
      toast.error(t("orders.errors.noActiveCashRegister"))
      return
    }

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
            tableNumber: t("tables.defaultTableName", { number: selectedTable?.name ?? 1 }),
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
      
      let description = undefined
      if (error && typeof error === 'object' && 'message' in error) {
        description = String((error as { message: unknown }).message)
      }
      
      toast.error(t('orders.orderCreationError'), {
        description
      })

      throw error
    }
  }

  const handleCloseOrderForm = () => {
    setSelectedTable(null)
    setIsOrderFormOpen(false)
  }

  const handleBulkCreateTables = async () => {
    if (!db || !user) return

    try {
      setIsBulkCreating(true)
      const restaurantId = user.establishmentId || user.uid
      const tableMapRef = doc(db, `restaurants/${restaurantId}/tableMaps`, tableMap.id)
      
      // Fetch the current table map to get the latest layout
      const tableMapSnapshot = await getDoc(tableMapRef)
      
      if (!tableMapSnapshot.exists()) {
        toast.error("Table map not found")
        return
      }

      const tableMapData = tableMapSnapshot.data()
      const existingTables = tableMapData?.layout?.tables || []
      const currentTableCount = existingTables.length

      // Generate new tables
      const newTables: RestaurantTable[] = []
      for (let i = 0; i < bulkTableCount; i++) {
        const tableNumber = currentTableCount + i + 1
        const tableName = bulkTablePrefix 
          ? `${bulkTablePrefix}-Mesa ${tableNumber}`
          : `Mesa ${tableNumber}`
        
        const newTable: RestaurantTable = {
          id: uuidv4(),
          name: tableName,
          capacity: bulkTableCapacity,
          status: 'available',
          mapId: tableMap.id,
          x: 0,
          y: 0,
          restaurantId: restaurantId
        }
        newTables.push(newTable)
      }

      // Update the table map's layout to include the new tables
      await updateDoc(tableMapRef, {
        'layout.tables': [...existingTables, ...newTables],
        updatedAt: new Date()
      })

      toast.success(t('tableMaps.bulkCreateSuccess', { count: bulkTableCount }))

      // Close dialog and reset form
      setIsBulkCreateDialogOpen(false)
      setBulkTableCount(20)
      setBulkTableCapacity(2)
      setBulkTablePrefix('')
      
      // Refresh tables
      const updatedSnapshot = await getDoc(tableMapRef)
      const updatedData = updatedSnapshot.data()
      const updatedTables = updatedData?.layout?.tables || []
      const processedTables = updatedTables.map((table: any) => ({
        ...table,
        id: table.id || uuidv4(),
        status: table.status || 'available',
        mapId: table.mapId ?? tableMap.id
      }))
      setTables(processedTables)
    } catch (error) {
      console.error('Error creating bulk tables:', error)
      toast.error(t('tableMaps.bulkCreateError'))
    } finally {
      setIsBulkCreating(false)
    }
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
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle>{tableMap.name}</DialogTitle>
                <DialogDescription id={mainDescriptionId}>{tableMap.description}</DialogDescription>
              </div>
              <Button 
                onClick={() => setIsBulkCreateDialogOpen(true)}
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('tableMaps.bulkCreateTables')}
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.length === 0 ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">{t('tables.tableMaps.noTablesFound')}</p>
                  <p className="text-gray-400 text-sm mt-2">{t('tableMaps.bulkCreateHint')}</p>
                </div>
              </div>
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

      <Dialog open={isBulkCreateDialogOpen} onOpenChange={setIsBulkCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tableMaps.bulkCreateTables')}</DialogTitle>
            <DialogDescription>
              {t('tableMaps.bulkCreateDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tablePrefix" className="text-right">
                {t('tableMaps.tablePrefix')}
              </Label>
              <Input 
                id="tablePrefix" 
                value={bulkTablePrefix} 
                onChange={(e) => setBulkTablePrefix(e.target.value)}
                placeholder={t('tableMaps.tablePrefixPlaceholder')}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tableCount" className="text-right">
                {t('tableMaps.tableCount')}
              </Label>
              <Input 
                id="tableCount" 
                type="number" 
                value={bulkTableCount} 
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10)
                  setBulkTableCount(value > 0 ? value : 1)
                }} 
                placeholder="20"
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tableCapacity" className="text-right">
                {t('tableMaps.tableCapacity')}
              </Label>
              <Input 
                id="tableCapacity" 
                type="number" 
                value={bulkTableCapacity} 
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10)
                  setBulkTableCapacity(value > 0 ? value : 2)
                }} 
                placeholder="2"
                className="col-span-3" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsBulkCreateDialogOpen(false)}
            >
              {t('commons.cancel')}
            </Button>
            <Button 
              onClick={handleBulkCreateTables}
              disabled={isBulkCreating}
            >
              {isBulkCreating ? t('tableMaps.creating') : t('tableMaps.createTables', { count: bulkTableCount })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}