"use client"

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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Order, OrderItem, TableItem } from '@/types'
import { useI18n } from '@/components/i18n-provider'
import { useFirebase } from '@/components/firebase-provider'
import { useAuth } from '@/components/auth-provider'
import { doc, updateDoc, collection, getDocs, addDoc, query, where, onSnapshot, deleteDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'

interface TransferItemsDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransferComplete?: () => void
}

export function TransferItemsDialog({ 
  order, 
  open, 
  onOpenChange,
  onTransferComplete
}: TransferItemsDialogProps) {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedMapId, setSelectedMapId] = useState<string>('')
  const [destinationTableId, setDestinationTableId] = useState<string>('')
  const [destinationOrderId, setDestinationOrderId] = useState<string>('')
  const [tableMaps, setTableMaps] = useState<any[]>([])
  const [tables, setTables] = useState<TableItem[]>([])
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)

  // Fetch tables and active orders when dialog opens
  useEffect(() => {
    if (!db || !order.restaurantId || !open) return

    const fetchData = async () => {
      setFetchingData(true)
      try {
        // Fetch table maps
        const tableMapsRef = collection(db, `restaurants/${order.restaurantId}/tableMaps`)
        const tableMapsSnapshot = await getDocs(tableMapsRef)
        const fetchedTableMaps = tableMapsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          ...doc.data()
        }))
        setTableMaps(fetchedTableMaps)

        // Fetch active orders (not closed/finished)
        const ordersRef = collection(db, `restaurants/${order.restaurantId}/orders`)
        const ordersQuery = query(ordersRef, where('status', '==', 'pending'))
        const ordersSnapshot = await getDocs(ordersQuery)
        const fetchedOrders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order))
        setActiveOrders(fetchedOrders.filter(o => o.id !== order.id))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error(t('orders.transfer.errorFetchingData'))
      } finally {
        setFetchingData(false)
      }
    }

    fetchData()
  }, [db, order.restaurantId, open, order.id, t])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedItems(new Set())
      setSelectedMapId('')
      setDestinationTableId('')
      setDestinationOrderId('')
    }
  }, [open])

  // Extract tables when map is selected
  useEffect(() => {
    if (!selectedMapId) {
      setTables([])
      return
    }

    const selectedMap = tableMaps.find(map => map.id === selectedMapId)
    if (selectedMap && selectedMap.layout && selectedMap.layout.tables) {
      const fetchedTables = selectedMap.layout.tables.map((table: any) => ({
        id: table.id,
        name: table.name,
        mapId: selectedMapId,
        ...table
      }))
      setTables(fetchedTables)
    } else {
      setTables([])
    }
  }, [selectedMapId, tableMaps])

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = () => {
    const items = Array.isArray(order.items) ? order.items : Object.values(order.items)
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map(item => item.id)))
    }
  }

  const handleTransfer = async () => {
    if (selectedItems.size === 0) {
      toast.error(t('orders.transfer.noItemsSelected'))
      return
    }

    if (!destinationTableId) {
      toast.error(t('orders.transfer.noDestinationSelected'))
      return
    }

    setLoading(true)

    try {
      const items = Array.isArray(order.items) ? order.items : Object.values(order.items)
      const itemsToTransfer = items.filter(item => selectedItems.has(item.id))

      // Calculate exact subtotal of items being transferred
      const transferSubtotal = itemsToTransfer.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const transferTax = 0
      const transferTotal = transferSubtotal

      // Remove items from source order
      const remainingItems = items.filter(item => !selectedItems.has(item.id))
      
      // If all items are being transferred, delete the source order instead of updating it
      if (remainingItems.length === 0) {
        const sourceOrderRef = doc(db, `restaurants/${order.restaurantId}/orders/${order.id}`)
        await deleteDoc(sourceOrderRef)
      } else {
        const newSubtotal = order.subtotal - transferSubtotal
        const newTax = (order.tax || 0)
        const newTotal = order.total - transferTotal

        // Update source order
        const sourceOrderRef = doc(db, `restaurants/${order.restaurantId}/orders/${order.id}`)
        await updateDoc(sourceOrderRef, {
          items: remainingItems,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal,
          updatedAt: new Date()
        })
      }

      // Check if destination table has an active order
      let targetOrderId: string | undefined = destinationOrderId === 'new' ? undefined : destinationOrderId

      if (!targetOrderId) {
        // Create new order for destination table
        const newOrderData: any = {
          tableNumber: tables.find(t => t.id === destinationTableId)?.name || '',
          tableId: destinationTableId,
          mapId: tables.find(t => t.id === destinationTableId)?.mapId || '',
          orderType: 'table',
          status: 'pending',
          restaurantId: order.restaurantId,
          items: itemsToTransfer,
          subtotal: transferSubtotal,
          tax: transferTax,
          total: transferTotal,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        // Only include userId if it exists
        if (user?.uid) {
          newOrderData.userId = user.uid
        }
        
        // Only include waiter if it exists - use same logic as order-form
        newOrderData.waiter = user?.username || user?.displayName || user?.email || user?.uid || ''
        
        // Include createdBy field for display in orders page
        newOrderData.createdBy = {
          uid: user?.uid || '',
          displayName: user?.username || user?.displayName || user?.email || '',
          email: user?.email || null,
          role: user?.role || 'unknown'
        }
        
        const newOrderRef = await addDoc(collection(db, `restaurants/${order.restaurantId}/orders`), newOrderData)
        targetOrderId = newOrderRef.id
      } else {
        // Add items to existing order
        const targetOrderRef = doc(db, `restaurants/${order.restaurantId}/orders/${targetOrderId}`)
        const targetOrder = activeOrders.find(o => o.id === targetOrderId)
        const targetItems = Array.isArray(targetOrder?.items) ? targetOrder.items : Object.values(targetOrder?.items || {})
        const updatedItems = [...targetItems, ...itemsToTransfer]
        const updatedSubtotal = targetOrder?.subtotal ? targetOrder.subtotal + transferSubtotal : transferSubtotal
        const updatedTax = targetOrder?.tax || 0
        const updatedTotal = targetOrder?.total ? targetOrder.total + transferTotal : transferTotal

        const updateData: any = {
          items: updatedItems,
          subtotal: updatedSubtotal,
          tax: updatedTax,
          total: updatedTotal,
          updatedAt: new Date()
        }
        
        // Update userId and waiter with current user - use same logic as order-form
        if (user?.uid) {
          updateData.userId = user.uid
        }
        updateData.waiter = user?.username || user?.displayName || user?.email || user?.uid || ''
        
        // Update createdBy field for display in orders page
        updateData.createdBy = {
          uid: user?.uid || '',
          displayName: user?.username || user?.displayName || user?.email || '',
          email: user?.email || null,
          role: user?.role || 'unknown'
        }

        await updateDoc(targetOrderRef, updateData)
      }

      toast.success(t('orders.transfer.success'))
      onOpenChange(false)
      onTransferComplete?.()
    } catch (error) {
      console.error('Error transferring items:', error)
      toast.error(t('orders.transfer.error'))
    } finally {
      setLoading(false)
    }
  }

  const items = Array.isArray(order.items) ? order.items : Object.values(order.items)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('orders.transfer.title')}</DialogTitle>
          <DialogDescription>
            {t('orders.transfer.description')}
          </DialogDescription>
        </DialogHeader>

        {fetchingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('orders.transfer.selectItems')}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedItems.size === items.length ? t('orders.transfer.deselectAll') : t('orders.transfer.selectAll')}
                </Button>
              </div>
              
              <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => handleItemToggle(item.id)}
                    />
                    <Label
                      htmlFor={item.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex justify-between">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Selection */}
            <div className="space-y-2">
              <Label>{t('orders.transfer.destination')}</Label>
              
              {/* Map Selection */}
              <Select value={selectedMapId} onValueChange={(value) => {
                setSelectedMapId(value)
                setDestinationTableId('')
                setDestinationOrderId('')
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={t('orders.transfer.selectMap')} />
                </SelectTrigger>
                <SelectContent>
                  {tableMaps
                    .filter(map => map.id !== order.mapId)
                    .map((map) => (
                      <SelectItem key={map.id} value={map.id}>
                        {map.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Table Selection */}
              {selectedMapId && (
                <Select value={destinationTableId} onValueChange={(value) => {
                  setDestinationTableId(value)
                  setDestinationOrderId('')
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('orders.transfer.selectDestinationTable')} />
                  </SelectTrigger>
                  <SelectContent>
                    {tables
                      .filter(table => table.id !== order.tableId)
                      .map((table) => (
                        <SelectItem key={table.id || ''} value={table.id || ''}>
                          {table.name || table.id}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Order Selection */}
              {destinationTableId && (
                <Select value={destinationOrderId} onValueChange={setDestinationOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('orders.transfer.createNewOrder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t('orders.transfer.createNewOrder')}</SelectItem>
                    {activeOrders
                      .filter(o => o.tableId === destinationTableId)
                      .map((activeOrder) => (
                        <SelectItem key={activeOrder.id} value={activeOrder.id}>
                          {t('orders.transfer.existingOrder')} - {activeOrder.tableNumber}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Summary */}
            {selectedItems.size > 0 && (
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('orders.transfer.itemsToTransfer')}:</span>
                  <span>{selectedItems.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('orders.transfer.transferTotal')}:</span>
                  <span className="font-semibold">
                    ${items
                      .filter(item => selectedItems.has(item.id))
                      .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('orders.transfer.cancel')}
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={loading || selectedItems.size === 0 || !destinationTableId}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('orders.transfer.transferring')}
              </>
            ) : (
              <>
                {t('orders.transfer.transfer')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
