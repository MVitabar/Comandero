"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useTheme, Theme } from "@/components/theme-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Loader2, Moon, Sun, Monitor } from "lucide-react"

export function AppearanceSettings() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && db) {
      setLoading(true)
      const fetchAppearancePreference = async () => {
        try {
          const prefsDoc = await getDoc(doc(db, "users", user.uid, "settings", "appearance"))
          if (prefsDoc.exists() && prefsDoc.data().theme) {
            setTheme(prefsDoc.data().theme as Theme)
          }
        } catch (error) {
          console.error("Error fetching appearance preference:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchAppearancePreference()
    }
  }, [user, db, setTheme])

  const handleThemeChange = (value: Theme) => {
    setTheme(value)
  }

  const handleSave = async () => {
    if (!user || !db) return

    setSaving(true)

    try {
      await setDoc(doc(db, "users", user.uid, "settings", "appearance"), {
        theme,
        updatedAt: new Date(),
      })

      toast({
        title: t("settings.appearance.actions.saved.title"),
        description: t("settings.appearance.actions.saved.description"),
      })
    } catch (error) {
      console.error("Error saving appearance preference:", error)
      toast({
        title: t("settings.appearance.actions.failed.title"),
        description: t("settings.appearance.actions.failed.description"),
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
        <h2 className="text-2xl font-bold">{t("settings.appearance.title")}</h2>
        <p className="text-muted-foreground">{t("settings.appearance.description")}</p>
      </div>

      <RadioGroup value={theme} onValueChange={handleThemeChange} className="space-y-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="light" id="light" />
          <Label htmlFor="light" className="flex items-center gap-2 font-medium">
            <Sun className="h-4 w-4" />
            {t("settings.appearance.modes.light.label")}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="dark" id="dark" />
          <Label htmlFor="dark" className="flex items-center gap-2 font-medium">
            <Moon className="h-4 w-4" />
            {t("settings.appearance.modes.dark.label")}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="system" id="system" />
          <Label htmlFor="system" className="flex items-center gap-2 font-medium">
            <Monitor className="h-4 w-4" />
            {t("settings.appearance.modes.system.label")}
          </Label>
        </div>
      </RadioGroup>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("settings.appearance.actions.saving")}
            </>
          ) : (
            t("settings.appearance.actions.save")
          )}
        </Button>
      </div>
    </div>
  )
}
