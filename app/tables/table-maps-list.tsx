"use client"

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, doc } from 'firebase/firestore'
import { useFirebase } from '@/components/firebase-provider'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import TableDialog from './table-dialog'
import TableMapViewDialog from './table-map-view-dialog'

// Define TableMap interface
export interface TableMap {
  id: string
  name: string
  description?: string
  layout: {
    tables: any[]
  }
  createdAt: Date
  updatedAt: Date
}

// Define Table interface
export interface RestaurantTable {
  id?: string
  name: string
  capacity: number
  x?: number
  y?: number
  tableMapId: string
  status: 'available' | 'occupied' | 'reserved'
}

interface TableMapsListProps {
  onCreateMap?: () => void
}

export default function TableMapsList({ onCreateMap }: TableMapsListProps) {
  const { t } = useTranslation()
  const { db } = useFirebase()
  const [tableMaps, setTableMaps] = useState<TableMap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTableMap, setSelectedTableMap] = useState<TableMap | null>(null)
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [isTableMapViewDialogOpen, setIsTableMapViewDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchTableMaps() {
      if (!db) return

      try {
        const restaurantId = 'Wz0Z6r7LpneHy3gfIg7d9zjzU6K2'
        const q = query(collection(db, `restaurants/${restaurantId}/tableMaps`))
        const querySnapshot = await getDocs(q)
        
        const maps = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TableMap))

        setTableMaps(maps)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching table maps:', error)
        setIsLoading(false)
      }
    }

    fetchTableMaps()
  }, [db])

  const handleAddTables = (tableMap: TableMap) => {
    setSelectedTableMap(tableMap)
    setIsTableDialogOpen(true)
  }

  const handleViewTableMap = (tableMap: TableMap) => {
    setSelectedTableMap(tableMap)
    setIsTableMapViewDialogOpen(true)
  }

  if (isLoading) {
    return <div className="p-6">{t('common.loading')}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('tables.tableMaps.title')}</h1>
        {onCreateMap && (
          <Button 
            variant="outline" 
            onClick={onCreateMap}
          >
            <Plus className="mr-2 h-4 w-4" /> {t('tables.tableMaps.createMap')}
          </Button>
        )}
      </div>

      {tableMaps.length === 0 ? (
        <div className="text-center text-muted-foreground">
          {t('tables.tableMaps.noMapsFound')}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('tables.tableMaps.mapName')}</TableHead>
              <TableHead>{t('tables.tableMaps.mapDescription')}</TableHead>
              <TableHead>{t('tables.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableMaps.map((map) => (
              <TableRow key={map.id}>
                <TableCell>{map.name}</TableCell>
                <TableCell>{map.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewTableMap(map)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> {t('tables.tableMaps.viewMap')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddTables(map)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> {t('tables.tableMaps.addTable')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {/* Edit map */}}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {/* Delete map */}}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedTableMap && (
        <>
          <TableDialog 
            isOpen={isTableDialogOpen} 
            onClose={() => setIsTableDialogOpen(false)}
            tableMap={selectedTableMap}
          />
          <TableMapViewDialog 
            isOpen={isTableMapViewDialogOpen} 
            onClose={() => setIsTableMapViewDialogOpen(false)}
            tableMap={selectedTableMap}
          />
        </>
      )}
    </div>
  )
}