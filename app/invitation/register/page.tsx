"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"

export default function InvitationRegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [invitationData, setInvitationData] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { signUp } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationId = searchParams.get('id')

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!db || !invitationId) {
        setLoading(false)
        return
      }

      try {
        const invitationRef = doc(db, 'invitations', invitationId)
        const invitationDoc = await getDoc(invitationRef)

        if (!invitationDoc.exists()) {
          toast.error(t("invitation.invalid"))
          router.push('/login')
          return
        }

        const data = invitationDoc.data()
        
        // Verificar si la invitación ha expirado
        if (data.expiresAt.toDate() < new Date()) {
          toast.error(t("invitation.expired"))
          router.push('/login')
          return
        }

        setInvitationData(data)
        setFormData(prev => ({
          ...prev,
          username: data.username || '',
          email: data.email || ''
        }))
      } catch (error) {
        console.error("Error fetching invitation:", error)
        toast.error(t("invitation.error"))
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [db, invitationId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = t("register.passwordRequired")
    } else if (formData.password.length < 8) {
      newErrors.password = t("register.passwordTooShort")
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("register.passwordsDoNotMatch")
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      const validationErrors = validateForm()
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      setLoading(true)
  
      try {
        // Almacenamos el establishmentId en una variable separada
        const establishmentId = invitationData.establishmentId;
        
        const result = await signUp(
          formData.email,
          formData.password,
          {
            username: formData.username,
            role: invitationData.role,
            // Use only one establishmentName property with the combined value
            establishmentName: `${invitationData.establishmentName}#${establishmentId}`
          }
        )

        if (result.success) {
          toast.success(t("register.success"))
          router.push("/dashboard")
        } else {
          setErrors({ form: result.error || t("register.unexpectedError") })
        }
      } catch (error) {
        console.error("Error de registro:", error)
        setErrors({ form: t("register.unexpectedError") })
      } finally {
        setLoading(false)
      }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("invitation.register.title")}</CardTitle>
          <CardDescription>
            {t("invitation.register.description", { 
              establishmentName: invitationData?.establishmentName 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="text-red-500 text-sm mb-4">{errors.form}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">{t("register.usernameLabel")}</Label>
              <Input
                id="username"
                value={formData.username}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("register.emailLabel")}</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("register.passwordLabel")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={errors.password ? "border-red-500" : ""}
                  disabled={loading}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("register.confirmPasswordLabel")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  disabled={loading}
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("register.loading")}
                </>
              ) : (
                t("register.submit")
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("register.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("register.loginLink")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}