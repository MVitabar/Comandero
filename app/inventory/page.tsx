"use client"

import type React from "react"
import { InventoryItem } from "@/types"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/components/i18n-provider"
import { 
  collection, 
  query, 
  where,
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Plus, Search, AlertTriangle, Edit, Trash2 } from "lucide-react"
import { usePermissions } from "@/components/permissions-provider"
import { UnauthorizedAccess } from "@/components/unauthorized-access"
import { useNotifications } from "@/hooks/useNotifications"
import { toast } from "sonner"

const entradas = [
  {
    name: "Coxinha",
    description: "Coxinha de frango",
    price: 10.0,
  },
  {
    name: "Pão de Queijo",
    description: "Pão de queijo fresco",
    price: 8.0,
  }
];

const pratosPrincipais = [
  {
    name: "Feijoada",
    description: "Feijoada com arroz e farofa",
    price: 25.0,
  },
  {
    name: "Churrasco",
    description: "Churrasco de carne com arroz e feijão",
    price: 30.0,
  }
];

const saladas = [
  {
    name: "Salada de Frutas",
    description: "Salada de frutas frescas",
    price: 15.0,
  },
  {
    name: "Salada de Folhas",
    description: "Salada de folhas verdes com frutas secas",
    price: 12.0,
  }
];

const bebidas = [
  {
    name: "Água",
    description: "Água mineral",
    price: 5.0,
  },
  {
    name: "Refrigerante",
    description: "Refrigerante de cola",
    price: 8.0,
  }
];

const sobremesas = [
  {
    name: "Torta de Chocolate",
    description: "Torta de chocolate com cobertura de chocolate",
    price: 18.0,
  },
  {
    name: "Mousse de Maracujá",
    description: "Mousse de maracujá com calda de maracujá",
    price: 15.0,
  }
];

const porcoesExtras = [
  {
    name: "Arroz",
    description: "Arroz branco",
    price: 5.0,
  },
  {
    name: "Feijão",
    description: "Feijão preto",
    price: 5.0,
  }
];

