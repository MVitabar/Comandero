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
import { Order } from '@/types'
import { useRouter } from 'next/navigation'

interface OrderDetailsDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ 
  order, 
  open, 
  onOpenChange 
}: OrderDetailsDialogProps) {
  const router = useRouter()

  const handleEditOrder = () => {
    // Navigate to order edit page or open edit modal
    router.push(`/orders/edit/${order.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
          <DialogDescription>
            Informações completas sobre o pedido
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Número da Mesa:</span>
            <span className="col-span-3">{order.tableNumber || 'N/A'}</span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Status:</span>
            <span className="col-span-3">{order.status}</span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Total:</span>
            <span className="col-span-3">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(order.total)}
            </span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Itens:</span>
            <div className="col-span-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>
                    {item.quantity} x {new Intl.NumberFormat('pt-BR', { 
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
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}