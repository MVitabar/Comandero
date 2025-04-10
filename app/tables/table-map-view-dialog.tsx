"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { TableMap, RestaurantTable } from './table-maps-list'
import { useFirebase } from '@/components/firebase-provider'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { TableCard } from '@/components/table-card'
import { OrderForm } from '@/components/orders/order-form'
import { Order } from '@/types'

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
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)

  useEffect(() => {
    async function fetchTables() {
      if (!db || !isOpen) return

      try {
        const restaurantId = 'Wz0Z6r7LpneHy3gfIg7d9zjzU6K2'
        const q = query(
          collection(db, `restaurants/${restaurantId}/tables`), 
          where('tableMapId', '==', tableMap.id)
        )
        const querySnapshot = await getDocs(q)
        
        const fetchedTables = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as RestaurantTable))

        setTables(fetchedTables)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching tables:', error)
        setIsLoading(false)
      }
    }

    fetchTables()
  }, [db, isOpen, tableMap.id])

  const handleCreateOrder = (table: RestaurantTable) => {
    setSelectedTable(table)
    setIsOrderFormOpen(true)
  }

  const handleCloseOrderForm = (open: boolean) => {
    setIsOrderFormOpen(false)
    setSelectedTable(null)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('tables.tableMaps.viewMap', { name: tableMap.name })}</DialogTitle>
            <DialogDescription>
              {tableMap.description || t('tables.tableMaps.noDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div>{t('common.loading')}</div>
            ) : tables.length === 0 ? (
              <div>{t('tables.tableMaps.noTablesFound')}</div>
            ) : (
              tables.map(table => {
                // Extract number from table name (assumes format "Mesa {number}")
                const tableNumberMatch = table.name.match(/Mesa (\d+)/)
                const tableNumber = tableNumberMatch ? parseInt(tableNumberMatch[1], 10) : 0

                return (
                  <TableCard 
                    key={table.id} 
                    table={{
                      uid: table.id || '',
                      number: tableNumber, // Use extracted number
                      seats: table.capacity,
                      shape: 'square', // Default shape, could be added to RestaurantTable
                      width: 100, // Default width
                      height: 100, // Default height
                      x: table.x || 0,
                      y: table.y || 0,
                      status: table.status || 'available'
                    }}
                    onCreateOrder={() => handleCreateOrder(table)}
                  />
                )
              })
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={onClose} variant="outline">
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedTable && (
        <Dialog 
          open={isOrderFormOpen} 
          onOpenChange={handleCloseOrderForm}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t('orders.createOrder')} - {selectedTable.name}</DialogTitle>
            </DialogHeader>
            <OrderForm 
              initialTableNumber={selectedTable.name}
              onOrderCreated={(order) => {
                // If an order is created, close the form
                handleCloseOrderForm(false)
              }}
              table={selectedTable}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}