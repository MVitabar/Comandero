"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'
import { TableMap } from './table-maps-list'
import { useFirebase } from '@/components/firebase-provider'
import { useAuth } from '@/components/auth-provider'
import { doc, collection, updateDoc, setDoc, query, getDocs, serverTimestamp } from 'firebase/firestore'
import {toast} from 'sonner'
import { v4 as uuidv4 } from 'uuid'
interface TableMapDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData?: TableMap
}

export default function TableMapDialog({ 
  isOpen, 
  onClose, 
  initialData 
}: TableMapDialogProps) {
  const { t } = useTranslation()
  const { db } = useFirebase()
  const { user } = useAuth()
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [layout, setLayout] = useState(initialData?.layout || { tables: [] })
  const [createTables, setCreateTables] = useState(false)
  const [tableCount, setTableCount] = useState(20)
  const [tableCapacity, setTableCapacity] = useState(2)
  const [tablePrefix, setTablePrefix] = useState('')

  useEffect(() => {
    // Reset form when initialData changes
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description || '')
      setLayout(initialData.layout || { tables: [] })
    }
  }, [initialData])

  const handleSave = async () => {
    if (!db || !user) {
      toast.error(t('common.error'))
      return
    }

    try {
      const restaurantId = user.establishmentId || user.uid
      
      // Generate tables if requested
      let tables = layout.tables || []
      if (createTables && !initialData) {
        for (let i = 0; i < tableCount; i++) {
          const tableNumber = i + 1
          const tableName = tablePrefix 
            ? `${tablePrefix}-Mesa ${tableNumber}`
            : `Mesa ${tableNumber}`
          
          tables.push({
            id: uuidv4(),
            name: tableName,
            capacity: tableCapacity,
            status: 'available',
            x: 0,
            y: 0,
            restaurantId: restaurantId
          })
        }
      }

      const tableMapData = {
        name,
        description,
        layout: { tables },
        updatedAt: new Date(),
        createdAt: initialData?.createdAt || new Date()
      }

      if (initialData) {
        // Update existing table map
        await updateDoc(doc(db, `restaurants/${restaurantId}/tableMaps`, initialData.id), tableMapData)
      } else {
        // Create new table map
        const tableMapRef = doc(
          db, 
          'restaurants', 
          restaurantId, 
          'tableMaps', 
          name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        )
        await setDoc(tableMapRef, {
          ...tableMapData,
          id: tableMapRef.id,
          createdAt: serverTimestamp()
        })
      }

      onClose()
    } catch (error) {
      console.error('Error saving table map:', error)
      toast.error(t('common.error'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="table-map-description">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t('tables.tableMaps.editMap') : t('tables.tableMaps.createMap')}
          </DialogTitle>
          <DialogDescription id="table-map-description">
            {initialData ? t('tables.tableMaps.editMapDescription') : t('tables.tableMaps.createMapDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('tables.tableMaps.mapName')}
            </Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="col-span-3" 
              placeholder={t('tables.tableMaps.mapNamePlaceholder')}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {t('tables.tableMaps.mapDescription')}
            </Label>
            <Input 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="col-span-3" 
              placeholder={t('tables.tableMaps.mapDescriptionPlaceholder')}
            />
          </div>
          
          {!initialData && (
            <>
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="createTables"
                    checked={createTables}
                    onCheckedChange={(checked) => setCreateTables(checked as boolean)}
                  />
                  <Label htmlFor="createTables" className="cursor-pointer">
                    {t('tableMaps.createTablesOnMapCreation')}
                  </Label>
                </div>
                
                {createTables && (
                  <div className="space-y-4 ml-6">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tablePrefix" className="text-right">
                        {t('tables.tableMaps.tablePrefix')}
                      </Label>
                      <Input 
                        id="tablePrefix" 
                        value={tablePrefix} 
                        onChange={(e) => setTablePrefix(e.target.value)}
                        placeholder={t('tables.tableMaps.tablePrefixPlaceholder')}
                        className="col-span-3" 
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tableCount" className="text-right">
                        {t('tables.tableMaps.tableCount')}
                      </Label>
                      <Input 
                        id="tableCount" 
                        type="number" 
                        value={tableCount} 
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10)
                          setTableCount(value > 0 ? value : 1)
                        }} 
                        placeholder="20"
                        className="col-span-3" 
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tableCapacity" className="text-right">
                        {t('tables.tableMaps.tableCapacity')}
                      </Label>
                      <Input 
                        id="tableCapacity" 
                        type="number" 
                        value={tableCapacity} 
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10)
                          setTableCapacity(value > 0 ? value : 2)
                        }} 
                        placeholder="2"
                        className="col-span-3" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {initialData ? t('common.update') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}