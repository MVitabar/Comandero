"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n, type Language } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

export function LanguageSettings() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { language, setLanguage, t } = useI18n()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && db) {
      setLoading(true)
      const fetchLanguagePreference = async () => {
        try {
          const prefsDoc = await getDoc(doc(db, "users", user.uid, "settings", "language"))
          if (prefsDoc.exists() && prefsDoc.data().language) {
            setLanguage(prefsDoc.data().language as Language)
          }
        } catch (error) {
          console.error("Error fetching language preference:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchLanguagePreference()
    }
  }, [user, db, setLanguage])

  const handleLanguageChange = (value: Language) => {
    setLanguage(value)
  }

  const handleSave = async () => {
    if (!user || !db) return

    setSaving(true)

    try {
      await setDoc(doc(db, "users", user.uid, "settings", "language"), {
        language,
        updatedAt: new Date(),
      })

      toast({
        title: t("languagePreferenceSaved"),
        description: t("languagePreferenceSuccess"),
      })
    } catch (error) {
      console.error("Error saving language preference:", error)
      toast({
        title: t("languagePreferenceFailed"),
        description: t("languagePreferenceError"),
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
        <h2 className="text-2xl font-bold">{t("language")}</h2>
        <p className="text-muted-foreground">{t("languageSettingsDescription")}</p>
      </div>

      <RadioGroup
        value={language}
        onValueChange={handleLanguageChange as (value: string) => void}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="en" id="en" />
          <Label htmlFor="en" className="font-medium">
            English
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="es" id="es" />
          <Label htmlFor="es" className="font-medium">
            Español
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pt" id="pt" />
          <Label htmlFor="pt" className="font-medium">
            Português
          </Label>
        </div>
      </RadioGroup>

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

