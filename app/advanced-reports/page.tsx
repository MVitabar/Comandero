"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FileSpreadsheet, BarChart, PieChart, LineChart } from "lucide-react"
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { ExcelReportGenerator } from "@/components/reports/excel-report-generator"

// Type definitions for Firestore documents
interface OrderItem {
  id?: string
  name: string
  price: number
  quantity: number
  category?: string
  notes?: string
  dietaryRestrictions?: string[]
}

interface Order {
  id: string
  tableId?: string
  tableNumber?: string
  status: "pending" | "preparing" | "ready" | "delivered" | "closed" | "cancelled"
  total: number
  subtotal: number
  tax?: number
  discount?: number
  waiter?: string
  items: OrderItem[]
  createdAt: Timestamp | Date
  closedAt?: Timestamp | Date
  specialRequests?: string
}

interface InventoryItem {
  id: string
  name: string
  category?: string
  quantity: number
  minQuantity: number
  unit: string
  price: number
}

// Define proper types for report data and summary items
type ReportSummaryItem = {
  label: string
  value: string | number
}

type ReportData = {
  summary?: ReportSummaryItem[]
  data?: any[]
  charts?: { 
    title: string; 
    type: string; 
    data: any 
  }[]
}

type ReportChart = {
  title: string
  type: string
  data: any
}

export type AllReportData = {
  sales?: ReportData
  orders?: ReportData
  inventory?: ReportData
  financial?: ReportData
  staff?: ReportData
  customers?: ReportData
  reservations?: ReportData
}

