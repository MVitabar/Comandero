"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  runTransaction 
} from "firebase/firestore"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Loader2, Plus, Minus, Trash } from "lucide-react"

const INVENTORY_CATEGORIES = [
  "bebidas",           // Drinks
  "entradas",          // Starters
  "platos_principales", // Main Courses
  "sobremesas",        // Desserts
  "porciones_extra"    // Extra Portions
] as const

type InventoryCategory = typeof INVENTORY_CATEGORIES[number]

interface OrderFormProps {
  onSubmit: (orderData: any) => void
  onCancel: () => void
  initialData?: any
  table: any
}

interface MenuItem {
  id: string
  name: string
  category: InventoryCategory
  price: number
  description?: string
  inventoryItemId?: string
  stockQuantity?: number
}

interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  currentStock: number
  unit: string
  minimumStock: number
  price?: number
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
  dietaryRestrictions?: string[]
}

export function OrderForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  table 
}: OrderFormProps) {
  const { db } = useFirebase()
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>("bebidas")
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined)
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialData?.items || [])
  const [specialRequests, setSpecialRequests] = useState(initialData?.specialRequests || "")
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialData?.dietaryRestrictions || [])
  
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [itemDietaryRestrictions, setItemDietaryRestrictions] = useState<string[]>([])

  // Fetch menu items and inventory with category-based collections
  const fetchMenuAndInventoryItems = useCallback(async () => {
    if (!db) return

    try {
      setLoading(true)
      const menuData: MenuItem[] = []
      const inventoryData: InventoryItem[] = []
      const uniqueCategories = new Set<InventoryCategory>()

      // Fetch menu items from each category collection
      for (const category of INVENTORY_CATEGORIES) {
        const menuRef = collection(db, `categories/${category}/menuItems`)
        const menuSnapshot = await getDocs(menuRef)

        // If no menu items exist, convert inventory items to menu items
        if (menuSnapshot.empty) {
          const inventoryRef = collection(db, `categories/${category}/inventoryItems`)
          const inventorySnapshot = await getDocs(inventoryRef)

          inventorySnapshot.forEach((doc) => {
            const inventoryItem = { 
              id: doc.id, 
              category,
              ...doc.data() 
            } as InventoryItem

            // Convert inventory item to menu item
            const menuItem: MenuItem = {
              id: inventoryItem.id,
              name: inventoryItem.name,
              category: inventoryItem.category,
              price: inventoryItem.price || 0,
              inventoryItemId: inventoryItem.id,
              stockQuantity: inventoryItem.currentStock,
              description: `${inventoryItem.unit} - Stock: ${inventoryItem.currentStock}`
            }

            menuData.push(menuItem)
            uniqueCategories.add(category)
          })
        } else {
          // If menu items exist, fetch them normally
          menuSnapshot.forEach((doc) => {
            const item = { 
              id: doc.id, 
              category,
              ...doc.data() 
            } as MenuItem

            menuData.push(item)
            uniqueCategories.add(category)
          })
        }

        // Always fetch inventory items
        const inventoryRef = collection(db, `categories/${category}/inventoryItems`)
        const inventorySnapshot = await getDocs(inventoryRef)

        inventorySnapshot.forEach((doc) => {
          const item = { 
            id: doc.id, 
            category,
            ...doc.data() 
          } as InventoryItem

          inventoryData.push(item)
        })
      }

      // Set state with fetched data
      setMenuItems(menuData)
      setInventoryItems(inventoryData)
      
      // Convert Set to Array and set categories
      const categoriesArray = Array.from(uniqueCategories)
      setCategories(categoriesArray)

      // Set initial category to the first available category or default to "bebidas"
      const initialCategory = categoriesArray.length > 0 
        ? categoriesArray[0] 
        : "bebidas"
      setSelectedCategory(initialCategory)

      // If items exist in the initial category, select the first item
      const initialCategoryItems = menuData.filter(item => item.category === initialCategory)
      if (initialCategoryItems.length > 0) {
        setSelectedItemId(initialCategoryItems[0].id)
      }

    } catch (error) {
      console.error("Error fetching menu and inventory items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch menu and inventory items",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [db, toast])

  // Add item to order
  const addItemToOrder = () => {
    const selectedMenuItem = menuItems.find(item => item.id === selectedItemId)
    if (!selectedMenuItem) return

    // Check inventory availability
    const requiredInventoryItems = inventoryItems.filter(
      inv => selectedMenuItem.inventoryItemId === inv.id
    )

    const canAddItem = requiredInventoryItems.every(
      inv => inv.currentStock >= quantity
    )

    if (!canAddItem) {
      toast({
        title: t("insufficientStock"),
        description: t("notEnoughInventoryForItem"),
        variant: "destructive"
      })
      return
    }

    const newOrderItem: OrderItem = {
      id: selectedItemId as string,
      name: selectedMenuItem.name,
      price: selectedMenuItem.price,
      quantity,
      notes,
      dietaryRestrictions: itemDietaryRestrictions
    }

    setOrderItems(prev => [...prev, newOrderItem])
    
    // Reset form
    setQuantity(1)
    setNotes("")
    setItemDietaryRestrictions([])
  }

  // Create order and update inventory
  const handleCreateOrder = async () => {
    if (!db || !user || orderItems.length === 0) return

    try {
      // Start a transaction to ensure atomic updates
      await runTransaction(db, async (transaction) => {
        // Calculate totals with robust fallback to 0
        const subtotal = orderItems.reduce((total, item) => {
          const itemPrice = Number(item.price) || 0
          const itemQuantity = Number(item.quantity) || 1
          return total + (itemPrice * itemQuantity)
        }, 0)
        
        // Prepare inventory updates
        const inventoryUpdates: { ref: any; currentStock: number }[] = []

        // First, check inventory availability and prepare updates
        for (const item of orderItems) {
          const menuItem = menuItems.find(mi => mi.id === item.id)
          if (menuItem?.inventoryItemId) {
            const inventoryItemRef = doc(db, `categories/${menuItem.category}/inventoryItems`, menuItem.inventoryItemId)
            
            // Fetch current inventory item
            const inventoryItemSnap = await transaction.get(inventoryItemRef)
            const currentStock = inventoryItemSnap.data()?.currentStock || 0
            const requiredQuantity = Number(item.quantity) || 1

            // Check if enough stock is available
            if (currentStock < requiredQuantity) {
              throw new Error(`Insufficient stock for ${menuItem.name}`)
            }

            // Prepare inventory update
            inventoryUpdates.push({
              ref: inventoryItemRef,
              currentStock: Math.max(0, currentStock - requiredQuantity)
            })
          }
        }

        // Prepare order document with default values and optional information
        const orderData = {
          tableId: table?.id || "",
          tableNumber: table?.number || "",
          items: orderItems.map(item => ({
            ...item,
            id: item.id || "",
            name: item.name || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            notes: item.notes || "",
            dietaryRestrictions: item.dietaryRestrictions || []
          })),
          status: "ordering",
          subtotal: Number(subtotal.toFixed(2)),
          createdBy: user.uid || "",
          createdAt: new Date(),
          specialRequests: specialRequests || "",
          dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : [],
          isDelivery: false,
          isPaid: false
        }

        // Create order document
        const orderRef = await addDoc(collection(db, "orders"), orderData)

        // Update inventory after order creation
        for (const update of inventoryUpdates) {
          transaction.update(update.ref, {
            currentStock: update.currentStock
          })
        }
      })

      // Success toast
      toast({
        title: t("orderCreated"),
        description: t("orderSuccessfullyAdded"),
        variant: "default"
      })

      // Calculate subtotal outside of transaction
      const calculatedSubtotal = orderItems.reduce((total, item) => {
        const itemPrice = Number(item.price) || 0
        const itemQuantity = Number(item.quantity) || 1
        return total + (itemPrice * itemQuantity)
      }, 0)

      // Reset order items and related states
      setOrderItems([])
      setSpecialRequests("")
      setDietaryRestrictions([])

      // Call parent submit handler
      onSubmit?.({
        mapId: table?.mapId || "",
        tableId: table?.id || "",
        tableNumber: table?.number || "",
        items: orderItems,
        total: Number(calculatedSubtotal.toFixed(2)),
        subtotal: Number(calculatedSubtotal.toFixed(2)),
        specialRequests: specialRequests || "",
        dietaryRestrictions: dietaryRestrictions || []
      })
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: t("errorCreatingOrder"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      })
    }
  }

  // Fetch items on component mount
  useEffect(() => {
    fetchMenuAndInventoryItems()
  }, [fetchMenuAndInventoryItems])

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4 overflow-y-auto pr-2">
          <div>
            <Label>{t("category")}</Label>
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => {
                const category = value as InventoryCategory
                setSelectedCategory(category)
                // Reset item selection when category changes
                setSelectedItemId(undefined)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {t(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div>
              <Label>{t("menuItem")}</Label>
              <Select 
                value={selectedItemId} 
                onValueChange={setSelectedItemId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectMenuItem")} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {menuItems
                    .filter(item => item.category === selectedCategory)
                    .map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - ${item.price.toFixed(2)}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>{t("quantity")}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                className="text-center"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{t("itemNotes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("itemNotesPlaceholder")}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("itemDietaryRestrictions")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {["gluten-free", "lactose-free", "vegan", "vegetarian", "celiac-friendly"].map((restriction) => (
                <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox 
                    id={restriction}
                    checked={itemDietaryRestrictions.includes(restriction)}
                    onCheckedChange={(checked) => {
                      setItemDietaryRestrictions(prev => 
                        checked 
                          ? [...prev, restriction]
                          : prev.filter(r => r !== restriction)
                      )
                    }}
                  />
                  <Label htmlFor={restriction}>{restriction}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="button" onClick={addItemToOrder} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {t("addToOrder")}
          </Button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2">
          <div>
            <h3 className="text-lg font-medium mb-2">{t("orderSummary")}</h3>
            {orderItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("item")}</TableHead>
                    <TableHead className="text-right">{t("quantity")}</TableHead>
                    <TableHead className="text-right">{t("price")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.notes && <div className="text-xs text-muted-foreground">{item.notes}</div>}
                          {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.dietaryRestrictions.map((restriction) => (
                                <div key={restriction} className="text-xs px-1.5 py-0.5 bg-muted rounded-sm">
                                  {restriction}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => {
                            const newOrderItems = [...orderItems]
                            newOrderItems.splice(index, 1)
                            setOrderItems(newOrderItems)
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">{t("noItemsInOrder")}</div>
            )}

            {orderItems.length > 0 && (
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>{t("total")}</span>
                <span>${orderItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">{t("specialRequests")}</Label>
            <Textarea
              id="specialRequests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder={t("specialRequestsPlaceholder")}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button 
          type="button" 
          onClick={handleCreateOrder} 
          disabled={orderItems.length === 0}
        >
          {t("createOrder")}
        </Button>
      </div>
    </div>
  )
}
