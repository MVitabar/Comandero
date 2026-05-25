"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { usePermissions } from "@/components/permissions-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, Package, Calendar, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from "firebase/firestore"
import { toast } from "sonner"
import type { Purchase, PurchaseItem, Supplier } from "@/types"

export function PurchasesList() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { db } = useFirebase()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    supplierId: "",
    purchaseNumber: "",
    status: "pending" as Purchase["status"],
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: "",
    paymentMethod: "",
    paymentStatus: "pending" as Purchase["paymentStatus"],
    notes: "",
    items: [] as PurchaseItem[],
  })

  const [itemForm, setItemForm] = useState({
    inventoryItemName: "",
    quantity: 0,
    unit: "",
    unitPrice: 0,
    notes: "",
    category: "",
  })

  useEffect(() => {
    fetchPurchases()
    fetchSuppliers()
    fetchCategories()
  }, [user, db])

  const fetchPurchases = async () => {
    if (!user?.establishmentId || !db) return

    setLoading(true)
    try {
      const purchasesRef = collection(db, `restaurants/${user.establishmentId}/purchases`)
      const q = query(purchasesRef, orderBy("orderDate", "desc"))
      const snapshot = await getDocs(q)
      const purchasesData = snapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
      })) as Purchase[]
      setPurchases(purchasesData)
    } catch (error) {
      console.error("Error fetching purchases:", error)
      toast.error(t("purchases.purchases.error.loading"))
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    if (!user?.establishmentId || !db) return

    try {
      const suppliersRef = collection(db, `restaurants/${user.establishmentId}/suppliers`)
      const snapshot = await getDocs(suppliersRef)
      const suppliersData = snapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
      })) as Supplier[]
      setSuppliers(suppliersData)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  const fetchCategories = async () => {
    if (!user?.establishmentId || !db) return

    try {
      const inventoryRef = collection(db, `restaurants/${user.establishmentId}/inventory`)
      const snapshot = await getDocs(inventoryRef)
      console.log("Inventory snapshot:", snapshot.docs.length)
      const categoriesData = snapshot.docs.map(doc => {
        const data = doc.data()
        console.log("Inventory doc:", data)
        return {
          id: doc.id,
          name: data.name || data.categoryName || data.category || doc.id,
        }
      })
      console.log("Categories data:", categoriesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const addItem = () => {
    if (!itemForm.inventoryItemName || itemForm.quantity <= 0 || itemForm.unitPrice <= 0) {
      toast.error(t("purchases.purchases.fillAllItemFields"))
      return
    }

    const newItem: PurchaseItem = {
      uid: Date.now().toString(),
      purchaseId: "",
      inventoryItemName: itemForm.inventoryItemName,
      quantity: itemForm.quantity,
      unit: itemForm.unit,
      unitPrice: itemForm.unitPrice,
      totalPrice: itemForm.quantity * itemForm.unitPrice,
      notes: itemForm.notes,
      category: itemForm.category,
    }

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    })

    setItemForm({
      inventoryItemName: "",
      quantity: 0,
      unit: "",
      unitPrice: 0,
      notes: "",
      category: "",
    })
  }

  const removeItem = (itemUid: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.uid !== itemUid),
    })
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.establishmentId || !db) return

    if (formData.items.length === 0) {
      toast.error(t("purchases.purchases.atLeastOneItem"))
      return
    }

    setLoading(true)
    try {
      const supplier = suppliers.find(s => s.uid === formData.supplierId || s.id === formData.supplierId)
      
      if (!supplier) {
        toast.error(t("purchases.purchases.supplier") + " is required")
        setLoading(false)
        return
      }
      
      const purchaseNumber = formData.purchaseNumber || `PO-${Date.now()}`

      const purchaseData = {
        ...formData,
        supplierName: supplier.name,
        purchaseNumber,
        totalAmount: calculateTotal(),
        items: formData.items.map(item => ({
          ...item,
          purchaseId: "",
        })),
        restaurantId: user.establishmentId,
        createdBy: user.uid,
        updatedAt: new Date(),
      }

      if (editingPurchase) {
        await updateDoc(doc(db, `restaurants/${user.establishmentId}/purchases`, editingPurchase.uid), purchaseData)
        toast.success(t("purchases.purchases.success.updated"))
      } else {
        const purchaseRef = await addDoc(collection(db, `restaurants/${user.establishmentId}/purchases`), {
          ...purchaseData,
          uid: "",
          createdAt: new Date(),
        })
        
        // Add items to inventory
        for (const item of formData.items) {
          if (item.category) {
            const categoryData = categories.find(c => c.id === item.category)
            await addDoc(collection(db, `restaurants/${user.establishmentId}/inventory`), {
              name: item.inventoryItemName,
              category: item.category,
              categoryName: categoryData?.name || item.category,
              quantity: item.quantity,
              unit: item.unit,
              price: item.unitPrice,
              minQuantity: 0,
              controlsStock: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        }
        
        toast.success(t("purchases.purchases.success.added"))
      }

      setIsDialogOpen(false)
      setEditingPurchase(null)
      resetForm()
      fetchPurchases()
    } catch (error) {
      console.error("Error saving purchase:", error)
      toast.error(t("purchases.purchases.error.saving"))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setFormData({
      supplierId: purchase.supplierId,
      purchaseNumber: purchase.purchaseNumber,
      status: purchase.status,
      orderDate: purchase.orderDate instanceof Date ? purchase.orderDate.toISOString().split('T')[0] : purchase.orderDate,
      expectedDeliveryDate: purchase.expectedDeliveryDate instanceof Date ? purchase.expectedDeliveryDate.toISOString().split('T')[0] : purchase.expectedDeliveryDate || "",
      paymentMethod: purchase.paymentMethod || "",
      paymentStatus: purchase.paymentStatus || "pending",
      notes: purchase.notes || "",
      items: purchase.items,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (purchase: Purchase) => {
    if (!user?.establishmentId || !db) return

    if (!confirm(t("purchases.purchases.deleteConfirm"))) return

    setLoading(true)
    try {
      await deleteDoc(doc(db, `restaurants/${user.establishmentId}/purchases`, purchase.uid))
      toast.success(t("purchases.purchases.success.deleted"))
      fetchPurchases()
    } catch (error) {
      console.error("Error deleting purchase:", error)
      toast.error(t("purchases.purchases.error.deleting"))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      supplierId: "",
      purchaseNumber: "",
      status: "pending",
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: "",
      paymentMethod: "",
      paymentStatus: "pending",
      notes: "",
      items: [],
    })
    setItemForm({
      inventoryItemName: "",
      quantity: 0,
      unit: "",
      unitPrice: 0,
      notes: "",
      category: "",
    })
  }

  const getStatusIcon = (status: Purchase["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "ordered":
        return <Package className="h-4 w-4 text-blue-500" />
      case "received":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "partial":
        return <Package className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredPurchases = purchases.filter(purchase =>
    purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("purchases.purchases.title")}</h2>
        {canCreate("purchases") && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingPurchase(null)
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                {t("purchases.purchases.add")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPurchase ? t("purchases.purchases.edit") : t("purchases.purchases.add")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierId">{t("purchases.purchases.supplier")} *</Label>
                    <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder={t("purchases.purchases.supplier")} />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.uid || supplier.id} value={supplier.uid || supplier.id || ""}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseNumber">{t("purchases.purchases.purchaseNumber")}</Label>
                    <Input
                      id="purchaseNumber"
                      value={formData.purchaseNumber}
                      onChange={(e) => setFormData({ ...formData, purchaseNumber: e.target.value })}
                      placeholder={t("purchases.purchases.autoGenerated")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderDate">{t("purchases.purchases.orderDate")} *</Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedDeliveryDate">{t("purchases.purchases.expectedDeliveryDate")}</Label>
                    <Input
                      id="expectedDeliveryDate"
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">{t("purchases.purchases.status")} *</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t("purchases.purchases.statuses.pending")}</SelectItem>
                        <SelectItem value="ordered">{t("purchases.purchases.statuses.ordered")}</SelectItem>
                        <SelectItem value="received">{t("purchases.purchases.statuses.received")}</SelectItem>
                        <SelectItem value="partial">{t("purchases.purchases.statuses.partial")}</SelectItem>
                        <SelectItem value="cancelled">{t("purchases.purchases.statuses.cancelled")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">{t("purchases.purchases.paymentStatus")}</Label>
                    <Select value={formData.paymentStatus} onValueChange={(value: any) => setFormData({ ...formData, paymentStatus: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t("purchases.purchases.paymentStatuses.pending")}</SelectItem>
                        <SelectItem value="paid">{t("purchases.purchases.paymentStatuses.paid")}</SelectItem>
                        <SelectItem value="partial">{t("purchases.purchases.paymentStatuses.partial")}</SelectItem>
                        <SelectItem value="overdue">{t("purchases.purchases.paymentStatuses.overdue")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="paymentMethod">{t("purchases.purchases.paymentMethod")}</Label>
                    <Input
                      id="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      placeholder={t("purchases.purchases.paymentMethodPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes">{t("purchases.purchases.notes")}</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">{t("purchases.purchases.items")}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemName">{t("purchases.purchases.itemName")} *</Label>
                      <Input
                        id="itemName"
                        value={itemForm.inventoryItemName}
                        onChange={(e) => setItemForm({ ...itemForm, inventoryItemName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">{t("purchases.purchases.category")}</Label>
                      <Select value={itemForm.category} onValueChange={(value) => setItemForm({ ...itemForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("purchases.purchases.selectCategory")} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">{t("purchases.purchases.quantity")} *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={itemForm.quantity}
                        onChange={(e) => setItemForm({ ...itemForm, quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">{t("purchases.purchases.unit")} *</Label>
                      <Input
                        id="unit"
                        value={itemForm.unit}
                        onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                        placeholder={t("purchases.purchases.unitPlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">{t("purchases.purchases.unitPrice")} *</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        step="0.01"
                        value={itemForm.unitPrice}
                        onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="itemNotes">{t("purchases.purchases.itemNotes")}</Label>
                      <Input
                        id="itemNotes"
                        value={itemForm.notes}
                        onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("purchases.purchases.addItem")}
                  </Button>

                  {formData.items.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.items.map((item) => (
                        <div key={item.uid} className="flex justify-between items-center p-2 bg-muted rounded">
                          <div className="flex-1">
                            <div className="font-medium">{item.inventoryItemName}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} {item.unit} × ${item.unitPrice.toFixed(2)} = ${item.totalPrice.toFixed(2)}
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.uid)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">{t("purchases.purchases.total")}:</span>
                        <span className="font-semibold text-lg">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false)
                    setEditingPurchase(null)
                    resetForm()
                  }}>
                    {t("commons.cancel")}
                  </Button>
                  <Button type="submit" disabled={loading || formData.items.length === 0}>
                    {loading ? t("commons.button.loading") : editingPurchase ? t("commons.button.edit") : t("commons.button.add")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t("purchases.purchases.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">{t("purchases.purchases.loading")}</div>
      ) : filteredPurchases.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? t("commons.noResults") : t("purchases.purchases.noPurchases")}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => (
            <Card key={purchase.uid} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(purchase.status)}
                    <h3 className="font-semibold">{purchase.purchaseNumber}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {t(`purchases.purchases.statuses.${purchase.status}`)}
                  </span>
                </div>

                <div className="text-sm">
                  <div className="font-medium">{purchase.supplierName}</div>
                  <div className="text-muted-foreground">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {t("purchases.purchases.orderDate")}: {purchase.orderDate instanceof Date ? purchase.orderDate.toLocaleDateString() : purchase.orderDate}
                  </div>
                  {purchase.expectedDeliveryDate && (
                    <div className="text-muted-foreground">
                      {t("purchases.purchases.expectedDeliveryDate")}: {purchase.expectedDeliveryDate instanceof Date ? purchase.expectedDeliveryDate.toLocaleDateString() : purchase.expectedDeliveryDate}
                    </div>
                  )}
                </div>

                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{purchase.items.length} {t("purchases.purchases.items")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{t("purchases.purchases.total")}: ${purchase.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {purchase.paymentStatus && (
                  <div className="text-sm">
                    <span className="font-medium">{t("purchases.purchases.payment")}:</span> {t(`purchases.purchases.paymentStatuses.${purchase.paymentStatus}`)}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {canUpdate("purchases") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(purchase)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {t("commons.edit")}
                    </Button>
                  )}
                  {canDelete("purchases") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(purchase)}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {t("commons.delete")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
