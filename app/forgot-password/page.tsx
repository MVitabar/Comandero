"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { sendPasswordResetEmail } from "firebase/auth"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
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
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: t("emailRequired"),
        variant: "destructive",
      })
      return
    }

    if (!auth) {
      toast({
        title: "Error",
        description: "Authentication service not available",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setEmailSent(true)
      toast({
        title: "Email Sent",
        description: "Password reset instructions have been sent to your email",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)

      if (error.code === "auth/user-not-found") {
        toast({
          title: "Error",
          description: "No account found with this email address",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send password reset email",
          variant: "destructive",
        })
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
              ? "Check your email for password reset instructions"
              : "Enter your email to receive password reset instructions"}
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="mb-4">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">If you don't see the email, check your spam folder</p>
              <Button className="mt-4" variant="outline" onClick={() => setEmailSent(false)}>
                Try another email
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("login")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

