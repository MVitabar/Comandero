"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import {Badge} from "@/components/ui/badge"
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  getCountFromServer, 
  where, 
  Timestamp 
} from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, Table } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Order, 
  SalesByCategory, 
  DailySalesData, 
  TopSellingItem,
  DashboardData,
  InventoryItem,
  OrderItem,
  InventoryItemDetail,
  InventoryItemSourceData
} from "@/types"
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle 
} from "lucide-react"

import { 
  PieChart, 
  Pie, 
  Sector, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DashboardPage() {
  const { t, i18n } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalOrders: 0,
    totalSales: 0,
    lowStockItems: 0,
    recentOrders: [],
    monthlyGrowth: 0,
    totalInventoryItems: 0,
    inventoryItems: {
      total: 0,
      lowStock: 0,
      inStock: 0,
      details: []
    },
    salesByCategory: [],
    dailySalesData: [],
    topSellingItems: [],
    salesList: []
  })

  const [inventoryViewMode, setInventoryViewMode] = useState<'totals' | 'by_category' | 'by_item'>('totals')

  const fetchDashboardData = async () => {
    try {
      console.log("🚀 Starting fetchDashboardData")
      const ordersRef = collection(db, `restaurants/${user?.establishmentId}/orders`)
      
      // Predefined list of valid categories with translations
      const validCategories = [
        { 
          id: 'appetizers', 
          name: t('categories.appetizers') 
        },
        { 
          id: 'desserts', 
          name: t('categories.desserts') 
        },
        { 
          id: 'drinks', 
          name: t('categories.drinks') 
        },
        { 
          id: 'main_courses', 
          name: t('categories.mainCourses') 
        },
        { 
          id: 'salads', 
          name: t('categories.salads') 
        },
        { 
          id: 'sides', 
          name: t('categories.sides') 
        }
      ]

      // Fetch items from all categories
      const inventoryPromises = validCategories.map(category => 
        getDocs(collection(db, `restaurants/${user?.establishmentId}/inventory/${category.id}/items`))
      )

      const inventorySnapshots = await Promise.all(inventoryPromises)
      
      // Flatten and process all inventory items
      const allInventoryItems: InventoryItem[] = inventorySnapshots.flatMap((snapshot, index) => 
        snapshot.docs.map(doc => ({
          ...(doc.data() as InventoryItem),
          id: doc.id,
          category: validCategories[index].id,
          categoryName: validCategories[index].name
        }))
      )

      console.log("📦 Total Inventory Items:", allInventoryItems.length)
      
      // Log unique categories
      const uniqueCategories = new Set(
        allInventoryItems.map(item => item.category).filter(category => category)
      )
      console.log("🏷️ Unique Inventory Categories:", Array.from(uniqueCategories))
      
      const inventoryDetails: InventoryItemDetail[] = allInventoryItems.map((data: InventoryItemSourceData) => {
        const quantity = Number(data.quantity) || 0
        
        // Use minQuantity instead of a separate threshold
        const minimumStockThreshold = Number(data.minQuantity) || 10
        const lowStockThreshold = Number(data.lowStockThreshold) || 50

        // Detailed logging for diagnosis
        console.group(`🔍 Stock Status for ${data.name}`)
        console.log('Quantity:', quantity)
        console.log('Minimum Stock Threshold:', minimumStockThreshold)
        console.log('Low Stock Threshold:', lowStockThreshold)
        console.log('Critical Threshold:', minimumStockThreshold)
        console.log('Warning Threshold:', minimumStockThreshold * 1.5)

        const status = (() => {
          // Critical: Quantity is less than the minimum stock threshold
          if (quantity < minimumStockThreshold) {
            console.log('🔴 Status: CRITICAL (quantity < minimum threshold)')
            return 'critical'
          }
          
          // Warning: Quantity is between minimum and 1.5x minimum
          if (quantity < minimumStockThreshold * 1.5) {
            console.log('🟠 Status: WARNING (quantity < 1.5 * minimum threshold)')
            return 'warning'
          }
          
          // Healthy: Quantity is more than 1.5x minimum
          console.log('🟢 Status: HEALTHY')
          return 'healthy'
        })()

        // Calculate low stock based on minimum stock threshold
        const lowStock = status !== 'healthy' 
          ? Math.max(0, minimumStockThreshold - quantity) 
          : 0

        console.log('Low Stock:', lowStock)
        console.log('Status:', status)
        console.groupEnd()

        return {
          id: data.id || crypto.randomUUID(),
          name: data.name || 'Unknown Item',
          category: data.category || 'uncategorized',
          categoryName: data.categoryName || 'Uncategorized',
          total: quantity,
          inStock: quantity,
          lowStock: lowStock,
          minQuantity: minimumStockThreshold,
          lowStockThreshold,
          status: status || 'default'
        }
      })

      console.log("✅ Processed Inventory Details:", inventoryDetails)

      // Calculate inventory totals
      const totalInventoryItems = inventoryDetails.reduce((sum, item) => sum + item.total, 0)
      const totalInStockItems = inventoryDetails.reduce((sum, item) => sum + item.inStock, 0)
      const totalLowStockItems = inventoryDetails.reduce((sum, item) => sum + (item.lowStock ?? 0), 0)

      // Calculate category-level stock status
      const categorySummary = inventoryDetails.reduce((acc, item) => {
        const category = item.category || 'uncategorized'
        
        if (!acc[category]) {
          acc[category] = {
            total: 0,
            inStock: 0,
            minStockThreshold: 0,  // Change from lowStockThreshold
            criticalItems: 0,
            warningItems: 0,
            healthyItems: 0
          }
        }
        
        acc[category].total += item.total
        acc[category].inStock += item.inStock
        
        // Use minQuantity instead of lowStockThreshold
        acc[category].minStockThreshold += item.minQuantity ?? 10
        
        if (item.status === 'critical') acc[category].criticalItems++
        if (item.status === 'warning') acc[category].warningItems++
        if (item.status === 'healthy') acc[category].healthyItems++
        
        return acc
      }, {} as Record<string, {
        total: number,
        inStock: number,
        minStockThreshold: number,
        criticalItems: number,
        warningItems: number,
        healthyItems: number
      }>)

      // Update category status calculation
      const getCategoryStatus = (categoryData: typeof categorySummary[string]) => {
        const totalMinStockThreshold = categoryData.minStockThreshold
        const totalInStock = categoryData.inStock

        // Critical if total in-stock is less than total minimum stock threshold
        if (totalInStock < totalMinStockThreshold) return 'critical'
        
        // Warning if total in-stock is less than 1.5 * total minimum stock threshold
        if (totalInStock < totalMinStockThreshold * 1.5) return 'warning'
        
        return 'healthy'
      }

      // Fetch total orders and sales for the current month
      const currentMonthStart = Timestamp.fromDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      const lastMonthStart = Timestamp.fromDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))
      
      console.log("Current Month Start (Timestamp):", currentMonthStart.toDate())
      console.log("Last Month Start (Timestamp):", lastMonthStart.toDate())
      console.log("Establishment ID:", user?.establishmentId)

      const currentMonthOrdersQuery = query(
        ordersRef, 
        where("status", "==", "finished"),
        where("createdAt", ">=", Timestamp.fromDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
      )
      const lastMonthOrdersQuery = query(
        ordersRef, 
        where("status", "==", "finished"),
        where("createdAt", ">=", Timestamp.fromDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))),
        where("createdAt", "<", Timestamp.fromDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
      )

      const [
        currentMonthOrdersSnapshot, 
        lastMonthOrdersSnapshot,
        ordersSnapshot
      ] = await Promise.all([
        getDocs(currentMonthOrdersQuery),
        getDocs(lastMonthOrdersQuery),
        getDocs(query(ordersRef, orderBy('createdAt', 'desc'), limit(5)))
      ])

      console.log("Current Month Orders Count:", currentMonthOrdersSnapshot.size)
      console.log("Last Month Orders Count:", lastMonthOrdersSnapshot.size)

      // Detailed logging of orders
      currentMonthOrdersSnapshot.docs.forEach((doc, index) => {
        const orderData = doc.data()
        console.log(`Current Month Order ${index + 1}:`, {
          id: doc.id,
          createdAt: orderData.createdAt?.toDate(),
          status: orderData.status,
          total: orderData.total,
          items: orderData.items ? Object.values(orderData.items).length : 0
        })
      })

      lastMonthOrdersSnapshot.docs.forEach((doc, index) => {
        const orderData = doc.data()
        console.log(`Last Month Order ${index + 1}:`, {
          id: doc.id,
          createdAt: orderData.createdAt?.toDate(),
          status: orderData.status,
          total: orderData.total,
          items: orderData.items ? Object.values(orderData.items).length : 0
        })
      })

      const currentMonthTotalSales = currentMonthOrdersSnapshot.docs.reduce(
        (total, doc) => total + (doc.data().total || 0), 
        0
      )
      const lastMonthTotalSales = lastMonthOrdersSnapshot.docs.reduce(
        (total, doc) => total + (doc.data().total || 0), 
        0
      )

      // Calculate monthly growth percentage
      const monthlyGrowth = lastMonthTotalSales > 0 
        ? ((currentMonthTotalSales - lastMonthTotalSales) / lastMonthTotalSales * 100)
        : 0

      // Consulta de Sales by Category
      const salesByCategoryQuery = query(
        ordersRef, 
        where("status", "==", "finished"),
        where("createdAt", ">=", currentMonthStart),
        where("createdAt", "<=", Timestamp.now())
      )
      const salesByCategorySnapshot = await getDocs(salesByCategoryQuery)

      // Función para asignar colores a categorías
      const getCategoryColor = (category: string): string => {
        const categoryColors: Record<string, string> = {
          'appetizers': '#0088FE',   // Azul claro
          'main_courses': '#00C49F', // Verde menta
          'salads': '#32CD32',       // Lima verde
          'sides': '#9370DB',        // Púrpura medio
          'desserts': '#FFBB28',     // Amarillo
          'drinks': '#FF8042',       // Naranja
          'uncategorized': '#8884D8' // Púrpura
        }
        return categoryColors[category] || '#FF6384'  // Color por defecto rosa
      }

      // Mapa para agregar ventas por categoría
      const categorySalesMap = new Map<string, {
        totalSales: number, 
        totalQuantity: number
      }>()

      // Procesar órdenes
      salesByCategorySnapshot.docs.forEach(doc => {
        const orderData = doc.data() as Order
        
        Object.values(orderData.items || {}).forEach((item: OrderItem) => {
          const category = item.category || 'uncategorized'
          const itemTotal = item.price * item.quantity

          const existingCategoryData = categorySalesMap.get(category) || { 
            totalSales: 0, 
            totalQuantity: 0 
          }

          categorySalesMap.set(category, {
            totalSales: existingCategoryData.totalSales + itemTotal,
            totalQuantity: existingCategoryData.totalQuantity + item.quantity
          })
        })
      })

      // Transformar datos para visualización
      const translatedCategorySales = Array.from(categorySalesMap.entries()).map(([category, data]) => {
        // Map full category names to translation keys
        const categoryKeyMap: Record<string, string> = {
          'Main Courses': 'main_courses',
          'Drinks': 'drinks',
          'Desserts': 'desserts',
          'Appetizers': 'appetizers',
          'Salads': 'salads',
          'Sides': 'sides',
          'Uncategorized': 'uncategorized'
        }
        
        const translationKey = categoryKeyMap[category] || category.toLowerCase()
        
        return {
          category: t(`${translationKey}`),
          originalCategory: category,
          totalSales: data.totalSales,
          totalQuantity: data.totalQuantity,
          color: getCategoryColor(category.toLowerCase())
        }
      }).sort((a, b) => b.totalSales - a.totalSales)

      // Diagnóstico detallado
      console.log("🍽️ Sales by Category Diagnóstico", {
        totalOrders: salesByCategorySnapshot.size,
        categorySalesDetails: translatedCategorySales,
        totalCategorySales: translatedCategorySales.reduce((sum, cat) => sum + cat.totalSales, 0)
      })

      // Calculate Top Selling Items from Orders
      const topSellingItemsMap = new Map<string, {
        name: string,
        category: string,
        totalQuantity: number,
        totalSales: number
      }>()

      console.log("DEBUG: Start of Top Selling Items Calculation")
      console.log("Sales Category Snapshot Size:", salesByCategorySnapshot.size)

      // Combine items from all orders
      const allOrderItems: OrderItem[] = []
      salesByCategorySnapshot.docs.forEach(doc => {
        const orderData = doc.data() as Order
        console.log("Processing Order:", {
          orderId: doc.id,
          status: orderData.status,
          createdAt: orderData.createdAt,
          items: orderData.items?.length
        })

        if (orderData.items && orderData.items.length > 0) {
          allOrderItems.push(...orderData.items)
        }
      })

      console.log("DEBUG: Total Order Items:", allOrderItems.length)

      // Process all items
      allOrderItems.forEach((item: OrderItem) => {
        console.log("Processing Item:", {
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })

        const existingItem = topSellingItemsMap.get(item.itemId)
        if (existingItem) {
          existingItem.totalQuantity += item.quantity
          existingItem.totalSales += item.price * item.quantity
        } else {
          topSellingItemsMap.set(item.itemId, {
            name: item.name,
            category: item.category,
            totalQuantity: item.quantity,
            totalSales: item.price * item.quantity
          })
        }
      })

      // Convert map to sorted array and take top 5
      const topSellingItems: TopSellingItem[] = Array.from(topSellingItemsMap.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5)
        .map((item, index) => ({
          id: `top-item-${index}`,
          name: item.name,
          quantity: item.totalQuantity,
          totalSales: item.totalSales,
          category: item.category
        }))

      console.log("DEBUG: Top Selling Items Calculation Complete")
      console.log("Top Selling Items Map Size:", topSellingItemsMap.size)
      console.log("Top Selling Items:", JSON.stringify(topSellingItems, null, 2))

      setDashboardData({
        totalOrders: currentMonthOrdersSnapshot.size,
        totalSales: currentMonthTotalSales,
        lowStockItems: totalLowStockItems,
        recentOrders: ordersSnapshot.docs.map(doc => ({
          ...doc.data() as Order,
          id: doc.id
        })),
        monthlyGrowth,
        totalInventoryItems,
        inventoryItems: {
          total: totalInventoryItems,
          inStock: totalInStockItems,
          lowStock: totalLowStockItems,
          details: inventoryDetails
        },
        salesByCategory: translatedCategorySales,
        dailySalesData: [],
        topSellingItems,
        salesList: []
      })
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
    }
  }

  const fetchComprehensiveDashboardData = async () => {
    try {
      // Hardcoded establishment ID for debugging
      const hardcodedEstablishmentId = 'restaurante-milenio-f7a872'
      
      // Use hardcoded ID if user's establishmentId is undefined or empty
      const establishmentId = user?.establishmentId || hardcodedEstablishmentId
      
      console.log("🔍 Establishment ID Debug:", {
        userEstablishmentId: user?.establishmentId,
        usedEstablishmentId: establishmentId
      })

      const ordersRef = collection(db, `restaurants/${establishmentId}/orders`)
      
      // Log the exact path being used
      console.log("📂 Orders Collection Path:", `restaurants/${establishmentId}/orders`)
      
      // Fetch sales list (last 50 completed orders)
      const salesQuery = query(
        ordersRef, 
        where('status', '==', 'finished'),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      
      const salesSnapshot = await getDocs(salesQuery)
      
      // Log number of orders found
      console.log("🧾 Orders Found:", salesSnapshot.docs.length)
      
      const salesList = salesSnapshot.docs.map(doc => {
        const orderData = doc.data() as Order
        // Check if createdAt is a Timestamp and convert if necessary
        const createdAt = orderData.createdAt instanceof Timestamp 
          ? orderData.createdAt.toDate() 
          : orderData.createdAt

        return {
          orderId: doc.id,
          date: createdAt,
          total: orderData.total,
          paymentMethod: orderData.paymentInfo?.method || 'Unknown'
        }
      })

      // Modify state update to preserve existing data
      setDashboardData(prevData => {
        console.log("Previous Dashboard Data (Detailed):", {
          ...prevData,
          topSellingItems: prevData.topSellingItems,
          topSellingItemsType: typeof prevData.topSellingItems,
          topSellingItemsIsArray: Array.isArray(prevData.topSellingItems)
        })
        
        const newData = {
          ...prevData,
          salesByCategory: prevData.salesByCategory,
          dailySalesData: prevData.dailySalesData,
          topSellingItems: prevData.topSellingItems,
          salesList: salesList
        }

        console.log("New Dashboard Data (Detailed):", {
          salesByCategory: newData.salesByCategory,
          dailySalesData: newData.dailySalesData,
          topSellingItems: newData.topSellingItems,
          topSellingItemsType: typeof newData.topSellingItems,
          topSellingItemsIsArray: Array.isArray(newData.topSellingItems)
        })

        return newData
      })
    } catch (error: unknown) {
      // Type guard to check if error is an Error object
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'An unknown error occurred'
      
      const errorStack = error instanceof Error 
        ? error.stack 
        : undefined

      console.error("Comprehensive dashboard data fetch error:", errorMessage)
      
      // Log detailed error information
      console.error("🚨 Detailed Error:", {
        message: errorMessage,
        stack: errorStack,
        establishmentId: user?.establishmentId
      })
      
      setDashboardData(prevData => {
        return {
          ...prevData,
          salesList: []
        }
      })
    }
  }

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t("dashboard.goodMorning")
    if (hour < 18) return t("dashboard.goodAfternoon")
    return t("dashboard.goodEvening")
  }

  // Get user's display name or first part of email
  const userName = user?.displayName || user?.email?.split('@')[0] || t("dashboard.user")

  // Stock status icon component
  const StockStatusIcon = ({ status }: { status: 'critical' | 'warning' | 'healthy' }) => {
    switch (status) {
      case 'critical':
        return <XCircle className="text-red-500 w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="text-yellow-500 w-5 h-5" />
      case 'healthy':
        return <CheckCircle2 className="text-green-500 w-5 h-5" />
    }
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Serializar fetches para evitar condiciones de carrera
        await fetchDashboardData()
        await fetchComprehensiveDashboardData()
      } catch (error) {
        console.error("Dashboard data loading error:", error)
        // Opcional: Manejar el error de manera amigable con el usuario
        // toast.error(t("dashboard.loadError"))
      }
    }

    if (db && user) {
      loadDashboardData()
    }
  }, [db, user])

  const inventoryStatCards = [
    { 
      label: t("dashboard.inventory.total"), 
      value: dashboardData.inventoryItems.total,
      className: "text-primary"
    },
    { 
      label: t("dashboard.inventory.inStock"), 
      value: dashboardData.inventoryItems.inStock,
      className: "text-green-600"
    },
    { 
      label: t("dashboard.inventory.lowStock"), 
      value: dashboardData.inventoryItems.lowStock,
      className: "text-red-600"
    }
  ]

  const getCategoryStatus = (categoryData: {
    total: number,
    inStock: number,
    minStockThreshold: number,
    criticalItems: number,
    warningItems: number,
    healthyItems: number
  }) => {
    const totalMinStockThreshold = categoryData.minStockThreshold
    const totalInStock = categoryData.inStock

    // Critical if total in-stock is less than total minimum stock threshold
    if (totalInStock < totalMinStockThreshold) return 'critical'
    
    // Warning if total in-stock is less than 1.5 * total minimum stock threshold
    if (totalInStock < totalMinStockThreshold * 1.5) return 'warning'
    
    return 'healthy'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Personalized Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("dashboard.welcomeMessage", { 
            restaurantName: user?.establishmentId || user?.restaurantName || t("dashboard.yourRestaurant") 
          })}
        </p>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales Overview - Top Left */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.salesByCategory.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.salesByCategory && dashboardData.salesByCategory.length > 0 
                ? dashboardData.salesByCategory.reduce((sum, cat) => sum + cat.totalSales, 0).toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "0.00"
              }
            </div>
            <div className="text-xs text-green-600">
              {dashboardData.salesByCategory && dashboardData.salesByCategory.length > 0
                ? `+${dashboardData.monthlyGrowth}% ${t("dashboard.totalSales.comparedToLastMonth")}`
                : t("dashboard.noSalesData")
              }
            </div>
          </CardContent>
        </Card>

        {/* Total Sales Performance - Top Center */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.dailySales.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalSales.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-green-600">
              {t("dashboard.totalSales.performance")}
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance - Top Right */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.totalSales.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalSales.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-green-600">
              {t("dashboard.totalSales.trend")}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Overview - Spanning 2 Columns */}
        <div className="w-full md:col-span-2">
          <Card className="w-full">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col justify-between items-center mb-4">
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  {t("dashboard.inventory.title")}
                </CardTitle>
                <Tabs 
                  value={inventoryViewMode} 
                  onValueChange={(value: string) => {
                    if (value !== inventoryViewMode) {
                      setInventoryViewMode(value as 'totals' | 'by_category' | 'by_item')
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid grid-cols-3 h-10 sm:h-auto">
                    {[
                      { value: 'totals', label: t("dashboard.inventory.totals") },
                      { value: 'by_category', label: t("dashboard.inventory.byCategory") },
                      { value: 'by_item', label: t("dashboard.inventory.byItem") }
                    ].map(tab => (
                      <TabsTrigger 
                        key={tab.value}
                        value={tab.value} 
                        className="text-xs sm:text-sm py-1.5 sm:py-2"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="totals" className="mt-4 sm:mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {inventoryStatCards.map((stat, index) => (
                        <Card 
                          key={index} 
                          className="shadow-sm hover:shadow-md transition-shadow w-full"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              {stat.label}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-xl sm:text-2xl font-bold ${stat.className}`}>
                              {stat.value}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="by_category" className="mt-4 sm:mt-6">
                    <div className="space-y-4">
                      {Object.entries(dashboardData.inventoryItems.details.reduce((acc, item) => {
                        const category = item.category || 'uncategorized'
                        
                        if (!acc[category]) {
                          acc[category] = {
                            total: 0,
                            inStock: 0,
                            minStockThreshold: 0,
                            criticalItems: 0,
                            warningItems: 0,
                            healthyItems: 0
                          }
                        }
                        
                        acc[category].total += item.total
                        acc[category].inStock += item.inStock
                        acc[category].minStockThreshold += item.minQuantity ?? 10
                        
                        if (item.status === 'critical') acc[category].criticalItems++
                        if (item.status === 'warning') acc[category].warningItems++
                        if (item.status === 'healthy') acc[category].healthyItems++
                        
                        return acc
                      }, {} as Record<string, {
                        total: number,
                        inStock: number,
                        minStockThreshold: number,
                        criticalItems: number,
                        warningItems: number,
                        healthyItems: number
                      }>)
                      ).map(([category, data]) => (
                        <Accordion 
                          type="single" 
                          collapsible 
                          key={category} 
                          className="border rounded-lg bg-white shadow-sm w-full"
                        >
                          <AccordionItem value={category} className="border-b last:border-b-0">
                            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
                              <div className="flex flex-col w-full">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-sm sm:text-base text-gray-800">
                                    {category}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {t("dashboard.inventory.total")}: {data.total ?? 0}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {t("dashboard.inventory.inStock")}: {data.inStock ?? 0}
                                  </Badge>
                                  <Badge 
                                    variant={
                                      getCategoryStatus(data) === 'critical' ? 'destructive' :
                                      getCategoryStatus(data) === 'warning' ? 'default' :
                                      'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {t(`dashboard.inventory.status.${getCategoryStatus(data)}`)}
                                  </Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                              <Table>
                                <TableHeader className="bg-gray-50">
                                  <TableRow>
                                    {[
                                      "itemName", 
                                      "total", 
                                      "inStock", 
                                      "status"
                                    ].map(key => (
                                      <TableHead 
                                        key={key} 
                                        className="text-xs sm:text-sm font-semibold text-gray-600 py-3"
                                      >
                                        {key === 'status' 
                                          ? t('dashboard.inventory.status.label') 
                                          : t(`dashboard.inventory.${key}`)}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {dashboardData.inventoryItems.details.filter(item => item.category === category).map(item => (
                                    <TableRow 
                                      key={item.id} 
                                      className="hover:bg-gray-100 transition-colors"
                                    >
                                      <TableCell className="text-xs sm:text-sm text-gray-800">
                                        {item.name}
                                      </TableCell>
                                      <TableCell className="text-xs sm:text-sm text-gray-700">
                                        {item.total}
                                      </TableCell>
                                      <TableCell className="text-xs sm:text-sm text-gray-700">
                                        {item.inStock}
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={
                                            item?.status === 'critical' ? 'destructive' :
                                            item?.status === 'warning' ? 'default' : 'secondary'
                                          }
                                          className="text-xs"
                                        >
                                          {t(`dashboard.inventory.status.${item?.status || 'default'}`)}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="by_item" className="w-full mt-4 sm:mt-6">
                    {dashboardData.inventoryItems.details.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.inventoryItems.details.map((item) => (
                          <Accordion 
                            type="single" 
                            collapsible 
                            key={item.id || 'unknown-item'} 
                            className="border rounded-lg bg-white shadow-sm w-full"
                          >
                            <AccordionItem value={item.id || 'unknown-item'} className="border-b last:border-b-0">
                              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col w-full">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-sm sm:text-base text-gray-800">
                                      {item.name || 'Unknown Item'}
                                    </span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {t("dashboard.inventory.total")}: {item.total ?? 0}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {t("dashboard.inventory.inStock")}: {item.inStock ?? 0}
                                    </Badge>
                                    <Badge 
                                      variant={
                                        item.status === 'critical' ? 'destructive' :
                                        item.status === 'warning' ? 'default' :
                                        item.status === 'healthy' ? 'secondary' :
                                        'default'
                                      }
                                      className="text-xs"
                                    >
                                      {t(`dashboard.inventory.status.${
                                        item.status === 'critical' ? 'critical' :
                                        item.status === 'warning' ? 'warning' :
                                        item.status === 'healthy' ? 'healthy' :
                                        'default'
                                      }`)}
                                    </Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-0">
                                <Table>
                                  <TableHeader className="bg-gray-50">
                                    <TableRow>
                                      {[
                                        "category", 
                                        "total", 
                                        "inStock", 
                                        "status"
                                      ].map(key => (
                                        <TableHead 
                                          key={key} 
                                          className="text-xs sm:text-sm font-semibold text-gray-600 py-3"
                                        >
                                          {t(`dashboard.inventory.${key}`)}
                                        </TableHead>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow className="hover:bg-gray-100 transition-colors">
                                      <TableCell className="text-xs sm:text-sm text-gray-700">
                                        {item.category}
                                      </TableCell>
                                      <TableCell className="text-xs sm:text-sm text-gray-700">
                                        {item.total}
                                      </TableCell>
                                      <TableCell className="text-xs sm:text-sm text-gray-700">
                                        {item.inStock}
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={
                                            item?.status === 'critical' ? 'destructive' :
                                            item?.status === 'warning' ? 'default' : 'secondary'
                                          }
                                          className="text-xs"
                                        >
                                          {t(`dashboard.inventory.status.${item?.status || 'default'}`)}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        {t("dashboard.inventory.noItems")}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </CardHeader>
          </Card>
        </div>
         {/* Top Selling Items */}
         <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('dashboard.topSellingItems.title')}</CardTitle>
            <CardDescription>{t('dashboard.topSellingItems.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.topSellingItems.map((item) => (
              <div 
                key={item.id} 
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t('dashboard.topSellingItems.quantity', { value: item.totalSales.toLocaleString(i18n.language, { minimumFractionDigits: 2 }) })}
                  </div>
                </div>
                <Badge variant="secondary">{item.quantity}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="w-full h-[500px]  md:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.salesByCategory.title')}</CardTitle>
            <CardDescription>{t('dashboard.salesByCategory.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.salesByCategory && dashboardData.salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart cy="50%" cx="50%" >
                  <Pie
                    data={dashboardData.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={0}
                    labelLine={false}
                    fill="#8884d8"
                    dataKey="totalSales"
                    nameKey="category"
                    
                  >
                    {dashboardData.salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${new Intl.NumberFormat(i18n.language, { style: 'currency', currency: user?.currency || 'USD' }).format(value as number)}`, 
                      t(`dashboard.salesByCategory.categories.${name}`)
                    ]}
                  />
                  <Legend 
                    formatter={(value) => t(`dashboard.salesByCategory.categories.${value}`)}
                    layout="horizontal" 
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ 
                      paddingTop: '5px',
                      position: 'relative',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}
                    iconSize={8}
                    className="block sm:hidden text-xs"
                  />
                  <Legend 
                    formatter={(value) => t(`dashboard.salesByCategory.categories.${value}`)}
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    iconSize={10}
                    className="hidden sm:block text-xs"
                    wrapperStyle={{
                      maxWidth: '30%',
                      paddingLeft: '10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                {t('dashboard.salesByCategory.noSalesData')}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Recent Orders */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('dashboard.recentOrders.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentOrders.map((order, index) => (
              <div 
                key={order.id} 
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <div>
                  <div className="font-medium">
                    {t('dashboard.recentOrders.orderNumber', { number: index + 1 })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('dashboard.recentOrders.table')} {order.tableNumber || '-'}
                  </div>
                </div>
                <Badge variant="outline">
                  {order.total.toLocaleString(i18n.language, { style: 'currency', currency: 'USD' })}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sales List */}
        <div className="container w-full md:col-span-3 mx-auto px-2  sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-4">
            <Card className="w-full">
              <CardHeader className="p-2 sm:p-4">
                <CardTitle className="text-sm sm:text-base">{t('dashboard.salesList.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                {dashboardData.salesList.length > 0 ? (
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b">
                          <th className="px-1 sm:px-4 py-2 text-left text-xs sm:text-sm">{t('dashboard.salesList.columns.date')}</th>
                          <th className="px-1 sm:px-4 py-2 text-left text-xs sm:text-sm hidden sm:table-cell">{t('dashboard.salesList.columns.orderId')}</th>
                          <th className="px-1 sm:px-4 py-2 text-right text-xs sm:text-sm">{t('dashboard.salesList.columns.total')}</th>
                          <th className="px-1 sm:px-4 py-2 text-left text-xs sm:text-sm hidden md:table-cell">{t('dashboard.salesList.columns.paymentMethod')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.salesList.map((sale) => (
                          <tr key={sale.orderId} className="border-b last:border-b-0">
                            <td className="px-1 sm:px-4 py-2 text-xs sm:text-sm">
                              {new Date(sale.date).toLocaleDateString(i18n.language, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-1 sm:px-4 py-2 text-xs sm:text-sm hidden sm:table-cell">{sale.orderId}</td>
                            <td className="px-1 sm:px-4 py-2 text-right text-xs sm:text-sm">
                              {sale.total.toLocaleString(i18n.language, { 
                                style: 'currency', 
                                currency: user?.currency || 'USD' 
                              })}
                            </td>
                            <td className="px-1 sm:px-4 py-2 text-xs sm:text-sm hidden md:table-cell">{sale.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground p-4 text-xs sm:text-sm">
                    {t('dashboard.salesList.noSales')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="w-full md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.additionalInsights.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              {t('dashboard.additionalInsights.placeholder')}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
