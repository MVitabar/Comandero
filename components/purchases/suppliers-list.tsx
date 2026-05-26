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
import { Plus, Edit, Trash2, Search, Phone, Mail, MapPin, Building } from "lucide-react"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { toast } from "sonner"
import type { Supplier } from "@/types"

export function SuppliersList() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { db } = useFirebase()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    taxId: "",
    notes: "",
    paymentTerms: "",
    deliveryTime: "",
    rating: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchSuppliers()
  }, [user, db])

  const fetchSuppliers = async () => {
    if (!user?.establishmentId || !db) return

    setLoading(true)
    try {
      const suppliersRef = collection(db, `restaurants/${user.establishmentId}/suppliers`)
      const q = query(suppliersRef, orderBy("name"))
      const snapshot = await getDocs(q)
      const suppliersData = snapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
      })) as Supplier[]
      setSuppliers(suppliersData)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast.error(t("purchases.suppliers.error.loading"))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.establishmentId || !db) return

    setLoading(true)
    try {
      const supplierData = {
        ...formData,
        restaurantId: user.establishmentId,
        updatedAt: new Date(),
      }

      if (editingSupplier) {
        await updateDoc(doc(db, `restaurants/${user.establishmentId}/suppliers`, editingSupplier.uid), supplierData)
        toast.success(t("purchases.suppliers.success.updated"))
      } else {
        await addDoc(collection(db, `restaurants/${user.establishmentId}/suppliers`), {
          ...supplierData,
          uid: "", // Will be set by Firestore
          createdAt: new Date(),
        })
        toast.success(t("purchases.suppliers.success.added"))
      }

      setIsDialogOpen(false)
      setEditingSupplier(null)
      resetForm()
      fetchSuppliers()
    } catch (error) {
      console.error("Error saving supplier:", error)
      toast.error(t("purchases.suppliers.error.saving"))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      city: supplier.city || "",
      state: supplier.state || "",
      country: supplier.country || "",
      zipCode: supplier.zipCode || "",
      taxId: supplier.taxId || "",
      notes: supplier.notes || "",
      paymentTerms: supplier.paymentTerms || "",
      deliveryTime: supplier.deliveryTime || "",
      rating: supplier.rating || 0,
      isActive: supplier.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (supplier: Supplier) => {
    if (!user?.establishmentId || !db) return

    if (!confirm(t("purchases.suppliers.deleteConfirm"))) return

    setLoading(true)
    try {
      await deleteDoc(doc(db, `restaurants/${user.establishmentId}/suppliers`, supplier.uid))
      toast.success(t("purchases.suppliers.success.deleted"))
      fetchSuppliers()
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast.error(t("purchases.suppliers.error.deleting"))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      taxId: "",
      notes: "",
      paymentTerms: "",
      deliveryTime: "",
      rating: 0,
      isActive: true,
    })
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("purchases.suppliers.title")}</h2>
        {canCreate("purchases") && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingSupplier(null)
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                {t("purchases.suppliers.add")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSupplier ? t("purchases.suppliers.edit") : t("purchases.suppliers.add")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="name">{t("purchases.suppliers.name")} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">{t("purchases.suppliers.contactPerson")}</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("purchases.suppliers.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("purchases.suppliers.phone")}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">{t("purchases.suppliers.taxId")}</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="address">{t("purchases.suppliers.address")}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("purchases.suppliers.city")}</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">{t("purchases.suppliers.state")}</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t("purchases.suppliers.country")}</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">{t("purchases.suppliers.zipCode")}</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">{t("purchases.suppliers.paymentTerms")}</Label>
                    <Input
                      id="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      placeholder={t("purchases.suppliers.paymentTermsPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">{t("purchases.suppliers.deliveryTime")}</Label>
                    <Input
                      id="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      placeholder={t("purchases.suppliers.deliveryTimePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="notes">{t("purchases.suppliers.notes")}</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false)
                    setEditingSupplier(null)
                    resetForm()
                  }}>
                    {t("commons.cancel")}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? t("commons.button.loading") : editingSupplier ? t("commons.button.edit") : t("commons.button.add")}
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          placeholder={t("purchases.suppliers.searchPlaceholder")}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">{t("purchases.suppliers.loading")}</div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? t("commons.noResults") : t("purchases.suppliers.noSuppliers")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.uid || supplier.id || supplier.name} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">{supplier.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${supplier.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {supplier.isActive ? t("purchases.suppliers.active") : t("purchases.suppliers.inactive")}
                  </span>
                </div>

                {supplier.contactPerson && (
                  <div className="text-sm text-muted-foreground">
                    {t("purchases.suppliers.contact")}: {supplier.contactPerson}
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {supplier.phone}
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {supplier.email}
                    </div>
                  )}
                  {(supplier.address || supplier.city) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {[supplier.address, supplier.city, supplier.state].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>

                {supplier.paymentTerms && (
                  <div className="text-sm">
                    <span className="font-medium">{t("purchases.suppliers.payment")}:</span> {supplier.paymentTerms}
                  </div>
                )}

                {supplier.deliveryTime && (
                  <div className="text-sm">
                    <span className="font-medium">{t("purchases.suppliers.delivery")}:</span> {supplier.deliveryTime}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {canUpdate("purchases") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(supplier)}
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
                      onClick={() => handleDelete(supplier)}
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
