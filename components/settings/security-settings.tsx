"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Shield, Key, Lock, Loader2, AlertCircle } from "lucide-react"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SecuritySettings() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { auth } = useFirebase()

  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auth.currentUser) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("settings.security.passwordMismatch"))
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t("settings.security.passwordTooShort"))
      return
    }

    setLoading(true)

    try {
      // Reauthenticate user first
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        passwordData.currentPassword
      )
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword)

      toast.success(t("settings.security.passwordUpdated"))
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordForm(false)
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error(t("settings.security.passwordUpdateError"))
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorToggle = (enabled: boolean) => {
    if (enabled) {
      toast.info(t("settings.security.twoFactorComingSoon"))
      return
    }
    setTwoFactorEnabled(enabled)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("settings.security.title")}</h2>
        <p className="text-muted-foreground">{t("settings.security.description")}</p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            <span className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t("settings.security.password")}
            </span>
          </h3>

          {!showPasswordForm ? (
            <Button onClick={() => setShowPasswordForm(true)} variant="outline">
              {t("settings.security.changePassword")}
            </Button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("settings.security.currentPassword")}</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("settings.security.newPassword")}</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("settings.security.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("settings.security.updating")}
                    </>
                  ) : (
                    t("settings.security.updatePassword")
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordForm(false)}
                  disabled={loading}
                >
                  {t("settings.security.cancel")}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            <span className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t("settings.security.twoFactor")}
            </span>
          </h3>

          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("settings.security.twoFactorDescription")}
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("settings.security.enableTwoFactor")}</p>
              <p className="text-sm text-muted-foreground">
                {t("settings.security.twoFactorInfo")}
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("settings.security.loginHistory")}
            </span>
          </h3>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("settings.security.loginHistoryComingSoon")}
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    </div>
  )
}