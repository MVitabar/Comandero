"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

// Define Language type
type Language = 'en' | 'es' | 'pt'

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
            const storedLanguage = prefsDoc.data().language as Language;
            // Only set language if it's different from current language
            if (storedLanguage !== language) {
              setLanguage(storedLanguage);
            }
          }
        } catch (error) {
          console.error("Error fetching language preference:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchLanguagePreference()
    }
  }, [user, db, language, setLanguage])

  const getSavedLanguage = async () => {
    if (!user || !db) return null;

    try {
      const prefsDoc = await getDoc(doc(db, "users", user.uid, "settings", "language"))
      if (prefsDoc.exists() && prefsDoc.data().language) {
        return prefsDoc.data().language as Language;
      }
    } catch (error) {
      console.error("Error fetching saved language:", error)
    }

    return null;
  }

  const setSavedLanguage = async (language: Language) => {
    if (!user || !db) return;

    try {
      await setDoc(doc(db, "users", user.uid, "settings", "language"), {
        language,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error("Error setting saved language:", error)
    }
  }

  const handleLanguageChange = (value: Language) => {
    // Prevent immediate language reversion
    const preventReversion = async () => {
      const currentLanguage = await getSavedLanguage();
      
      if (currentLanguage !== value) {
        await setSavedLanguage(value);
        setLanguage(value);
      }
    };

    // Immediate change
    setLanguage(value);
    
    // Prevent reversion with a slight delay
    setTimeout(preventReversion, 100);
  }

  const handleSave = async () => {
    if (!user || !db) return

    setSaving(true)

    try {
      // Update Firestore with the current language
      await setDoc(doc(db, "users", user.uid, "settings", "language"), {
        language,
        updatedAt: new Date(),
      }, { merge: true });

      toast({
        title: t("settings.language.actions.profileUpdated"),
        description: t("settings.language.actions.profileUpdateSuccess"),
      })
    } catch (error) {
      console.error("Error saving language preference", error);
      toast({
        title: t("settings.language.actions.profileUpdateFailed"),
        description: t("settings.language.actions.profileUpdateError"),
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  };

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
        <h2 className="text-2xl font-bold">{t("settings.language.title")}</h2>
        <p className="text-muted-foreground">{t("settings.language.description")}</p>
      </div>

      <RadioGroup
        value={language}
        onValueChange={handleLanguageChange}
        className="grid grid-cols-3 gap-4"
      >
        <div>
          <RadioGroupItem value="en" id="en" className="peer sr-only" />
          <Label
            htmlFor="en"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            {t("settings.language.languages.en")}
          </Label>
        </div>
        <div>
          <RadioGroupItem value="es" id="es" className="peer sr-only" />
          <Label
            htmlFor="es"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            {t("settings.language.languages.es")}
          </Label>
        </div>
        <div>
          <RadioGroupItem value="pt" id="pt" className="peer sr-only" />
          <Label
            htmlFor="pt"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            {t("settings.language.languages.pt")}
          </Label>
        </div>
      </RadioGroup>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("settings.language.actions.saving")}
            </>
          ) : (
            t("settings.language.actions.submit")
          )}
        </Button>
      </div> 
    </div>
  )
}
