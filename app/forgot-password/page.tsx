"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { sendPasswordResetEmail } from "firebase/auth"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import {toast} from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Loader2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const { auth } = useFirebase()
  const { t } = useI18n()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error(t("forgotPassword.error.emailRequired"))  
      return
    }

    if (!auth) {
      toast.error(t("forgotPassword.error.authNotInitialized"))
      return
    }

    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setEmailSent(true)
      toast.success(t("forgotPassword.success.emailSent"))
    } catch (error: any) {
      console.error("Password reset error:", error)

      if (error.code === "auth/user-not-found") {
        toast.error(t("forgotPassword.error.userNotFound"))
      } else if (error.code === "auth/invalid-email") {
        toast.error(t("forgotPassword.error.invalidEmail"))
      } else {
        toast.error(t("forgotPassword.error.genericError"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/login")} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{t("forgotPassword")}</CardTitle>
          </div>
          <CardDescription>
            {emailSent
              ? t("forgotPassword.description.emailSent")
              : t("forgotPassword.description.initial")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("forgotPassword.button.sending")}
                  </>
                ) : (
                  t("forgotPassword.button.sendInstructions")
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="mb-4">
                {t("forgotPassword.success.emailSent")} <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                {t("forgotPassword.emailSent.checkSpam")}
              </p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => setEmailSent(false)}
              >
                {t("forgotPassword.button.tryAnotherEmail")}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("forgotPassword.loginReminder")}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("forgotPassword.loginLink")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
