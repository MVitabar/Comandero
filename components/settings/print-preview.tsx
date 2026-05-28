"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Eye } from "lucide-react"
import { PrintOrder } from "@/lib/printerService"

export function PrintPreview() {
  const { t } = useI18n()
  
  const [previewType, setPreviewType] = useState<'cashier' | 'kitchen' | 'bar'>('cashier')
  const [orderId, setOrderId] = useState("ORD-001")
  const [tableNumber, setTableNumber] = useState(5)
  const [waiter, setWaiter] = useState("Juan Pérez")
  const [total, setTotal] = useState(125.50)

  const [items, setItems] = useState([
    { name: "Hamburguesa Clásica", quantity: 2, notes: "Sin cebolla", category: 'food' as const },
    { name: "Papas Fritas", quantity: 2, notes: "", category: 'food' as const },
    { name: "Coca Cola", quantity: 2, notes: "Con hielo", category: 'drink' as const },
    { name: "Cerveza Artesanal", quantity: 1, notes: "", category: 'drink' as const },
  ])

  const generateReceipt = (type: 'cashier' | 'kitchen' | 'bar'): string => {
    const lines: string[] = []

    // Header
    lines.push('================================')
    const tableLabel = tableNumber ? `MESA ${tableNumber}` : 'COMANDA'
    lines.push(`       ${tableLabel}`)
    lines.push('================================')
    lines.push(`Pedido: ${orderId}`)
    lines.push(`Mesa: ${tableNumber || 'N/A'}`)
    lines.push(`Fecha: ${new Date().toLocaleString()}`)
    lines.push(`Mesero: ${waiter || 'N/A'}`)
    lines.push('================================')
    lines.push('')

    // Filtrar items según la sección
    const filteredItems = items.filter(item => {
      if (type === 'kitchen') return item.category === 'food'
      if (type === 'bar') return item.category === 'drink'
      return true // cashier muestra todo
    })

    if (filteredItems.length === 0) {
      lines.push('No hay items para esta sección')
    } else {
      filteredItems.forEach(item => {
        lines.push(`${item.quantity}x ${item.name}`)
        if (item.notes) {
          lines.push(`   OBS:`)
          lines.push(`( ${item.notes} )`)
        }
        lines.push('')
      })
    }

    // Footer
    lines.push('================================')
    if (type === 'cashier') {
      lines.push(`TOTAL: $${total.toFixed(2)}`)
    }
    lines.push('================================')
    lines.push('')
    lines.push('') // Espacio extra para corte

    return lines.join('\n')
  }

  const receipt = generateReceipt(previewType)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Vista Previa de Impresión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Comanda</Label>
            <Select value={previewType} onValueChange={(value: any) => setPreviewType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cashier">Caja</SelectItem>
                <SelectItem value="kitchen">Cocina</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Mesa</Label>
            <Input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre border-2 border-gray-300">
          {receipt}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Esta es una vista previa de cómo se verá la comanda impresa. Los items se filtran según el tipo de comanda seleccionado.</p>
        </div>
      </CardContent>
    </Card>
  )
}
