"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import {toast} from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FileSpreadsheet } from "lucide-react"
import { collection, query, where, orderBy, getDocs, DocumentData } from "firebase/firestore"
import { ExcelReportGenerator } from "@/components/reports/excel-report-generator"
import { 
  Order, 
  InventoryItem, 
  ReportDataAdvanced, 
  SalesData, 
  FinancialData, 
  StaffData, 
  CustomersData, 
  ReservationsData,
  User,
  SalesDataAdvanced
} from "@/types"

const AdvancedReportsPage = () => {
  const { db } = useFirebase()
  const { user } = useAuth()
  const { t } = useI18n()

  const generateDefaultFinancialData = (): FinancialData => ({
    summary: [
      { label: t("totalRevenue"), value: "$0.00" },
      { label: t("netProfit"), value: "$0.00" },
      { label: t("expenses"), value: "$0.00" },
    ],
    data: []
  })

  const generateDefaultStaffData = (): StaffData => ({
    summary: [
      { label: t("totalStaff"), value: "0" },
      { label: t("activeStaff"), value: "0" },
      { label: t("avgPerformance"), value: "0%" },
    ],
    data: []
  })

  const generateDefaultCustomersData = (): CustomersData => ({
    summary: [
      { label: t("totalCustomers"), value: "0" },
      { label: t("newCustomers"), value: "0" },
      { label: t("repeatCustomers"), value: "0" },
    ],
    data: []
  })

  const generateDefaultReservationsData = (): ReservationsData => ({
    summary: [
      { label: t("totalReservations"), value: "0" },
      { label: t("confirmedReservations"), value: "0" },
      { label: t("pendingReservations"), value: "0" },
    ],
    data: []
  })

  const [reportData, setReportData] = useState<ReportDataAdvanced>({
    sales: {
      summary: [
        { label: t("totalSales"), value: "$0.00" },
        { label: t("averageTicket"), value: "$0.00" },
        { label: t("totalOrders"), value: "0" },
        { label: t("categories"), value: "0" },
      ],
      data: []
    },
    orders: [],
    inventory: [],
    financial: generateDefaultFinancialData(),
    staff: generateDefaultStaffData(),
    customers: generateDefaultCustomersData(),
    reservations: generateDefaultReservationsData()
  })
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  const convertSalesDataToAdvanced = (salesData: SalesData): SalesDataAdvanced => ({
    summary: [
      { label: t("totalSales"), value: `$${salesData.totalRevenue.toFixed(2)}` },
      { label: t("averageTicket"), value: `$${salesData.averageTicket.toFixed(2)}` },
      { label: t("totalOrders"), value: salesData.orderCount.toString() },
      { label: t("categories"), value: salesData.topSellingItems?.length.toString() || "0" },
    ],
    data: salesData.topSellingItems?.map(item => ({
      category: item.itemName,
      amount: item.revenue,
      percentage: (item.revenue / salesData.totalRevenue) * 100
    })) || []
  })

  const fetchAllReportData = async (): Promise<ReportDataAdvanced> => {
    try {
      if (!db || !user) {
        return {
          sales: {
            summary: [
              { label: t("totalSales"), value: "$0.00" },
              { label: t("averageTicket"), value: "$0.00" },
              { label: t("totalOrders"), value: "0" },
              { label: t("categories"), value: "0" },
            ],
            data: []
          },
          orders: [],
          inventory: [],
          financial: generateDefaultFinancialData(),
          staff: generateDefaultStaffData(),
          customers: generateDefaultCustomersData(),
          reservations: generateDefaultReservationsData()
        }
      }

      const orders = await fetchOrdersData()
      const inventory = await fetchInventoryData()
      const salesData = await fetchSalesData()

      return {
        orders,
        inventory,
        sales: convertSalesDataToAdvanced(salesData),
        financial: generateDefaultFinancialData(),
        staff: generateDefaultStaffData(),
        customers: generateDefaultCustomersData(),
        reservations: generateDefaultReservationsData()
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
      return {
        sales: {
          summary: [
            { label: t("totalSales"), value: "$0.00" },
            { label: t("averageTicket"), value: "$0.00" },
            { label: t("totalOrders"), value: "0" },
            { label: t("categories"), value: "0" },
          ],
          data: []
        },
        orders: [],
        inventory: [],
        financial: generateDefaultFinancialData(),
        staff: generateDefaultStaffData(),
        customers: generateDefaultCustomersData(),
        reservations: generateDefaultReservationsData()
      }
    }
  }

  const fetchSalesData = async (): Promise<SalesData> => {
    try {
      if (!db || !user) return {
        date: new Date(),
        totalRevenue: 0,
        orderCount: 0,
        averageTicket: 0,
        topSellingItems: []
      }

      const ordersRef = collection(db, "restaurants", user.uid, "orders")
      const q = query(ordersRef, where("status", "==", "closed"), orderBy("closedAt", "desc"))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return {
          date: new Date(),
          totalRevenue: 0,
          orderCount: 0,
          averageTicket: 0,
          topSellingItems: []
        }
      }

      const orders: Order[] = querySnapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData
        return {
          id: doc.id,
          total: data.total || 0,
          status: data.status || 'closed',
          tableNumber: data.tableNumber || undefined,
          tableId: data.tableId || '',
          tableMapId: data.tableMapId || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          closedAt: data.closedAt?.toDate ? data.closedAt.toDate() : undefined,
          items: (data.items || []).map((item: any) => ({
            id: item.id || '',
            name: item.name || '',
            category: item.category || 'Uncategorized',
            quantity: item.quantity || 0,
            price: item.price || 0
          })),
          orderType: data.orderType || 'table',
          restaurantId: data.restaurantId || user?.uid || '',
          subtotal: data.subtotal || data.total || 0,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          paymentInfo: data.paymentInfo || {
            method: "unknown",
            amount: 0,
            status: "pending"
          },
          createdBy: data.createdBy || {
            uid: "",
            displayName: "",
            email: null,
            role: "staff"
          }
        }
      })

      // Calculate total sales
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

      // Calculate order count
      const orderCount = orders.length

      // Calculate average ticket
      const averageTicket = orderCount > 0 ? totalRevenue / orderCount : 0

      // Calculate top selling items
      const itemSales: Record<string, { quantity: number, revenue: number }> = {}
      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (!itemSales[item.name]) {
            itemSales[item.name] = { quantity: 0, revenue: 0 }
          }
          itemSales[item.name].quantity += item.quantity
          itemSales[item.name].revenue += item.price * item.quantity
        })
      })

      const topSellingItems = Object.entries(itemSales)
        .map(([itemName, { quantity, revenue }]) => ({
          itemName,
          quantity,
          revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      return {
        date: new Date(),
        totalRevenue,
        orderCount,
        averageTicket,
        topSellingItems
      }
    } catch (error) {
      console.error("Error fetching sales data:", error)
      return {
        date: new Date(),
        totalRevenue: 0,
        orderCount: 0,
        averageTicket: 0,
        topSellingItems: []
      }
    }
  }

  const fetchOrdersData = async (): Promise<Order[]> => {
    try {
      if (!db || !user) return []

      const ordersRef = collection(db, "restaurants", user.uid, "orders")
      const q = query(ordersRef, orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return []
      }

      return querySnapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData
        return {
          id: doc.id,
          total: data.total || 0,
          status: data.status || 'closed',
          tableNumber: data.tableNumber || undefined,
          tableId: data.tableId || '',
          tableMapId: data.tableMapId || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          closedAt: data.closedAt?.toDate ? data.closedAt.toDate() : undefined,
          items: (data.items || []).map((item: any) => ({
            id: item.id || '',
            name: item.name || '',
            category: item.category || 'Uncategorized',
            quantity: item.quantity || 0,
            price: item.price || 0
          })),
          orderType: data.orderType || 'table',
          restaurantId: data.restaurantId || user?.uid || '',
          subtotal: data.subtotal || data.total || 0,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          paymentInfo: data.paymentInfo || {
            method: "unknown",
            amount: 0,
            status: "pending"
          },
          createdBy: data.createdBy || {
            uid: "",
            displayName: "",
            email: null,
            role: "staff"
          }
        }
      })
    } catch (error) {
      console.error("Error fetching orders data:", error)
      return []
    }
  }

  const fetchInventoryData = async (): Promise<InventoryItem[]> => {
    try {
      if (!db || !user) return []

      const inventoryRef = collection(db, "restaurants", user.uid, "inventory")
      const q = query(inventoryRef, orderBy("name"))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return []
      }

      return querySnapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData
        return {
          id: doc.id,
          name: data.name || '',
          category: data.category || 'Uncategorized',
          quantity: data.quantity || 0,
          minQuantity: data.minQuantity || 0,
          unit: data.unit || '',
          price: data.price || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          restaurantId: user.uid,
          description: data.description || ''
        } as unknown as InventoryItem
      })
    } catch (error) {
      console.error("Error fetching inventory data:", error)
      return []
    }
  }

  const convertReportDataForGenerator = (reportData: ReportDataAdvanced): { 
    orders?: Order[]; 
    inventory?: InventoryItem[]; 
    sales?: SalesData; 
    financial?: { category: string; amount: number; percentage: number; }[];
    staff?: { name: string; role: string; performance: number; shifts: number; }[];
    customers?: { uid: string; name: string; visits: number; lastVisit: Date; totalSpent: number; }[];
    reservations?: { date: Date; time: string; guests: number; status: "pending" | "cancelled" | "confirmed"; }[];
  } => ({
    orders: reportData.orders,
    inventory: reportData.inventory,
    sales: {
      date: new Date(),
      totalRevenue: parseFloat(
        String(reportData.sales.summary.find(s => s.label === t("totalSales"))?.value)
          .replace('$', '')
          .replace(',', '') || '0'
      ),
      orderCount: parseInt(
        String(reportData.sales.summary.find(s => s.label === t("totalOrders"))?.value) || '0'
      ),
      averageTicket: parseFloat(
        String(reportData.sales.summary.find(s => s.label === t("averageTicket"))?.value)
          .replace('$', '')
          .replace(',', '') || '0'
      ),
      topSellingItems: reportData.sales.data.map(item => ({
        itemName: String(item.category),
        quantity: 0, // We might need to adjust this if quantity is not available
        revenue: Number(item.amount) || 0
      }))
    },
    customers: reportData.customers?.map((customer: { id: any; name: any; visits: any; lastVisit: any; totalSpent: any }) => ({
      uid: customer.id, // Map existing id to uid
      name: customer.name,
      visits: customer.visits,
      lastVisit: customer.lastVisit,
      totalSpent: customer.totalSpent
    })),
    financial: reportData.financial ? Object.entries(reportData.financial).map(([category, data]) => ({
      category,
      amount: data.total || 0,
      percentage: data.percentage || 0
    })) : [],
    staff: reportData.staff ? Object.entries(reportData.staff).map(([name, data]) => ({
      name,
      role: data.role || '',
      performance: data.performance || 0,
      shifts: data.shifts || 0
    })) : [],
    reservations: reportData.reservations ? Object.entries(reportData.reservations).map(([_, data]) => ({
      date: data.date || new Date(),
      time: data.time || '',
      guests: data.guests || 0,
      status: data.status || "pending"
    })) : []
  })

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const data = await fetchAllReportData()
        setReportData(data)
        setOrders(data.orders || [])
        setInventory(data.inventory || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching report data:", error)
        setLoading(false)
        toast.error(t("errorFetchingData"))
      }
    }

    loadReportData()
  }, [db, user])

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <ExcelReportGenerator reportData={convertReportDataForGenerator(reportData)} />
      )}
    </div>
  )
}

export default AdvancedReportsPage
