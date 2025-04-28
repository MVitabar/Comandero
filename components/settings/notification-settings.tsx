"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useNotifications } from "@/hooks/useNotifications"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"
import { NotificationPreferences } from "@/types"

export function NotificationSettings() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()
  const { sendNotification } = useNotifications()

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
      await setDoc(doc(db, "users", user.uid, "settings", "notifications"), {
        ...preferences,
        updatedAt: new Date()
      })

      toast.success(t("settings.notifications.actions.profileUpdateSuccess"), {
        description: t("settings.notifications.actions.profileUpdateSuccessDescription"),
      })

      await sendNotification({
        title: t("settings.push.notificationsSavedTitle"),
        message: t("settings.push.notificationsSavedMessage"),
        url: window.location.href,
      });
    } catch (error) {
      toast.error(t("settings.notifications.actions.profileUpdateError"), {
        description: t("settings.notifications.actions.profileUpdateErrorDescription"),
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
        <h2 className="text-2xl font-bold">{t("settings.notifications.title")}</h2>
        <p className="text-muted-foreground">{t("settings.notifications.description")}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{t("settings.notifications.types.title")}</h3>
          <div className="space-y-4">
            {(["newOrders", "orderUpdates", "inventoryAlerts", "systemAnnouncements", "dailyReports"] as (keyof NotificationPreferences)[]).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={key} className="font-medium">
                    {t(`settings.notifications.types.${key}.label`)}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(`settings.notifications.types.${key}.description`)}
                  </p>
                </div>
                <Switch
                  id={key}
                  checked={preferences[key]}
                  onCheckedChange={() => handleToggle(key)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">{t("settings.notifications.deliveryMethods.title")}</h3>
          <div className="space-y-4">
            {(["emailNotifications", "pushNotifications", "soundAlerts"] as (keyof NotificationPreferences)[]).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={key} className="font-medium">
                    {t(`settings.notifications.deliveryMethods.${key}.label`)}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(`settings.notifications.deliveryMethods.${key}.description`)}
                  </p>
                </div>
                <Switch
                  id={key}
                  checked={preferences[key]}
                  onCheckedChange={() => handleToggle(key)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("settings.notifications.actions.submitting")}
            </>
          ) : (
            t("settings.notifications.actions.submit")
          )}
        </Button>
      </div>
    </div>
  )
}
