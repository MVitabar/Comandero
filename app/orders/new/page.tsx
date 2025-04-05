"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Minus, Plus, Trash, ArrowLeft } from "lucide-react"

// Inventory item interface
interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  price: number
}

// Order item interface
interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes: string
}

export default function NewOrderPage() {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tableNumber, setTableNumber] = useState("")
  const [selectedItemId, setSelectedItemId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  useEffect(() => {
    fetchInventoryItems()
  }, [db])

  const fetchInventoryItems = async () => {
    if (!db) return

    setLoading(true)
    try {
      const inventoryRef = collection(db, "inventory")
      const q = query(inventoryRef, orderBy("name"))
      const querySnapshot = await getDocs(q)

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[]

      setInventoryItems(items)
    } catch (error) {
      console.error("Error fetching inventory items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    if (!selectedItemId) {
      toast({
        title: "Error",
        description: "Please select an item",
        variant: "destructive",
      })
      return
    }

    const inventoryItem = inventoryItems.find((item) => item.id === selectedItemId)
    if (!inventoryItem) return

    const newItem: OrderItem = {
      id: inventoryItem.id,
      name: inventoryItem.name,
      quantity,
      price: inventoryItem.price,
      notes,
    }

    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex((item) => item.id === selectedItemId)

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += quantity
      updatedItems[existingItemIndex].notes = notes || updatedItems[existingItemIndex].notes
      setOrderItems(updatedItems)
    } else {
      // Add new item
      setOrderItems([...orderItems, newItem])
    }

    // Reset form
    setSelectedItemId("")
    setQuantity(1)
    setNotes("")
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...orderItems]
    updatedItems.splice(index, 1)
    setOrderItems(updatedItems)
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    setOrderItems(updatedItems)
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    if (!db || !user) return

    if (!tableNumber) {
      toast({
        title: "Error",
        description: "Please enter a table number",
        variant: "destructive",
      })
      return
    }

    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      })
      return
    }

    try {
      const newOrder = {
        table: Number.parseInt(tableNumber),
        waiter: user.displayName || user.email,
        items: orderItems,
        total: calculateTotal(),
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "orders"), newOrder)

      toast({
        title: "Order Created",
        description: `Order for Table ${tableNumber} has been created successfully`,
      })

      router.push("/orders")
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{t("createOrder")}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table">Table Number</Label>
              <Input
                id="table"
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter table number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - ${item.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions"
              />
            </div>

            <Button onClick={handleAddItem} className="w-full">
              Add to Order
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.notes && <div className="text-xs text-muted-foreground">{item.notes}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(index, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No items added to the order yet</div>
            )}

            {orderItems.length > 0 && (
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            )}

            <Button onClick={handleSubmitOrder} className="w-full" disabled={orderItems.length === 0 || !tableNumber}>
              Submit Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