export default function InventoryPage() {
  const { user } = useAuth()
  const { canView, canCreate, canUpdate, canDelete } = usePermissions()
  const { t } = useI18n()
  const { sendNotification } = useNotifications()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Inventory Item Management State
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')

  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    price: 0,
    minQuantity: 0,
    description: '',
    supplier: '',
  })

  // Verificar si el usuario puede ver el inventario
  if (!canView('inventory')) {
    return <UnauthorizedAccess />
  }

  // Fetch Inventory Items
  const fetchInventoryItems = async () => {
    const establishmentId = user?.establishmentId

    if (!establishmentId) {
      setError(t("inventory.noEstablishmentError"))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Predefined categories to filter
      const categories = [
        'drinks', 'appetizers', 'main_courses', 
        'desserts', 'salads', 'sides'
      ]
      
      console.log('Fetching inventory for establishment:', establishmentId)
      console.log('Categories to fetch:', categories)
      
      // Fetch items for each category
      const itemsPromises = categories.map(async (category) => {
        const categoryRef = doc(
          db, 
          'restaurants', 
          establishmentId, 
          'inventory', 
          category
        )

        const itemsRef = collection(categoryRef, 'items')
        
        const itemsQuery = query(
          itemsRef,
          orderBy('name')
        )
        
        try {
          const itemsSnapshot = await getDocs(itemsQuery)
          
          console.log(`Items in category ${category}:`, itemsSnapshot.docs.length)
          
          return itemsSnapshot.docs.map(itemDoc => {
            const itemData = itemDoc.data()
            console.log(`Item in ${category}:`, itemData)
            return {
              uid: itemDoc.id,
              category: category,
              name: itemData.name || '',
              quantity: itemData.quantity || 0,
              unit: itemData.unit || '',
              price: itemData.price || 0,
              minQuantity: itemData.minQuantity || 0,
              description: itemData.description || '',
              supplier: itemData.supplier || '',
              createdAt: itemData.createdAt || new Date(),
              updatedAt: itemData.updatedAt || new Date(),
            } as InventoryItem
          })
        } catch (categoryErr) {
          console.error(`Error fetching items for category ${category}:`, categoryErr)
          return []
        }
      })

      // Combine all items from all categories
      const allItems = await Promise.all(itemsPromises)
      const flattenedItems = allItems.flat()

      console.log('Total items fetched:', flattenedItems.length)
      
      setInventoryItems(flattenedItems)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching inventory:", err)
      setError(t("inventory.fetchError"))
      setLoading(false)
    }
  }

  // Initialize data fetch
  useEffect(() => {
    if (user?.establishmentId) {
      fetchInventoryItems()
    }
  }, [user?.establishmentId])

  // Add/Edit Inventory Item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.establishmentId) {
      toast.error(t("commons.error"), {
        description: t("inventory.noEstablishmentError"),
      })
      return
    }

    try {
      const itemData: Partial<InventoryItem> = {
        ...formData,
        restaurantId: user.establishmentId,
        updatedAt: new Date(),
        createdAt: formData.createdAt || new Date()
      }

      // Verify category is selected
      if (!itemData.category) {
        toast.error(t("commons.error"), {
          description: t("inventory.noCategoryError"),
        })
        return
      }

      // Find the original category of the selected item
      const originalCategory = selectedItem?.category

      // Reference to the item in its original category
      const itemRef = originalCategory
        ? doc(
            db, 
            'restaurants', 
            user.establishmentId, 
            'inventory', 
            originalCategory,
            'items', 
            selectedItem?.uid
          )
        : null

      // If category changed, delete from old category and add to new
      if (originalCategory && originalCategory !== itemData.category) {
        // Delete from original category
        if (itemRef) await deleteDoc(itemRef)

        // Add to new category
        const newCategoryRef = doc(
          db, 
          'restaurants', 
          user.establishmentId, 
          'inventory', 
          itemData.category
        )
        const newItemsInCategoryRef = collection(newCategoryRef, 'items')
        const newDocRef = await addDoc(newItemsInCategoryRef, itemData)

        // Update local state
        setInventoryItems(prev => 
          prev
            .filter(item => item.uid !== selectedItem?.uid)
            .concat({
              ...itemData, 
              uid: newDocRef.id,
              category: itemData.category
            } as InventoryItem)
        )
      } else {
        if (dialogMode === 'add') {
          // Add new item to category
          const categoryRef = doc(
            db, 
            'restaurants', 
            user.establishmentId, 
            'inventory', 
            itemData.category
          )
          const itemsInCategoryRef = collection(categoryRef, 'items')
          const docRef = await addDoc(itemsInCategoryRef, itemData)
          
          // Update local state
          setInventoryItems(prev => [...prev, { 
            ...itemData, 
            uid: docRef.id 
          } as InventoryItem])
        } else {
          // Update in the same category
          if (itemRef) await updateDoc(itemRef, itemData)
          
          setInventoryItems(prev => 
            prev.map(item => 
              item.uid === selectedItem?.uid 
                ? { ...item, ...itemData } as InventoryItem 
                : item
            )
          )
        }
      }
      
      toast.success(t("inventory.saveSuccess"), {
        description: t("inventory.itemSaved"),
      })

      await sendNotification({
        title: t("inventory.push.itemSavedTitle"),
        message: t("inventory.push.itemSavedMessage", { name: itemData.name }),
        url: window.location.href,
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        price: 0,
        minQuantity: 0,
        description: '',
        supplier: '',
      })
      setIsDialogOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error("Error saving inventory item:", err)
      toast.error(t("commons.error"), {
        description: t("inventory.saveError"),
      })
    }
  }

  // Delete Inventory Item
  const handleDelete = async (itemId: string) => {
    if (!user?.establishmentId) {
      toast.error(t("commons.error"), {
        description: t("inventory.noEstablishmentError"),
      })
      return
    }

    try {
      const itemRef = doc(db, 'restaurants', user.establishmentId, 'inventory', itemId)
      await deleteDoc(itemRef)
      
      setInventoryItems(prev => prev.filter(item => item.uid !== itemId))
      
      toast.success(t("inventory.deleteSuccess"), {
        description: t("inventory.itemDeleted"),
      })

      await sendNotification({
        title: t("inventory.push.itemDeletedTitle"),
        message: t("inventory.push.itemDeletedMessage"),
        url: window.location.href,
      });
    } catch (err) {
      console.error("Error deleting inventory item:", err)
      toast.error(t("commons.error"), {
        description: t("inventory.deleteError"),
      })
    }
  }

  // Filtered and Sorted Inventory
  const filteredInventory = useMemo(() => {
    return inventoryItems.sort((a, b) => 
      a.quantity < b.quantity ? 1 : -1
    )
  }, [inventoryItems])

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return inventoryItems.filter(item => 
      item.quantity <= (item.minQuantity || 0)
    )
  }, [inventoryItems])

  // First, create a function to check if user can perform any actions
  const canPerformActions = canUpdate('inventory') || canDelete('inventory');

  useEffect(() => {
    // Notificar productos con bajo stock
    if (lowStockItems.length > 0) {
      toast.warning(`${lowStockItems.length} productos con bajo stock`)

      // Notificación push solo si hay items críticos
      const criticalItems = lowStockItems.filter(item => item.quantity <= (item.minQuantity || 0) / 2)
      if (criticalItems.length > 0) {
        sendNotification({
          title: "¡Alerta de Inventario!",
          message: `${criticalItems.length} productos requieren atención inmediata`,
          url: '/inventory'
        })
      }
    }
  }, [lowStockItems])

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t("inventory.title")}</CardTitle>
              <CardDescription>{t("inventory.subtitle")}</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                {canCreate('inventory') && (
                  <Button 
                    onClick={() => {
                      setDialogMode('add')
                      setFormData({})
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> {t("inventory.addItem")}
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {dialogMode === 'add' 
                      ? t("inventory.addItemTitle") 
                      : t("inventory.editItemTitle")
                    }
                  </DialogTitle>
                  <DialogDescription>
                    {dialogMode === 'add' 
                      ? t("inventory.addItemDescription") 
                      : t("inventory.editItemDescription")
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Form fields for inventory item */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("inventory.name")}</Label>
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          name: e.target.value
                        }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("inventory.category")}</Label>
                      <Select
                        value={formData.category || ''}
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev, 
                          category: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("inventory.selectCategory")} />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Add your categories here */}
                          <SelectItem value="drinks">{t('dashboard.salesByCategory.categories.drinks')}</SelectItem>
                          <SelectItem value="appetizers">{t('dashboard.salesByCategory.categories.appetizers')}</SelectItem>
                          <SelectItem value="main_courses">{t('dashboard.salesByCategory.categories.main_courses')}</SelectItem>
                          <SelectItem value="desserts">{t('dashboard.salesByCategory.categories.desserts')}</SelectItem>
                          <SelectItem value="salads">{t('dashboard.salesByCategory.categories.salads')}</SelectItem>
                          <SelectItem value="sides">{t('dashboard.salesByCategory.categories.sides')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* More form fields... */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("inventory.quantity")}</Label>
                      <Input
                        value={formData.quantity || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          quantity: Number(e.target.value)
                        }))}
                        type="number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("inventory.unit")}</Label>
                      <Input 
                        value={formData.unit || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          unit: e.target.value
                        }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("inventory.minQuantity")}</Label>
                      <Input
                        value={formData.minQuantity || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          minQuantity: Number(e.target.value)
                        }))}
                        type="number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("inventory.price")}</Label>
                      <Input
                        value={formData.price || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          price: Number(e.target.value)
                        }))}
                        type="number"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("inventory.description")}</Label>
                    <Input 
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        description: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("inventory.supplier")}</Label>
                    <Input 
                      value={formData.supplier || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        supplier: e.target.value
                      }))}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {dialogMode === 'add' 
                        ? t("inventory.add") 
                        : t("inventory.update")
                      }
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 text-yellow-600" />
                <p className="text-yellow-800">
                  {t("inventory.lowStockAlert", { count: lowStockItems.length })}
                </p>
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.name")}</TableHead>
                <TableHead>{t("inventory.category")}</TableHead>
                <TableHead>{t("inventory.quantity")}</TableHead>
                <TableHead>{t("inventory.unit")}</TableHead>
                {/* Only show actions column if user has permissions */}
                {canPerformActions && (
                  <TableHead>{t("inventory.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.uid}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{t(`inventory.categories.${item.category}`)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        item.quantity <= (item.minQuantity || 0) 
                          ? "destructive" 
                          : "default"
                      }
                    >
                      {item.quantity} {item.unit}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  {/* Only show actions cell if user has permissions */}
                  {canPerformActions && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {canUpdate('inventory') && (
                          <Button 
                            size="icon" 
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item)
                              setFormData(item)
                              setDialogMode('edit')
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete('inventory') && (
                          <Button 
                            size="icon" 
                            variant="destructive"
                            onClick={() => handleDelete(item.uid)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}