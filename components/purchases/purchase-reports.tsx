"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, TrendingUp, Package, ShoppingCart } from "lucide-react"
import type { Purchase } from "@/types"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function PurchaseReports() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { db } = useFirebase()
  const [loading, setLoading] = useState(false)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [totalPurchases, setTotalPurchases] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [profitMargin, setProfitMargin] = useState(0)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])

  useEffect(() => {
    fetchPurchaseData()
  }, [user, db])

  const fetchPurchaseData = async () => {
    if (!user?.establishmentId || !db) return

    setLoading(true)
    try {
      const purchasesRef = collection(db, `restaurants/${user.establishmentId}/purchases`)
      const q = query(purchasesRef, orderBy("orderDate", "desc"))
      const snapshot = await getDocs(q)
      const purchasesData = snapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
      })) as Purchase[]
      setPurchases(purchasesData)

      // Calculate totals
      const total = purchasesData.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
      setTotalPurchases(total)

      // Calculate total cost (purchase price * quantity)
      const cost = purchasesData.reduce((sum, p) => {
        const itemCost = p.items?.reduce((itemSum: number, item: any) => {
          return itemSum + (item.purchasePrice || 0) * item.quantity
        }, 0)
        return sum + itemCost
      }, 0)
      setTotalCost(cost)

      // Calculate profit margin (assuming sales price is used for revenue)
      const revenue = purchasesData.reduce((sum, p) => {
        const itemRevenue = p.items?.reduce((itemSum: number, item: any) => {
          return itemSum + (item.salesPrice || item.purchasePrice || 0) * item.quantity
        }, 0)
        return sum + itemRevenue
      }, 0)
      const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0
      setProfitMargin(margin)

      // Category data
      const categoryMap = new Map<string, number>()
      purchasesData.forEach(p => {
        p.items?.forEach((item: any) => {
          const category = item.category || 'Uncategorized'
          const cost = (item.purchasePrice || 0) * item.quantity
          categoryMap.set(category, (categoryMap.get(category) || 0) + cost)
        })
      })
      setCategoryData(Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })))

      // Monthly data
      const monthlyMap = new Map<string, number>()
      purchasesData.forEach(p => {
        const date = new Date(p.orderDate)
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        const cost = p.items?.reduce((sum: number, item: any) => sum + (item.purchasePrice || 0) * item.quantity, 0)
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + cost)
      })
      setMonthlyData(Array.from(monthlyMap.entries()).map(([name, value]) => ({ name, value })))

    } catch (error) {
      console.error("Error fetching purchase data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t("commons.loading")}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("purchases.reports.totalPurchases")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPurchases.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{purchases.length} {t("purchases.reports.purchases")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("purchases.reports.totalCost")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t("purchases.reports.purchaseCost")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("purchases.reports.profitMargin")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{t("purchases.reports.averageMargin")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("purchases.reports.totalItems")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchases.reduce((sum, p) => sum + (p.items?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t("purchases.reports.itemsPurchased")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("purchases.reports.costByCategory")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("purchases.reports.monthlyCost")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("purchases.reports.recentPurchases")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t("purchases.purchases.purchaseNumber")}</th>
                  <th className="text-left p-2">{t("purchases.purchases.supplier")}</th>
                  <th className="text-left p-2">{t("purchases.purchases.orderDate")}</th>
                  <th className="text-right p-2">{t("purchases.purchases.total")}</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 10).map((purchase) => (
                  <tr key={purchase.id} className="border-b">
                    <td className="p-2">{purchase.purchaseNumber}</td>
                    <td className="p-2">{purchase.supplierName}</td>
                    <td className="p-2">{new Date(purchase.orderDate).toLocaleDateString()}</td>
                    <td className="p-2 text-right">${(purchase.totalAmount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
