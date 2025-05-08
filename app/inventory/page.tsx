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
  increment
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
import { Plus, Search, AlertTriangle, Edit, Trash2, PlusCircle } from "lucide-react"
import { usePermissions } from "@/components/permissions-provider"
import { UnauthorizedAccess } from "@/components/unauthorized-access"
import { useNotifications } from "@/hooks/useNotifications"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"


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
    controlsStock: false,
    lowStockThreshold: 0,
  })

  // Estados para el diálogo de añadir stock
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [selectedItemForStockAdd, setSelectedItemForStockAdd] = useState<InventoryItem | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(0);
  const [isSavingStock, setIsSavingStock] = useState(false);

  // Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState('');

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
          
          return itemsSnapshot.docs.map(itemDoc => {
            const itemData = itemDoc.data()
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
              controlsStock: itemData.controlsStock || false,
              lowStockThreshold: itemData.lowStockThreshold || 0,
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
        controlsStock: false,
        lowStockThreshold: 0,
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
      item.controlsStock && // Solo considerar si controla stock
      item.quantity <= (item.lowStockThreshold !== undefined ? item.lowStockThreshold : item.minQuantity) && 
      (item.lowStockThreshold !== undefined ? item.lowStockThreshold : item.minQuantity) > 0
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

  const handleSave = async () => {
    if (!user || !user.establishmentId) {
      toast.error(t("inventory.noEstablishmentErrorMsg"));
      return;
    }

    // Basic validation (example)
    if (!formData.name || !formData.category) {
      toast.error(t("inventory.fillRequiredFieldsMsg"));
      return;
    }

    // Prepare data for saving
    let dataToSave: Partial<InventoryItem> = {
      ...formData,
      name: formData.name!,
      category: formData.category!,
      price: Number(formData.price) || 0, // Ensure price is a number, default to 0
    };

    if (formData.controlsStock) {
      dataToSave.quantity = Number(formData.quantity) || 0;
      dataToSave.minQuantity = Number(formData.minQuantity) || 0;
      dataToSave.unit = formData.unit || undefined; // Keep as is or set to undefined if empty
      dataToSave.lowStockThreshold = Number(formData.lowStockThreshold) || 0;
    } else {
      dataToSave.quantity = 0;
      dataToSave.minQuantity = 0;
      dataToSave.unit = undefined; // Explicitly set to undefined if not controlling stock
      dataToSave.lowStockThreshold = 0; // Or undefined
    }

    // Remove id if it exists to avoid issues with addDoc, or ensure it's used for updateDoc correctly
    if (dialogMode === 'add') {
      delete dataToSave.id; // Firestore generates ID on addDoc
      delete dataToSave.uid; // uid should also be managed carefully, often same as id or set by backend
    }

    setLoading(true);
    try {
      if (dialogMode === 'edit' && selectedItem && selectedItem.id) {
        const itemRef = doc(db, "restaurants", user.establishmentId, "inventory", selectedItem.category, "items", selectedItem.id);
        await updateDoc(itemRef, {
          ...dataToSave,
          updatedAt: serverTimestamp(),
        });
        toast.success(t("inventory.itemUpdatedMsg"));
      } else {
        // For adding, ensure category is part of the path
        if (!dataToSave.category) {
          toast.error(t("inventory.categoryRequiredMsg"));
          setLoading(false);
          return;
        }
        const itemsCollectionRef = collection(db, "restaurants", user.establishmentId, "inventory", dataToSave.category, "items");
        await addDoc(itemsCollectionRef, {
          ...dataToSave,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // restaurantId: user.establishmentId, // Already part of path, but can be good for denormalization/rules
        });
        toast.success(t("inventory.itemAddedMsg"));
      }
      fetchInventoryItems(); // Refresh list
      setIsDialogOpen(false); // Close dialog
    } catch (error) {
      console.error("Error saving item: ", error);
      toast.error(t("inventory.errorSavingItemMsg"));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAddStock = async () => {
    if (!selectedItemForStockAdd || !selectedItemForStockAdd.uid || !selectedItemForStockAdd.category) { 
      toast.error(t("inventory.errorNoItemSelectedToAddStock"));
      return;
    }
    if (!user || !user.establishmentId) {
      toast.error(t("inventory.noEstablishmentErrorMsg"));
      return;
    }
    if (quantityToAdd <= 0) {
      toast.error(t("inventory.errorQuantityToAddPositive"));
      return;
    }

    setIsSavingStock(true);
    try {
      const itemRef = doc(db, "restaurants", user.establishmentId, "inventory", selectedItemForStockAdd.category, "items", selectedItemForStockAdd.uid); 

      await updateDoc(itemRef, {
        quantity: increment(quantityToAdd),
        updatedAt: serverTimestamp()
      });

      toast.success(t("inventory.stockAddedSuccessfullyMsg"));
      fetchInventoryItems(); // Refresh list
      setIsAddStockDialogOpen(false); // Close dialog
      setSelectedItemForStockAdd(null); // Clear selected item
      setQuantityToAdd(0); // Reset quantity to add
    } catch (error) {
      console.error("Error adding stock: ", error);
      toast.error(t("inventory.errorAddingStockMsg"));
    } finally {
      setIsSavingStock(false);
    }
  };

  // Filtrar inventario basado en searchQuery en múltiples campos
  const filteredInventoryItems = inventoryItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query) ||
      (item.supplier || '').toLowerCase().includes(query) ||
      (item.unit || '').toLowerCase().includes(query)
    );
  });

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
                  <div className="flex items-center space-x-2 py-2">
                    <Switch
                      id="controlsStock"
                      checked={!!formData.controlsStock} // Asegura que sea booleano
                      onCheckedChange={(checked) => // Switch pasa un booleano directamente
                        setFormData(prev => {
                          if (!checked) { // Si el control de stock se desactiva
                            return {
                              ...prev,
                              controlsStock: false,
                              quantity: 0,
                              minQuantity: 0,
                              unit: undefined,
                              lowStockThreshold: 0,
                            };
                          }                     // Si se activa
                          return { ...prev, controlsStock: true };
                        })
                      }
                    />
                    <Label htmlFor="controlsStock">{t("inventory.controlsStockLabel")}</Label>
                  </div>
                  {formData.controlsStock && (
                    <>
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
                          <Label>{t("inventory.lowStockThreshold")}</Label>
                          <Input
                            value={formData.lowStockThreshold || 0}
                            onChange={(e) => setFormData(prev => ({
                              ...prev, 
                              lowStockThreshold: Number(e.target.value)
                            }))}
                            type="number"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
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
          {/* Sección de Búsqueda */}
          <div className="relative w-full max-w-md mb-6 mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('inventory.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

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
                <TableHead className="py-3 px-1 w-12 sm:w-16 md:w-auto md:px-2 lg:px-3">{t("inventory.unit")}</TableHead>
                {/* Only show actions column if user has permissions */}
                {canPerformActions && (
                  <TableHead>{t("inventory.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventoryItems.length > 0 ? (
                filteredInventoryItems.map((item) => (
                  <TableRow key={item.uid} className={item.controlsStock && typeof item.lowStockThreshold === "number" && item.quantity < item.lowStockThreshold ? 'bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800' : 'hover:bg-muted/50'}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{t(`inventory.categories.${item.category}`)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          item.controlsStock && // Solo considerar si controla stock
                          item.quantity <= (item.lowStockThreshold !== undefined ? item.lowStockThreshold : item.minQuantity) && 
                          (item.lowStockThreshold !== undefined ? item.lowStockThreshold : item.minQuantity) > 0
                            ? "destructive" 
                            : "default"
                        }
                      >
                        {item.quantity} {item.unit}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-1 w-12 sm:w-16 md:w-auto md:px-2 lg:px-3">{item.unit}</TableCell>
                    {/* Only show actions cell if user has permissions */}
                    {canPerformActions && (
                      <TableCell className="py-3 px-1 md:px-2 lg:px-3 text-right">
                        <div className="flex flex-col sm:flex-row sm:space-x-2 items-end space-y-1 sm:space-y-0">
                          {canUpdate('inventory') && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                      setSelectedItem(item)
                                      setFormData(item)
                                      setDialogMode('edit')
                                      setIsDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('inventory.editBtn')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {item.controlsStock && canUpdate('inventory') && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                      setSelectedItemForStockAdd(item);
                                      setQuantityToAdd(0); // Resetear cantidad a añadir
                                      setIsAddStockDialogOpen(true);
                                    }}
                                  >
                                    <PlusCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('inventory.addStockBtn')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {canDelete('inventory') && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(item.uid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={canPerformActions ? 5 : 4} className="text-center py-4">
                    {t("inventory.noItemsFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogo para añadir stock */}
      <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('inventory.addStockTo')} {selectedItemForStockAdd?.name}
            </DialogTitle>
            <DialogDescription>
              {t('inventory.currentQuantity')}: {selectedItemForStockAdd?.quantity} {selectedItemForStockAdd?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="quantityToAdd">{t('inventory.quantityToAddLabel')}</Label>
            <Input 
              id="quantityToAdd" 
              type="number" 
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(Number(e.target.value))}
              placeholder={t('inventory.enterQuantityPlaceholder')}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStockDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmAddStock} disabled={isSavingStock}>
              {isSavingStock ? t('common.saving') : t('inventory.addStockConfirmBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}