export default function AdvancedReportsPage() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<AllReportData>({})
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (db) {
      fetchReportData()
    }
  }, [db])

  const fetchReportData = async () => {
    if (!db) {
      toast({
        title: t("error"),
        description: t("databaseNotInitialized"),
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Fetch all the data needed for reports
      const salesData = await fetchSalesData()
      const ordersData = await fetchOrdersData()
      const inventoryData = await fetchInventoryData()

      setReportData({
        sales: salesData,
        orders: ordersData,
        inventory: inventoryData,
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast({
        title: t("error"),
        description: t("failedToFetchReportData"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesData = async () => {
    try {
      if (!db) throw new Error("Database not initialized")

      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("status", "==", "closed"), orderBy("closedAt", "desc"))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return {
          summary: [
            { label: t("totalSales"), value: "$0.00" },
            { label: t("averageTicket"), value: "$0.00" },
            { label: t("totalOrders"), value: 0 },
            { label: t("categories"), value: 0 },
          ],
          data: [],
        }
      }

      const orders: Order[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Order))

      // Calculate total sales
      const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0)

      // Calculate average ticket
      const avgTicket = orders.length > 0 ? totalSales / orders.length : 0

      // Sales by category
      const salesByCategory: Record<string, number> = {}
      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: OrderItem) => {
            const category = item.category || "Uncategorized"
            if (!salesByCategory[category]) {
              salesByCategory[category] = 0
            }
            salesByCategory[category] += item.price * item.quantity || 0
          })
        }
      })

      // Format data for the report
      const salesTableData = Object.entries(salesByCategory).map(([category, amount]) => ({
        Category: category,
        Amount: `$${amount.toFixed(2)}`,
        Percentage: `${((amount / totalSales) * 100).toFixed(1)}%`,
      }))

      // Add a total row
      salesTableData.push({
        Category: "TOTAL",
        Amount: `$${totalSales.toFixed(2)}`,
        Percentage: "100%",
      })

      return {
        summary: [
          { label: t("totalSales"), value: `$${totalSales.toFixed(2)}` },
          { label: t("averageTicket"), value: `$${avgTicket.toFixed(2)}` },
          { label: t("totalOrders"), value: orders.length },
          { label: t("categories"), value: Object.keys(salesByCategory).length },
        ],
        data: salesTableData,
      }
    } catch (error) {
      console.error("Error fetching sales data:", error)
      toast({
        title: t("error"),
        description: t("failedToFetchSalesData"),
        variant: "destructive",
      })
      return {
        summary: [
          { label: t("totalSales"), value: "$0.00" },
          { label: t("averageTicket"), value: "$0.00" },
          { label: t("totalOrders"), value: 0 },
          { label: t("categories"), value: 0 },
        ],
        data: [],
      }
    }
  }

  const fetchOrdersData = async () => {
    try {
      if (!db) throw new Error("Database not initialized")

      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return {
          summary: [
            { label: t("totalOrders"), value: 0 },
            { label: t("completedOrders"), value: 0 },
            { label: t("pendingOrders"), value: 0 },
            { label: t("cancelledOrders"), value: 0 },
            { label: t("avgServiceTime"), value: "0 " + t("minutes") },
          ],
          data: [],
        }
      }

      const orders: Order[] = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          closedAt: data.closedAt?.toDate ? data.closedAt.toDate() : null,
        } as Order
      })

      // Calculate order statistics
      const totalOrders = orders.length
      const completedOrders = orders.filter((order) => order.status === "closed").length
      const pendingOrders = orders.filter((order) => ["pending", "preparing", "ready"].includes(order.status)).length
      const cancelledOrders = orders.filter((order) => order.status === "cancelled").length

      // Calculate average service time (from creation to closure)
      let totalServiceTime = 0
      let ordersWithServiceTime = 0

      orders.forEach((order) => {
        if (order.createdAt && order.closedAt) {
          const serviceTime = (order.closedAt as Date).getTime() - (order.createdAt as Date).getTime()
          totalServiceTime += serviceTime
          ordersWithServiceTime++
        }
      })

      const avgServiceTime =
        ordersWithServiceTime > 0
          ? totalServiceTime / ordersWithServiceTime / (1000 * 60) // in minutes
          : 0

      // Format data for the report
      const ordersTableData = orders.slice(0, 20).map((order) => ({
        "Order ID": order.id.substring(0, 8),
        Table: order.tableNumber || "N/A",
        Status: order.status,
        Total: `$${order.total.toFixed(2)}`,
        Items: order.items.length,
      }))

      return {
        summary: [
          { label: t("totalOrders"), value: totalOrders },
          { label: t("completedOrders"), value: completedOrders },
          { label: t("pendingOrders"), value: pendingOrders },
          { label: t("cancelledOrders"), value: cancelledOrders },
          { label: t("avgServiceTime"), value: `${avgServiceTime.toFixed(1)} ${t("minutes")}` },
        ],
        data: ordersTableData,
      }
    } catch (error) {
      console.error("Error fetching orders data:", error)
      toast({
        title: t("error"),
        description: t("failedToFetchOrdersData"),
        variant: "destructive",
      })
      return {
        summary: [
          { label: t("totalOrders"), value: 0 },
          { label: t("completedOrders"), value: 0 },
          { label: t("pendingOrders"), value: 0 },
          { label: t("cancelledOrders"), value: 0 },
          { label: t("avgServiceTime"), value: "0 " + t("minutes") },
        ],
        data: [],
      }
    }
  }

  const fetchInventoryData = async () => {
    try {
      if (!db) throw new Error("Database not initialized")

      const inventoryRef = collection(db, "inventory")
      const q = query(inventoryRef)

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return {
          summary: [
            { label: t("totalItems"), value: 0 },
            { label: t("lowStockItems"), value: 0 },
            { label: t("totalInventoryValue"), value: "$0.00" },
          ],
          data: [],
        }
      }

      const inventoryItems: InventoryItem[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as InventoryItem))

      // Calculate inventory statistics
      const lowStockItems = inventoryItems.filter((item) => item.quantity < item.minQuantity)
      const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)

      // Format data for the report
      const inventoryTableData = inventoryItems.map((item) => ({
        Name: item.name,
        Category: item.category || "Uncategorized",
        Quantity: `${item.quantity} ${item.unit}`,
        MinQuantity: `${item.minQuantity} ${item.unit}`,
        Value: `$${(item.quantity * item.price).toFixed(2)}`,
      }))

      return {
        summary: [
          { label: t("totalItems"), value: inventoryItems.length },
          { label: t("lowStockItems"), value: lowStockItems.length },
          { label: t("totalInventoryValue"), value: `$${totalInventoryValue.toFixed(2)}` },
        ],
        data: inventoryTableData,
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error)
      toast({
        title: t("error"),
        description: t("failedToFetchInventoryData"),
        variant: "destructive",
      })
      return {
        summary: [
          { label: t("totalItems"), value: 0 },
          { label: t("lowStockItems"), value: 0 },
          { label: t("totalInventoryValue"), value: "$0.00" },
        ],
        data: [],
      }
    }
  }

  return (
    <div ref={printRef} className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t("advancedReports")}</h1>
      <div className="flex items-center justify-between mb-4">
        <ExcelReportGenerator 
          reportData={reportData} 
          fileName={`restaurant_report_${new Date().toISOString().split('T')[0]}`}
          printRef={printRef}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sales Report */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-muted-foreground/20 pb-3">
              <CardTitle className="text-xl font-semibold flex items-center justify-between">
                {t("salesReport")}
                <BarChart className="h-6 w-6 text-primary opacity-70" />
              </CardTitle>
              <CardDescription>{t("salesReportDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {reportData.sales?.summary?.map((item: ReportSummaryItem, index: number) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-2 border-b border-muted-foreground/10 last:border-b-0 hover:bg-accent/50 px-2 rounded-md transition-colors"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Orders Report */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-muted-foreground/20 pb-3">
              <CardTitle className="text-xl font-semibold flex items-center justify-between">
                {t("ordersReport")}
                <PieChart className="h-6 w-6 text-primary opacity-70" />
              </CardTitle>
              <CardDescription>{t("ordersReportDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {reportData.orders?.summary?.map((item: ReportSummaryItem, index: number) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-2 border-b border-muted-foreground/10 last:border-b-0 hover:bg-accent/50 px-2 rounded-md transition-colors"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inventory Report */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-muted-foreground/20 pb-3">
              <CardTitle className="text-xl font-semibold flex items-center justify-between">
                {t("inventoryReport")}
                <LineChart className="h-6 w-6 text-primary opacity-70" />
              </CardTitle>
              <CardDescription>{t("inventoryReportDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {reportData.inventory?.summary?.map((item: ReportSummaryItem, index: number) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-2 border-b border-muted-foreground/10 last:border-b-0 hover:bg-accent/50 px-2 rounded-md transition-colors"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
