"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/components/i18n-provider"
import {toast} from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    establishmentName: "",
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { signUp } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const { sendNotification } = useNotifications()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Username validation
    if (!formData.username) {
      newErrors.username = t("register.usernameRequired")
    } else if (formData.username.length < 3) {
      newErrors.username = t("register.usernameTooShort")
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = t("register.emailRequired")
    } else if (!formData.email.includes('@')) {
      newErrors.email = t("register.invalidEmailFormat")
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t("register.passwordRequired")
    } else if (formData.password.length < 8) {
      newErrors.password = t("register.passwordTooShort")
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("register.passwordsDoNotMatch")
    }

    // Establishment name validation
    if (!formData.establishmentName) {
      newErrors.establishmentName = t("register.establishmentNameRequired")
    }

    // Terms acceptance
    if (!acceptTerms) {
      newErrors.terms = t("register.termsRequired")
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Validate form
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return
    }

    try {
      const result = await signUp(
        formData.email, 
        formData.password, 
        {
          username: formData.username,
          establishmentName: formData.establishmentName
        }
      )

      if (result.success) {
        // Notificación in-app con Sonner
        toast.success(t("register.success"))
        
        // Notificación push con OneSignal
        await sendNotification({
          title: "Nuevo Usuario Registrado",
          message: `${formData.username} se ha registrado en ${formData.establishmentName}`,
        })
        
        router.push("/dashboard")
      } else {
        // Handle specific error cases
        setErrors({ 
          form: result.error || t("register.unexpectedError")
        })
        
        toast.error(result.error || t("register.unexpectedError"))
        if (result.error === "EMAIL_ALREADY_EXISTS") {
          setErrors((prev) => ({ ...prev, email: t("register.emailAlreadyExists") }))
        }
        if (result.error === "USERNAME_ALREADY_EXISTS") {
          setErrors((prev) => ({ ...prev, username: t("register.usernameAlreadyExists") }))
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
      
      setErrors({ 
        form: t("register.unexpectedError")
      })
      
      toast.error(t("register.unexpectedError"))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear specific error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("register.title")}</CardTitle>
          <CardDescription>{t("register.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="text-red-500 text-sm mb-4">
                {errors.form}
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username">{t("register.usernameLabel")}</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder={t("register.usernamePlaceholder")}
                disabled={loading}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("register.emailLabel")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("register.emailPlaceholder")}
                disabled={loading}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Establishment Name Input */}
            <div className="space-y-2">
              <Label htmlFor="establishmentName">{t("register.establishmentNameLabel")}</Label>
              <Input
                id="establishmentName"
                name="establishmentName"
                type="text"
                value={formData.establishmentName}
                onChange={handleChange}
                placeholder={t("register.establishmentNamePlaceholder")}
                disabled={loading}
                className={errors.establishmentName ? "border-red-500" : ""}
              />
              {errors.establishmentName && (
                <p className="text-red-500 text-sm">{errors.establishmentName}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("register.passwordLabel")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("register.passwordPlaceholder")}
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
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("register.confirmPasswordLabel")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t("register.confirmPasswordPlaceholder")}
                  disabled={loading}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Acceptance */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => {
                  setAcceptTerms(!!checked)
                  if (errors.terms) {
                    const newErrors = { ...errors }
                    delete newErrors.terms
                    setErrors(newErrors)
                  }
                }}
                disabled={loading}
              />
              <Label 
                htmlFor="terms" 
                className={errors.terms ? "text-red-500" : ""}
              >
                {t("register.acceptTerms")}
              </Label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-sm">{errors.terms}</p>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("register.loading")}</>
              ) : (
                t("register.submit")
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link 
            href="/login" 
            className="text-sm text-blue-600 hover:underline"
          >
            {t("register.loginLink")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
