"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import { TableMap } from './table-maps-list'
import { useFirebase } from '@/components/firebase-provider'
import { useAuth } from '@/components/auth-provider'
import { doc, collection, updateDoc, setDoc } from 'firebase/firestore'
import { Toast, ToastProps } from '@/components/ui/toast'

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

  const handleSave = async () => {
    if (!db || !user) {
      console.error('Debug: Missing db or user', { db: !!db, user: !!user })
      return
    }

    try {
      const tableMapData = {
        name,
        description,
        layout: initialData?.layout || { tables: [] },
        createdAt: initialData ? undefined : new Date(),
        updatedAt: new Date()
      }

      console.log('Debug: Saving table map data:', tableMapData)

      const restaurantId = user.uid
      const tableMapRef = doc(collection(db, `restaurants/${restaurantId}/tableMaps`))

      if (initialData) {
        // Update existing table map
        console.log('Debug: Updating existing table map', { 
          restaurantId, 
          tableMapId: initialData.id, 
          data: tableMapData 
        })
        await updateDoc(doc(db, `restaurants/${restaurantId}/tableMaps`, initialData.id), tableMapData)
      } else {
        // Create new table map
        console.log('Debug: Creating new table map', { 
          restaurantId, 
          data: tableMapData 
        })
        await setDoc(tableMapRef, tableMapData)
      }

      console.log('Debug: Table map saved successfully')
      onClose()
    } catch (error) {
      console.error('Error saving table map:', error)
      Toast({
        title: t('common.error'),
        description: t('tables.tableMaps.saveError'),
        variant: 'destructive'
      } as ToastProps)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData 
              ? t('tables.tableMaps.editMap') 
              : t('tables.tableMaps.createMap')
            }
          </DialogTitle>
          <DialogDescription>
            {t('tables.tableMaps.mapDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t('tables.tableMaps.mapName')}</Label>
            <Input 
              placeholder={t('tables.tableMaps.mapName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>{t('tables.tableMaps.mapDescription')}</Label>
            <Input 
              placeholder={t('tables.tableMaps.mapDescription')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name}
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}