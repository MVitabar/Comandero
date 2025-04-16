"use client"

import { useState, useEffect, useCallback, ChangeEvent } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { 
  doc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore"
import { Loader2, Plus, Minus, Trash, QrCode } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import QRCode from 'qrcode.react'
import { 
  OrderFormProps, 
  OrderItem, 
  MenuItem, 
  MenuItemCategory, 
  BaseOrderStatus, 
  Order,
  User,
  RestaurantTable,
  PaymentInfo,
  PaymentMethod,
  TableItem
} from "@/types"
import { 
  checkInventoryAvailability, 
  reduceInventoryStock,
  InventoryItem 
} from '@/lib/inventory-utils'

export function OrderForm({ 
  initialTableNumber, 
  onOrderCreated,
  user: propUser,
  table
}: { 
  initialTableNumber?: string, 
  onOrderCreated?: (order: Order) => void | Promise<any>,
  user?: User | null,
  table?: RestaurantTable
}) {
  const { db } = useFirebase()
  const { user: contextUser } = useAuth()
  const user = propUser || contextUser
  const { t } = useI18n()

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-destructive">
          {t("orders.errors.unauthorized")}
        </p>
      </div>
    )
  }

  // Use table prop if available, otherwise use initialTableNumber
  const [tableNumber, setTableNumber] = useState(table?.name || initialTableNumber || '')

  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<MenuItemCategory>(MenuItemCategory.Appetizer)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [specialRequests, setSpecialRequests] = useState("")
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")

  const [selectedTable, setSelectedTable] = useState<{
    uid: string
    mapId: string
    number: number
  } | null>(null)
  const [tables, setTables] = useState<{uid: string, mapId: string, number: number}[]>([])

  const [selectedItem, setSelectedItem] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [itemDietaryRestrictions, setItemDietaryRestrictions] = useState<string[]>([])

  const [showQRCode, setShowQRCode] = useState(false)
  const [menuUrl, setMenuUrl] = useState("https://v0-restaurante-milenio-website.vercel.app/")

  const [orderType, setOrderType] = useState<'table' | 'counter' | 'takeaway'>('table')

  const filteredMenuItems = menuItems.filter(
    item => item.category === selectedCategory
  )

  const handleAddItem = () => {
    const menuItem = menuItems.find((item) => item.uid === selectedItem)
    if (!menuItem) {
      toast({
        title: t("orders.errors.noItemSelected"),
        variant: "destructive"
      });
      return;
    }

    if (quantity < 1) {
      toast({
        title: t("orders.errors.invalidQuantity"),
        variant: "destructive"
      });
      return;
    }

    if (menuItem.stock === undefined || menuItem.stock === null) {
      toast({
        title: t("orders.errors.stockUnavailable"),
        description: "No se pudo determinar el stock del item",
        variant: "destructive"
      });
      return;
    }

    if (menuItem.stock < quantity) {
      toast({
        title: t("orders.errors.insufficientStock"),
        description: `Solo hay ${menuItem.stock} unidades disponibles`,
        variant: "destructive"
      });
      return;
    }

    const newItem: OrderItem = {
      id: `temp-${Date.now()}`,
      itemId: menuItem.uid,
      name: menuItem.name,
      category: menuItem.category || 'uncategorized', // Añadir valor por defecto
      price: menuItem.price,
      quantity: quantity,
      unit: menuItem.unit || '', // Añadir valor por defecto para unit
      stock: menuItem.stock || 0, // Añadir valor por defecto para stock
      customDietaryRestrictions: itemDietaryRestrictions,
      notes: notes
    };

    const existingItemIndex = orderItems.findIndex(
      (item) =>
        item.itemId === menuItem.uid &&
        JSON.stringify(item.customDietaryRestrictions || []) === JSON.stringify(itemDietaryRestrictions || []) &&
        item.notes === notes
    );

    if (existingItemIndex >= 0) {
      const totalRequestedQuantity = orderItems[existingItemIndex].quantity + quantity;
      if (totalRequestedQuantity > menuItem.stock) {
        toast({
          title: t("orders.errors.stockExceeded"),
          description: `Superaría el stock disponible de ${menuItem.stock} unidades`,
          variant: "destructive"
        });
        return;
      }

      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, newItem]);
    }

    setQuantity(1);
    setNotes("");
    setItemDietaryRestrictions([]);
  }

  // Memoize fetchMenuItems to prevent unnecessary re-renders
  const memoizedFetchMenuItems = useCallback(async () => {
    console.group('fetchMenuItems Debug')
    console.log('DB:', db)
    console.log('User:', user)

    if (!db || !user) {
      console.log('Missing db or user, cannot fetch menu items')
      console.groupEnd()
      setLoading(false)
      return;
    }

    // Add type-safe check for establishmentId
    if (!user.establishmentId) {
      console.error('No establishment ID found for user')
      toast({
        title: "Inventory Error",
        description: "Unable to load inventory: No establishment ID found",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const menuItems: MenuItem[] = []

      // Fetch inventory reference using establishmentId
      const inventoryRef = collection(db, 'restaurants', user.establishmentId, 'inventory')
      console.log('Inventory Reference:', inventoryRef.path)

      // Fetch all category documents
      const categoriesSnapshot = await getDocs(inventoryRef)
      console.log('Categories Found:', categoriesSnapshot.docs.map(doc => doc.id))

      // Iterate through categories
      for (const categoryDoc of categoriesSnapshot.docs) {
        const category = categoryDoc.id
        console.log(`Processing Category: ${category}`)

        // Reference to items subcollection for this category
        const itemsRef = collection(db, 'restaurants', user.establishmentId, 'inventory', category, 'items')
        
        // Fetch items for this category
        const itemsSnapshot = await getDocs(itemsRef)
        console.log(`Items in ${category}:`, itemsSnapshot.docs.length)

        // Process each item in the category
        const categoryItems = itemsSnapshot.docs.map(itemDoc => {
          const itemData = itemDoc.data()
          console.group('Item Data Debug')
          console.log('Raw Item Data:', itemData)
          
          // Determine stock, with more flexible parsing
          let stock = 0
          if (typeof itemData.quantity === 'number') {
            stock = itemData.quantity
          } else if (typeof itemData.quantity === 'string') {
            const parsedStock = parseInt(itemData.quantity, 10)
            stock = !isNaN(parsedStock) ? parsedStock : 0
          }

          // Create menu item
          const menuItem: MenuItem = {
            uid: itemDoc.id,
            name: itemData.name || 'Unnamed Item',
            category: category as MenuItemCategory,
            price: Number(itemData.price || 0),
            stock: stock,
            unit: itemData.unit || '',
            description: itemData.description || '',
            // Add any other relevant fields
          }

          console.log('Processed Menu Item:', menuItem)
          console.groupEnd()

          return menuItem
        })

        // Add category items to menu items
        menuItems.push(...categoryItems)
      }

      console.log('Total Menu Items:', menuItems.length)
      setMenuItems(menuItems)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      setLoading(false)
      toast({
        title: t("orders.errors.fetchMenuItemsFailed"),
        description: error instanceof Error ? error.message : "Não foi possível carregar os itens do menu",
        variant: "destructive"
      })
    }
  }, [db, user, t])

  // Ensure fetchMenuItems is called when db and user are available
  useEffect(() => {
    console.log('useEffect triggered for fetchMenuItems')
    if (db && user) {
      memoizedFetchMenuItems()
    }
  }, [memoizedFetchMenuItems, db, user])

  // Fetch tables
  const fetchTables = async () => {
    if (!db || !user) return

    try {
      const restaurantId = user?.uid || ''

      // Fetch all table maps for the restaurant
      const tableMapsRef = collection(db, `restaurants/${restaurantId}/tableMaps`)
      const tableMapsSnapshot = await getDocs(tableMapsRef)

      const availableTables: { uid: string, mapId: string, number: number }[] = []

      // Iterate through table maps and collect available tables
      tableMapsSnapshot.docs.forEach(mapDoc => {
        const tableMapData = mapDoc.data()
        const tablesInMap = tableMapData?.layout?.tables || []

        const mapAvailableTables = tablesInMap
          .filter((table: TableItem) => 
            table.status === 'available' || 
            table.status === 'ordering'
          )
          .map((table: TableItem) => ({
            uid: table.id,
            mapId: mapDoc.id,
            number: table.name 
              ? parseInt(table.name.replace('Mesa ', ''), 10) 
              : table.number || 0
          }))

        availableTables.push(...mapAvailableTables)
      })

      setTables(availableTables)
      
      if (availableTables.length > 0 && !selectedTable) {
        setSelectedTable(availableTables[0])
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
      toast({
        title: t('common.error'),
        description: t('tables.fetchError'),
        variant: 'destructive'
      })
    }
  }

  // Type-safe category selection handler
  const handleCategoryChange = (category: string) => {
    // Convert string to MenuItemCategory, with a fallback
    const menuCategory = Object.values(MenuItemCategory).find(
      c => c.toLowerCase() === category.toLowerCase()
    ) || MenuItemCategory.Appetizer

    setSelectedCategory(menuCategory)
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...orderItems]
    updatedItems.splice(index, 1)
    setOrderItems(updatedItems)
  }

  // Correct onChange handler for quantity input
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(isNaN(value) || value < 1 ? 1 : value);
  }

  // Optional: Method for programmatically updating item quantities
  const updateItemQuantity = (index: number, newQuantity: number) => {
    const updatedItems = [...orderItems];
    updatedItems[index].quantity = newQuantity;
    setOrderItems(updatedItems);
  }

  // Calculate total with robust type handling
  const calculateTotal = (): number => {
    // Ensure we're working with a valid array of items
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return 0
    }

    // Safely calculate total with type coercion and validation
    const subtotal = orderItems.reduce((acc, item) => {
      // Ensure price and quantity are numbers
      const price = Number(item.price || 0)
      const quantity = Number(item.quantity || 1)

      // Calculate item total
      const itemTotal = price * quantity

      // Add to accumulator, ensuring it's a number
      return Number(acc + itemTotal)
    }, 0 as number)

    // Apply any discounts
    if (discount > 0) {
      const discountAmount = discountType === 'percentage'
        ? subtotal * (Number(discount) / 100)
        : Number(discount)

      return Number(Math.max(subtotal - discountAmount, 0))
    }

    return subtotal
  }

  // Validate order details
  const handleSubmit = async () => {
    // Early validation checks
    if (orderItems.length === 0) {
      toast({
        title: t("orders.errors.emptyOrder"),
        description: t("orders.errors.emptyOrderDescription"),
        variant: "destructive"
      })
      return
    }

    // Validate table number based on order type
    if (orderType === 'table' && !tableNumber.trim()) {
      toast({
        title: t("orders.errors.noTableSelected"),
        description: t("orders.errors.noTableSelectedDescription"),
        variant: "destructive"
      })
      return
    }

    // Validate order details
    try {
      // Determine table number with explicit type handling
      const finalTableNumber = (() => {
        // For table order type
        if (orderType === 'table') {
          // Prioritize selected table number, then input table number
          if (selectedTable?.number) return selectedTable.number
          if (tableNumber.trim()) return tableNumber
          return 'Balcão'
        }
        
        // For other order types
        return tableNumber.trim() || 'Balcão'
      })()

      // Safely map order items with type-safe defaults
      const safeOrderItems = orderItems.map(item => ({
        id: item.id || `temp-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemId: item.itemId || '',
        name: item.name || 'Item Sem Nome',
        
        // Ensure all required fields have safe defaults
        category: item.category || 'Sem Categoria',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        
        // Optional fields with safe handling
        description: item.description || '', 
        unit: item.unit || '', 
        notes: item.notes || '', 
        
        // Dietary and customization fields with safe defaults
        customDietaryRestrictions: item.customDietaryRestrictions || [], 
        isVegetarian: item.isVegetarian ?? false,
        isVegan: item.isVegan ?? false,
        isGlutenFree: item.isGlutenFree ?? false,
        isLactoseFree: item.isLactoseFree ?? false,
        
        // Additional safety checks
        stock: Number(item.stock || 0)
      }))

      // Prepare order data with safe value handling
      const orderData: Order = {
        id: `temp-order-${Date.now()}`,
        tableId: orderType === 'table' ? (selectedTable?.uid || '') : '',
        tableNumber: finalTableNumber as number,
        tableMapId: selectedTable?.mapId || '', // Use mapId instead of tableMapId
        orderType,
        type: orderType,
        status: 'pending' as BaseOrderStatus,
        items: safeOrderItems,
        subtotal: calculateTotal(),
        total: calculateTotal(),
        discount: discount,
        createdAt: new Date(),
        updatedAt: new Date(),
        waiter: user.username,
        userId: user?.uid,
        restaurantId: user?.establishmentId || user.uid || '',
        paymentInfo: {
          method: 'other' as PaymentMethod,
          amount: 0,
        },
        closedAt: null, // Now compatible with Date | null
        tax: 0,
        ...(specialRequests && { specialRequests }),
        ...(dietaryRestrictions && { dietaryRestrictions }),
      };

      // Validate order data before submission
      if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Cannot create an order without items');
      }

      // Convertir items del pedido a formato de inventario
      const inventoryItems: InventoryItem[] = safeOrderItems.map(item => ({
        id: String(item.itemId || item.id), // Convertir a string
        name: item.name,
        category: item.category,
        quantity: Number(item.quantity), // Asegurar que sea un número
        price: Number(item.price), // Asegurar que sea un número
        unit: item.unit || '' // Usar cadena vacía si no hay unidad
      }))

      // Verificar disponibilidad de inventario
      if (!user.establishmentId) {
        toast({
          title: "Error de Establecimiento",
          description: "No se ha podido identificar el establecimiento",
          variant: "destructive"
        })
        return
      }

      const inventoryCheck = await checkInventoryAvailability(
        db, 
        user.establishmentId, 
        inventoryItems
      )

      if (!inventoryCheck.isAvailable) {
        const unavailableItemNames = inventoryCheck.unavailableItems
          .map(item => item.name)
          .join(', ')

        toast({
          title: t("inventory.insufficientStock"),
          description: `Los siguientes items no tienen stock suficiente: ${unavailableItemNames}`,
          variant: "destructive"
        })
        return
      }

      // Use onOrderCreated callback if provided
      if (!onOrderCreated) {
        console.error('No onOrderCreated callback provided');
        toast({
          title: "Error de Configuración",
          description: "No se ha configurado la función para crear pedidos",
          variant: "destructive"
        });
        return;
      }

      try {
        console.group('Order Creation Process');
        console.log('Order Details:', {
          items: orderItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: calculateTotal(),
          orderType,
          tableNumber
        });

        const result = await onOrderCreated(orderData);
        
        console.log('Order Creation Result:', result);

        // Reset form after successful submission
        resetForm();

        // Show success toast
        toast({
          title: t("orders.success.orderCreated"),
          description: `Pedido creado por ${calculateTotal()}`,
          variant: "default"
        });

        console.groupEnd();
      } catch (error) {
        console.groupEnd();
        console.error('Order Creation Failed:', error);
        toast({
          title: t("orders.errors.orderCreationFailed"),
          description: error instanceof Error ? error.message : "No se pudo crear el pedido",
          variant: "destructive"
        });
      }

      // Después de crear el pedido, reducir el stock
      if (!user.establishmentId) {
        console.error('No establishment ID found for user');
        toast({
          title: "Error de Establecimiento",
          description: "No se ha podido identificar el establecimiento para reducir stock",
          variant: "destructive"
        });
        return;
      }

      const stockReductionResults = await Promise.all(
        inventoryItems.map(item => 
          reduceInventoryStock({
            db,
            establishmentId: user.establishmentId!, // Aserción de tipo no nulo
            item,
            quantityToReduce: item.quantity
          })
        )
      )

      // Verificar si hubo errores en la reducción de stock
      const failedStockReductions = stockReductionResults.filter(result => !result.success)
      
      if (failedStockReductions.length > 0) {
        console.error('Stock reduction errors:', failedStockReductions)
        toast({
          title: t("inventory.stockReductionError"),
          description: "Algunos items no pudieron ser descontados del inventario",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      toast({
        title: t("orders.errors.orderCreationFailed"),
        description: error instanceof Error ? error.message : "Não foi possível criar o pedido",
        variant: "destructive"
      })
    }
  }

  const handleCreateOrder = async () => {
    // Validate order creation
    if (orderItems.length === 0) {
      toast({
        title: t("orders.errors.noItemsInOrder"),
        variant: "destructive"
      })
      return
    }

    // Validate table for table orders
    if (orderType === 'table' && !tableNumber.trim()) {
      toast({
        title: t("orders.errors.noTableSelected"),
        variant: "destructive"
      })
      return
    }

    // Prepare order object
    const newOrder: Order = {
      id: '', // Will be set by Firestore
      uid: user?.uid || '',
      restaurantId: user?.establishmentId || '',
      tableId: table?.id || '',
      tableNumber: orderType === 'table' ? parseInt(tableNumber) : 0,
      tableMapId: table?.tableMapId || '',
      waiter: user?.displayName || user?.email || user?.uid || 'Owner',
      items: orderItems,
      total: calculateTotal(),
      subtotal: calculateTotal(),
      status: 'pending',
      orderType: orderType,
      type: orderType,
      specialRequests: specialRequests || '',
      discount: discount || 0,
      paymentInfo: {
        method: 'other',
        amount: calculateTotal()
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add additional context for debugging
      debugContext: {
        userInfo: {
          uid: user?.uid,
          displayName: user?.displayName,
          establishmentId: user?.establishmentId
        },
        orderContext: {
          orderType,
          tableNumber,
          tableId: table?.id,
          tableMapId: table?.tableMapId
        }
      }
    };

    // Comprehensive order data cleaning
    const cleanOrder = Object.fromEntries(
      Object.entries(newOrder)
        .filter(([_, v]) => 
          v !== undefined && 
          v !== null && 
          // Remove empty objects and arrays
          (typeof v !== 'object' || 
           (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0))
        )
        .map(([k, v]) => {
          // Recursively clean nested objects
          if (typeof v === 'object' && !Array.isArray(v)) {
            return [k, Object.fromEntries(
              Object.entries(v)
                .filter(([_, nestedV]) => 
                  nestedV !== undefined && 
                  nestedV !== null && 
                  nestedV !== ''
                )
            )];
          }
          return [k, v];
        })
    ) as Order;

    console.log('🧹 Cleaned Order Object:', JSON.stringify(cleanOrder, null, 2));

    // Validate order before creation
    console.log('Debug: Order Creation Attempt', {
      orderItems: orderItems.length,
      orderType,
      tableNumber,
      userExists: !!user,
      userEstablishmentId: user?.establishmentId
    })

    // Ensure order has at least some meaningful data
    if (orderItems.length === 0) {
      console.error('Order creation failed: No items in order', {
        orderType,
        tableNumber,
        user: user?.uid
      })
      toast({
        title: t("orders.errors.noItemsInOrder"),
        variant: "destructive"
      })
      return
    }

    // Convertir items del pedido a formato de inventario
    const inventoryItems: InventoryItem[] = orderItems.map(item => ({
      id: String(item.itemId || item.id), // Convertir a string
      name: item.name,
      category: item.category,
      quantity: Number(item.quantity), // Asegurar que sea un número
      price: Number(item.price), // Asegurar que sea un número
      unit: item.unit || '' // Usar cadena vacía si no hay unidad
    }))

    // Verificar disponibilidad de inventario
    if (!user.establishmentId) {
      toast({
        title: "Error de Establecimiento",
        description: "No se ha podido identificar el establecimiento",
        variant: "destructive"
      })
      return
    }

    const inventoryCheck = await checkInventoryAvailability(
      db, 
      user.establishmentId, 
      inventoryItems
    )

    if (!inventoryCheck.isAvailable) {
      const unavailableItemNames = inventoryCheck.unavailableItems
        .map(item => item.name)
        .join(', ')

      toast({
        title: t("inventory.insufficientStock"),
        description: `Los siguientes items no tienen stock suficiente: ${unavailableItemNames}`,
        variant: "destructive"
      })
      return
    }

    // Use onOrderCreated callback if provided
    if (!onOrderCreated) {
      console.error('No onOrderCreated callback provided');
      toast({
        title: "Error de Configuración",
        description: "No se ha configurado la función para crear pedidos",
        variant: "destructive"
      });
      return;
    }

    try {
      console.group('Order Creation Process');
      console.log('Order Details:', {
        items: orderItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateTotal(),
        orderType,
        tableNumber
      });

      const result = await onOrderCreated(cleanOrder);
      
      console.log('Order Creation Result:', result);

      // Reset form after successful submission
      resetForm();

      // Show success toast
      toast({
        title: t("orders.success.orderCreated"),
        description: `Pedido creado por ${calculateTotal()}`,
        variant: "default"
      });

      console.groupEnd();
    } catch (error) {
      console.groupEnd();
      console.error('Order Creation Failed:', error);
      toast({
        title: t("orders.errors.orderCreationFailed"),
        description: error instanceof Error ? error.message : "No se pudo crear el pedido",
        variant: "destructive"
      });
    }

    // Después de crear el pedido, reducir el stock
    if (!user.establishmentId) {
      console.error('No establishment ID found for user');
      toast({
        title: "Error de Establecimiento",
        description: "No se ha podido identificar el establecimiento para reducir stock",
        variant: "destructive"
      });
      return;
    }

    const stockReductionResults = await Promise.all(
      inventoryItems.map(item => 
        reduceInventoryStock({
          db,
          establishmentId: user.establishmentId!, // Aserción de tipo no nulo
          item,
          quantityToReduce: item.quantity
        })
      )
    )

    // Verificar si hubo errores en la reducción de stock
    const failedStockReductions = stockReductionResults.filter(result => !result.success)
    
    if (failedStockReductions.length > 0) {
      console.error('Stock reduction errors:', failedStockReductions)
      toast({
        title: t("inventory.stockReductionError"),
        description: "Algunos items no pudieron ser descontados del inventario",
        variant: "destructive"
      })
    }
  }

  // Modify resetForm to handle new state
  const resetForm = () => {
    setOrderItems([])
    setSpecialRequests('')
    setDietaryRestrictions([])
    
    // Safely reset discount with number type
    setDiscount(0 as number)
    setDiscountType("percentage")
    
    // Explicitly type the category to resolve type issues
    setSelectedCategory(MenuItemCategory.Appetizer)
    
    setSelectedItem('')
    
    // Ensure quantity is a number
    setQuantity(1 as number)
    
    // Reset order type specific fields
    setOrderType('table')
    
    // Reset table selection if applicable
    setSelectedTable(null)
  }

  // Modify the useEffect to handle category selection more robustly
  useEffect(() => {
    console.group('Menu Items Update')
    console.log('Menu Items:', menuItems)
    
    // Set initial category if not set and menu items exist
    if (menuItems.length > 0) {
      // Get unique categories from menu items, filtering out undefined
      const uniqueCategories = Array.from(
        new Set(
          menuItems
            .map(item => item.category)
            .filter((category): category is MenuItemCategory => category !== undefined)
        )
      )

      console.log('Unique Categories:', uniqueCategories)

      if (uniqueCategories.length > 0) {
        // Set the first category if no category is selected
        if (!selectedCategory) {
          const firstCategory = uniqueCategories[0]
          console.log('Setting Initial Category:', firstCategory)
          setSelectedCategory(firstCategory)
        }

        // Optionally set first item in the category
        if (selectedCategory) {
          const firstItemInCategory = menuItems.find(
            item => item.category === selectedCategory
          )
          
          if (firstItemInCategory) {
            console.log('Setting Initial Item:', firstItemInCategory.uid)
            setSelectedItem(firstItemInCategory.uid)
          }
        }
      }
    }

    console.groupEnd()
  }, [menuItems])

  // Toggle QR Code display
  const toggleQRCode = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default button behavior if needed
    event.preventDefault()
    
    // Toggle QR Code visibility
    setShowQRCode(!showQRCode)
  }

  // Comprehensive onChange handlers for controlled components
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  }

  const handleItemDietaryRestrictionsChange = (restrictions: string[]) => {
    setItemDietaryRestrictions(restrictions);
  }

  const handleMenuUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    // Optional: Add URL validation
    setMenuUrl(url);
  }

  const handleSelectedItemChange = (itemUid: string) => {
    setSelectedItem(itemUid);
    
    // Reset related state when item changes
    const selectedMenuItem = menuItems.find(item => item.uid === itemUid);
    if (selectedMenuItem) {
      setQuantity(1);
      setNotes('');
      setItemDietaryRestrictions([]);
    }
  }

  const handleOrderTypeChange = (value: 'table' | 'counter' | 'takeaway') => {
    setOrderType(value);
  }

  const handleSelectedTableChange = (tableData: {
    uid: string
    mapId: string
    number: number
  } | null) => {
    setSelectedTable(tableData);
  }

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDiscount(isNaN(value) ? 0 : value);
  }

  const handleDiscountTypeChange = (value: "percentage" | "fixed") => {
    setDiscountType(value);
  }

  const handleSpecialRequestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Optional: Add validation if needed
    setSpecialRequests(value);
  }

  const handleDietaryRestrictionsChange = (restrictions: string[]) => {
    // Optional: Add validation if needed
    setDietaryRestrictions(restrictions);
  }

 

  // Render menu items for the selected category
  const renderMenuItems = (): React.ReactNode => {
    console.group('Render Menu Items Debug')
    console.log('Selected Category:', selectedCategory)
    console.log('All Menu Items:', menuItems)

    // Filter items by selected category
    const filteredItems = menuItems.filter(
      item => item.category === selectedCategory
    )

    console.log('Filtered Items:', filteredItems)
    console.log('Filtered Items Details:', filteredItems.map(item => ({
      name: item.name,
      stock: item.stock ?? 'undefined',  // Use nullish coalescing to handle undefined
      price: item.price
    })))
    console.groupEnd()

    if (filteredItems.length === 0) {
      return (
        <div className="text-muted-foreground text-sm">
          {t("orders.noItemsInCategory")}
        </div>
      )
    }

    return (
      <Select 
        value={selectedItem} 
        onValueChange={handleSelectedItemChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("orders.selectItem")} />
        </SelectTrigger>
        <SelectContent>
          {filteredItems.map(item => (
            <SelectItem 
              key={item.uid} 
              value={item.uid}
              disabled={(item.stock ?? 0) <= 0}
            >
              {item.name} 
              {(item.stock ?? 0) > 0 
                ? ` - R$ ${item.price.toFixed(2)} (${item.stock} disponíveis)` 
                : ' (Indisponível)'
              }
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Render category selector
  const renderCategorySelector = (): React.ReactNode => {
    // Get unique categories from menu items, filtering out undefined
    const uniqueCategories = Array.from(
      new Set(
        menuItems
          .map(item => item.category)
          .filter((category): category is MenuItemCategory => category !== undefined)
      )
    )

    console.group('Category Selector Debug')
    console.log('Unique Categories:', uniqueCategories)
    console.log('Current Selected Category:', selectedCategory)
    console.groupEnd()

    if (uniqueCategories.length === 0) {
      return (
        <div className="text-muted-foreground text-sm">
          {t("orders.noCategoriesFound")}
        </div>
      )
    }

    return (
      <Select 
        value={selectedCategory || uniqueCategories[0] || ''} 
        onValueChange={(value: string) => {
          // Type assertion to ensure it's a MenuItemCategory
          const category = value as MenuItemCategory
          
          console.log('Category Changed:', category)
          setSelectedCategory(category)
          
          // Reset selected item when category changes
          setSelectedItem("")
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("orders.selectCategory")} />
        </SelectTrigger>
        <SelectContent>
          {uniqueCategories.map(category => (
            <SelectItem 
              key={category} 
              value={category}
            >
              {t(`orders.categories.${category}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Render table selection with counter/takeaway option
  const renderTableSelector = (): React.ReactNode => {
    // If table is passed as a prop, use it
    if (initialTableNumber) {
      function handleTableNumberChange(event: ChangeEvent<HTMLInputElement>): void {
        throw new Error("Function not implemented.")
      }

      return (
        <div className="mb-4">
          <Label>{t("orders.tableNumber")}</Label>
          <Input 
            type="text" 
            onChange={handleTableNumberChange}
            readOnly 
            className="bg-muted cursor-not-allowed" 
            defaultValue={initialTableNumber}
          />
        </div>
      )
    }

    function handleTableNumberChange(event: ChangeEvent<HTMLInputElement>): void {
      setTableNumber(event.target.value);
    }

    // Custom table selection when no table is predefined
    return (
      <div className="space-y-4">
        <div>
          <Label>{t("orders.orderType")}</Label>
          <Select 
            value={orderType} 
            onValueChange={handleOrderTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("orders.selectOrderType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">{t("orders.table")}</SelectItem>
              <SelectItem value="counter">{t("orders.counter")}</SelectItem>
              <SelectItem value="takeaway">{t("orders.takeaway")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {orderType === 'table' && (
          <div>
            <Label>{t("orders.tableNumber")}</Label>
            <Input 
              type="text" 
              placeholder={t("orders.tableNumberPlaceholder")} 
              value={tableNumber}
              onChange={handleTableNumberChange}
              className="w-full"
            />
          </div>
        )}
      </div>
    )
  }

  const renderDietaryRestrictions = () => {
    const dietaryOptions = [
      { id: "gluten-free", key: "gluten-free" },
      { id: "lactose-free", key: "lactose-free" },
      { id: "vegan", key: "vegan" },
      { id: "vegetarian", key: "vegetarian" }
    ];

    return (
      <div className="space-y-2">
        {dietaryOptions.map(({ id, key }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox 
              id={id}
              checked={itemDietaryRestrictions.includes(key)}
              onCheckedChange={(checked) => {
                const updatedRestrictions = checked 
                  ? [...itemDietaryRestrictions, key]
                  : itemDietaryRestrictions.filter(r => r !== key);
                handleItemDietaryRestrictionsChange(updatedRestrictions);
              }}
            />
            <Label htmlFor={id}>{t(key)}</Label>
          </div>
        ))}
      </div>
    );
  }

  const renderMenuUrlInput = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor="menu-url">{t("orders.menuUrl")}</Label>
        <Input 
          id="menu-url"
          type="url"
          placeholder={t("orders.menuUrlPlaceholder")}
          value={menuUrl}
          onChange={handleMenuUrlChange}
          className="w-full"
          pattern="https?://.*"  // Basic URL validation
        />
      </div>
    );
  }

  const renderSpecialRequestsInput = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor="special-requests">{t("orders.specialRequests")}</Label>
        <Textarea
          id="special-requests"
          onChange={handleSpecialRequestsChange}
          placeholder={t("orders.specialRequestsPlaceholder")}
          className="resize-y min-h-[100px]"
          maxLength={500}  // Optional: Limit input length
          defaultValue={specialRequests}
        />
      </div>
    );
  }

  const renderDiscountInput = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor="discount">{t("orders.discount")}</Label>
        <div className="flex items-center space-x-2">
          <Input 
            id="discount"
            type="number"
            placeholder={t("orders.discountPlaceholder")}
            value={discount}
            onChange={handleDiscountChange}
            className="flex-grow"
            min="0"
            step="0.01"
            max="100"  // Assuming percentage or fixed amount
          />
          <Select 
            value={discountType}
            onValueChange={(value: "percentage" | "fixed") => {
              setDiscountType(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("orders.discountType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">{t("orders.percentage")}</SelectItem>
              <SelectItem value="fixed">{t("orders.fixedAmount")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl min-h-screen flex flex-col justify-center py-8">
      <div className="bg-background border rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Item Selection */}
          <div className="space-y-4">
            {renderTableSelector()}
            <div>
              <Label>{t("orders.selectCategory")}</Label>
              {renderCategorySelector()}
            </div>

            <div>
              <Label>{t("orders.selectItem")}</Label>
              {renderMenuItems()}
            </div>

            <div>
              <Label>{t("orders.quantity")}</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="text-center flex-grow w-20"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">{t("orders.itemNotes")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder={t("orders.itemNotesPlaceholder")}
                className="resize-y min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("orders.itemDietaryRestrictions")}</Label>
              {renderDietaryRestrictions()}
            </div>

            <Button type="button" onClick={handleAddItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {t("orders.addToOrder")}
            </Button>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{t("orders.orderSummary")}</h2>
              <div className="flex items-center gap-2">
                {orderItems.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setOrderItems([])}
                    className="text-xs"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    {t("orders.clearOrder")}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleQRCode}
                  className="text-xs flex items-center"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  {showQRCode ? t('orders.hideMenuQr') : t('orders.showMenuQr')}
                </Button>
              </div>
            </div>

            {showQRCode && (
              <div className="flex flex-col items-center space-y-4 mt-4">
                
                <QRCode 
                  value={menuUrl} 
                  size={256} 
                  level={'H'} 
                  includeMargin={true} 
                />
              </div>
            )}

            {orderItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>{t("orders.noItemsInOrder")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="max-h-[50vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-[40%]">{t("orders.item")}</TableHead>
                        <TableHead className="w-[20%] text-center">{t("orders.quantity")}</TableHead>
                        <TableHead className="w-[20%] text-right">{t("orders.price")}</TableHead>
                        <TableHead className="w-[20%] text-right">{t("orders.total")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={`${item.id}-${index}`}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              {item.notes && (
                                <span className="text-xs text-muted-foreground">
                                  {item.notes}
                                </span>
                              )}
                              {item.customDietaryRestrictions && item.customDietaryRestrictions.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {item.customDietaryRestrictions.map(restriction => 
                                    t(restriction)
                                  ).join(', ')}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const updatedItems = [...orderItems]
                                  updatedItems[index].quantity = Math.max(1, item.quantity - 1)
                                  setOrderItems(updatedItems)
                                }}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const updatedItems = [...orderItems]
                                  updatedItems[index].quantity += 1
                                  setOrderItems(updatedItems)
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            R$ {item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updatedItems = orderItems.filter((_, i) => i !== index)
                                setOrderItems(updatedItems)
                              }}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("orders.subtotal")}</span>
                    <span className="font-semibold">
                      R$ {orderItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t("orders.discount")}</Label>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={discountType} 
                        onValueChange={handleDiscountTypeChange}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="fixed">R$</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={discount}
                        onChange={handleDiscountChange}
                        min="0"
                        className="w-[100px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span>{t("orders.total")}</span>
                    <span className="text-xl font-bold">
                      R$ {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              {renderSpecialRequestsInput()}
            </div>

            

            <div>
              {renderMenuUrlInput()}
            </div>

            <div>
              {renderDiscountInput()}
            </div>

            <Button 
              onClick={handleCreateOrder} 
              className="w-full" 
              disabled={orderItems.length === 0 || (orderType === 'table' && !tableNumber.trim())}
            >
              {t("orders.createOrder")}
            </Button>
            {orderItems.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                {t("orders.errors.noItemsInOrder")}
              </p>
            )}
            {(orderType === 'table' && !tableNumber.trim()) && (
              <p className="text-sm text-red-500 mt-2">
                {t("orders.errors.noTableSelected")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
