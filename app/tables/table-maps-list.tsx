"use client"

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, doc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { useFirebase } from '@/components/firebase-provider'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import TableDialog from './table-dialog'
import TableMapViewDialog from './table-map-view-dialog'
import TableMapDialog from './table-map-dialog'
import { toast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
  restaurantId?: string
  status: 'available' | 'occupied' | 'reserved'
}

interface TableMapsListProps {
  onCreateMap?: () => void
}

export default function TableMapsList({ onCreateMap }: TableMapsListProps) {
  const { t } = useTranslation()
  const { db } = useFirebase()
  const { user } = useAuth()
  const [tableMaps, setTableMaps] = useState<TableMap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTableMap, setSelectedTableMap] = useState<TableMap | null>(null)
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [isTableMapViewDialogOpen, setIsTableMapViewDialogOpen] = useState(false)
  const [editingMap, setEditingMap] = useState<TableMap | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<TableMap | null>(null)

  useEffect(() => {
    if (!db || !user) return

    const restaurantId = user.establishmentId || user.uid
    const tableMapCollectionRef = collection(db, `restaurants/${restaurantId}/tableMaps`)

    // Create a real-time listener
    const unsubscribe = onSnapshot(
      tableMapCollectionRef, 
      (snapshot) => {
        const fetchedTableMaps: TableMap[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TableMap))

        // Remove debug logging
        setTableMaps(fetchedTableMaps)
        setIsLoading(false)
      },
      (error) => {
        console.error('Error fetching table maps in real-time:', error)
        setIsLoading(false)
        toast({
          title: t('common.error'),
          description: t('tables.tableMaps.fetchError'),
          variant: 'destructive'
        })
      }
    )

    // Cleanup subscription on component unmount
    return () => unsubscribe()
  }, [db, user, t])

  const handleAddTables = (tableMap: TableMap) => {
    setSelectedTableMap(tableMap)
    setIsTableDialogOpen(true)
  }

  const handleViewTableMap = (tableMap: TableMap) => {
    setSelectedTableMap(tableMap)
    setIsTableMapViewDialogOpen(true)
  }

  const handleEditMap = (map: TableMap) => {
    setEditingMap(map)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditingMap(null)
    setIsEditModalOpen(false)
  }

  const handleDeleteTableMap = async () => {
    if (!db || !user || !tableToDelete) return

    try {
      const restaurantId = user.establishmentId || user.uid
      const tableMapRef = doc(db, `restaurants/${restaurantId}/tableMaps`, tableToDelete.id)
      
      await deleteDoc(tableMapRef)

      toast({
        title: t('tableMaps.delete.success'),
        description: `${tableToDelete.name} ${t('commons.deleted')}`,
        variant: 'default'
      })

      // Reset the tableToDelete state
      setTableToDelete(null)
    } catch (error) {
      console.error('Error deleting table map:', error)
      toast({
        title: t('common.error'),
        description: t('tableMaps.delete.error'),
        variant: 'destructive'
      })
    }
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
                      onClick={() => handleEditMap(map)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setTableToDelete(map)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('tableMaps.delete.confirmTitle')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('tableMaps.delete.confirmDescription', { 
                              name: tableToDelete?.name 
                            })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t('commons.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteTableMap}
                          >
                            {t('commons.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

      {isEditModalOpen && editingMap && (
        <TableMapDialog 
          isOpen={isEditModalOpen} 
          onClose={handleCloseEditModal} 
          initialData={editingMap} 
        />
      )}
    </div>
  )
}