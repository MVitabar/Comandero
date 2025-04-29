"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import { TableMap, RestaurantTable } from './table-maps-list'
import { useFirebase } from '@/components/firebase-provider'
import { useAuth } from '@/components/auth-provider'
import { doc, updateDoc, arrayUnion, getDoc, setDoc, writeBatch } from 'firebase/firestore'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

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
  const { user } = useAuth()
  const [tableName, setTableName] = useState('')
  const [tableCapacity, setTableCapacity] = useState(2)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function generateTableName() {
      if (!db || !user) return

      try {
        const restaurantId = user.establishmentId || user.uid
        const tableMapRef = doc(db, `restaurants/${restaurantId}/tableMaps`, tableMap.id)
        const tableMapSnapshot = await getDoc(tableMapRef)
        
        if (!tableMapSnapshot.exists()) {
          console.error('Table map not found')
          return
        }

        const tableMapData = tableMapSnapshot.data()
        const existingTables = tableMapData?.layout?.tables || []
        
        const tableCount = existingTables.length
        const newTableNumber = tableCount + 1
        setTableName(`Mesa ${newTableNumber}`)
      } catch (error) {
        console.error('Error generating table name:', error)
      }
    }

    generateTableName()
  }, [db, user, tableMap])

  const handleCreateTable = async () => {
    if (!db || !user) return

    try {
      setIsLoading(true)
      const restaurantId = user.establishmentId || user.uid
      const tableMapRef = doc(db, `restaurants/${restaurantId}/tableMaps`, tableMap.id)
      
      // Fetch the current table map to get the latest layout
      const tableMapSnapshot = await getDoc(tableMapRef)
      
      // If table map doesn't exist, create it with initial layout
      if (!tableMapSnapshot.exists()) {
        await setDoc(tableMapRef, {
          id: tableMap.id,
          name: tableMap.name,
          layout: { tables: [] },
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true })
      }

      // Generate a unique ID for the new table
      const newTableId = uuidv4()

      // Fetch the updated snapshot to get the latest data
      const updatedTableMapSnapshot = await getDoc(tableMapRef)
      const tableMapData = updatedTableMapSnapshot.data()
      const existingTables = tableMapData?.layout?.tables || []
      
      // Determine the next table number
      const tableCount = existingTables.length
      const newTableNumber = tableCount + 1
      const generatedTableName = `Mesa ${newTableNumber}`

      // Cuando crees o edites una mesa, asegúrate de incluir tableMapId/mapId
      const newTable: RestaurantTable = {
        id: newTableId,
        name: tableName || generatedTableName,
        capacity: tableCapacity,
        status: 'available',
        mapId: tableMap.id, 
        x: 0, 
        y: 0, 
        restaurantId: restaurantId 
      }

      // Update the table map's layout to include the new table
      await updateDoc(tableMapRef, {
        'layout.tables': arrayUnion(newTable),
        updatedAt: new Date()
      })

      toast.success(t("tableDialog.success.create"), {
        description: t("tableDialog.success.createDescription", { tableName: newTable.name }),
        duration: 3000
      })

      // Reset form and close dialog
      setTableName('')
      setTableCapacity(2)
      onClose()
    } catch (error) {
      console.error('Error creating table:', error)
      toast.error(t("tableDialog.error.create"), {
        description: t("tableDialog.error.createDescription"),
        duration: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="table-dialog-description">
        <DialogHeader>
          <DialogTitle>{t("tableDialog.title")}</DialogTitle>
          <DialogDescription id="table-dialog-description">
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
            onClick={handleCreateTable}
          >
            {t("tableDialog.actions.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}