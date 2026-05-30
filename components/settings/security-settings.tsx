"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Shield, Key, Lock, Loader2, AlertCircle, Trash2 } from "lucide-react"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { deleteDoc, doc, collection, getDocs, query, where, writeBatch, setDoc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export function SecuritySettings() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { auth, db } = useFirebase()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [deletePassword, setDeletePassword] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showDeleteForm, setShowDeleteForm] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  // Check if user is using Google authentication
  useEffect(() => {
    if (auth?.currentUser) {
      const googleUser = auth.currentUser.providerData.some(
        (provider: any) => provider.providerId === 'google.com'
      )
      setIsGoogleUser(googleUser)
    }
  }, [auth, user])

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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auth.currentUser || !user) return

    // Check if user is using Google authentication
    const isGoogleUser = auth.currentUser.providerData.some(
      (provider: any) => provider.providerId === 'google.com'
    )

    if (!isGoogleUser && !deletePassword) {
      toast.error(t("settings.security.passwordRequired"))
      return
    }

    setLoading(true)

    try {
      // Reauthenticate user based on provider
      if (isGoogleUser) {
        // For Google users, we need to reauthenticate with Google
        const { GoogleAuthProvider, reauthenticateWithPopup } = await import('firebase/auth')
        const provider = new GoogleAuthProvider()
        await reauthenticateWithPopup(auth.currentUser, provider)
      } else {
        // For email/password users, reauthenticate with email/password
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email!,
          deletePassword
        )
        await reauthenticateWithCredential(auth.currentUser, credential)
      }

      // Delete all establishment data if user is the owner
      if (db && user.establishmentId && user.role === 'owner') {
        try {
          // Store the email and trial info before deletion for trial reset prevention
          const establishmentRef = doc(db, "restaurants", user.establishmentId)
          const establishmentDoc = await getDoc(establishmentRef)
          
          if (establishmentDoc.exists()) {
            const establishmentData = establishmentDoc.data()
            
            // Store deleted account info to prevent trial reset
            const deletedAccountsRef = doc(db, "deletedAccounts", auth.currentUser.email!)
            await deleteDoc(deletedAccountsRef).catch(() => {}) // Clear any existing record
            await deleteDoc(deletedAccountsRef).catch(() => {}) // This is intentional to ensure clean slate
            await setDoc(deletedAccountsRef, {
              email: auth.currentUser.email,
              originalEstablishmentId: user.establishmentId,
              trialStartDate: establishmentData.trialStartDate,
              trialEndDate: establishmentData.trialEndDate,
              isTrialActive: establishmentData.isTrialActive,
              subscriptionPlan: establishmentData.subscriptionPlan,
              deletedAt: new Date().toISOString()
            })

            // Delete all subcollections and documents
            const batch = writeBatch(db)
            
            // Delete all users in the establishment
            const usersRef = collection(db, "restaurants", user.establishmentId, "users")
            const usersSnapshot = await getDocs(usersRef)
            usersSnapshot.forEach((userDoc) => {
              batch.delete(userDoc.ref)
            })

            // Delete the establishment document
            batch.delete(establishmentRef)

            // Note: We're not deleting all subcollections (inventory, orders, etc.) 
            // as this could be a very large operation. In a production environment,
            // you would want to use a Cloud Function or a more efficient bulk delete method.
            // For now, we're deleting the core establishment data which is sufficient
            // to prevent the establishment from being accessible.

            await batch.commit()
          }
        } catch (error) {
          console.error("Error deleting establishment data:", error)
        }
      }

      // Delete user from establishment's users subcollection
      if (db && user.establishmentId) {
        try {
          await deleteDoc(doc(db, "restaurants", user.establishmentId, "users", user.uid))
        } catch (error) {
          console.error("Error deleting user data from Firestore:", error)
        }
      }

      // Delete global user document
      if (db) {
        try {
          await deleteDoc(doc(db, "users", user.uid))
        } catch (error) {
          console.error("Error deleting global user data:", error)
        }
      }

      // Delete user from Firebase Auth
      await deleteUser(auth.currentUser)

      toast.success(t("settings.security.accountDeleted"))
      router.push("/login")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error(t("settings.security.deleteAccountError"))
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

        <Card className="p-6 border-destructive">
          <h3 className="text-lg font-semibold mb-4 text-destructive">
            <span className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {t("settings.security.deleteAccount")}
            </span>
          </h3>

          <Alert className="mb-4 border-destructive">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {t("settings.security.deleteAccountWarning")}
            </AlertDescription>
          </Alert>

          {!showDeleteForm ? (
            <Button onClick={() => setShowDeleteForm(true)} variant="destructive">
              {t("settings.security.deleteAccountButton")}
            </Button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              {isGoogleUser ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t("settings.security.googleReauthWarning")}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">{t("settings.security.confirmPassword")}</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    disabled={loading}
                    required
                    placeholder={t("settings.security.enterPassword")}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" variant="destructive" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("settings.security.deleting")}
                    </>
                  ) : (
                    t("settings.security.confirmDelete")
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteForm(false)
                    setDeletePassword("")
                  }}
                  disabled={loading}
                >
                  {t("settings.security.cancel")}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}