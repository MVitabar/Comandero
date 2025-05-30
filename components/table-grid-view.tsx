"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useTranslation } from 'react-i18next';
import { TableCard } from "@/components/table-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus } from "lucide-react"
import { TableItem, Order, TableGridViewProps } from "@/types"

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
  const { t: translate } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("number")

  useEffect(() => {
  }, [tables])

  // Refuerza que cada mesa tenga mapId antes de renderizar, usando undefined en vez de null
  // Si viene de RestaurantTable, toma tableMapId como mapId
  // Corrige tipos: number y seats siempre deben ser number; solo accede a propiedades válidas
  const processedTables = tables.map(table => ({
    ...table,
    id: table.id || table.uid || `table_${Math.random().toString(36).substr(2, 9)}`,
    number: typeof table.number === 'number'
      ? table.number
      : (typeof table.name === 'string' ? parseInt(table.name.replace(/\D/g, ''), 10) || 0 : 0),
    seats: typeof table.seats === 'number'
      ? table.seats
      : (typeof (table as any).capacity === 'number' ? (table as any).capacity : 4),
    status: table.status || 'available',
    mapId: table.mapId ?? (table as any).tableMapId ?? undefined
  }))

  const filteredTables = processedTables
    .filter((table) => {
      // Apply search filter
      const matchesSearch =
        table.number.toString().includes(searchQuery) ||
        translate(`tables.statuses.${table.status}`).toLowerCase().includes(searchQuery.toLowerCase())

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
              <SelectItem value="all">{translate("tables.allStatuses")}</SelectItem>
              <SelectItem value="available">{translate("tables.statuses.available")}</SelectItem>
              <SelectItem value="occupied">{translate("tables.statuses.occupied")}</SelectItem>
              <SelectItem value="reserved">{translate("tables.statuses.reserved")}</SelectItem>
              <SelectItem value="maintenance">{translate("tables.statuses.maintenance")}</SelectItem>
              <SelectItem value="ordering">{translate("tables.statuses.ordering")}</SelectItem>
              <SelectItem value="preparing">{translate("tables.statuses.preparing")}</SelectItem>
              <SelectItem value="ready">{translate("tables.statuses.ready")}</SelectItem>
              <SelectItem value="served">{translate("tables.statuses.served")}</SelectItem>
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
