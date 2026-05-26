"use client"

import React, { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Order, OrderItem } from '@/types'
import { useI18n } from '@/components/i18n-provider'
import { useFirebase } from '@/components/firebase-provider'
import { doc, updateDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { Loader2, Plus, Minus } from 'lucide-react'

interface PartialPaymentDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentComplete?: () => void
}

interface SelectedItem {
  item: OrderItem
  quantityToPay: number
}

export function PartialPaymentDialog({ 
  order, 
  open, 
  onOpenChange,
  onPaymentComplete
}: PartialPaymentDialogProps) {
  const { t } = useI18n()
  const { db } = useFirebase()
  
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map())
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedItems(new Map())
      setPaymentMethod('')
    }
  }, [open])

  const handleQuantityChange = (itemId: string, item: OrderItem, delta: number) => {
    const currentQuantity = selectedItems.get(itemId) || 0
    const unpaidQuantity = item.quantity - (item.paidQuantity || 0)
    const newQuantity = Math.max(0, Math.min(currentQuantity + delta, unpaidQuantity))
    
    if (newQuantity === 0) {
      selectedItems.delete(itemId)
    } else {
      selectedItems.set(itemId, newQuantity)
    }
    
    setSelectedItems(new Map(selectedItems))
  }

  const handlePayment = async () => {
    if (selectedItems.size === 0) {
      toast.error(t('orders.partialPayment.noItemsSelected'))
      return
    }

    if (!paymentMethod) {
      toast.error(t('orders.partialPayment.noPaymentMethod'))
      return
    }

    setLoading(true)

    try {
      const items = Array.isArray(order.items) ? order.items : Object.values(order.items)
      const updatedItems = items.map(item => {
        const quantityToPay = selectedItems.get(item.id) || 0
        if (quantityToPay > 0) {
          return {
            ...item,
            paidQuantity: (item.paidQuantity || 0) + quantityToPay
          }
        }
        return item
      })

      // Calculate payment amount
      const paymentAmount = Array.from(selectedItems.entries()).reduce((sum, [itemId, qty]) => {
        const item = items.find(i => i.id === itemId)
        return sum + (item ? item.price * qty : 0)
      }, 0)

      // Update order with paid quantities
      const orderRef = doc(db, `restaurants/${order.restaurantId}/orders/${order.id}`)
      await updateDoc(orderRef, {
        items: updatedItems,
        updatedAt: new Date()
      })

      // Check if all items are paid
      const allPaid = updatedItems.every(item => (item.paidQuantity || 0) >= item.quantity)
      
      if (allPaid) {
        await updateDoc(orderRef, {
          status: 'closed',
          paymentMethod: paymentMethod,
          closedAt: new Date()
        })
        toast.success(t('orders.partialPayment.orderFullyPaid'))
      } else {
        toast.success(t('orders.partialPayment.partialPaymentSuccess'))
      }

      onOpenChange(false)
      onPaymentComplete?.()
    } catch (error) {
      console.error('Error processing partial payment:', error)
      toast.error(t('orders.partialPayment.error'))
    } finally {
      setLoading(false)
    }
  }

  const items = Array.isArray(order.items) ? order.items : Object.values(order.items)
  const totalPaymentAmount = Array.from(selectedItems.entries()).reduce((sum, [itemId, qty]) => {
    const item = items.find(i => i.id === itemId)
    return sum + (item ? item.price * qty : 0)
  }, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('orders.partialPayment.title')}</DialogTitle>
          <DialogDescription>
            {t('orders.partialPayment.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Items Selection */}
          <div className="space-y-2">
            <Label>{t('orders.partialPayment.selectItems')}</Label>
            
            <div className="border rounded-md p-4 space-y-3 max-h-48 overflow-y-auto">
              {items.map((item) => {
                const unpaidQuantity = item.quantity - (item.paidQuantity || 0)
                const quantityToPay = selectedItems.get(item.id) || 0
                
                if (unpaidQuantity <= 0) return null
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('orders.partialPrice')}: ${item.price.toFixed(2)} | 
                        {t('orders.partialPayment.unpaid')}: {unpaidQuantity} / {item.quantity}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item, -1)}
                        disabled={quantityToPay === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={quantityToPay}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          const newQuantity = Math.max(0, Math.min(val, unpaidQuantity))
                          if (newQuantity === 0) {
                            selectedItems.delete(item.id)
                          } else {
                            selectedItems.set(item.id, newQuantity)
                          }
                          setSelectedItems(new Map(selectedItems))
                        }}
                        className="w-16 text-center"
                        min={0}
                        max={unpaidQuantity}
                      />
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item, 1)}
                        disabled={quantityToPay >= unpaidQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label>{t('orders.selectPaymentMethod')}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder={t('orders.selectPaymentMethod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t('orders.paymentMethods.cash')}</SelectItem>
                <SelectItem value="card">{t('orders.paymentMethods.card')}</SelectItem>
                <SelectItem value="transfer">{t('orders.paymentMethods.transfer')}</SelectItem>
                <SelectItem value="credit">{t('orders.paymentMethods.credit')}</SelectItem>
                <SelectItem value="debit">{t('orders.paymentMethods.debit')}</SelectItem>
                <SelectItem value="other">{t('orders.paymentMethods.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {selectedItems.size > 0 && (
            <div className="bg-muted p-4 rounded-md space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('orders.partialPayment.itemsSelected')}:</span>
                <span>{selectedItems.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('orders.partialPayment.paymentAmount')}:</span>
                <span className="font-semibold">${totalPaymentAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('commons.cancel')}
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading || selectedItems.size === 0 || !paymentMethod}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('orders.partialPayment.processing')}
              </>
            ) : (
              t('orders.partialPayment.pay')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
