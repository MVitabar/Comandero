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
import { toast } from 'sonner'
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

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
  mapId: string
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
        toast.error(t('tableMaps.fetch.error'))
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

      toast.success(t('tableMaps.delete.success', { name: tableToDelete.name }))

      // Reset the tableToDelete state
      setTableToDelete(null)
    } catch (error) {
      console.error('Error deleting table map:', error)
      toast.error(t('tableMaps.delete.error'))
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
        // Vista de escritorio
        <div className="hidden md:block">
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
                      <ActionButtons 
                        map={map}
                        onView={handleViewTableMap}
                        onAddTables={handleAddTables}
                        onEdit={handleEditMap}
                        onDelete={setTableToDelete}
                        onConfirmDelete={handleDeleteTableMap}  // Add this prop
                        tableToDelete={tableToDelete}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Vista móvil */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {tableMaps.map((map) => (
          <Card key={map.id}>
            <CardHeader>
              <CardTitle className="text-lg">{map.name}</CardTitle>
              <CardDescription>
                {map.description || t('tables.tableMaps.noDescription')}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-wrap gap-2">
              <ActionButtons 
                map={map}
                onView={handleViewTableMap}
                onAddTables={handleAddTables}
                onEdit={handleEditMap}
                onDelete={setTableToDelete}
                onConfirmDelete={handleDeleteTableMap}  // Add this prop
                tableToDelete={tableToDelete}
              />
            </CardFooter>
          </Card>
        ))}
      </div>

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

// First, define the interface for ActionButtons props
interface ActionButtonsProps {
  map: TableMap;
  onView: (map: TableMap) => void;
  onAddTables: (map: TableMap) => void;
  onEdit: (map: TableMap) => void;
  onDelete: (map: TableMap) => void;
  onConfirmDelete: () => void;  // Add this prop
  tableToDelete: TableMap | null;
}

// Update the ActionButtons component
function ActionButtons({ 
  map, 
  onView, 
  onAddTables, 
  onEdit, 
  onDelete,
  onConfirmDelete,  // Add this prop
  tableToDelete 
}: ActionButtonsProps) {
  const { t } = useTranslation()
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onView(map)}
      >
        <Eye className="mr-2 h-4 w-4" /> {t('tables.tableMaps.viewMap')}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onAddTables(map)}
      >
        <Plus className="mr-2 h-4 w-4" /> {t('tables.tableMaps.addTable')}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onEdit(map)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(map)}
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
              onClick={onConfirmDelete}  // Use the passed handler
            >
              {t('commons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}