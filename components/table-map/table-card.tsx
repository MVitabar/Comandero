"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Users,
  Square,
  Circle,
  RectangleVerticalIcon as Rectangle,
  Edit,
  Trash,
  ClipboardList,
  CheckCircle,
  Receipt,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TableItem {
  id: string
  number: number
  seats: number
  shape: "square" | "round" | "rectangle"
  width: number
  height: number
  x: number
  y: number
  status: "available" | "occupied" | "reserved" | "maintenance" | "ordering" | "preparing" | "ready" | "served"
}

interface TableCardProps {
  table: TableItem
  hasActiveOrder?: boolean
  orderStatus?: string
  onEdit?: () => void
  onDelete?: (table: TableItem) => void
  onCreateOrder?: () => void
  onViewOrder?: (orderId: string) => void
  onMarkAsServed?: () => void
  onCloseOrder?: () => void
  isEditing?: boolean
}

export function TableCard({
  table,
  hasActiveOrder = false,
  orderStatus = "",
  onEdit,
  onDelete,
  onCreateOrder,
  onViewOrder,
  onMarkAsServed,
  onCloseOrder,
  isEditing = false,
}: TableCardProps) {
  const { t } = useI18n()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-50 border-green-200 text-green-700"
      case "occupied":
        return "bg-red-50 border-red-200 text-red-700"
      case "reserved":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "maintenance":
        return "bg-gray-50 border-gray-200 text-gray-700"
      case "ordering":
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
      case "preparing":
        return "bg-orange-50 border-orange-200 text-orange-700"
      case "ready":
        return "bg-purple-50 border-purple-200 text-purple-700"
      case "served":
        return "bg-indigo-50 border-indigo-200 text-indigo-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  // Get shape icon
  const ShapeIcon = () => {
    switch (table.shape) {
      case "round":
        return <Circle className="h-5 w-5" />
      case "rectangle":
        return <Rectangle className="h-5 w-5" />
      default:
        return <Square className="h-5 w-5" />
    }
  }

  return (
    <>
      <Card className={cn("transition-all hover:shadow-md flex flex-col h-full", getStatusColor(table.status))}>
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <span className="text-sm sm:text-base">
              {t("table")} {table.number}
            </span>
            <Badge variant="outline" className={cn("font-normal text-xs sm:text-sm", getStatusColor(table.status))}>
              {t(table.status)}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-2 flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                {table.seats} {t("seats")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShapeIcon />
              <span className="text-sm">{t(table.shape)}</span>
            </div>
          </div>

          {hasActiveOrder && (
            <div className="mt-2 pt-2 border-t">
              <Badge variant="secondary" className="w-full justify-center text-xs sm:text-sm">
                {t(orderStatus)}
              </Badge>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          {isEditing ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:flex-1" 
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-1" />
                {t("edit")}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full sm:flex-1" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-1" />
                {t("delete")}
              </Button>
            </div>
          ) : hasActiveOrder ? (
            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 min-w-[100px]" 
                onClick={() => onViewOrder?.("orderId")}
              >
                <ClipboardList className="h-4 w-4 mr-1" />
                {t("viewOrder")}
              </Button>
              {(orderStatus === "ready" || orderStatus === "delivered") && (
                <Button 
                  variant={orderStatus === "ready" ? "default" : "secondary"} 
                  size="sm" 
                  className="flex-1 min-w-[100px]" 
                  onClick={orderStatus === "ready" ? onMarkAsServed : onCloseOrder}
                >
                  {orderStatus === "ready" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t("serve")}
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-1" />
                      {t("close")}
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={onCreateOrder}
              disabled={table.status !== "available"}
            >
              <ClipboardList className="h-4 w-4 mr-1" />
              {t("createOrder")}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm">{t("deleteTableConfirmation", { tableNumber: table.number })}</p>
          <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)} 
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete?.(table);
                setIsDeleteDialogOpen(false);
              }}
              className="w-full sm:w-auto"
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
