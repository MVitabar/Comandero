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
import { doc, collection, getDocs, query, orderBy, where, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
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
  PaymentMethod
} from "@/types"

export function OrderForm({ 
  initialTableNumber, 
  onOrderCreated,
  user: propUser,
  table
}: { 
  initialTableNumber?: string, 
  onOrderCreated?: (order: Order) => void,
  user?: User | null,
  table?: RestaurantTable
}) {
  const { db } = useFirebase()
  const { user: contextUser } = useAuth()
  const user = propUser || contextUser

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-destructive">
          Usuário não autenticado. Por favor, faça login para criar um pedido.
        </p>
      </div>
    )
  }

  // Use table prop if available, otherwise use initialTableNumber
  const tableNumber = table?.name || initialTableNumber || ''

  const { t } = useI18n()

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
    if (!menuItem) return

    const newItem: OrderItem = {
      uid: menuItem.uid, // Added optional uid
      itemId: menuItem.uid, // Ensure itemId is set
      menuItemId: menuItem.uid, // Add menuItemId
      name: menuItem.name,
      category: menuItem.category || 'uncategorized',
      quantity,
      price: menuItem.price,
      notes: notes || "",
      unit: menuItem.unit, // Add unit if available
      customDietaryRestrictions: itemDietaryRestrictions.length > 0 ? [...itemDietaryRestrictions] : undefined,
      isVegetarian: itemDietaryRestrictions.includes('vegetarian'),
      isVegan: itemDietaryRestrictions.includes('vegan'),
      isGlutenFree: itemDietaryRestrictions.includes('gluten-free'),
      isLactoseFree: itemDietaryRestrictions.includes('lactose-free'),
      dietaryInfo: {
        vegetarian: itemDietaryRestrictions.includes('vegetarian'),
        vegan: itemDietaryRestrictions.includes('vegan'),
        glutenFree: itemDietaryRestrictions.includes('gluten-free'),
        lactoseFree: itemDietaryRestrictions.includes('lactose-free')
      }
    }

    const existingItemIndex = orderItems.findIndex(
      (item) =>
        item.itemId === menuItem.uid &&
        JSON.stringify(item.customDietaryRestrictions || []) === JSON.stringify(itemDietaryRestrictions || []) &&
        item.notes === notes,
    )

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += quantity
      setOrderItems(updatedItems)
    } else {
      // Add new item
      setOrderItems([...orderItems, newItem])
    }

    // Reset form
    setQuantity(1)
    setNotes("")
    setItemDietaryRestrictions([])
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

    try {
      setLoading(true)
      const menuItems: MenuItem[] = []

      // Fetch inventory reference
      const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')
      console.log('Inventory Reference:', inventoryRef.path)

      const categoriesSnapshot = await getDocs(inventoryRef)
      console.log('Categories Found:', categoriesSnapshot.docs.map(doc => doc.id))

      // Iterate through categories
      for (const categoryDoc of categoriesSnapshot.docs) {
        const category = categoryDoc.id
        const categoryData = categoryDoc.data()
        console.log(`Processing Category: ${category}`, categoryData)

        // Check if the category has items
        if (categoryData && categoryData.items) {
          console.log(`Items in ${category}:`, Object.keys(categoryData.items))

          const categoryItems = Object.values(categoryData.items).map((itemData: any) => {
            console.group('Item Data Debug')
            console.log('Raw Item Data:', itemData)
            
            // Determine stock, with more flexible parsing
            let stock = 0
            if (typeof itemData.quantity === 'number') {
              stock = itemData.quantity
            } else if (typeof itemData.quantity === 'string') {
              const parsedStock = parseInt(itemData.quantity, 10)
              stock = isNaN(parsedStock) ? 0 : parsedStock
            }

            // Parse price with more robust handling
            let price = 0
            if (typeof itemData.price === 'number') {
              price = itemData.price
            } else if (typeof itemData.price === 'string') {
              // Remove currency symbols and parse
              const cleanPrice = itemData.price
                .replace(/[R$\s]/g, '')  // Remove R$, spaces
                .replace(',', '.')  // Replace comma with dot for decimal
              const parsedPrice = parseFloat(cleanPrice)
              price = isNaN(parsedPrice) ? 0 : parsedPrice
            }

            const menuItem = {
              uid: itemData.id || itemData.uid,
              name: itemData.name,
              price: price,
              category: category as MenuItemCategory,
              description: itemData.description || '',
              unit: itemData.unit || '',
              stock: stock
            }

            console.log('Processed Menu Item:', menuItem)
            console.groupEnd()

            return menuItem
          })

          menuItems.push(...categoryItems)
        } else {
          console.log(`No items found in category: ${category}`)
        }
      }

      console.log('Total Menu Items:', menuItems)
      console.log('Menu Items Details:', menuItems.map(item => ({
        name: item.name,
        category: item.category,
        stock: item.stock ?? 'undefined',  // Use nullish coalescing to handle undefined
        price: item.price
      })))

      setMenuItems(menuItems)
      setLoading(false)
      console.groupEnd()
    } catch (error) {
      console.error("Error fetching menu items:", error)
      setLoading(false)
      console.groupEnd()
      toast({
        title: "Erro ao Buscar Itens",
        description: error instanceof Error ? error.message : "Não foi possível carregar os itens do menu",
        variant: "destructive"
      })
    }
  }, [db, user, toast])

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
      const q = query(
        collection(db, 'restaurants', user.uid, 'tables'),
        where('status', 'in', ['available', 'ordering'])
      );
      const querySnapshot = await getDocs(q)

      const availableTables = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        mapId: doc.data().mapId,
        number: doc.data().number as number
      }))

      setTables(availableTables)
      
      if (availableTables.length > 0 && !selectedTable) {
        setSelectedTable(availableTables[0])
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
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
        title: "Carrinho Vazio",
        description: "Adicione itens ao pedido antes de enviar",
        variant: "destructive"
      })
      return
    }

    // Validate table number based on order type
    if (orderType === 'table' && !tableNumber.trim()) {
      toast({
        title: "Mesa Não Selecionada",
        description: "Por favor, selecione ou insira o número da mesa",
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
        discount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        waiter: user.username,
        userId: user?.uid,
        restaurantId: user?.uid || '',
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

      // Call onSubmit prop with cleaned order data
      onOrderCreated && onOrderCreated(orderData)

      // Reset form after successful submission
      resetForm()

      // Show success toast
      toast({
        title: "Pedido Criado",
        description: `Pedido ${orderType === 'table' ? `da Mesa ${finalTableNumber}` : orderType} criado com sucesso!`,
        variant: "default"
      })

    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      toast({
        title: "Erro ao Criar Pedido",
        description: error instanceof Error ? error.message : "Não foi possível criar o pedido",
        variant: "destructive"
      })
    }
  }

  const handleCreateOrder = async () => {
    try {
      // Prepare clean order data, removing undefined values
      const orderData: Partial<Order> = {
        restaurantId: user.uid,
        type: orderType || 'dine-in',
        orderType: orderType || 'dine-in',
        
        // Use type-safe status with explicit typing
        status: 'active' as BaseOrderStatus,
        
        // Safely handle table-related fields
        ...(table?.id && { tableId: table.id }),
        ...(table?.tableMapId && { tableMapId: table.tableMapId }),
        
        // Process selected items
        items: orderItems.map(item => {
          // Ensure itemId is always a non-optional string
          const safeItemId = item.uid || item.itemId || 'unknown';
          
          return {
            menuItemId: item.uid,
            itemId: safeItemId, // Use a non-optional string
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            category: item.category || 'uncategorized',
            notes: item.notes || '',
            customDietaryRestrictions: item.customDietaryRestrictions || [],
            isVegetarian: !!item.isVegetarian,
            isVegan: !!item.isVegan,
            isGlutenFree: !!item.isGlutenFree,
            isLactoseFree: !!item.isLactoseFree,
            dietaryInfo: item.dietaryInfo || {
              vegetarian: false,
              vegan: false,
              glutenFree: false,
              lactoseFree: false
            }
          }
        }),
        
        // Calculate totals with fallback
        total: calculateTotal(),
        subtotal: calculateTotal(),
        tax: 0,
        
        // Timestamp management
        createdAt: new Date(),
        
        // Optional fields from original orderData
        ...(specialRequests && { specialRequests }),
        ...(dietaryRestrictions && { dietaryRestrictions }),
        
        // Payment information with defaults
        paymentInfo: {
          method: 'other' as PaymentMethod,
          amount: 0,
        },
        
        // User and waiter information
        ...(user.uid && { userId: user.uid }),
        ...(user.username && { waiter: user.username })
      };

      // Remove any remaining undefined values
      const cleanOrderData = Object.fromEntries(
        Object.entries(orderData).filter(([_, v]) => v !== undefined)
      ) as unknown as Order;

      // Construct a comprehensive order object with all required properties
      const finalOrderData: Order = {
        id: '', // Will be set by Firestore
        tableNumber: parseInt(
          table?.name?.replace(/\D/g, '') || // Extract number from table name
          initialTableNumber || '0', // Fallback to initialTableNumber 
          10
        ),
        orderType: orderType || 'table',
        status: 'pending' as BaseOrderStatus,
        userId: user.uid || undefined,
        restaurantId: user.uid,
        type: orderType || 'table',
        
        // Spread existing order data with type checking
        ...Object.fromEntries(
          Object.entries(orderData)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => {
              // Ensure type safety for critical properties
              switch (k) {
                case 'items':
                  return [k, v as OrderItem[]];
                case 'subtotal':
                case 'total':
                case 'discount':
                case 'tax':
                  return [k, Number(v)];
                case 'createdAt':
                case 'updatedAt':
                  return [k, v instanceof Date ? v : new Date()];
                default:
                  return [k, v];
              }
            })
        ),
        
        // Ensure critical properties are present and type-safe
        items: (orderData.items || []) as OrderItem[],
        subtotal: calculateTotal(),
        total: calculateTotal(),
        discount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        tableId: table?.id || '',
        tableMapId: table?.tableMapId || '',
        waiter: user.username,
        
        // Payment information
        paymentInfo: {
          method: 'other' as PaymentMethod,
          amount: 0,
        },
        closedAt: null,  // Now compatible with Date | null
        tax: 0
      };

      // Remove undefined values from the final order data
      const firestoreOrderData = Object.fromEntries(
        Object.entries(finalOrderData).filter(([_, v]) => 
          v !== undefined && 
          !(typeof v === 'object' && v !== null && Object.keys(v).length === 0)
        )
      );

      // Generate a unique order ID
      const newOrderRef = doc(collection(db, `restaurants/${user.uid}/orders`));

      // Save the order to Firestore
      await setDoc(newOrderRef, {
        ...firestoreOrderData,
        id: newOrderRef.id,  // Include the generated ID in the document
        createdAt: serverTimestamp()  // Use server timestamp for consistency
      });

      // Update table status when creating an order
      const updateTableStatus = async () => {
        if (orderType === 'table' && selectedTable) {
          try {
            const restaurantId = user?.uid || ''
            const tableRef = doc(db, `restaurants/${restaurantId}/tables`, selectedTable.uid)
            
            await updateDoc(tableRef, {
              status: 'occupied',
              activeOrderId: newOrderRef.id
            })
          } catch (error) {
            console.error('Error updating table status:', error)
            toast({
              title: 'Error',
              description: 'Could not update table status',
              variant: 'destructive'
            })
          }
        }
      }

      // Call update table status after order creation
      await updateTableStatus()

      // Success notification
      toast({
        title: 'Order Created',
        description: `Order #${newOrderRef.id} successfully created`,
        variant: 'default'
      });

      // Reset form state
      resetForm();

      // Optional: Close order form
      onOrderCreated?.(finalOrderData);

    } catch (error) {
      // Comprehensive error handling
      console.error('Order Creation Error:', error);
      
      toast({
        title: 'Order Creation Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

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
          Nenhum item encontrado nesta categoria
        </div>
      )
    }

    return (
      <Select 
        value={selectedItem} 
        onValueChange={handleSelectedItemChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um item" />
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
          Nenhuma categoria encontrada
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
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {uniqueCategories.map(category => (
            <SelectItem 
              key={category} 
              value={category}
            >
              {category}
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
          <Label>Mesa</Label>
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
      throw new Error("Function not implemented.")
    }

    // Custom table selection when no table is predefined
    return (
      <div className="space-y-4">
        <div>
          <Label>Tipo de Pedido</Label>
          <Select 
            value={orderType} 
            onValueChange={handleOrderTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o tipo de pedido" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Mesa</SelectItem>
              <SelectItem value="counter">Balcão</SelectItem>
              <SelectItem value="takeaway">Para Viagem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {orderType === 'table' && (
          <div>
            <Label>Número da Mesa</Label>
            <Input 
              type="text" 
              placeholder="Digite o número da mesa" 
              defaultValue={0}
              value={tableNumber}
              // No need to set tableNumber here
              className="w-full"
              onChange={handleTableNumberChange}
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
        <Label htmlFor="menu-url">{t("menuUrl")}</Label>
        <Input 
          id="menu-url"
          type="url"
          placeholder={t("menuUrlPlaceholder")}
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
        <Label htmlFor="special-requests">{t("specialRequests")}</Label>
        <Textarea
          id="special-requests"
          onChange={handleSpecialRequestsChange}
          placeholder={t("specialRequestsPlaceholder")}
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
        <Label htmlFor="discount">{t("discount")}</Label>
        <div className="flex items-center space-x-2">
          <Input 
            id="discount"
            type="number"
            placeholder={t("discountPlaceholder")}
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
              <SelectValue placeholder={t("discountType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">{t("percentage")}</SelectItem>
              <SelectItem value="fixed">{t("fixedAmount")}</SelectItem>
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
              <Label>{t("selectCategory")}</Label>
              {renderCategorySelector()}
            </div>

            <div>
              <Label>{t("selectItem")}</Label>
              {renderMenuItems()}
            </div>

            <div>
              <Label>{t("quantity")}</Label>
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
              <Label htmlFor="notes">{t("itemNotes")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder={t("itemNotesPlaceholder")}
                className="resize-y min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("itemDietaryRestrictions")}</Label>
              {renderDietaryRestrictions()}
            </div>

            <Button type="button" onClick={handleAddItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {t("addToOrder")}
            </Button>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{t("orderSummary")}</h2>
              <div className="flex items-center gap-2">
                {orderItems.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setOrderItems([])}
                    className="text-xs"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    {t("clearOrder")}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleQRCode}
                  className="text-xs flex items-center"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  {showQRCode ? t('hideMenuQr') : t('showMenuQr')}
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
                <p>{t("noItemsInOrder")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="max-h-[50vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-[40%]">{t("item")}</TableHead>
                        <TableHead className="w-[20%] text-center">{t("quantity")}</TableHead>
                        <TableHead className="w-[20%] text-right">{t("price")}</TableHead>
                        <TableHead className="w-[20%] text-right">{t("total")}</TableHead>
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
                    <span>{t("subtotal")}</span>
                    <span className="font-semibold">
                      R$ {orderItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t("discount")}</Label>
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
                    <span>{t("total")}</span>
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
              {t("createOrder")}
            </Button>
            {orderItems.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                {t("errors.noItemsInOrder")}
              </p>
            )}
            {(orderType === 'table' && !tableNumber.trim()) && (
              <p className="text-sm text-red-500 mt-2">
                {t("errors.noTableSelected")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
