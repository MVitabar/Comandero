"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

interface NotificationPreferences {
  newOrders: boolean
  orderUpdates: boolean
  inventoryAlerts: boolean
  systemAnnouncements: boolean
  dailyReports: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  soundAlerts: boolean
}

export function NotificationSettings() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newOrders: true,
    orderUpdates: true,
    inventoryAlerts: true,
    systemAnnouncements: true,
    dailyReports: false,
    emailNotifications: true,
    pushNotifications: true,
    soundAlerts: true,
  })

  useEffect(() => {
    if (user && db) {
      setLoading(true)
      const fetchNotificationPreferences = async () => {
        try {
          const prefsDoc = await getDoc(doc(db, "users", user.uid, "settings", "notifications"))
          if (prefsDoc.exists()) {
            setPreferences(prefsDoc.data() as NotificationPreferences)
          }
        } catch (error) {
          console.error("Error fetching notification preferences:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchNotificationPreferences()
    }
  }, [user, db])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    if (!user || !db) return

    setSaving(true)

    try {
      await setDoc(doc(db, "users", user.uid, "settings", "notifications"), preferences)

      toast({
        title: t("notificationPreferencesSaved"),
        description: t("notificationPreferencesSuccess"),
      })
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast({
        title: t("notificationPreferencesFailed"),
        description: t("notificationPreferencesError"),
        variant: "destructive",
      })
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
        <h2 className="text-2xl font-bold">{t("notifications")}</h2>
        <p className="text-muted-foreground">{t("notificationSettingsDescription")}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{t("notificationTypes")}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newOrders" className="font-medium">
                  {t("newOrders")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("newOrdersDescription")}</p>
              </div>
              <Switch
                id="newOrders"
                checked={preferences.newOrders}
                onCheckedChange={() => handleToggle("newOrders")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="orderUpdates" className="font-medium">
                  {t("orderUpdates")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("orderUpdatesDescription")}</p>
              </div>
              <Switch
                id="orderUpdates"
                checked={preferences.orderUpdates}
                onCheckedChange={() => handleToggle("orderUpdates")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inventoryAlerts" className="font-medium">
                  {t("inventoryAlerts")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("inventoryAlertsDescription")}</p>
              </div>
              <Switch
                id="inventoryAlerts"
                checked={preferences.inventoryAlerts}
                onCheckedChange={() => handleToggle("inventoryAlerts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="systemAnnouncements" className="font-medium">
                  {t("systemAnnouncements")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("systemAnnouncementsDescription")}</p>
              </div>
              <Switch
                id="systemAnnouncements"
                checked={preferences.systemAnnouncements}
                onCheckedChange={() => handleToggle("systemAnnouncements")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dailyReports" className="font-medium">
                  {t("dailyReports")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("dailyReportsDescription")}</p>
              </div>
              <Switch
                id="dailyReports"
                checked={preferences.dailyReports}
                onCheckedChange={() => handleToggle("dailyReports")}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">{t("deliveryMethods")}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications" className="font-medium">
                  {t("emailNotifications")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("emailNotificationsDescription")}</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={preferences.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotifications" className="font-medium">
                  {t("pushNotifications")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("pushNotificationsDescription")}</p>
              </div>
              <Switch
                id="pushNotifications"
                checked={preferences.pushNotifications}
                onCheckedChange={() => handleToggle("pushNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="soundAlerts" className="font-medium">
                  {t("soundAlerts")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("soundAlertsDescription")}</p>
              </div>
              <Switch
                id="soundAlerts"
                checked={preferences.soundAlerts}
                onCheckedChange={() => handleToggle("soundAlerts")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : (
            t("saveChanges")
          )}
        </Button>
      </div>
    </div>
  )
}

