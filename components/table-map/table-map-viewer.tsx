"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ZoomIn, ZoomOut, Move, RefreshCw, Map, Grid2X2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface TableItem {
  id: string
  number: number
  seats: number
  shape: "square" | "round" | "rectangle"
  width: number
  height: number
  x: number
  y: number
  status: "available" | "occupied" | "ordering" | "preparing" | "ready" | "served"
}

interface TableMapViewerProps {
  tables: TableItem[]
  selectedTable?: TableItem | null
  onTableClick?: (table: TableItem) => void
  onViewOrder?: (orderId: string) => void
  onAddTable?: () => void
  onMarkAsServed?: (table: TableItem, orderId: string) => void
  onCloseOrder?: (table: TableItem, orderId: string) => void
  autoRefresh?: boolean
  refreshInterval?: number
  showControls?: boolean
  showLegend?: boolean
  minZoom?: number
  maxZoom?: number
  initialZoom?: number
}

export function TableMapViewer({
  tables,
  selectedTable,
  onTableClick,
  onViewOrder,
  onAddTable,
  onMarkAsServed,
  onCloseOrder,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  showControls = true,
  showLegend = true,
  minZoom = 0.5,
  maxZoom = 2,
  initialZoom = 1,
}: TableMapViewerProps) {
  const { t } = useI18n()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(initialZoom)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 })
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [viewMode, setViewMode] = useState("map")

  // Calculate the map boundaries based on table positions
  useEffect(() => {
    if (tables.length === 0) return

    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    tables.forEach((table) => {
      const tableRight = table.x + table.width
      const tableBottom = table.y + (table.shape === "rectangle" ? table.height : table.width)

      minX = Math.min(minX, table.x)
      minY = Math.min(minY, table.y)
      maxX = Math.max(maxX, tableRight)
      maxY = Math.max(maxY, tableBottom)
    })

    // Add padding
    const padding = 50
    minX = Math.max(0, minX - padding)
    minY = Math.max(0, minY - padding)
    maxX = maxX + padding
    maxY = maxY + padding

    setMapSize({
      width: maxX - minX,
      height: maxY - minY,
    })
  }, [tables])

  // Update container size on resize
  useEffect(() => {
    if (!mapContainerRef.current) return

    const updateContainerSize = () => {
      if (mapContainerRef.current) {
        setContainerSize({
          width: mapContainerRef.current.clientWidth,
          height: mapContainerRef.current.clientHeight,
        })
      }
    }

    updateContainerSize()

    const resizeObserver = new ResizeObserver(updateContainerSize)
    resizeObserver.observe(mapContainerRef.current)

    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current)
      }
    }
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setLastRefresh(new Date())
      // This will trigger a re-render, and if the parent component
      // is set up to fetch new data on refresh, it will do so
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Handle mouse/touch events for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return

    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(Math.min(maxZoom, zoom + 0.1))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(minZoom, zoom - 0.1))
  }

  const resetZoom = () => {
    setZoom(initialZoom)
    setPosition({ x: 0, y: 0 })
  }

  const handleRefresh = () => {
    setLastRefresh(new Date())
  }

  // Get table status color
  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-500 hover:bg-green-200"
      case "occupied":
        return "bg-red-100 border-red-500 hover:bg-red-200"
      case "reserved":
        return "bg-blue-100 border-blue-500 hover:bg-blue-200"
      case "maintenance":
        return "bg-gray-100 border-gray-500 hover:bg-gray-200"
      case "ordering":
        return "bg-yellow-100 border-yellow-500 hover:bg-yellow-200"
      case "preparing":
        return "bg-orange-100 border-orange-500 hover:bg-orange-200"
      case "ready":
        return "bg-purple-100 border-purple-500 hover:bg-purple-200"
      case "served":
        return "bg-indigo-100 border-indigo-500 hover:bg-indigo-200"
      default:
        return "bg-white border-gray-300 hover:bg-gray-50"
    }
  }

  // Render table status dot
  const renderTableStatusDot = (status: string) => {
    switch (status) {
      case "preparing":
        return "●"
      case "ready":
        return "●"
      case "served":
        return "●"
      default:
        return ""
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full w-full overflow-hidden">
        {/* Responsive Controls */}
        {showControls && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-2 space-y-2 sm:space-y-0">
            {/* Mobile Controls Dropdown */}
            <div className="md:hidden w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Move className="h-4 w-4" />
                      {t("mapControls")}
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => setZoom(Math.max(minZoom || 0.5, zoom - 0.2))}
                  >
                    <ZoomOut className="h-4 w-4" /> {t("zoomOut")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => setZoom(Math.min(maxZoom || 2, zoom + 0.2))}
                  >
                    <ZoomIn className="h-4 w-4" /> {t("zoomIn")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={resetZoom}
                  >
                    <RefreshCw className="h-4 w-4" /> {t("resetZoom")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setZoom(Math.max(minZoom || 0.5, zoom - 0.2))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("zoomOut")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setZoom(Math.min(maxZoom || 2, zoom + 0.2))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("zoomIn")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={resetZoom}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("resetZoom")}</TooltipContent>
              </Tooltip>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="hidden sm:flex"
              >
                <Map className="h-4 w-4 mr-2" />
                {t("mapView")}
              </Button>
              <Button 
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="hidden sm:flex"
              >
                <Grid2X2 className="h-4 w-4 mr-2" />
                {t("gridView")}
              </Button>
            </div>
          </div>
        )}

        {/* Responsive Map/Grid Container */}
        <div 
          ref={mapContainerRef}
          className="flex-1 overflow-hidden relative w-full max-w-full"
          style={{
            maxWidth: '100%',
            overscrollBehavior: 'contain'
          }}
        >
          <div 
            className="absolute inset-0 w-full h-full touch-none select-none"
            style={{ 
              transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
              overflowX: 'hidden',
              overflowY: 'hidden',
              width: 'fit-content',
              margin: 'auto'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              style={{
                width: `${mapSize.width}px`,
                height: `${mapSize.height}px`,
                position: 'relative'
              }}
            >
              {tables.map((table) => (
                <div
                  key={table.id}
                  style={{
                    position: 'absolute',
                    left: `${table.x}px`,
                    top: `${table.y}px`,
                    width: `${table.width}px`,
                    height: `${table.shape === 'rectangle' ? table.height : table.width}px`,
                    cursor: 'pointer',
                  }}
                  onClick={() => onTableClick && onTableClick(table)}
                  className={`
                    absolute rounded-md border-2 
                    ${getTableStatusColor(table.status)}
                    ${selectedTable?.id === table.id ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <div className="absolute top-1 right-1 text-xs">
                    {renderTableStatusDot(table.status)}
                  </div>
                  <div className="absolute bottom-1 left-1 text-xs">
                    {table.number}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="sm:hidden flex justify-between p-2">
          <Button 
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            <Map className="h-4 w-4 mr-2" />
            {t("mapView")}
          </Button>
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid2X2 className="h-4 w-4 mr-2" />
            {t("gridView")}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
