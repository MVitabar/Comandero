"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import {toast} from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { updateProfile, User as FirebaseUser } from "firebase/auth"
import { Loader2 } from "lucide-react"
import { UserRole } from "@/types/permissions"
import { usePermissions } from "@/components/permissions-provider"
import { UnauthorizedAccess } from "../unauthorized-access"
import type { CustomUser } from '@/types';
import { useNotifications } from "@/hooks/useNotifications"

export function UserProfile() {
  const { canView, canUpdate } = usePermissions();
  const { user } = useAuth() as { user: CustomUser | null }
  const { db, auth } = useFirebase()
  const { t } = useI18n()
  const { sendNotification } = useNotifications();

  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    role: "",
    phoneNumber: "",
    position: "",
  })

  useEffect(() => {
    if (user && db) {
      setLoading(true)
      const fetchUserData = async () => {
        try {
          if (!user.uid) {
            return
          }

          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUserData({
              username: user.displayName || data.username || "",
              email: user.email || data.email || "",
              role: data.role || "waiter",
              phoneNumber: data.phoneNumber || "",
              position: data.position || "",
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchUserData()
    }
  }, [user, db])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setUserData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !db || !auth) return

    setLoading(true)

    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: userData.username,
        phoneNumber: userData.phoneNumber,
        position: userData.position,
        role: userData.role,
        updatedAt: new Date(),
      })

      await updateProfile(user, {
        displayName: userData.username,
      })

      toast.success(t("settings.profile.actions.profileUpdated"))
      await sendNotification({
        title: t("profile.push.profileSavedTitle"),
        message: t("profile.push.profileSavedMessage", { username: userData.username }),
        url: window.location.href,
      });
    } catch (error) {
      toast.error(t("settings.profile.actions.errorUpdatingProfile"))
    } finally {
      setLoading(false) 
    }
  }

  // Verificar si puede ver el perfil
  if (!canView('profile')) {
    return <UnauthorizedAccess />
  }

  // Verificar si puede cambiar roles (solo OWNER, ADMIN, MANAGER)
  const canChangeRoles = user?.role === UserRole.OWNER || 
                        user?.role === UserRole.ADMIN || 
                        user?.role === UserRole.MANAGER;

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("settings.profile.title")}</h2>
        <p className="text-muted-foreground">{t("settings.profile.description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t("settings.profile.fields.username")}</Label>
            <Input
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              disabled={loading || !canUpdate('profile')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("settings.profile.fields.email.label")}</Label>
            <Input id="email" name="email" value={userData.email} disabled={true} className="bg-muted" />
            <p className="text-xs text-muted-foreground">{t("settings.profile.fields.email.cannotBeChanged")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">{t("settings.profile.fields.phoneNumber")}</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={userData.phoneNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">{t("settings.profile.fields.position.label")}</Label>
            <Input
              id="position"
              name="position"
              value={userData.position}
              onChange={handleChange}
              disabled={loading}
              placeholder={t("settings.profile.fields.position.placeholder")}
            />
          </div>

          {canChangeRoles && (
            <div className="space-y-2">
              <Label htmlFor="role">{t("settings.profile.fields.role.label")}</Label>
              <Select value={userData.role} onValueChange={handleRoleChange} disabled={loading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder={t("settings.profile.fields.role.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`settings.profile.fields.role.options.${role.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !canUpdate('profile')}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("settings.profile.actions.submitting")}
              </>
            ) : (
              t("settings.profile.actions.submit")
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
