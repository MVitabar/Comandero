"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react"
import Link from "next/link"

// Order status types
type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled"

// Order interface
interface Order {
  id: string
  table: number
  waiter: string
  status: OrderStatus
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  total: number
  createdAt: any
  updatedAt: any
}

export default function OrdersPage() {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending")

  useEffect(() => {
    fetchOrders()
  }, [db])

  const fetchOrders = async () => {
    if (!db) return

    setLoading(true)
    try {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const fetchedOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]

      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!db || !selectedOrder) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id ? { ...order, status: newStatus, updatedAt: new Date() } : order,
        ),
      )

      toast({
        title: "Status Updated",
        description: `Order #${selectedOrder.id.substring(0, 6)} status changed to ${newStatus}`,
      })

      setIsStatusDialogOpen(false)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = async () => {
    if (!db || !selectedOrder) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)
      await deleteDoc(orderRef)

      // Update local state
      setOrders(orders.filter((order) => order.id !== selectedOrder.id))

      toast({
        title: "Order Deleted",
        description: `Order #${selectedOrder.id.substring(0, 6)} has been deleted`,
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "delivered":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return ""
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table.toString().includes(searchQuery) ||
      order.waiter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("orders")}</h1>
        <Link href="/orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("newOrder")}
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("orders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Waiter</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
                    <TableCell>{order.table}</TableCell>
                    <TableCell>{order.waiter}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell>${order.total?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrder(order)
                              setNewStatus(order.status)
                              setIsStatusDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">No orders found</div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change the status for order #{selectedOrder?.id.substring(0, 6)}</DialogDescription>
          </DialogHeader>
          <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order #{selectedOrder?.id.substring(0, 6)}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

