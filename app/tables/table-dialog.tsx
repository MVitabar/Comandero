"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import { TableMap, RestaurantTable } from './table-maps-list'
import { useFirebase } from '@/components/firebase-provider'
import { addDoc, collection, doc, query, where, getDocs } from 'firebase/firestore'
import { toast } from '@/components/ui/use-toast'

interface TableDialogProps {
  isOpen: boolean
  onClose: () => void
  tableMap: TableMap
}

export default function TableDialog({ 
  isOpen, 
  onClose, 
  tableMap 
}: TableDialogProps) {
  const { t } = useTranslation()
  const { db } = useFirebase()
  const [tableName, setTableName] = useState('')
  const [tableCapacity, setTableCapacity] = useState(2)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function generateTableName() {
      if (!db) return

      try {
        const restaurantId = 'Wz0Z6r7LpneHy3gfIg7d9zjzU6K2'
        const tablesCollectionRef = collection(db, `restaurants/${restaurantId}/tables`)
        const q = query(tablesCollectionRef, where('tableMapId', '==', tableMap.id))
        const querySnapshot = await getDocs(q)
        
        const tableCount = querySnapshot.size
        const newTableNumber = tableCount + 1
        setTableName(`Mesa ${newTableNumber}`)
      } catch (error) {
        console.error('Error generating table name:', error)
      }
    }

    if (isOpen) {
      generateTableName()
    }
  }, [db, isOpen, tableMap.id])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("tableDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("tableDialog.description")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableName" className="text-right">
              {t("tableDialog.labels.tableName")}
            </Label>
            <Input 
              id="tableName" 
              value={tableName} 
              onChange={(e) => setTableName(e.target.value)} 
              placeholder={t("tableDialog.placeholders.tableName")}
              className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableCapacity" className="text-right">
              {t("tableDialog.labels.tableCapacity")}
            </Label>
            <Input 
              id="tableCapacity" 
              type="number" 
              value={tableCapacity} 
              onChange={(e) => {
                const value = parseInt(e.target.value, 10)
                setTableCapacity(value > 0 ? value : 2)
              }} 
              placeholder={t("tableDialog.placeholders.tableCapacity")}
              className="col-span-3" 
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            {t("tableDialog.actions.cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            onClick={async () => {
              if (tableCapacity <= 0) {
                toast({
                  title: 'Error',
                  description: t("tableDialog.errors.invalidCapacity"),
                  variant: 'destructive'
                })
                return
              }

              setIsLoading(true)
              try {
                const restaurantId = 'Wz0Z6r7LpneHy3gfIg7d9zjzU6K2'
                const tablesCollectionRef = collection(db, `restaurants/${restaurantId}/tables`)
                const newTable: RestaurantTable = {
                  name: tableName,
                  capacity: tableCapacity,
                  tableMapId: tableMap.id,
                  status: 'available'
                }

                const docRef = await addDoc(tablesCollectionRef, newTable)

                toast({
                  title: t("tableDialog.success.create"),
                  description: `${tableName} ${t("commons.created")}`,
                  variant: 'default'
                })

                onClose()
              } catch (error) {
                console.error('Error creating table:', error)
                toast({
                  title: 'Error',
                  description: t("tableDialog.errors.create"),
                  variant: 'destructive'
                })
              } finally {
                setIsLoading(false)
              }
            }}
          >
            {t("tableDialog.actions.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}