"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { TableMap } from './table-maps-list'
import { useFirebase } from '@/components/firebase-provider'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { TableCard } from '@/components/table-card'
import { Order } from '@/types'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/use-toast'
import { OrderForm } from '@/components/orders/order-form'

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
  const { toast } = useToast()
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)

  useEffect(() => {
    async function fetchTables() {
      console.log('Debug: Fetching tables', { 
        isOpen, 
        tableMap: {
          id: tableMap.id,
          name: tableMap.name
        }, 
        db: !!db, 
        user: {
          uid: user?.uid,
          email: user?.email
        }
      })

      if (!db || !user || !isOpen) {
        console.log('Debug: Conditions not met for fetching tables')
        setIsLoading(false)
        return
      }

      try {
        const restaurantId = user.uid
        console.log('Debug: Fetching tables for', { 
          restaurantId, 
          tableMapId: tableMap.id 
        })

        // Verify the collection path
        const tablesCollectionRef = collection(db, `restaurants/${restaurantId}/tables`)
        console.log('Debug: Tables Collection Reference', tablesCollectionRef.path)

        const q = query(
          tablesCollectionRef, 
          where('tableMapId', '==', tableMap.id)
        )
        
        // Log the query details
        console.log('Debug: Query Details', {
          collectionPath: tablesCollectionRef.path,
          whereClause: {
            field: 'tableMapId',
            operator: '==',
            value: tableMap.id
          },
          tableMapDetails: {
            id: tableMap.id,
            name: tableMap.name
          }
        })

        const querySnapshot = await getDocs(q)
        
        console.log('Debug: Query snapshot', { 
          size: querySnapshot.size,
          empty: querySnapshot.empty
        })

        // Log each document if any exist
        if (!querySnapshot.empty) {
          querySnapshot.docs.forEach((doc, index) => {
            console.log(`Debug: Document ${index}`, {
              id: doc.id,
              data: doc.data()
            })
          })
        } else {
          console.log('Debug: No documents found. Checking all documents in collection.')
          
          // Fetch all documents in the collection to verify
          const allDocsSnapshot = await getDocs(tablesCollectionRef)
          console.log('Debug: All documents in collection', {
            size: allDocsSnapshot.size,
            documents: allDocsSnapshot.docs.map(doc => ({
              id: doc.id,
              data: doc.data()
            }))
          })
        }

        const fetchedTables = querySnapshot.docs.map(doc => {
          const tableData = {
            id: doc.id,
            ...doc.data()
          } as RestaurantTable
          console.log('Debug: Individual table', tableData)
          return tableData
        })

        console.log('Debug: Fetched tables', fetchedTables)
        setTables(fetchedTables)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching tables:', error)
        toast({
          title: t('commons.error'),
          description: t('tables.tableMaps.fetchTablesError'),
          variant: 'destructive'
        })
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchTables()
    }
  }, [db, user, isOpen, tableMap.id])

  const handleCreateOrder = (table: RestaurantTable) => {
    setSelectedTable(table)
    setIsOrderFormOpen(true)
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
                  const aNumber = parseInt(a.name.replace('Mesa ', ''), 10)
                  const bNumber = parseInt(b.name.replace('Mesa ', ''), 10)
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
              onOrderCreated={(order) => {
                // Optional: handle order creation if needed
                handleCloseOrderForm()
              }}
              table={selectedTable}
              aria-labelledby="order-form-title"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}