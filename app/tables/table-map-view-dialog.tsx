"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next' 
import { TableMap } from './table-maps-list'
import { useFirebase } from '@/components/firebase-provider'
import { doc, getDoc, collection, addDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { TableCard } from '@/components/table-card'
import { Order } from '@/types'
import { useAuth } from '@/components/auth-provider'
import {toast} from 'sonner'
import { OrderForm } from '@/components/orders/order-form'
import { v4 as uuidv4 } from 'uuid'

interface RestaurantTable {
  id?: string
  name: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  tableMapId: string
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

        // Ensure each table has a unique identifier
        const processedTables = tablesInMap.map((table: { id: any; status: any }) => ({
          ...table,
          id: table.id || uuidv4(), // Generate ID if not present
          status: table.status || 'available' // Default status if not set
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
      const sanitizedOrderData: Order = {
        ...order,
        uid: user?.uid || order.uid || '',
        restaurantId: restaurantId,
        status: order.status || 'pending',
        
        // Normalize items to match OrderItem interface
        items: (order.items || []).map(item => {
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
        tableMapId: order.tableMapId || '',
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
            tableMapId: order.tableMapId || ''
          },
          timestamp: new Date()
        }
      }

      // Clean the order data
      const cleanedOrderData = cleanOrderData(sanitizedOrderData);

      // Save order to Firestore
      const newOrderRef = await addDoc(ordersRef, {
        ...cleanedOrderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: cleanedOrderData.status || 'pending'
      })

      // Update table status
      if (selectedTable) {
        const tableRef = doc(db, 'restaurants', restaurantId, 'tables', selectedTable.id || '')
        await setDoc(tableRef, {
          status: 'occupied',
          activeOrderId: newOrderRef.id
        }, { merge: true })  // Use merge to avoid overwriting existing data
      }

      toast.success(t('orders.orderCreated'), {
        description: t('orders.orderCreatedDescription', { orderId: newOrderRef.id })
      })

      // Close order form
      handleCloseOrderForm()

      return newOrderRef.id
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

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
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
        <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tableMap.name}</DialogTitle>
            <DialogDescription>{tableMap.description}</DialogDescription>
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
                .map(table => (
                  <TableCard 
                    key={table.id} 
                    table={{
                      uid: table.id || '',
                      number: parseInt(table.name.replace('Mesa ', ''), 10), 
                      seats: table.capacity,
                      shape: 'square', 
                      width: 100, 
                      height: 100, 
                      x: 0, 
                      y: 0, 
                      status: table.status
                    }}
                    onCreateOrder={() => handleCreateOrder(table)}
                  />
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isOrderFormOpen && selectedTable && (
        <Dialog open={isOrderFormOpen} onOpenChange={handleCloseOrderForm}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t('orders.createOrder')} - {selectedTable.name}</DialogTitle>
            </DialogHeader>
            <div className="sr-only" id="order-form-title">
              {t('orders.createOrder')} {t('commons.for')} {selectedTable.name}
            </div>
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