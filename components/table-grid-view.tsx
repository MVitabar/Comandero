"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { TableCard } from "@/components/table-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus } from "lucide-react"

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

interface Order {
  id: string
  status: string
  tableId: string
  // Other order properties
}

interface TableGridViewProps {
  tables: TableItem[]
  orders?: Record<string, Order>
  onTableClick?: (table: TableItem) => void
  onCreateOrder?: (table: TableItem) => void
  onViewOrder?: (table: TableItem) => void
  onMarkAsServed?: (table: TableItem, orderId: string) => void
  onCloseOrder?: (table: TableItem, orderId: string) => void
  onAddTable?: () => void
  onEditTable?: (table: TableItem) => void
  onDeleteTable?: (table: TableItem) => void
  isEditing?: boolean
}

export function TableGridView({
  tables,
  orders = {},
  onTableClick,
  onCreateOrder,
  onViewOrder,
  onMarkAsServed,
  onCloseOrder,
  onAddTable,
  onEditTable,
  onDeleteTable,
  isEditing = false,
}: TableGridViewProps) {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("number")

  // Filter and sort tables
  const filteredTables = tables
    .filter((table) => {
      // Apply search filter
      const matchesSearch =
        table.number.toString().includes(searchQuery) ||
        t(table.status).toLowerCase().includes(searchQuery.toLowerCase())

      // Apply status filter
      const matchesStatus = statusFilter === "all" || table.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "number":
          return a.number - b.number
        case "seats":
          return a.seats - b.seats
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return a.number - b.number
      }
    })

  return (
    <div className="space-y-4">
      {/* Filters and controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchTables")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="available">{t("available")}</SelectItem>
              <SelectItem value="occupied">{t("occupied")}</SelectItem>
              <SelectItem value="reserved">{t("reserved")}</SelectItem>
              <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
              <SelectItem value="ordering">{t("ordering")}</SelectItem>
              <SelectItem value="preparing">{t("preparing")}</SelectItem>
              <SelectItem value="ready">{t("ready")}</SelectItem>
              <SelectItem value="served">{t("served")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">{t("tableNumber")}</SelectItem>
              <SelectItem value="seats">{t("seats")}</SelectItem>
              <SelectItem value="status">{t("status")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isEditing && (
          <Button onClick={onAddTable}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addTable")}
          </Button>
        )}
      </div>

      {/* Table grid */}
      {filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const tableOrder = Object.values(orders).find((order) => order.tableId === table.id)

            return (
              <TableCard
                key={table.id}
                table={table}
                hasActiveOrder={!!tableOrder}
                orderStatus={tableOrder?.status || ""}
                isEditing={isEditing}
                onEdit={() => onEditTable && onEditTable(table)}
                onDelete={() => onDeleteTable && onDeleteTable(table)}
                onCreateOrder={() => onCreateOrder && onCreateOrder(table)}
                onViewOrder={() => onViewOrder && onViewOrder(table)}
                onMarkAsServed={() => tableOrder && onMarkAsServed && onMarkAsServed(table, tableOrder.id)}
                onCloseOrder={() => tableOrder && onCloseOrder && onCloseOrder(table, tableOrder.id)}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery || statusFilter !== "all" ? t("noTablesMatchFilter") : t("noTablesInMap")}
        </div>
      )}
    </div>
  )
}

