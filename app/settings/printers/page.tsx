"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Printer, Plus, Trash2, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { PrinterConfig } from "@/types"
import { toast } from "sonner"
import { printerService, PrinterService } from "@/lib/printerService"

export default function PrintersPage() {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const router = useRouter()
  
  const [printers, setPrinters] = useState<PrinterConfig[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPrinterName, setNewPrinterName] = useState("")
  const [newPrinterType, setNewPrinterType] = useState<'cashier' | 'kitchen' | 'bar'>('cashier')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false)

  useEffect(() => {
    if (!db || !user) return

    const restaurantId = user.establishmentId || user.uid
    const printersRef = collection(db, 'restaurants', restaurantId, 'printers')
    
    const unsubscribe = onSnapshot(printersRef, (snapshot) => {
      const printersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrinterConfig))
      setPrinters(printersData)
    })

    // Check if Bluetooth is supported
    setIsBluetoothSupported(PrinterService.isBluetoothSupported())

    return () => unsubscribe()
  }, [db, user])

  const handleAddPrinter = async () => {
    if (!db || !user || !newPrinterName.trim()) {
      toast.error("Please enter a printer name")
      return
    }

    if (!isBluetoothSupported) {
      toast.error("Bluetooth is not supported in this browser")
      return
    }

    setIsConnecting(true)

    try {
      // Discover and connect to printer
      const devices = await printerService.discoverBluetoothPrinters()
      if (devices.length === 0) {
        toast.error("No printers found. Please make sure your printer is in pairing mode.")
        setIsConnecting(false)
        return
      }

      const device = devices[0]
      const connected = await printerService.connectBluetoothPrinter(device.id)

      if (!connected) {
        toast.error("Failed to connect to printer")
        setIsConnecting(false)
        return
      }

      // Save printer configuration
      const restaurantId = user?.establishmentId || user?.uid
      if (!restaurantId) {
        toast.error("User not authenticated")
        setIsConnecting(false)
        return
      }
      const printersRef = collection(db, 'restaurants', restaurantId, 'printers')
      
      await addDoc(printersRef, {
        name: newPrinterName,
        type: newPrinterType,
        deviceId: device.id,
        connected: true,
        autoPrint: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      toast.success("Printer added and connected successfully")
      setIsAddDialogOpen(false)
      setNewPrinterName("")
    } catch (error) {
      console.error("Error adding printer:", error)
      toast.error("Failed to add printer")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDeletePrinter = async (printerId: string) => {
    if (!db || !user) return

    try {
      const restaurantId = user.establishmentId || user.uid
      const printerRef = doc(db, 'restaurants', restaurantId, 'printers', printerId)
      await deleteDoc(printerRef)
      toast.success("Printer deleted successfully")
    } catch (error) {
      console.error("Error deleting printer:", error)
      toast.error("Failed to delete printer")
    }
  }

  const handleToggleAutoPrint = async (printer: PrinterConfig) => {
    if (!db || !user) return

    try {
      const restaurantId = user.establishmentId || user.uid
      const printerRef = doc(db, 'restaurants', restaurantId, 'printers', printer.id)
      await updateDoc(printerRef, {
        autoPrint: !printer.autoPrint,
        updatedAt: new Date()
      })
      toast.success("Printer settings updated")
    } catch (error) {
      console.error("Error updating printer:", error)
      toast.error("Failed to update printer settings")
    }
  }

  const handleReconnectPrinter = async (printer: PrinterConfig) => {
    if (!printer.deviceId) {
      toast.error("No device ID found for this printer")
      return
    }

    setIsConnecting(true)

    try {
      const connected = await printerService.connectBluetoothPrinter(printer.deviceId)
      
      if (connected) {
        const restaurantId = user?.establishmentId || user?.uid
        if (!restaurantId) {
          toast.error("User not authenticated")
          setIsConnecting(false)
          return
        }
        const printerRef = doc(db, 'restaurants', restaurantId, 'printers', printer.id)
        await updateDoc(printerRef, {
          connected: true,
          updatedAt: new Date()
        })
        toast.success("Printer reconnected successfully")
      } else {
        toast.error("Failed to reconnect printer")
      }
    } catch (error) {
      console.error("Error reconnecting printer:", error)
      toast.error("Failed to reconnect printer")
    } finally {
      setIsConnecting(false)
    }
  }

  const getPrinterTypeLabel = (type: string) => {
    switch (type) {
      case 'cashier':
        return t("printers.types.cashier")
      case 'kitchen':
        return t("printers.types.kitchen")
      case 'bar':
        return t("printers.types.bar")
      default:
        return type
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("printers.title")}</h1>
          <p className="text-muted-foreground">{t("printers.description")}</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} disabled={!isBluetoothSupported}>
          <Plus className="mr-2 h-4 w-4" />
          {t("printers.addPrinter")}
        </Button>
      </div>

      {!isBluetoothSupported && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              {t("printers.bluetoothNotSupported")}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {printers.map((printer) => (
          <Card key={printer.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  {printer.name}
                </div>
                <div className="flex items-center gap-2">
                  {printer.connected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("printers.type")}:</span>
                  <span className="text-sm font-medium">{getPrinterTypeLabel(printer.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("printers.autoPrint")}:</span>
                  <span className="text-sm font-medium">{printer.autoPrint ? t("commons.yes") : t("commons.no")}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {!printer.connected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReconnectPrinter(printer)}
                    disabled={isConnecting}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t("printers.reconnect")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleAutoPrint(printer)}
                >
                  {printer.autoPrint ? t("printers.disableAutoPrint") : t("printers.enableAutoPrint")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePrinter(printer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {printers.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Printer className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t("printers.noPrinters")}</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("printers.addPrinter")}</DialogTitle>
            <DialogDescription>
              {t("printers.addPrinterDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="printerName">{t("printers.printerName")}</Label>
              <Input
                id="printerName"
                value={newPrinterName}
                onChange={(e) => setNewPrinterName(e.target.value)}
                placeholder={t("printers.printerNamePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="printerType">{t("printers.printerType")}</Label>
              <Select value={newPrinterType} onValueChange={(value: any) => setNewPrinterType(value)}>
                <SelectTrigger id="printerType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">{t("printers.types.cashier")}</SelectItem>
                  <SelectItem value="kitchen">{t("printers.types.kitchen")}</SelectItem>
                  <SelectItem value="bar">{t("printers.types.bar")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("commons.cancel")}
            </Button>
            <Button onClick={handleAddPrinter} disabled={isConnecting || !newPrinterName.trim()}>
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("printers.connecting")}
                </>
              ) : (
                t("printers.add")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
