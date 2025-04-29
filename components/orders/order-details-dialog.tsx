// components/orders/order-details-dialog.tsx
import React, { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Order, OrderDetailsDialogProps } from '@/types'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/i18n-provider'

export function OrderDetailsDialog({ 
  order, 
  open, 
  onOpenChange 
}: OrderDetailsDialogProps) {
  const router = useRouter()
  const { t, i18n } = useI18n()

  const handleEditOrder = () => {
    // Navigate to order edit page or open edit modal
    router.push(`/orders/edit/${order.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby="order-details-description">
        <DialogHeader>
          <DialogTitle>{t("orders.details.title")}</DialogTitle>
          <DialogDescription id="order-details-description">
            {t("orders.details.description")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">{t("orders.details.tableNumber")}:</span>
            <span className="col-span-3">{order.tableNumber || t("commons.notAvailable")}</span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">{t("orders.details.status")}:</span>
            <span className="col-span-3">{order.status}</span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">{t("orders.details.total")}:</span>
            <span className="col-span-3">
              {new Intl.NumberFormat(i18n.language, { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(order.total)}
            </span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">{t("orders.details.items")}:</span>
            <div className="col-span-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>
                    {item.quantity} x {new Intl.NumberFormat(i18n.language, { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange?.(false)}
          >
            {t("commons.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}