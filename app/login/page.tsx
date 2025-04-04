"use client"

import React, { useEffect } from "react"

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
import { Eye, EyeOff, Loader2, Download, Smartphone } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [canInstallPWA, setCanInstallPWA] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  const { auth } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setCanInstallPWA(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast({
          title: t("appInstallSuccess"),
          description: t("appInstallSuccessDescription"),
        })
      } else {
        toast({
          title: t("appInstallCancelled"),
          description: t("appInstallCancelledDescription"),
          variant: "default",
        })
      }

      // Reset the deferred prompt
      setDeferredPrompt(null)
      setCanInstallPWA(false)
    }
  }

  // Determine download options based on device
  const getDownloadOptions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const platform = navigator.platform.toLowerCase()

    if (/android/.test(userAgent)) {
      return {
        platform: "Android",
        icon: <Smartphone className="mr-2 h-5 w-5" />,
        text: t("downloadAndroidApp")
      }
    } else if (/(ipod|iphone|ipad)/.test(userAgent)) {
      return {
        platform: "iOS",
        icon: <Smartphone className="mr-2 h-5 w-5" />,
        text: t("downloadIOSApp")
      }
    }

    return null
  }

  const downloadOption = getDownloadOptions()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setErrors({})

    // Validate form
    let hasErrors = false
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = t("emailRequired")
      hasErrors = true
    }

    if (!password) {
      newErrors.password = t("passwordRequired")
      hasErrors = true
    }

    if (hasErrors) {
      setErrors(newErrors)
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
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
      } else if (error.code === "auth/too-many-requests") {
        toast({
          title: "Login Failed",
          description: "Too many failed login attempts. Please try again later.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t("login")}</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
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
              <Label htmlFor="password">{t("password")}</Label>
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
                  {t("login")}
                </>
              ) : (
                t("login")
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-primary hover:underline">
              {t("register")}
            </Link>
          </p>
          
          {/* PWA Install Button */}
          {canInstallPWA && (
            <Button 
              variant="outline" 
              className="w-full mt-2" 
              onClick={handleInstallPWA}
            >
              <Download className="mr-2 h-5 w-5" />
              {t("install App")}
            </Button>
          )}

          
          
        </CardFooter>
      </Card>
    </div>
  )
}
