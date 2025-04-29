"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Minus, Plus, Trash, ArrowLeft } from "lucide-react"
import { InventoryItem, OrderItem } from "@/types"
import { OrderForm } from "@/components/orders/order-form"
import { Order } from "@/types"
import { useNotifications } from "@/hooks/useNotifications"
import { toast } from "sonner"

export default function NewOrderPage() {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const router = useRouter()
  const { sendNotification } = useNotifications()

  // Utility function to remove undefined values from an object
  const removeUndefinedValues = (obj: Record<string, any>): Record<string, any> => {
    const cleanedObj: Record<string, any> = {};
    
    Object.keys(obj).forEach(key => {
      // Check if the value is not undefined
      if (obj[key] !== undefined) {
        // If the value is an object, recursively clean it
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const cleanedNestedObj = removeUndefinedValues(obj[key]);
          
          // Only add the nested object if it's not empty
          if (Object.keys(cleanedNestedObj).length > 0) {
            cleanedObj[key] = cleanedNestedObj;
          }
        } else {
          cleanedObj[key] = obj[key];
        }
      }
    });
    
    return cleanedObj;
  };

  const handleCreateOrder = async (order: Order) => {
    if (!db || !user) {
      toast.error("Database or user not found")
      return
    }

    // Validate establishmentId before proceeding
    if (!user.establishmentId) {
      console.error('No establishment ID found for user')
      toast.error("Establishment ID not found")
      return
    }

    try {
      const ordersRef = collection(db, 'restaurants', user.establishmentId, 'orders')
      
      // Remove undefined values from the order
      const cleanedOrder = removeUndefinedValues(order);

      const newOrderRef = await addDoc(ordersRef, {
        ...cleanedOrder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: cleanedOrder.status || 'pending'
      })

      // IMPORTANTE: Guarda el id generado por Firestore en el documento
      await updateDoc(newOrderRef, { id: newOrderRef.id });

      // Notificación push con OneSignal
      await sendNotification({
        title: "Nuevo Pedido",
        message: `Mesa ${order.tableNumber} - Total: $${order.total}`,
        url: `/orders/${newOrderRef.id}`
      })

      // Optional: Navigate back to orders page or show order details
      router.push('/orders')
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Erro ao criar pedido")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{t("newOrderPage.title")}</h1>
      </div>

      {user ? (
        <OrderForm 
          user={user}
          onOrderCreated={handleCreateOrder}
        />
      ) : (
        <p>Usuário não autenticado</p>
      )}
    </div>
  )
}
