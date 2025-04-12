"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { collection, query, orderBy, limit, getDocs, getCountFromServer, where } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User,
  Order
} from "@/types"
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle 
} from "lucide-react"

// Define types for our dashboard data
type SalesData = {
  date: string
  amount: number
}

type TopSellingItem = {
  id: string
  name: string
  quantity: number
  totalSales: number
}

type InventoryData = {
  level: number
  lowStockItems: Array<{
    id: string
    name: string
    currentStock: number
    minimumStock: number
  }>
}

export default function DashboardPage() {
  const { t, i18n } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<{
    totalOrders: number;
    totalSales: number;
    lowStockItems: number;
    recentOrders: Order[];
    monthlyGrowth: number;
    totalInventoryItems: number;
    inventoryItems: {
      total: number;
      lowStock: number;
      inStock: number;
      details: Array<{
        name: string;
        total: number;
        inStock: number;
        lowStock: number;
        status: 'critical' | 'warning' | 'healthy'
      }>;
    }
  }>({
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
    }
  })

  const fetchDashboardData = async () => {
    try {
      const ordersRef = collection(db, "orders")
      const inventoryRef = collection(db, "inventory")

      // Fetch total orders and sales for the current month
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      
      const currentMonthOrdersQuery = query(
        ordersRef, 
        where("date", ">=", currentMonthStart),
        where("status", "==", "completed")
      )
      const lastMonthOrdersQuery = query(
        ordersRef, 
        where("date", ">=", lastMonthStart),
        where("date", "<", currentMonthStart),
        where("status", "==", "completed")
      )

      // Fetch inventory data with detailed breakdown
      const inventorySnapshot = await getDocs(inventoryRef)
      
      const inventoryDetails = inventorySnapshot.docs.map(doc => {
        const data = doc.data()
        const total = data.initialStock || 0
        const inStock = data.stock || 0
        const lowStock = Math.max(0, total - inStock)
        
        // Determine stock status
        let status: 'critical' | 'warning' | 'healthy' = 'healthy'
        const stockPercentage = (inStock / total) * 100
        
        if (stockPercentage <= 20) status = 'critical'
        else if (stockPercentage <= 50) status = 'warning'

        return {
          name: data.name || 'Unknown',
          total,
          inStock,
          lowStock,
          status
        }
      })

      // Calculate inventory totals
      const totalInventoryItems = inventoryDetails.reduce((sum, item) => sum + item.total, 0)
      const totalInStockItems = inventoryDetails.reduce((sum, item) => sum + item.inStock, 0)
      const totalLowStockItems = inventoryDetails.reduce((sum, item) => sum + item.lowStock, 0)

      // Fetch orders data
      const [
        currentMonthOrdersSnapshot, 
        lastMonthOrdersSnapshot,
        ordersSnapshot
      ] = await Promise.all([
        getDocs(currentMonthOrdersQuery),
        getDocs(lastMonthOrdersQuery),
        getDocs(query(ordersRef, orderBy('date', 'desc'), limit(5)))
      ])

      const currentMonthTotalSales = currentMonthOrdersSnapshot.docs.reduce(
        (total, doc) => total + (doc.data().totalAmount || 0), 
        0
      )
      const lastMonthTotalSales = lastMonthOrdersSnapshot.docs.reduce(
        (total, doc) => total + (doc.data().totalAmount || 0), 
        0
      )

      // Calculate monthly growth percentage
      const monthlyGrowth = lastMonthTotalSales > 0 
        ? ((currentMonthTotalSales - lastMonthTotalSales) / lastMonthTotalSales * 100)
        : 0

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
        }
      })
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
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
    fetchDashboardData()
  }, [db, user])

  return (
    <div className="p-6 space-y-6">
      {/* Personalized Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("dashboard.welcomeMessage", { 
            restaurantName: user?.currentEstablishmentName || user?.restaurantName || t("dashboard.yourRestaurant") 
          })}
        </p>
      </div>

      <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.salesOverview.title")}</CardTitle>
            <CardDescription>{t("dashboard.salesOverview.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {t("dashboard.salesOverview.totalSales", { 
                amount: t("commons.currency", { 
                  value: dashboardData.totalSales.toLocaleString(i18n.language, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }) 
                }) 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.salesOverview.monthlyGrowth", { 
                percentage: dashboardData.monthlyGrowth
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.topSellingItems.title")}</CardTitle>
            <CardDescription>{t("dashboard.topSellingItems.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Top selling items will be displayed here */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stockLevel.title")}</CardTitle>
            <CardDescription>{t("dashboard.stockLevel.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Stock Level Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{t("dashboard.stockLevel.totalItems")}</span>
                  <span className="text-muted-foreground text-xs">
                    {dashboardData.inventoryItems.total}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{t("dashboard.stockLevel.inStock")}</span>
                  <span className="text-green-600 text-xs">
                    {dashboardData.inventoryItems.inStock}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{t("dashboard.stockLevel.lowStock")}</span>
                  <span className="text-red-600 text-xs">
                    {dashboardData.inventoryItems.lowStock}
                  </span>
                </div>
              </div>

              {/* Detailed Inventory Breakdown */}
              <div className="space-y-2">
                {dashboardData.inventoryItems.details.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 bg-muted/50 p-2 rounded-lg"
                  >
                    <StockStatusIcon status={item.status} />
                    <div className="flex-grow">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.inStock} / {item.total}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.status === 'critical' ? 'bg-red-500' :
                            item.status === 'warning' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ 
                            width: `${(item.inStock / item.total) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                        <span>
                          {t(`dashboard.stockLevel.status.${item.status}`)}
                        </span>
                        <span>
                          {t("dashboard.stockLevel.percentage", { 
                            percentage: Math.round((item.inStock / item.total) * 100)
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        {/* Mobile Dropdown Tabs */}
        <div className="block md:hidden mb-4">
          <Select 
            defaultValue="recent"
            onValueChange={(value) => {
              // setActiveTab(value as "recent" | "sales" | "categories");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a tab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                {t("dashboard.recentOrders")}
              </SelectItem>
              <SelectItem value="sales" className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                {t("dashboard.salesOverview.title")}
              </SelectItem>
              <SelectItem value="categories" className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                {t("dashboard.categories")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Card Content */}
          <div className="mt-4">
            {/* Recent orders will be displayed here */}
          </div>
        </div>

        {/* Desktop Horizontal Tabs */}
        <Tabs defaultValue="recent" className="hidden md:block">
          <TabsList className="flex flex-wrap justify-center sm:justify-start w-full overflow-x-auto">
            <TabsTrigger value="recent" className="flex-grow sm:flex-grow-0 sm:min-w-[120px] max-w-[200px]">
              <LineChart className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{t("dashboard.recentOrders")}</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex-grow sm:flex-grow-0 sm:min-w-[120px] max-w-[200px]">
              <BarChart className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{t("dashboard.salesOverview.title")}</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-grow sm:flex-grow-0 sm:min-w-[120px] max-w-[200px]">
              <PieChart className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{t("dashboard.categories")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.recentOrders")}</CardTitle>
                <CardDescription>Latest orders from customers</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Recent orders will be displayed here */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.salesOverview.title")}</CardTitle>
                <CardDescription>Sales data for the current period</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Sales data will be displayed here */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.categories")}</CardTitle>
                <CardDescription>Sales by category</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Categories will be displayed here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
