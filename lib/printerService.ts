/**
 * Servicio de impresión para comandas
 * Soporta impresoras térmicas vía Web Bluetooth API, WebUSB API y red (IP)
 */

export interface PrinterConfig {
  id: string
  name: string
  type: 'cashier' | 'kitchen' | 'bar'
  connectionMethod: 'bluetooth' | 'usb' | 'network' | 'manual'
  deviceId?: string
  ipAddress?: string
  port?: number
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

export class PrinterService {
  private bluetoothDevice: BluetoothDevice | null = null
  private bluetoothCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
  private usbDevice: USBDevice | null = null

  /**
   * Busca impresoras Bluetooth disponibles
   */
  async discoverBluetoothPrinters(): Promise<BluetoothDevice[]> {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth not supported')
      }
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // Servicio de impresión genérico
      })
      return [device]
    } catch (error) {
      console.error('Error discovering Bluetooth printers:', error)
      throw error
    }
  }

  /**
   * Busca impresoras USB disponibles
   */
  async discoverUSBPrinters(): Promise<USBDevice[]> {
    try {
      if (!navigator.usb) {
        throw new Error('USB not supported')
      }
      const devices = await navigator.usb.getDevices()
      return devices
    } catch (error) {
      console.error('Error discovering USB printers:', error)
      throw error
    }
  }

  /**
   * Solicita y conecta una impresora USB
   */
  async requestUSBPrinter(): Promise<USBDevice> {
    try {
      if (!navigator.usb) {
        throw new Error('USB not supported')
      }
      const device = await navigator.usb.requestDevice({
        filters: [
          { classCode: 0x07 }, // Clase de impresora USB
          { vendorId: 0x0456 }, // Ejemplo: vendor ID común para impresoras
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0519 }, // Star Micronics
        ]
      })
      return device
    } catch (error) {
      console.error('Error requesting USB printer:', error)
      throw error
    }
  }

  /**
   * Conecta a una impresora Bluetooth específica
   */
  async connectBluetoothPrinter(deviceId: string): Promise<boolean> {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth not supported')
      }
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }]
      })

      const server = await device.gatt?.connect()
      if (!server) throw new Error('Could not connect to GATT server')

      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')

      this.bluetoothDevice = device
      this.bluetoothCharacteristic = characteristic

      return true
    } catch (error) {
      console.error('Error connecting to Bluetooth printer:', error)
      return false
    }
  }

  /**
   * Conecta a una impresora USB específica
   */
  async connectUSBPrinter(device: USBDevice): Promise<boolean> {
    try {
      await device.open()
      
      // Seleccionar la primera configuración
      if (device.configurations.length > 0) {
        await device.selectConfiguration(device.configurations[0].configurationValue)
        
        // Buscar una interfaz de impresora (class 0x07)
        for (const config of device.configurations) {
          for (const iface of config.interfaces) {
            for (const alt of iface.alternates) {
              if (alt.interfaceClass === 0x07) { // Clase de impresora
                await device.claimInterface(iface.interfaceNumber)
                await device.selectAlternateInterface(iface.interfaceNumber, alt.alternateSetting)
                this.usbDevice = device
                return true
              }
            }
          }
        }
      }
      
      // Si no encuentra interfaz específica, intenta con la primera
      if (device.configurations.length > 0 && device.configurations[0].interfaces.length > 0) {
        const iface = device.configurations[0].interfaces[0]
        await device.claimInterface(iface.interfaceNumber)
        this.usbDevice = device
        return true
      }

      return false
    } catch (error) {
      console.error('Error connecting to USB printer:', error)
      return false
    }
  }

  /**
   * Verifica conexión a impresora de red
   */
  async checkNetworkPrinter(ipAddress: string, port: number = 9100): Promise<boolean> {
    try {
      const response = await fetch(`http://${ipAddress}:${port}`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      })
      return true
    } catch (error) {
      console.error('Error checking network printer:', error)
      return false
    }
  }

  /**
   * Desconecta las impresoras actuales
   */
  async disconnectPrinter(method: 'bluetooth' | 'usb' | 'network'): Promise<void> {
    if (method === 'bluetooth') {
      if (this.bluetoothDevice?.gatt?.connected) {
        await this.bluetoothDevice.gatt.disconnect()
      }
      this.bluetoothDevice = null
      this.bluetoothCharacteristic = null
    } else if (method === 'usb') {
      if (this.usbDevice) {
        try {
          await this.usbDevice.close()
        } catch (error) {
          console.error('Error closing USB device:', error)
        }
        this.usbDevice = null
      }
    }
    // Network printers don't need explicit disconnection
  }

  /**
   * Genera el texto de la comanda en formato ESC/POS
   */
  private generateReceipt(order: PrintOrder, type: 'cashier' | 'kitchen' | 'bar'): string {
    const lines: string[] = []

    // Header
    lines.push('================================')
    const tableLabel = order.tableNumber ? `MESA ${order.tableNumber}` : 'COMANDA'
    lines.push(`       ${tableLabel}`)
    lines.push('================================')
    lines.push(`Pedido: ${order.orderId}`)
    lines.push(`Mesa: ${order.tableNumber || 'N/A'}`)
    lines.push(`Fecha: ${order.createdAt.toLocaleString()}`)
    lines.push(`Mesero: ${order.waiter || 'N/A'}`)
    lines.push('================================')
    lines.push('')

    // Filtrar items según la sección
    const filteredItems = order.items.filter(item => {
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
      lines.push(`TOTAL: $${order.total.toFixed(2)}`)
    }
    lines.push('================================')
    lines.push('')
    lines.push('') // Espacio extra para corte

    return lines.join('\n')
  }

  /**
   * Imprime una comanda
   */
  async printOrder(order: PrintOrder, type: 'cashier' | 'kitchen' | 'bar', method: 'bluetooth' | 'usb' | 'network' = 'bluetooth', config?: { ipAddress?: string; port?: number }): Promise<boolean> {
    const receipt = this.generateReceipt(order, type)

    if (method === 'bluetooth') {
      if (!this.bluetoothCharacteristic) {
        console.error('No Bluetooth printer connected')
        return false
      }
      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(receipt)
        await this.bluetoothCharacteristic.writeValue(data)
        return true
      } catch (error) {
        console.error('Error printing via Bluetooth:', error)
        return false
      }
    } else if (method === 'usb') {
      if (!this.usbDevice) {
        console.error('No USB printer connected')
        return false
      }
      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(receipt)
        
        // Buscar endpoint de salida
        for (const config of this.usbDevice.configurations) {
          for (const iface of config.interfaces) {
            for (const alt of iface.alternates) {
              for (const endpoint of alt.endpoints) {
                if (endpoint.direction === 'out') {
                  await this.usbDevice.transferOut(endpoint.endpointNumber, data)
                  return true
                }
              }
            }
          }
        }
        
        console.error('No OUT endpoint found')
        return false
      } catch (error) {
        console.error('Error printing via USB:', error)
        return false
      }
    } else if (method === 'network') {
      if (!config?.ipAddress) {
        console.error('No IP address provided for network printer')
        return false
      }
      try {
        const port = config.port || 9100
        const response = await fetch(`http://${config.ipAddress}:${port}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: receipt,
          mode: 'no-cors'
        })
        return true
      } catch (error) {
        console.error('Error printing via network:', error)
        return false
      }
    }

    return false
  }

  /**
   * Verifica si el navegador soporta Web Bluetooth
   */
  static isBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator
  }

  /**
   * Verifica si el navegador soporta WebUSB
   */
  static isUSBSupported(): boolean {
    return typeof navigator !== 'undefined' && 'usb' in navigator
  }
}

// Singleton instance
export const printerService = new PrinterService()
