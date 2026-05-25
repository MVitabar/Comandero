"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Phone, Mail, Clock, Loader2 } from "lucide-react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { toast } from "sonner"

export function EstablishmentSettings() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { db } = useFirebase()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [establishmentData, setEstablishmentData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    openingHours: "",
    taxId: "",
  })

  useEffect(() => {
    if (user?.establishmentId && db) {
      setLoading(true)
      const fetchEstablishmentData = async () => {
        try {
          const estDoc = await getDoc(doc(db, "restaurants", user.establishmentId!))
          if (estDoc.exists()) {
            const data = estDoc.data()
            setEstablishmentData({
              name: data.name || "",
              address: data.address || "",
              phone: data.phone || "",
              email: data.email || "",
              openingHours: data.openingHours || "",
              taxId: data.taxId || "",
            })
          }
        } catch (error) {
          console.error("Error fetching establishment data:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchEstablishmentData()
    }
  }, [user, db])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEstablishmentData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.establishmentId || !db) return

    setSaving(true)

    try {
      await updateDoc(doc(db, "restaurants", user.establishmentId), {
        ...establishmentData,
        updatedAt: new Date(),
      })

      toast.success(t("settings.establishment.actions.saved"))
    } catch (error) {
      console.error("Error saving establishment data:", error)
      toast.error(t("settings.establishment.actions.error"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("settings.establishment.title")}</h2>
        <p className="text-muted-foreground">{t("settings.establishment.description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            <span className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t("settings.establishment.businessInfo")}
            </span>
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("settings.establishment.fields.name")}</Label>
              <Input
                id="name"
                name="name"
                value={establishmentData.name}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("settings.establishment.fields.address")}
                </span>
              </Label>
              <Input
                id="address"
                name="address"
                value={establishmentData.address}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t("settings.establishment.fields.phone")}
                  </span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={establishmentData.phone}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("settings.establishment.fields.email")}
                  </span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={establishmentData.email}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingHours">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t("settings.establishment.fields.openingHours")}
                </span>
              </Label>
              <Input
                id="openingHours"
                name="openingHours"
                value={establishmentData.openingHours}
                onChange={handleChange}
                disabled={saving}
                placeholder="Mon-Fri: 9AM-10PM, Sat-Sun: 10AM-11PM"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">{t("settings.establishment.fields.taxId")}</Label>
              <Input
                id="taxId"
                name="taxId"
                value={establishmentData.taxId}
                onChange={handleChange}
                disabled={saving}
                placeholder="CNPJ / Tax ID"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("settings.establishment.actions.saving")}
              </>
            ) : (
              t("settings.establishment.actions.save")
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}