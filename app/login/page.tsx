"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import "@/styles/globals.css"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { auth } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setErrors({})

    // Validate form
    let hasErrors = false
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = t("login.emailRequired")
      hasErrors = true
    }

    if (!password) {
      newErrors.password = t("login.passwordRequired")
      hasErrors = true
    }

    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    if (!auth) {
      toast({
        title: t("commons.error"),
        description: t("commons.auth.serviceUnavailable"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        toast({
          title: t("login.title"),
          description: t("login.error.invalidCredentials"),
          variant: "destructive",
        })
      } else if (error.code === "auth/too-many-requests") {
        toast({
          title: t("login.title"),
          description: t("login.error.tooManyAttempts"),
          variant: "destructive",
        })
      } else {
        toast({
          title: t("login.title"),
          description: t("login.error.unknown"),
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
          <CardTitle>{t("login.title")}</CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                disabled={loading}
                required
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t("commons.passwordVisibility.hide") : t("commons.passwordVisibility.show")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("commons.login.button.loggingIn")}
                </>
              ) : (
                t("login.login")
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            {t("login.forgotPassword")}
          </Link>
          <Link href="/register" className="text-sm text-blue-600 hover:underline">
            {t("register.submit")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
