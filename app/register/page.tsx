"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { auth, db } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = t("usernameRequired")
    } else if (formData.username.length < 3) {
      newErrors.username = t("usernameMinLength")
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = t("emailRequired")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("emailInvalid")
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t("passwordRequired")
    } else if (formData.password.length < 8) {
      newErrors.password = t("passwordMinLength")
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t("passwordRequirements")
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("passwordsDoNotMatch")
    }

    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = t("acceptTermsRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!auth || !db) {
      toast({
        title: t("commons.error"),
        description: t("commons.auth.serviceUnavailable"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

      const user = userCredential.user
      const userId = user.uid // Explicitly get the uid

      // Update profile with username
      await updateProfile(user, {
        displayName: formData.username,
      })

      // Store additional user data in Firestore with nested collection structure
      await setDoc(doc(db, "restaurants", userId), {
        uid: userId,
        username: formData.username,
        email: formData.email,
        role: "owner", // First registered user is the owner
        createdAt: new Date(),
        lastLogin: new Date(),
      })

      // Create a users subcollection for the restaurant
      await setDoc(doc(db, "restaurants", userId, "users", userId), {
        uid: userId,
        username: formData.username,
        email: formData.email,
        role: "owner",
        status: "active",
        addedBy: userId,
        createdAt: new Date(),
      })

      toast({
        title: t("registrationSuccessful"),
        description: t("accountCreated"),
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Registration error:", error)

      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: t("emailAlreadyInUse") }))
      } else if (error.code === "auth/invalid-email") {
        setErrors((prev) => ({ ...prev, email: t("emailInvalid") }))
      } else if (error.code === "auth/weak-password") {
        setErrors((prev) => ({ ...prev, password: t("passwordTooWeak") }))
      } else if (error.code === "auth/configuration-not-found") {
        toast({
          title: t("commons.error"),
          description: t("commons.auth.configurationError"),
          variant: "destructive",
        })
      } else {
        toast({
          title: t("registrationFailed"),
          description: error.message || t("commons.error.generic"),
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
          <CardTitle>{t("register")}</CardTitle>
          <CardDescription>{t("createAccountDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t("password.hide") : t("password.show")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && <PasswordStrengthIndicator password={formData.password} />}
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t("password.hide") : t("password.show")}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="terms" className={`text-sm ${errors.terms ? "text-red-500" : ""}`}>
                {t("acceptTerms")}
              </Label>
            </div>
            {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("registering")}
                </>
              ) : (
                t("register")
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("login")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
