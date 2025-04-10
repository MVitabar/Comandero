"use client"

import { useState, useEffect } from "react"
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
  orders = {}, // Provide a default empty object
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

  useEffect(() => {
    console.group('📊 Table Grid View')
    console.log('Tables Received:', {
      tableCount: tables.length,
      tableDetails: tables.map(table => ({
        id: table.id,
        number: table.number,
        status: table.status,
        seats: table.seats
      }))
    })
    console.groupEnd()
  }, [tables])

  const processedTables = tables.map(table => ({
    ...table,
    id: table.id || `table_${Math.random().toString(36).substr(2, 9)}`,
    number: table.number || 0,
    seats: table.seats || 4,
    status: table.status || 'available',
    shape: table.shape || 'square',
    width: table.width || 50,
    height: table.height || 50,
    x: table.x || 0,
    y: table.y || 0
  }))

  const filteredTables = processedTables
    .filter((table) => {
      // Apply search filter
      const matchesSearch =
        table.number.toString().includes(searchQuery) ||
        t(`tables.statuses.${table.status}`).toLowerCase().includes(searchQuery.toLowerCase())

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
            placeholder={t("tables.search")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("tables.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tables.allStatuses")}</SelectItem>
              <SelectItem value="available">{t("tables.statuses.available")}</SelectItem>
              <SelectItem value="occupied">{t("tables.statuses.occupied")}</SelectItem>
              <SelectItem value="reserved">{t("tables.statuses.reserved")}</SelectItem>
              <SelectItem value="maintenance">{t("tables.statuses.maintenance")}</SelectItem>
              <SelectItem value="ordering">{t("tables.statuses.ordering")}</SelectItem>
              <SelectItem value="preparing">{t("tables.statuses.preparing")}</SelectItem>
              <SelectItem value="ready">{t("tables.statuses.ready")}</SelectItem>
              <SelectItem value="served">{t("tables.statuses.served")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={t("tables.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">{t("tables.tableNumber")}</SelectItem>
              <SelectItem value="seats">{t("tables.seats")}</SelectItem>
              <SelectItem value="status">{t("tables.status")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isEditing && (
          <Button onClick={onAddTable}>
            <Plus className="h-4 w-4 mr-2" />
            {t("tables.addTable")}
          </Button>
        )}
      </div>

      {/* Table Grid */}
      {filteredTables.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {t("noTablesFound")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            // Safely find table order using Object.values and optional chaining
            const tableOrder = orders ? Object.values(orders).find((order) => order.tableId === table.id) : undefined

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
      )}

      {/* Add Table Button */}
      {isEditing && onAddTable && (
        <div className="mt-4 flex justify-center">
          <Button onClick={onAddTable} className="w-full max-w-md">
            <Plus className="mr-2 h-4 w-4" />
            {t("tables.addTable")}
          </Button>
        </div>
      )}
    </div>
  )
}
