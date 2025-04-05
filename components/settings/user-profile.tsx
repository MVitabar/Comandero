"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { Loader2, Upload } from "lucide-react"

export function UserProfile() {
  const { user } = useAuth()
  const { db, auth } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()

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
      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        username: userData.username,
        phoneNumber: userData.phoneNumber,
        position: userData.position,
        role: userData.role,
        updatedAt: new Date(),
      })

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: userData.username,
      })

      toast({
        title: t("profileUpdated"),
        description: t("profileUpdateSuccess"),
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: t("profileUpdateFailed"),
        description: t("profileUpdateError"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("profile")}</h2>
        <p className="text-muted-foreground">{t("profileSettingsDescription")}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src="" alt={userData.username} />
            <AvatarFallback className="text-xl">{getInitials(userData.username)}</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t("uploadPhoto")}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" name="email" value={userData.email} disabled={true} className="bg-muted" />
              <p className="text-xs text-muted-foreground">{t("emailCannotBeChanged")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t("phoneNumber")}</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">{t("position")}</Label>
              <Input
                id="position"
                name="position"
                value={userData.position}
                onChange={handleChange}
                disabled={loading}
                placeholder={t("positionPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t("role")}</Label>
              <Select value={userData.role} onValueChange={handleRoleChange} disabled={loading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder={t("selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("admin")}</SelectItem>
                  <SelectItem value="manager">{t("manager")}</SelectItem>
                  <SelectItem value="chef">{t("chef")}</SelectItem>
                  <SelectItem value="waiter">{t("waiter")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("saveChanges")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

