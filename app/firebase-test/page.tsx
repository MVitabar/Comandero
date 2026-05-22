"use client"

import { useState } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function FirebaseTestPage() {
  const { t } = useI18n()
  const { app, auth, db, isInitialized, error } = useFirebase()
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({
    app: null,
    auth: null,
    db: null,
  })

  const runTests = () => {
    setTestResults({
      app: !!app,
      auth: !!auth,
      db: !!db,
    })
  }

  const configStatus = (value: string | undefined) =>
    value ? `✓ ${t("dev.firebaseTest.set")}` : `✗ ${t("dev.firebaseTest.missing")}`

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("dev.firebaseTest.title")}</CardTitle>
          <CardDescription>{t("dev.firebaseTest.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>{t("dev.firebaseTest.initialized")}</span>
              {isInitialized ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("dev.firebaseTest.error")}</AlertTitle>
                <AlertDescription>{String(error)}</AlertDescription>
              </Alert>
            )}

            {testResults.app !== null && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span>{t("dev.firebaseTest.app")}</span>
                  {testResults.app ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("dev.firebaseTest.auth")}</span>
                  {testResults.auth ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("dev.firebaseTest.firestore")}</span>
                  {testResults.db ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            )}

            {isInitialized && !error && (
              <div className="mt-4 text-sm">
                <p>
                  <strong>{t("dev.firebaseTest.configLabel")}</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-2">
                  {JSON.stringify(
                    {
                      apiKey: configStatus(app?.options.apiKey),
                      authDomain: configStatus(app?.options.authDomain),
                      projectId: configStatus(app?.options.projectId),
                      storageBucket: configStatus(app?.options.storageBucket),
                      messagingSenderId: configStatus(app?.options.messagingSenderId),
                      appId: configStatus(app?.options.appId),
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={runTests} className="w-full">
            {t("dev.firebaseTest.runTests")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
