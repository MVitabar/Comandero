"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
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

  const { login } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validate form
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = t("login.emailRequired")
    } else if (!email.includes('@')) {
      newErrors.email = t("login.invalidEmailFormat")
    }

    if (!password) {
      newErrors.password = t("login.passwordRequired")
    }

    // If validation errors exist, stop and show errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const result = await login(email, password)

      if (result.success) {
        toast({
          title: t("login.success"),
          description: t("login.welcomeBack"),
          variant: "default"
        })
        router.push("/dashboard")
      } else {
        // Handle specific error cases
        setErrors({ 
          form: result.error || t("login.unexpectedError")
        })
        
        toast({
          title: t("login.error"),
          description: result.error || t("login.unexpectedError"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ 
        form: t("login.unexpectedError")
      })
      
      toast({
        title: t("login.error"),
        description: t("login.unexpectedError"),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("login.title")}</CardTitle>
          <CardDescription>{t("login.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {errors.form && (
              <div className="text-red-500 text-sm mb-4">
                {errors.form}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
                disabled={loading}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("login.passwordLabel")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  disabled={loading}
                  className={errors.password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("login.loading")}</>
              ) : (
                t("login.submit")
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link 
            href="/forgot-password" 
            className="text-sm text-blue-600 hover:underline"
          >
            {t("login.forgotPassword")}
          </Link>
          <Link 
            href="/register" 
            className="text-sm text-blue-600 hover:underline"
          >
            {t("login.registerLink")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
