"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"

export default function DashboardPage() {
  const { t } = useI18n()
  const { db } = useFirebase()
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!db) return

      try {
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef, orderBy("createdAt", "desc"), limit(5))
        const querySnapshot = await getDocs(q)

        const orders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setRecentOrders(orders)
      } catch (error) {
        console.error("Error fetching recent orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()
  }, [db])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t("dashboard")}</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("salesOverview")}</CardTitle>
            <CardDescription>Daily sales overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234.56</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            <div className="h-[80px] mt-4 flex items-end justify-between">
              {[40, 30, 70, 80, 50, 60, 90].map((height, i) => (
                <div key={i} className="w-[8%] bg-primary rounded-sm" style={{ height: `${height}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("topSellingItems")}</CardTitle>
            <CardDescription>Most popular items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Pizza Margherita", "Pasta Carbonara", "Tiramisu", "Caesar Salad", "Risotto"].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{item}</span>
                  <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 50) + 10} orders</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("stockLevel")}</CardTitle>
            <CardDescription>Inventory status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[120px]">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">78%</span>
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
                    strokeLinecap="round"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray="251.2"
                    strokeDashoffset="55.3"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-center text-sm text-muted-foreground">3 items with low stock</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">
            <LineChart className="h-4 w-4 mr-2" />
            {t("recentOrders")}
          </TabsTrigger>
          <TabsTrigger value="sales">
            <BarChart className="h-4 w-4 mr-2" />
            {t("salesOverview")}
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChart className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("recentOrders")}</CardTitle>
              <CardDescription>Latest orders from customers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">Order #{order.id.substring(0, 6)}</div>
                        <div className="text-sm text-muted-foreground">
                          Table {order.table || "N/A"} • {order.items?.length || 0} items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${order.total?.toFixed(2) || "0.00"}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.createdAt?.toDate()).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">No recent orders found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("salesOverview")}</CardTitle>
              <CardDescription>Sales data for the current period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 bg-primary rounded-sm"
                      style={{ height: `${Math.floor(Math.random() * 200) + 50}px` }}
                    />
                    <span className="text-sm">{day}</span>
                  </div>
                ))}
              </div>
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
              <div className="flex justify-center py-4">
                <div className="w-[300px] h-[300px] relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {[
                      { color: "hsl(var(--primary))", start: 0, size: 25 },
                      { color: "hsl(var(--primary) / 0.8)", start: 25, size: 20 },
                      { color: "hsl(var(--primary) / 0.6)", start: 45, size: 15 },
                      { color: "hsl(var(--primary) / 0.4)", start: 60, size: 10 },
                      { color: "hsl(var(--primary) / 0.2)", start: 70, size: 30 },
                    ].map((segment, i) => {
                      const startAngle = (segment.start / 100) * 360
                      const endAngle = ((segment.start + segment.size) / 100) * 360

                      const x1 = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180))
                      const y1 = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180))
                      const x2 = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180))
                      const y2 = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180))

                      const largeArcFlag = segment.size > 50 ? 1 : 0

                      return (
                        <path
                          key={i}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                        />
                      )
                    })}
                    <circle cx="50" cy="50" r="25" fill="hsl(var(--background))" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2" />
                  <span>Main Dishes (25%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/80 mr-2" />
                  <span>Appetizers (20%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/60 mr-2" />
                  <span>Desserts (15%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/40 mr-2" />
                  <span>Drinks (10%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/20 mr-2" />
                  <span>Others (30%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

