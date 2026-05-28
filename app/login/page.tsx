"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/components/i18n-provider"
import {toast} from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { UserRole } from "@/types"
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { login, user, signInWithGoogle } = useAuth()
  const { t } = useI18n()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      // Redirigir según el rol
      switch (user.role) {
        case UserRole.OWNER:
        case UserRole.ADMIN:
        case UserRole.MANAGER:
          router.replace("/dashboard")
          break
        case UserRole.WAITER:
        case UserRole.CHEF:
        case UserRole.BARMAN:
          router.replace("/orders")
          break
        default:
          router.replace("/dashboard")
      }
    }
  }, [user, loading, router])

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
        toast.success(t("login.success"))
        // Redirect based on user role
        if (result.user?.role === UserRole.WAITER || result.user?.role === UserRole.CHEF) {
          router.push("/tables")
        } else {
          router.push("/dashboard")
        }
      } else {
        // Handle specific error cases
        setErrors({ 
          form: result.error || t("login.unexpectedError")
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ 
        form: t("login.unexpectedError")
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setErrors({})

    try {
      const result = await signInWithGoogle()

      if (result.success) {
        if (result.isNewUser) {
          // Redirect to setup page for new users
          router.push("/setup")
        } else {
          toast.success(t("login.success"))
          // Redirect based on user role
          if (result.user?.role === UserRole.WAITER || result.user?.role === UserRole.CHEF) {
            router.push("/tables")
          } else {
            router.push("/dashboard")
          }
        }
      } else {
        setErrors({ 
          form: result.error || t("login.unexpectedError")
        })
      }
    } catch (error) {
      console.error("Google sign-in error:", error)
      setErrors({ 
        form: t("login.unexpectedError")
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  {t("login.orContinueWith")}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("login.signInWithGoogle")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex justify-between w-full">
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
          </div>
          <div className="flex justify-center gap-4 text-xs text-gray-600">
            <Link 
              href="/terms-and-conditions" 
              className="hover:underline"
            >
              {t("login.termsAndConditions")}
            </Link>
            <span>•</span>
            <Link 
              href="/privacy-policy" 
              className="hover:underline"
            >
              {t("login.privacyPolicy")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
