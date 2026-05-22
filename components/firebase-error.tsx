"use client"

import { useFirebase } from "./firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export function FirebaseError() {
  const { error } = useFirebase()
  const { t } = useI18n()

  if (!error) return null

  const handleRefresh = () => {
    window.location.reload()
  }

  const errorMessage =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("errors.firebase.title")}</AlertTitle>
          <AlertDescription>
            {t("errors.firebase.description")}
            <ul className="list-disc pl-5 mt-2">
              <li>{t("errors.firebase.reasons.network")}</li>
              <li>{t("errors.firebase.reasons.disruption")}</li>
              <li>{t("errors.firebase.reasons.configuration")}</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t("errors.firebase.technicalDetails")} {errorMessage}
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("errors.firebase.refresh")}
          </Button>
        </div>
      </div>
    </div>
  )
}
