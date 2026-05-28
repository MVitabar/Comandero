export interface PrinterConfig {
  id: string
  name: string
  type: 'cashier' | 'kitchen' | 'bar'
  deviceId?: string
  connected?: boolean
  autoPrint?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PrintOrder {
  orderId: string
  tableNumber?: number
  items: Array<{
    name: string
    quantity: number
    notes?: string
    category: 'food' | 'drink'
  }>
  total: number
  createdAt: Date
  waiter?: string
}
