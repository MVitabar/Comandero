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
  }>({
    totalOrders: 0,
    totalSales: 0,
    lowStockItems: 0,
    recentOrders: []
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!db || !user) return

      try {
        // Fetch orders
        const ordersRef = collection(db, 'restaurants', user.uid, 'orders')
        const ordersQuery = query(
          ordersRef, 
          orderBy('createdAt', 'desc'), 
          limit(10)
        )
        const ordersSnapshot = await getDocs(ordersQuery)
        const totalOrdersCount = await getCountFromServer(ordersRef)

        // Fetch sales
        const salesRef = collection(db, 'restaurants', user.uid, 'sales')
        const salesQuery = query(salesRef, orderBy('date', 'desc'), limit(10))
        const salesSnapshot = await getDocs(salesQuery)
        const totalSales = salesSnapshot.docs.reduce((total, doc) => 
          total + (doc.data().total || 0), 0)

        // Fetch low stock items
        const inventoryRef = collection(db, 'restaurants', user.uid, 'inventory')
        const lowStockQuery = query(
          inventoryRef, 
          where('currentStock', '<=', 'minimumStock')
        )
        const lowStockSnapshot = await getDocs(lowStockQuery)
        const lowStockCount = lowStockSnapshot.docs.length

        setDashboardData({
          totalOrders: totalOrdersCount.data().count,
          totalSales,
          lowStockItems: lowStockCount,
          recentOrders: ordersSnapshot.docs.map(doc => ({
            ...doc.data() as Order,
            id: doc.id
          }))
        })
      } catch (error) {
        console.error("Dashboard data fetch error:", error)
      }
    }

    fetchDashboardData()
  }, [db, user])

  return (
    <div className="p-6 space-y-6">
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
                percentage: 0
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
            <div className="flex items-center justify-center h-[120px]">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {t("dashboard.stockLevel.percentage", { 
                      percentage: 0
                    })}
                  </span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="10"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary stroke-current"
                    strokeWidth="10"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray="251.2"
                    strokeDashoffset="251.2"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-center text-sm text-muted-foreground">
              {t("dashboard.stockLevel.lowStockItems", { 
                count: dashboardData.lowStockItems
              })}
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
                Categories
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
              <span className="truncate">Categories</span>
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
                <CardTitle>Categories</CardTitle>
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
