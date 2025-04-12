"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, query, collection, where, getDocs } from "firebase/firestore"
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
    establishmentName: "",
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [suggestedNames, setSuggestedNames] = useState<string[]>([])

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
      newErrors.username = t("register.error.usernameRequired")
    } else if (formData.username.length < 3) {
      newErrors.username = t("register.error.usernameMinLength")
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = t("register.error.emailRequired")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("register.error.emailInvalid")
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t("register.error.passwordRequired")
    } else if (formData.password.length < 8) {
      newErrors.password = t("register.error.passwordMinLength")
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t("register.error.passwordRequirements")
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("register.error.passwordsDoNotMatch")
    }

    // Establishment name validation
    if (!formData.establishmentName.trim()) {
      newErrors.establishmentName = t("register.error.establishmentNameRequired")
    } else if (formData.establishmentName.length < 3) {
      newErrors.establishmentName = t("register.error.establishmentNameMinLength")
    }

    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = t("register.error.acceptTermsRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateUniqueRestaurantId = (name: string) => {
    const sanitizedName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
    const randomHash = Math.random().toString(36).substring(2, 10)
    return `${sanitizedName}-${randomHash}`
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
      // Verificar disponibilidad del nombre del establecimiento
      const establishmentsRef = collection(db, 'establishments')
      const q = query(
        establishmentsRef, 
        where('name', '==', formData.establishmentName)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        // Generar nombres alternativos
        const baseSlug = formData.establishmentName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .trim()

        const alternatives = [
          `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`,
          `${baseSlug}-${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}`,
          `${baseSlug}-${Math.floor(Math.random() * 9000) + 1000}`
        ].map(alt => {
          // Asegurar que la longitud no exceda un límite razonable
          return alt.length > 50 ? alt.substring(0, 50) : alt
        })

        // Verificar que los nombres alternativos no estén ya en uso
        const checkAlternativesQuery = query(
          establishmentsRef, 
          where('name', 'in', alternatives)
        )
        const alternativesSnapshot = await getDocs(checkAlternativesQuery)

        // Filtrar nombres que no estén en uso
        const availableAlternatives = alternatives.filter(alt => 
          !alternativesSnapshot.docs.some(doc => doc.data().name === alt)
        )

        if (availableAlternatives.length === 0) {
          // Si todos los nombres están en uso, generar uno completamente aleatorio
          const fallbackName = `${baseSlug}-${Date.now()}`
          availableAlternatives.push(fallbackName)
        }

        setSuggestedNames(availableAlternatives)
        setLoading(false)
        return
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

      const user = userCredential.user
      const userId = user.uid

      // Sanitizar el nombre del establecimiento
      const baseSlug = formData.establishmentName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // Crear documento global de usuario
      await setDoc(doc(db, 'users', userId), {
        uid: userId,
        username: formData.username,
        email: formData.email,
        role: "owner",
        status: "active",
        establishmentName: formData.establishmentName,
        createdAt: new Date(),
      })

      // Crear documento del establecimiento
      await setDoc(doc(db, 'establishments', baseSlug), {
        name: formData.establishmentName,
        slug: baseSlug,
        createdAt: new Date(),
      })

      // Crear documento de información del establecimiento
      await setDoc(doc(db, 'establishments', baseSlug, 'info', 'details'), {
        name: formData.establishmentName,
        uid: userId,
        username: formData.username,
        email: formData.email,
        role: "owner",
        createdAt: new Date(),
        lastLogin: new Date(),
      })

      // Crear usuario en la subcolección de usuarios del establecimiento
      await setDoc(doc(db, 'establishments', baseSlug, 'users', userId), {
        uid: userId,
        username: formData.username,
        email: formData.email,
        role: "owner",
        status: "active",
        createdAt: new Date(),
      })

      toast({
        title: t("register.success.registrationSuccessful"),
        description: t("register.success.accountCreated"),
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Registration error:", error)

      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: t("register.error.emailInUse") }))
      } else if (error.code === "auth/invalid-email") {
        setErrors((prev) => ({ ...prev, email: t("register.error.emailInvalid") }))
      } else if (error.code === "auth/weak-password") {
        setErrors((prev) => ({ ...prev, password: t("register.error.passwordTooWeak") }))
      } else if (error.code === "auth/configuration-not-found") {
        toast({
          title: t("commons.error"),
          description: t("commons.auth.configurationError"),
          variant: "destructive",
        })
      } else {
        toast({
          title: t("register.error.registrationFailed"),
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
          <CardTitle>{t("register.title")}</CardTitle>
          <CardDescription>{t("register.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("register.username")}</Label>
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
              <Label htmlFor="email">{t("register.email")}</Label>
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
              <Label htmlFor="establishmentName">{t("register.establishmentName")}</Label>
              <Input
                id="establishmentName"
                name="establishmentName"
                value={formData.establishmentName}
                onChange={handleChange}
                className={errors.establishmentName ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.establishmentName && <p className="text-sm text-red-500">{errors.establishmentName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("register.password")}</Label>
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
              <Label htmlFor="confirmPassword">{t("register.confirmPassword")}</Label>
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
                {t("register.acceptTerms")}
              </Label>
            </div>
            {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}

            {suggestedNames.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-yellow-600">
                  {t("register.error.establishmentNameTaken")}
                </p>
                <div className="space-y-2">
                  {suggestedNames.map((name, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      onClick={() => {
                        setFormData(prev => ({ ...prev, establishmentName: name }))
                        setSuggestedNames([])
                      }}
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("register.registering")}
                </>
              ) : (
                t("register.register")
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("register.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("register.login")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
