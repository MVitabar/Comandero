"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Inventory item interface
interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  unit: string
  minimumStock: number
  price: number
  createdAt: any
  updatedAt: any
}

// Inventory Categories Definition
const INVENTORY_CATEGORIES = [
  "bebidas",           // Drinks
  "entradas",          // Starters
  "platos_principales", // Main Courses
  "sobremesas",        // Desserts
  "porciones_extra"    // Extra Portions
] as const

type InventoryCategory = typeof INVENTORY_CATEGORIES[number]

export default function InventoryPage() {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { toast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: 0,
    unit: "",
    minimumStock: 0,
    price: 0,
  })

  const fetchItems = useCallback(async () => {
    if (!db) return

    try {
      setLoading(true)
      const allItems: InventoryItem[] = []

      // Fetch items from each category collection
      for (const category of INVENTORY_CATEGORIES) {
        const inventoryItemsRef = collection(db, `categories/${category}/inventoryItems`)
        const querySnapshot = await getDocs(inventoryItemsRef)

        querySnapshot.forEach((doc) => {
          const item = { 
            id: doc.id, 
            ...doc.data(),
            category 
          } as InventoryItem
          allItems.push(item)
        })
      }

      setItems(allItems)
    } catch (error) {
      console.error("Error fetching inventory items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [db, t, toast])

  useEffect(() => {
    fetchItems()
  }, [db])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "currentStock" || name === "minimumStock" || name === "price" ? Number.parseFloat(value) : value,
    })
  }

  const handleAddItem = async () => {
    if (!db) return

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.unit) {
        toast({
          title: t("error"),
          description: t("missingRequiredFields"),
          variant: "destructive"
        })
        return
      }

      // Ensure the selected category is valid
      if (!INVENTORY_CATEGORIES.includes(formData.category as InventoryCategory)) {
        toast({
          title: t("error"),
          description: t("invalidCategory"),
          variant: "destructive"
        })
        return
      }

      // Prepare inventory item data
      const newItem: Omit<InventoryItem, 'id'> = {
        name: formData.name,
        category: formData.category as InventoryCategory,
        currentStock: formData.currentStock,
        unit: formData.unit,
        minimumStock: formData.minimumStock,
        price: formData.price,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Reference to the specific category's inventory items collection
      const inventoryItemsRef = collection(
        db, 
        `categories/${formData.category}/inventoryItems`
      )

      // Add the new inventory item
      await addDoc(inventoryItemsRef, newItem)

      // Success toast
      toast({
        title: t("success"),
        description: `${formData.name} ${t("addedSuccessfully")}`,
        variant: "default"
      })

      // Refresh items
      fetchItems()

      // Reset form
      setFormData({
        name: "",
        category: "",
        currentStock: 0,
        unit: "",
        minimumStock: 0,
        price: 0
      })

      // Close dialog
      setIsAddDialogOpen(false)

    } catch (error) {
      console.error("Error adding inventory item:", error)
      toast({
        title: t("error"),
        description: t("failedToAddInventoryItem"),
        variant: "destructive"
      })
    }
  }

  const handleEditItem = async () => {
    if (!db || !selectedItem) return

    try {
      const itemRef = doc(db, `categories/${selectedItem.category}/inventoryItems`, selectedItem.id)
      await updateDoc(itemRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      })

      // Update local state
      setItems(
        items.map((item) => (item.id === selectedItem.id ? { ...item, ...formData, updatedAt: serverTimestamp() } : item)),
      )

      toast({
        title: "Item Updated",
        description: `${formData.name} has been updated`,
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string, category: string) => {
    if (!db) return

    try {
      const itemRef = doc(db, `categories/${category}/inventoryItems`, id)
      await deleteDoc(itemRef)

      // Update local state
      setItems(items.filter((item) => item.id !== id))

      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted",
      })
    } catch (error) {
      console.error("Error deleting inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      minimumStock: item.minimumStock,
      price: item.price,
    })
    setIsEditDialogOpen(true)
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const lowStockItems = filteredItems.filter((item) => item.currentStock <= item.minimumStock)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("inventory")}</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addItem")}
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="font-medium text-amber-800">
                {lowStockItems.length} {lowStockItems.length === 1 ? "item" : "items"} with low stock
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("inventory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : filteredItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Min. Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.minimumStock}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.currentStock <= item.minimumStock ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">Low Stock</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id, item.category)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">No inventory items found</div>
          )}
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addItem")}</DialogTitle>
            <DialogDescription>Add a new item to your inventory</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("category")}</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      category: value
                    }))
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {INVENTORY_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {t(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Quantity</Label>
                <Input
                  id="currentStock"
                  name="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" value={formData.unit} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumStock">Minimum Quantity</Label>
                <Input
                  id="minimumStock"
                  name="minimumStock"
                  type="number"
                  value={formData.minimumStock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update inventory item details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">{t("category")}</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      category: value
                    }))
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {INVENTORY_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {t(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-currentStock">Quantity</Label>
                <Input
                  id="edit-currentStock"
                  name="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input id="edit-unit" name="unit" value={formData.unit} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-minimumStock">Minimum Quantity</Label>
                <Input
                  id="edit-minimumStock"
                  name="minimumStock"
                  type="number"
                  value={formData.minimumStock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
