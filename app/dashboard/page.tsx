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
  InventoryItemSourceData,
  PaymentMethod
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
import { ptBR, enUS } from 'date-fns/locale'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { Download, Clock, AlertCircle, FileSpreadsheet, FileText, Users, Package, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserRole } from "@/types/permissions"

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
    salesList: [],
    paymentMethodsBreakdown: []
  })

  const [inventoryViewMode, setInventoryViewMode] = useState<'totals' | 'by_category' | 'by_item'>('totals')

  // Define category colors palette (cycles for dynamic categories)
  const categoryColorPalette = [
    '#10B981', '#3B82F6', '#F43F5E', '#8B5CF6',
    '#F97316', '#F59E0B', '#6B7280', '#14B8A6'
  ]

  const categoryColors: Record<string, string> = {
    appetizer: '#10B981',
    main_course: '#3B82F6',
    dessert: '#F43F5E',
    drink: '#8B5CF6',
    sides: '#F97316',
    other: '#6B7280'
  }

  // Helper: resolve category display name (translate legacy IDs, use raw name for custom)
  const getCategoryName = (categoryId: string, customName?: string): string => {
    const defaultKeys: Record<string, string> = {
      drinks: t('categories.drinks'),
      appetizers: t('categories.appetizers'),
      main_courses: t('categories.mainCourses'),
      desserts: t('categories.desserts'),
      salads: t('categories.salads'),
      sides: t('categories.sides'),
    }
    return defaultKeys[categoryId] ?? customName ?? categoryId
  }

  const fetchDashboardData = async () => {
    try {
      const ordersRef = collection(db, `restaurants/${user?.establishmentId}/orders`)
      
      // Fetch categories dynamically from database
      const inventoryCategoriesSnapshot = await getDocs(
        collection(db, `restaurants/${user?.establishmentId}/inventory`)
      )
      const validCategories = inventoryCategoriesSnapshot.docs.map((doc, index) => ({
        id: doc.id,
        name: doc.data().name || doc.id,
        color: doc.data().color || categoryColorPalette[index % categoryColorPalette.length]
      }))

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
          categoryName: getCategoryName(validCategories[index].id, validCategories[index].name)
        }))
      )

      // --- INICIO CORRECCIÓN TIPOS INVENTARIO ---
      // 1. Añadir cálculo de status a cada InventoryItem para poder usar item.status
      const addStatusToInventoryItem = (item: InventoryItem): InventoryItemDetail => {
        const quantity = Number(item.quantity) || 0;
        const minQuantity = Number(item.minQuantity) || 10;
        const lowStockThreshold = Number(item.lowStockThreshold) || 50;
        let status: 'critical' | 'warning' | 'healthy' | 'default' = 'default';
        if (quantity < minQuantity) status = 'critical';
        else if (quantity < minQuantity * 1.5) status = 'warning';
        else status = 'healthy';
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          categoryName: item.categoryName,
          total: quantity,
          inStock: quantity,
          lowStock: status !== 'healthy' ? Math.max(0, minQuantity - quantity) : 0,
          minQuantity,
          lowStockThreshold,
          status,
        };
      };

      // 2. Al procesar allInventoryItems, convertirlos a InventoryItemDetail
      const allInventoryItemsDetailed: InventoryItemDetail[] = allInventoryItems.map(addStatusToInventoryItem);

      // 3. Usar allInventoryItemsDetailed en todos los cálculos posteriores y en el dashboardData
      // --- FIN CORRECCIÓN TIPOS INVENTARIO ---

      // Calculate inventory totals
      const totalInventoryItems = allInventoryItemsDetailed.length
      const totalInStockItems = allInventoryItemsDetailed.reduce((sum, item) => sum + item.inStock, 0)
      const totalLowStockItems = allInventoryItemsDetailed.reduce((sum, item) => sum + (item.lowStock ?? 0), 0)

      // Calculate category-level stock status
      const categorySummary = allInventoryItemsDetailed.reduce((acc, item) => {
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

      // Calculate monthly growth percentage
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

      // Mapa para agregar ventas por categoría
      const categorySalesMap = new Map<string, {
        totalSales: number, 
        totalQuantity: number
      }>()

      // Expand payment methods
      const paymentMethodsMap: Record<string, number> = {
        cash: 0,
        credit: 0,
        debit: 0,
        other: 0
      }

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

        // Normalize payment method
        const paymentMethod = orderData.paymentMethod?.toLowerCase() || 'other'
        const normalizedMethod = 
          paymentMethod === 'credito' ? 'credit' :
          paymentMethod === 'debito' ? 'debit' :
          paymentMethod === 'efectivo' ? 'cash' :
          'other'

        // Update payment method totals
        if (paymentMethodsMap.hasOwnProperty(normalizedMethod)) {
          paymentMethodsMap[normalizedMethod] += orderData.total || 0
        } else {
          paymentMethodsMap['other'] += orderData.total || 0
        }
      })

      // Convert map to array and calculate percentage
      const paymentMethodsBreakdown = Object.entries(paymentMethodsMap)
        .filter(([_, total]) => total > 0)
        .map(([method, total]) => ({
          method: (method === 'cash' || method === 'credit' || method === 'debit' || method === 'other' 
            ? method 
            : 'other') as PaymentMethod, 
          total,
          percentage: (total / currentMonthTotalSales) * 100
        }))
        .sort((a, b) => b.total - a.total)

      // Build a lookup from fetched categories for colors and names
      const categoryMeta: Record<string, { name: string; color: string }> = {}
      validCategories.forEach((cat, index) => {
        categoryMeta[cat.id] = {
          name: getCategoryName(cat.id, cat.name),
          color: cat.color || categoryColorPalette[index % categoryColorPalette.length]
        }
      })

      // Transformar datos para visualización
      const translatedCategorySales = Array.from(categorySalesMap.entries()).map(([category, data]) => ({
        category,
        name: categoryMeta[category]?.name ?? getCategoryName(category, category),
        totalQuantity: data.totalQuantity,
        totalSales: data.totalSales,
        color: categoryMeta[category]?.color ?? categoryColors[category] ?? categoryColors['other']
      })).sort((a, b) => b.totalSales - a.totalSales)

      // Calculate Top Selling Items from Orders
      const topSellingItemsMap = new Map<string, {
        id: string;
        name: string;
        quantity: number;
        totalSales: number;
        category?: string;
      }>()

      salesByCategorySnapshot.docs.forEach(doc => {
        const orderData = doc.data() as Order
        const items = Array.isArray(orderData.items) 
          ? orderData.items 
          : Object.values(orderData.items)

        items.forEach(item => {
          const nameKey = item.name?.trim() || '';
          if (!nameKey) return;
          const existingItem = topSellingItemsMap.get(nameKey)
          if (existingItem) {
            existingItem.quantity += item.quantity
            existingItem.totalSales += item.price * item.quantity
          } else {
            topSellingItemsMap.set(nameKey, {
              id: item.id || item.itemId || nameKey,
              name: item.name,
              quantity: item.quantity,
              totalSales: item.price * item.quantity,
              category: item.category
            })
          }
        })
      })

      // Prepare top selling items
      const topSellingItems: TopSellingItem[] = Array.from(topSellingItemsMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          totalSales: item.totalSales,
          category: item.category || 'uncategorized'
        }))

      // Update dashboard data
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
          details: allInventoryItemsDetailed
        },
        salesByCategory: translatedCategorySales,
        dailySalesData: [],
        topSellingItems,
        salesList: [],
        paymentMethodsBreakdown
      })
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
    }
  }

  const fetchComprehensiveDashboardData = async () => {
    try {
      // Fetch sales data for the current month
      const currentDate = new Date()
      const startOfCurrentMonth = startOfMonth(currentDate)
      const endOfCurrentMonth = endOfMonth(currentDate)

      const salesQuery = query(
        collection(db, `restaurants/${user?.establishmentId}/orders`),
        where('createdAt', '>=', startOfCurrentMonth),
        where('createdAt', '<=', endOfCurrentMonth),
        where('status', '==', 'finished'),
        orderBy('createdAt', 'desc')
      )

      const salesSnapshot = await getDocs(salesQuery)

      // Initialize payment methods map
      const paymentMethodsMap: Record<string, number> = {
        cash: 0,
        credit: 0,
        debit: 0,
        other: 0
      }

      // Calculate total sales and process payment methods
      const currentMonthTotalSales = salesSnapshot.docs.reduce((total, doc) => {
        const orderData = doc.data() as Order
        const orderTotal = orderData.total || 0
        
        // Update payment methods total
        const paymentMethod = 
          orderData.paymentMethod || 
          orderData.paymentInfo?.method || 
          'other'
        
        paymentMethodsMap[paymentMethod] = 
          (paymentMethodsMap[paymentMethod] || 0) + orderTotal

        return total + orderTotal
      }, 0)

      // Process category sales
      const categorySalesMap = new Map<string, { totalQuantity: number; totalSales: number }>()
      
      salesSnapshot.docs.forEach(doc => {
        const orderData = doc.data() as Order
        const items = Array.isArray(orderData.items) 
          ? orderData.items 
          : Object.values(orderData.items)

        items.forEach(item => {
          const category = item.category || 'uncategorized'
          const existingCategoryData = categorySalesMap.get(category) || { totalQuantity: 0, totalSales: 0 }
          
          categorySalesMap.set(category, {
            totalQuantity: existingCategoryData.totalQuantity + item.quantity,
            totalSales: existingCategoryData.totalSales + (item.price * item.quantity)
          })
        })
      })

      // Fetch categories dynamically from database for color matching and correct names
      const inventoryCategoriesSnapshot = await getDocs(
        collection(db, `restaurants/${user?.establishmentId}/inventory`)
      )
      const validCategories = inventoryCategoriesSnapshot.docs.map((doc, index) => ({
        id: doc.id,
        name: doc.data().name || doc.id,
        color: doc.data().color || categoryColorPalette[index % categoryColorPalette.length]
      }))

      // Build a lookup from fetched categories for colors and names
      const categoryMeta: Record<string, { name: string; color: string }> = {}
      validCategories.forEach((cat, index) => {
        categoryMeta[cat.id] = {
          name: getCategoryName(cat.id, cat.name),
          color: cat.color || categoryColorPalette[index % categoryColorPalette.length]
        }
      })

      // Transform category sales for visualization
      const translatedCategorySales = Array.from(categorySalesMap.entries()).map(([category, data]) => ({
        category,
        totalQuantity: data.totalQuantity,
        totalSales: data.totalSales
      }))

      // Prepare sales by category with colors and names
      const salesByCategory: SalesByCategory[] = translatedCategorySales.map(category => {
        // Normalize category name for color matching
        const normalizedCategory = category.category.toLowerCase().replace(/\s+/g, '_')
        return {
          ...category,
          name: categoryMeta[category.category]?.name ?? getCategoryName(category.category, category.category),
          color: categoryMeta[category.category]?.color ?? 
                 categoryColors[normalizedCategory] ?? 
                 categoryColors[category.category] ?? 
                 categoryColors['other']
        }
      })

      // Calculate top selling items
      const topSellingItemsMap = new Map<string, {
        id: string;
        name: string;
        quantity: number;
        totalSales: number;
        category?: string;
      }>()

      salesSnapshot.docs.forEach(doc => {
        const orderData = doc.data() as Order
        const items = Array.isArray(orderData.items) 
          ? orderData.items 
          : Object.values(orderData.items)

        items.forEach(item => {
          const nameKey = item.name?.trim() || '';
          if (!nameKey) return;
          const existingItem = topSellingItemsMap.get(nameKey)
          if (existingItem) {
            existingItem.quantity += item.quantity
            existingItem.totalSales += item.price * item.quantity
          } else {
            topSellingItemsMap.set(nameKey, {
              id: item.id || item.itemId || nameKey,
              name: item.name,
              quantity: item.quantity,
              totalSales: item.price * item.quantity,
              category: item.category
            })
          }
        })
      })

      // Prepare top selling items
      const topSellingItems: TopSellingItem[] = Array.from(topSellingItemsMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          totalSales: item.totalSales,
          category: item.category || 'uncategorized'
        }))

      // Prepare sales list with more comprehensive filtering
      const salesList = salesSnapshot.docs.map(doc => {
        const orderData = doc.data() as Order
        
        // Convert Firestore Timestamp to Date if needed
        let createdAtDate: Date | null = null
        if (orderData.createdAt) {
          if (orderData.createdAt instanceof Date) {
            createdAtDate = orderData.createdAt
          } else if (typeof orderData.createdAt === 'object' && 'toDate' in orderData.createdAt) {
            createdAtDate = (orderData.createdAt as any).toDate()
          } else if (typeof orderData.createdAt === 'string') {
            createdAtDate = new Date(orderData.createdAt)
          }
        }
        
        return {
          date: createdAtDate ? format(createdAtDate, 'PP', { locale: i18n.language === 'pt-BR' ? ptBR : enUS }) : '',
          orderId: doc.id,
          total: orderData.total || 0,
          paymentMethod: 
            orderData.paymentMethod || 
            orderData.paymentInfo?.method || 
            'other',
          status: orderData.status || 'unknown'
        }
      })
      .filter(sale => sale.total > 0) // Ensure only sales with value are shown
      .sort((a, b) => {
        // Handle empty dates in sorting
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      .slice(0, 50) // Limit to most recent 50 sales

      // Update state with complete dashboard data
      setDashboardData((prevData: DashboardData) => {
        // Ensure all properties of DashboardData are included
        return {
          ...prevData,
          totalOrders: salesSnapshot.docs.length,
          totalSales: currentMonthTotalSales,
          salesByCategory,
          dailySalesData: [],
          topSellingItems,
          salesList,
          paymentMethodsBreakdown: Object.entries(paymentMethodsMap)
            .filter(([_, total]) => total > 0)
            .map(([method, total]) => ({
              method: (method === 'cash' || method === 'credit' || method === 'debit' || method === 'other' 
                ? method 
                : 'other') as PaymentMethod, 
              total: Number(total),
              percentage: (Number(total) / currentMonthTotalSales) * 100
            }))
            .sort((a, b) => b.total - a.total),
          lowStockItems: prevData.lowStockItems || 0,
          recentOrders: prevData.recentOrders || [],
          monthlyGrowth: prevData.monthlyGrowth || 0,
          totalInventoryItems: prevData.totalInventoryItems || 0,
          inventoryItems: prevData.inventoryItems || { total: 0, lowStock: 0 }
        }
      })
    } catch (error: unknown) {
      // Type guard to check if error is an Error object
      let errorMessage = t('auth.errors.unexpectedError')
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message)
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      console.error("Dashboard data fetch error:", errorMessage)
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

  useEffect(() => {
    // Notificar cuando hay un crecimiento negativo
    if (dashboardData.monthlyGrowth < 0) {
      toast.warning(t("dashboard.toast.salesAlert"))
    }

    // Notificar metas alcanzadas
    const targetSales = 10000; // Define a target sales value
    if (dashboardData.totalSales > targetSales) {
      toast.success(t("dashboard.toast.goalReached"))
    }
  }, [dashboardData])

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

  const handleExportGeneralExcel = async () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Sales by day
      const wsSales = XLSX.utils.json_to_sheet(dashboardData.dailySalesData?.length > 0 ? dashboardData.dailySalesData : [{ date: '', sales: '' }]);
      XLSX.utils.book_append_sheet(wb, wsSales, t("dashboard.export.salesByDay"));
      
      // Top selling products
      const wsProducts = XLSX.utils.json_to_sheet(dashboardData.topSellingItems?.length > 0 ? dashboardData.topSellingItems : [{ name: '', quantity: '' }]);
      XLSX.utils.book_append_sheet(wb, wsProducts, t("dashboard.export.topProducts"));
      
      // Inventory from dashboard data
      const wsInventory = XLSX.utils.json_to_sheet(dashboardData.inventoryItems.details?.length > 0 ? dashboardData.inventoryItems.details : [{ name: '', inStock: '' }]);
      XLSX.utils.book_append_sheet(wb, wsInventory, t("dashboard.export.inventory"));
      
      // Complete inventory with all categories
      const inventoryRef = collection(db, `restaurants/${user?.establishmentId}/inventory`)
      const categoriesSnapshot = await getDocs(inventoryRef)
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id
        const categoryName = categoryDoc.data().name || categoryId
        const itemsRef = collection(db, `restaurants/${user?.establishmentId}/inventory/${categoryId}/items`)
        const itemsSnapshot = await getDocs(itemsRef)
        
        const items = itemsSnapshot.docs.map(doc => ({
          name: doc.data().name,
          quantity: doc.data().quantity,
          minQuantity: doc.data().minQuantity,
          price: doc.data().price,
          category: categoryName
        }))
        
        // Always create sheet with headers, even if no data
        const ws = XLSX.utils.json_to_sheet(items.length > 0 ? items : [
          { name: '', quantity: '', minQuantity: '', price: '', category: categoryName }
        ])
        XLSX.utils.book_append_sheet(wb, ws, `Inventory - ${categoryName.substring(0, 25)}`)
      }
      
      // Complete sales data
      const ordersRef = collection(db, `restaurants/${user?.establishmentId}/orders`)
      const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'))
      const ordersSnapshot = await getDocs(ordersQuery)
      
      const salesData = ordersSnapshot.docs.map(doc => {
        const order = doc.data() as Order
        return {
          orderId: doc.id,
          date: order.createdAt ? new Date(order.createdAt instanceof Date ? order.createdAt : (order.createdAt as any).toDate()).toLocaleDateString() : '',
          total: order.total || 0,
          status: order.status,
          paymentMethod: order.paymentMethod,
          tableNumber: order.tableNumber,
          items: Object.values(order.items || {}).map((item: OrderItem) => `${item.name} (${item.quantity})`).join(', ')
        }
      })
      
      // Always create sheet with headers, even if no data
      const wsSalesComplete = XLSX.utils.json_to_sheet(salesData.length > 0 ? salesData : [
        { orderId: '', date: '', total: '', status: '', paymentMethod: '', tableNumber: '', items: '' }
      ])
      XLSX.utils.book_append_sheet(wb, wsSalesComplete, 'Complete Sales')
      
      // User activity data
      const sessionsRef = collection(db, `restaurants/${user?.establishmentId}/sessions`)
      const sessionsQuery = query(sessionsRef, orderBy('loginTime', 'desc'))
      const sessionsSnapshot = await getDocs(sessionsQuery)
      
      const sessionsData = sessionsSnapshot.docs.map(doc => {
        const session = doc.data()
        return {
          sessionId: doc.id,
          username: session.username,
          email: session.email,
          role: session.role,
          loginTime: session.loginTime ? new Date(session.loginTime instanceof Date ? session.loginTime : (session.loginTime as any).toDate()).toLocaleString() : '',
          logoutTime: session.logoutTime ? new Date(session.logoutTime instanceof Date ? session.logoutTime : (session.logoutTime as any).toDate()).toLocaleString() : '',
          status: session.status,
          device: session.device?.type,
          os: session.device?.os
        }
      })
      
      // Always create sheet with headers, even if no data
      const wsUserActivity = XLSX.utils.json_to_sheet(sessionsData.length > 0 ? sessionsData : [
        { sessionId: '', username: '', email: '', role: '', loginTime: '', logoutTime: '', status: '', device: '', os: '' }
      ])
      XLSX.utils.book_append_sheet(wb, wsUserActivity, 'User Activity')
      
      XLSX.writeFile(wb, `${t("dashboard.export.generalReport")}-${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success(t("dashboard.toast.excelDownloaded"));
    } catch (error) {
      console.error('Error exporting general report:', error)
      toast.error(t("dashboard.toast.exportError"))
    }
  }

  const handleExportInventoryExcel = async () => {
    try {
      const inventoryRef = collection(db, `restaurants/${user?.establishmentId}/inventory`)
      const categoriesSnapshot = await getDocs(inventoryRef)
      
      const wb = XLSX.utils.book_new()
      let hasData = false
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id
        const categoryName = categoryDoc.data().name || categoryId
        const itemsRef = collection(db, `restaurants/${user?.establishmentId}/inventory/${categoryId}/items`)
        const itemsSnapshot = await getDocs(itemsRef)
        
        const items = itemsSnapshot.docs.map(doc => ({
          name: doc.data().name,
          quantity: doc.data().quantity,
          minQuantity: doc.data().minQuantity,
          price: doc.data().price,
          category: categoryName
        }))
        
        // Always create sheet with headers, even if no data
        const ws = XLSX.utils.json_to_sheet(items.length > 0 ? items : [
          { name: '', quantity: '', minQuantity: '', price: '', category: categoryName }
        ])
        XLSX.utils.book_append_sheet(wb, ws, categoryName.substring(0, 31))
        hasData = true
      }
      
      if (!hasData) {
        // Create empty sheet with headers if no categories
        const ws = XLSX.utils.json_to_sheet([
          { name: '', quantity: '', minQuantity: '', price: '', category: '' }
        ])
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory')
      }
      
      XLSX.writeFile(wb, `inventory-report-${new Date().toISOString().slice(0,10)}.xlsx`)
      toast.success(t("dashboard.toast.inventoryDownloaded"))
    } catch (error) {
      console.error('Error exporting inventory:', error)
      toast.error(t("dashboard.toast.exportError"))
    }
  }

  const handleExportSalesExcel = async () => {
    try {
      const ordersRef = collection(db, `restaurants/${user?.establishmentId}/orders`)
      const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'))
      const ordersSnapshot = await getDocs(ordersQuery)
      
      const salesData = ordersSnapshot.docs.map(doc => {
        const order = doc.data() as Order
        return {
          orderId: doc.id,
          date: order.createdAt ? new Date(order.createdAt instanceof Date ? order.createdAt : (order.createdAt as any).toDate()).toLocaleDateString() : '',
          total: order.total || 0,
          status: order.status,
          paymentMethod: order.paymentMethod,
          tableNumber: order.tableNumber,
          items: Object.values(order.items || {}).map((item: OrderItem) => `${item.name} (${item.quantity})`).join(', ')
        }
      })
      
      const wb = XLSX.utils.book_new()
      // Always create sheet with headers, even if no data
      const ws = XLSX.utils.json_to_sheet(salesData.length > 0 ? salesData : [
        { orderId: '', date: '', total: '', status: '', paymentMethod: '', tableNumber: '', items: '' }
      ])
      XLSX.utils.book_append_sheet(wb, ws, 'Sales')
      XLSX.writeFile(wb, `sales-report-${new Date().toISOString().slice(0,10)}.xlsx`)
      toast.success(t("dashboard.toast.salesDownloaded"))
    } catch (error) {
      console.error('Error exporting sales:', error)
      toast.error(t("dashboard.toast.exportError"))
    }
  }

  const handleExportUserActivityExcel = async () => {
    try {
      const sessionsRef = collection(db, `restaurants/${user?.establishmentId}/sessions`)
      const sessionsQuery = query(sessionsRef, orderBy('loginTime', 'desc'))
      const sessionsSnapshot = await getDocs(sessionsQuery)
      
      const sessionsData = sessionsSnapshot.docs.map(doc => {
        const session = doc.data()
        return {
          sessionId: doc.id,
          username: session.username,
          email: session.email,
          role: session.role,
          loginTime: session.loginTime ? new Date(session.loginTime instanceof Date ? session.loginTime : (session.loginTime as any).toDate()).toLocaleString() : '',
          logoutTime: session.logoutTime ? new Date(session.logoutTime instanceof Date ? session.logoutTime : (session.logoutTime as any).toDate()).toLocaleString() : '',
          status: session.status,
          device: session.device?.type,
          os: session.device?.os
        }
      })
      
      const wb = XLSX.utils.book_new()
      // Always create sheet with headers, even if no data
      const ws = XLSX.utils.json_to_sheet(sessionsData.length > 0 ? sessionsData : [
        { sessionId: '', username: '', email: '', role: '', loginTime: '', logoutTime: '', status: '', device: '', os: '' }
      ])
      XLSX.utils.book_append_sheet(wb, ws, 'User Activity')
      XLSX.writeFile(wb, `user-activity-report-${new Date().toISOString().slice(0,10)}.xlsx`)
      toast.success(t("dashboard.toast.userActivityDownloaded"))
    } catch (error) {
      console.error('Error exporting user activity:', error)
      toast.error(t("dashboard.toast.exportError"))
    }
  }

  const handleExportGeneralPDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();
      
      // Sales by day
      doc.text(t("dashboard.export.salesByDay"), 14, 14);
      autoTable(doc, {
        startY: 20,
        head: [[t("dashboard.export.date"), t("dashboard.export.sales")]],
        body: (dashboardData.dailySalesData || []).map(row => [row.date, row.sales]),
      });
      let y = (doc as any).lastAutoTable?.finalY + 10 || 30;
      
      // Top selling products
      doc.text(t("dashboard.export.topProducts"), 14, y);
      autoTable(doc, {
        startY: y + 6,
        head: [[t("dashboard.export.product"), t("dashboard.export.quantity")]],
        body: (dashboardData.topSellingItems || []).map(row => [row.name, row.quantity]),
      });
      y = (doc as any).lastAutoTable?.finalY + 10 || y + 30;
      
      // Inventory from dashboard data
      doc.text(t("dashboard.export.inventory"), 14, y);
      autoTable(doc, {
        startY: y + 6,
        head: [[t("dashboard.export.product"), t("dashboard.export.stock")]],
        body: (dashboardData.inventoryItems.details || []).map(row => [row.name, row.inStock]),
      });
      y = (doc as any).lastAutoTable?.finalY + 10 || y + 30;
      
      // Complete inventory with all categories
      const inventoryRef = collection(db, `restaurants/${user?.establishmentId}/inventory`)
      const categoriesSnapshot = await getDocs(inventoryRef)
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id
        const categoryName = categoryDoc.data().name || categoryId
        const itemsRef = collection(db, `restaurants/${user?.establishmentId}/inventory/${categoryId}/items`)
        const itemsSnapshot = await getDocs(itemsRef)
        
        const items = itemsSnapshot.docs.map(doc => ({
          name: doc.data().name,
          quantity: doc.data().quantity,
          minQuantity: doc.data().minQuantity,
          price: doc.data().price,
          category: categoryName
        }))
        
        if (items.length > 0) {
          doc.text(`Inventory - ${categoryName.substring(0, 25)}`, 14, y);
          autoTable(doc, {
            startY: y + 6,
            head: [['Name', 'Quantity', 'Min Quantity', 'Price', 'Category']],
            body: items.map(row => [row.name, row.quantity, row.minQuantity, row.price, row.category]),
          });
          y = (doc as any).lastAutoTable?.finalY + 10 || y + 30;
        }
      }
      
      // Complete sales data
      const ordersRef = collection(db, `restaurants/${user?.establishmentId}/orders`)
      const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'))
      const ordersSnapshot = await getDocs(ordersQuery)
      
      const salesData = ordersSnapshot.docs.map(doc => {
        const order = doc.data() as Order
        return {
          orderId: doc.id,
          date: order.createdAt ? new Date(order.createdAt instanceof Date ? order.createdAt : (order.createdAt as any).toDate()).toLocaleDateString() : '',
          total: order.total || 0,
          status: order.status,
          paymentMethod: order.paymentMethod,
          tableNumber: order.tableNumber,
          items: Object.values(order.items || {}).map((item: OrderItem) => `${item.name} (${item.quantity})`).join(', ')
        }
      })
      
      if (salesData.length > 0) {
        doc.text('Complete Sales', 14, y);
        autoTable(doc, {
          startY: y + 6,
          head: [['Order ID', 'Date', 'Total', 'Status', 'Payment Method', 'Table', 'Items']],
          body: salesData.map(row => [row.orderId || '', row.date || '', row.total || 0, row.status || '', row.paymentMethod || '', row.tableNumber || '', row.items || '']),
        });
        y = (doc as any).lastAutoTable?.finalY + 10 || y + 30;
      }
      
      // User activity data
      const sessionsRef = collection(db, `restaurants/${user?.establishmentId}/sessions`)
      const sessionsQuery = query(sessionsRef, orderBy('loginTime', 'desc'))
      const sessionsSnapshot = await getDocs(sessionsQuery)
      
      const sessionsData = sessionsSnapshot.docs.map(doc => {
        const session = doc.data()
        return {
          sessionId: doc.id,
          username: session.username,
          email: session.email,
          role: session.role,
          loginTime: session.loginTime ? new Date(session.loginTime instanceof Date ? session.loginTime : (session.loginTime as any).toDate()).toLocaleString() : '',
          logoutTime: session.logoutTime ? new Date(session.logoutTime instanceof Date ? session.logoutTime : (session.logoutTime as any).toDate()).toLocaleString() : '',
          status: session.status,
          device: session.device?.type,
          os: session.device?.os
        }
      })
      
      if (sessionsData.length > 0) {
        doc.text('User Activity', 14, y);
        autoTable(doc, {
          startY: y + 6,
          head: [['Session ID', 'Username', 'Email', 'Role', 'Login Time', 'Logout Time', 'Status', 'Device', 'OS']],
          body: sessionsData.map(row => [row.sessionId, row.username, row.email, row.role, row.loginTime, row.logoutTime, row.status, row.device, row.os]),
        });
      }
      
      doc.save(`${t("dashboard.export.generalReport")}-${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success(t("dashboard.toast.pdfDownloaded"));
    } catch (error) {
      console.error('Error exporting general PDF:', error)
      toast.error(t("dashboard.toast.exportError"))
    }
  }

  const handleExportInventoryPDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();
      
      const inventoryRef = collection(db, `restaurants/${user?.establishmentId}/inventory`)
      const categoriesSnapshot = await getDocs(inventoryRef)
      
      let y = 14;
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id
        const categoryName = categoryDoc.data().name || categoryId
        const itemsRef = collection(db, `restaurants/${user?.establishmentId}/inventory/${categoryId}/items`)
        const itemsSnapshot = await getDocs(itemsRef)
        
        const items = itemsSnapshot.docs.map(doc => ({
          name: doc.data().name,
          quantity: doc.data().quantity,
          minQuantity: doc.data().minQuantity,
          price: doc.data().price,
          category: categoryName
        }))
        
        doc.text(`Inventory - ${categoryName.substring(0, 25)}`, 14, y);
        autoTable(doc, {
          startY: y + 6,
          head: [['Name', 'Quantity', 'Min Quantity', 'Price', 'Category']],
          body: items.length > 0 ? items.map(row => [row.name, row.quantity, row.minQuantity, row.price, row.category]) : [['', '', '', '', categoryName]],
        });
        y = (doc as any).lastAutoTable?.finalY + 10 || y + 30;
        
        // Add new page if needed
        if (y > 270) {
          doc.addPage();
          y = 14;
        }
      }
      
      if (categoriesSnapshot.docs.length === 0) {
        doc.text('Inventory', 14, y);
        autoTable(doc, {
          startY: y + 6,
          head: [['Name', 'Quantity', 'Min Quantity', 'Price', 'Category']],
          body: [['', '', '', '', '']],
        });
      }
      
      doc.save(`inventory-report-${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success(t("dashboard.toast.inventoryDownloaded"));
    } catch (error) {
      console.error('Error exporting inventory PDF:', error)
      toast.error(t("dashboard.toast.exportError"))
    }
  }

  const handleExportSalesPDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();
      
      const ordersRef = collection(db, `restaurants/${user?.establishmentId}/orders`)
      const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'))
      const ordersSnapshot = await getDocs(ordersQuery)
      
      const salesData = ordersSnapshot.docs.map(doc => {
        const order = doc.data() as Order
        return {
          orderId: doc.id,
          date: order.createdAt ? new Date(order.createdAt instanceof Date ? order.createdAt : (order.createdAt as any).toDate()).toLocaleDateString() : '',
          total: order.total || 0,
          status: order.status,
          paymentMethod: order.paymentMethod,
          tableNumber: order.tableNumber,
          items: Object.values(order.items || {}).map((item: OrderItem) => `${item.name} (${item.quantity})`).join(', ')
        }
      })
      
      doc.text('Sales Report', 14, 14);
      autoTable(doc, {
        startY: 20,
        head: [['Order ID', 'Date', 'Total', 'Status', 'Payment Method', 'Table', 'Items']],
        body: salesData.length > 0 ? salesData.map(row => [row.orderId || '', row.date || '', row.total || 0, row.status || '', row.paymentMethod || '', row.tableNumber || '', row.items || '']) as any : [['', '', '', '', '', '', '']],
      });
      
      doc.save(`sales-report-${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success(t("dashboard.toast.salesDownloaded"));
    } catch (error) {
      console.error('Error exporting sales PDF:', error)
      toast.error(t("dashboard.toast.exportError"))
    }
  }

  const handleExportUserActivityPDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();
      
      const sessionsRef = collection(db, `restaurants/${user?.establishmentId}/sessions`)
      const sessionsQuery = query(sessionsRef, orderBy('loginTime', 'desc'))
      const sessionsSnapshot = await getDocs(sessionsQuery)
      
      const sessionsData = sessionsSnapshot.docs.map(doc => {
        const session = doc.data()
        return {
          sessionId: doc.id,
          username: session.username,
          email: session.email,
          role: session.role,
          loginTime: session.loginTime ? new Date(session.loginTime instanceof Date ? session.loginTime : (session.loginTime as any).toDate()).toLocaleString() : '',
          logoutTime: session.logoutTime ? new Date(session.logoutTime instanceof Date ? session.logoutTime : (session.logoutTime as any).toDate()).toLocaleString() : '',
          status: session.status,
          device: session.device?.type,
          os: session.device?.os
        }
      })
      
      doc.text('User Activity Report', 14, 14);
      autoTable(doc, {
        startY: 20,
        head: [['Session ID', 'Username', 'Email', 'Role', 'Login Time', 'Logout Time', 'Status', 'Device', 'OS']],
        body: sessionsData.length > 0 ? sessionsData.map(row => [row.sessionId, row.username, row.email, row.role, row.loginTime, row.logoutTime, row.status, row.device, row.os]) : [['', '', '', '', '', '', '', '', '']],
      });
      
      doc.save(`user-activity-report-${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success(t("dashboard.toast.userActivityDownloaded"));
    } catch (error) {
      console.error('Error exporting user activity PDF:', error)
      toast.error(t("dashboard.toast.exportError"))
    }
  }

  const canDownloadReports = user?.role === UserRole.OWNER || 
                               user?.role === UserRole.ADMIN || 
                               user?.role === UserRole.MANAGER

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Trial Period Banner */}
      {(() => {
        // Debug logging
        console.log('Trial data:', {
          isTrialActive: user?.isTrialActive,
          trialEndDate: user?.trialEndDate,
          trialStartDate: user?.trialStartDate,
          subscriptionPlan: user?.subscriptionPlan
        });

        if (!user?.isTrialActive || !user?.trialEndDate) return null;

        let daysLeft = 0;
        try {
          const endDate = new Date(user.trialEndDate);
          const now = new Date();
          
          // Check if date is valid
          if (isNaN(endDate.getTime())) {
            console.error('Invalid trialEndDate:', user.trialEndDate);
            daysLeft = 0;
          } else {
            const diffTime = endDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysLeft = Math.max(0, diffDays);
          }
        } catch (error) {
          console.error('Error calculating days left:', error);
          daysLeft = 0;
        }

        return (
          <Alert className="bg-blue-50 border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <span className="font-semibold">{t("dashboard.trial.title")}</span> {t("dashboard.trial.message", { 
                daysLeft,
                plan: user.subscriptionPlan || 'basic'
              })}
            </AlertDescription>
          </Alert>
        );
      })()}

      {/* Personalized Welcome Section */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          {t("dashboard.welcomeMessage", { 
            restaurantName: user?.establishmentId || user?.restaurantName || t("dashboard.yourRestaurant") 
          })}
        </p>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                : t("dashboard.salesByCategory.noSalesData")
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
        <div className="w-full sm:col-span-2 lg:col-span-3">
          <Card className="w-full">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col justify-between items-center mb-4">
                <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">
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
                  <TabsList className="grid grid-cols-3 h-9 sm:h-10 md:h-auto">
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

                  <TabsContent value="totals" className="mt-3 sm:mt-4 md:mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {inventoryStatCards.map((stat, index) => (
                        <Card 
                          key={index} 
                          className="shadow-sm hover:shadow-md transition-shadow w-full"
                        >
                          <CardHeader className="pb-2 p-3 sm:p-4">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                              {stat.label}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 sm:p-4">
                            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${stat.className}`}>
                              {stat.value}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="by_category" className="mt-3 sm:mt-4 md:mt-6">
                    <div className="space-y-3 sm:space-y-4">
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
                      }>))
                      .map(([category, data]) => (
                        <Accordion 
                          type="single" 
                          collapsible 
                          key={category} 
                          className="border rounded-lg bg-white shadow-sm w-full"
                        >
                          <AccordionItem value={category} className="border-b last:border-b-0">
                            <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-muted/50 transition-colors">
                              <div className="flex flex-col w-full">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-xs sm:text-sm md:text-base text-gray-800">
                                    {getCategoryName(category)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
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
                              <div className="overflow-x-auto">
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
                                          className="text-xs sm:text-sm font-semibold text-gray-600 py-2 sm:py-3 px-2 sm:px-4"
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
                                        <TableCell className="text-xs sm:text-sm text-gray-800 px-2 sm:px-4 py-2">
                                          {item.name}
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm text-gray-700 px-2 sm:px-4 py-2">
                                          {item.total}
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm text-gray-700 px-2 sm:px-4 py-2">
                                          {item.inStock}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-2">
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
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="by_item" className="w-full mt-3 sm:mt-4 md:mt-6">
                    {dashboardData.inventoryItems.details.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {dashboardData.inventoryItems.details.map((item, index) => (
                          <Accordion 
                            type="single" 
                            collapsible 
                            key={item.id || `item-${index}`} 
                            className="border rounded-lg bg-white shadow-sm w-full"
                          >
                            <AccordionItem value={item.id || `item-val-${index}`} className="border-b last:border-b-0">
                              <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col w-full">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-xs sm:text-sm md:text-base text-gray-800">
                                      {item.name || 'Unknown Item'}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 sm:gap-2">
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
                                <div className="overflow-x-auto">
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
                                            className="text-xs sm:text-sm font-semibold text-gray-600 py-2 sm:py-3 px-2 sm:px-4"
                                          >
                                            {t(`dashboard.inventory.${key}`)}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow key={item.id || `item-row-${index}`} className="hover:bg-gray-100 transition-colors">
                                        <TableCell className="text-xs sm:text-sm text-gray-700 px-2 sm:px-4 py-2">
                                          {getCategoryName(item.category, item.categoryName)}
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm text-gray-700 px-2 sm:px-4 py-2">
                                          {item.total}
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm text-gray-700 px-2 sm:px-4 py-2">
                                          {item.inStock}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-2">
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
                                </div>
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
            {dashboardData.topSellingItems.map((item, index) => (
              <div 
                key={item.id || `item-${index}`} 
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
        <Card className="w-full h-auto sm:h-[500px] lg:col-span-2">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">{t('dashboard.salesByCategory.title')}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t('dashboard.salesByCategory.description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            {dashboardData.salesByCategory && dashboardData.salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart cy="50%" cx="50%" >
                  <Pie
                    data={dashboardData.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
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
                      `$${new Intl.NumberFormat(i18n.language).format(value as number)}`, 
                      dashboardData.salesByCategory.find(s => s.category === name)?.name ?? getCategoryName(String(name))
                    ]}
                  />
                  <Legend 
                    formatter={(value) => dashboardData.salesByCategory.find(s => s.category === value)?.name ?? getCategoryName(String(value))}
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
                    formatter={(value) => dashboardData.salesByCategory.find(s => s.category === value)?.name ?? getCategoryName(String(value))}
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
                key={order.id || `order-${index}`} 
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
        <div className="container w-full lg:col-span-3 mx-auto px-2 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <Card className="w-full">
              <CardHeader className="p-2 sm:p-3 md:p-4">
                <CardTitle className="text-xs sm:text-sm md:text-base">{t('salesList.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 md:p-4">
                {dashboardData.salesList.length > 0 ? (
                  <div className="overflow-x-auto max-h-[300px] sm:max-h-[400px]">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="sticky top-0 bg-background z-10">
                        <tr className="border-b">
                          <th className="px-1 sm:px-2 md:px-4 py-2 text-left text-xs sm:text-sm">{t('salesList.columns.date')}</th>
                          <th className="px-1 sm:px-2 md:px-4 py-2 text-left text-xs sm:text-sm hidden sm:table-cell">{t('salesList.columns.orderId')}</th>
                          <th className="px-1 sm:px-2 md:px-4 py-2 text-right text-xs sm:text-sm">{t('salesList.columns.total')}</th>
                          <th className="px-1 sm:px-2 md:px-4 py-2 text-left text-xs sm:text-sm hidden md:table-cell">
                            {t('salesList.columns.paymentMethod')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.salesList.map((sale, index) => (
                          <tr key={sale.orderId || `sale-${index}`} className="border-b last:border-b-0">
                            <td className="px-1 sm:px-2 md:px-4 py-2 text-xs sm:text-sm">
                              {new Date(sale.date).toLocaleDateString(i18n.language, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-1 sm:px-2 md:px-4 py-2 text-xs sm:text-sm hidden sm:table-cell">{sale.orderId}</td>
                            <td className="px-1 sm:px-2 md:px-4 py-2 text-right text-xs sm:text-sm">
                              {sale.total.toLocaleString(i18n.language, { 
                                style: 'currency', 
                                currency: user?.currency || 'USD' 
                              })}
                            </td>
                            <td className="px-1 sm:px-2 md:px-4 py-2 text-xs sm:text-sm hidden md:table-cell">
                              <Badge 
                                variant={
                                  sale.paymentMethod === 'cash' ? 'default' :
                                  sale.paymentMethod === 'credit' ? 'secondary' :
                                  sale.paymentMethod === 'debit' ? 'outline' :
                                  sale.paymentMethod === 'other' ? 'destructive' :
                                  'default'
                                }
                                className="capitalize"
                              >
                                {t(`salesList.paymentMethods.${sale.paymentMethod}`)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground p-4 text-xs sm:text-sm">
                    {t('salesList.noSales')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="w-full lg:col-span-3">
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

      {/* Reporte General como Footer */}
      {canDownloadReports && (
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>{t('dashboard.reports.title')}</CardTitle>
            <CardDescription>{t('dashboard.reports.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="inventory" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-lg border">
                <TabsTrigger value="inventory" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Package className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('dashboard.reports.inventory')}</span>
                </TabsTrigger>
                <TabsTrigger value="sales" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <ShoppingCart className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('dashboard.reports.sales')}</span>
                </TabsTrigger>
                <TabsTrigger value="userActivity" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Users className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('dashboard.reports.userActivity')}</span>
                </TabsTrigger>
                <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <FileText className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('dashboard.reports.general')}</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="inventory" className="mt-6 border rounded-lg p-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.reports.inventoryDescription')}
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={handleExportInventoryExcel} variant="outline" className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel</span>
                    </Button>
                    <Button onClick={handleExportInventoryPDF} variant="outline" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sales" className="mt-6 border rounded-lg p-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.reports.salesDescription')}
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={handleExportSalesExcel} variant="outline" className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel</span>
                    </Button>
                    <Button onClick={handleExportSalesPDF} variant="outline" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="userActivity" className="mt-6 border rounded-lg p-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.reports.userActivityDescription')}
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={handleExportUserActivityExcel} variant="outline" className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel</span>
                    </Button>
                    <Button onClick={handleExportUserActivityPDF} variant="outline" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="general" className="mt-6 border rounded-lg p-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.reports.generalDescription')}
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={handleExportGeneralExcel} variant="outline" className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel</span>
                    </Button>
                    <Button onClick={handleExportGeneralPDF} variant="outline" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
