"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/types/permissions"
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from "@/components/firebase-provider";
import { useI18n } from "@/components/i18n-provider";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditUserPage() {
  const [formData, setFormData] = useState({
    username: "",
    role: UserRole.WAITER
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userNotFound, setUserNotFound] = useState(false);

  const { t } = useI18n()
  const { user: currentUser } = useAuth()
  const { db } = useFirebase();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    const fetchUser = async () => {
      if (!db || !currentUser?.establishmentId || !userId) {
        setFetchLoading(false);
        return;
      }

      try {
        const userRef = doc(
          db,
          "restaurants",
          currentUser.establishmentId!,
          "users",
          userId
        );
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          setUserNotFound(true);
          setFetchLoading(false);
          return;
        }

        const userData = userDoc.data();
        setFormData({
          username: userData.username || "",
          role: userData.role || UserRole.WAITER
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error(t("users.errors.fetchUsers"));
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUser();
  }, [db, currentUser, userId, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
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

    if (!formData.username.trim()) {
      newErrors.username = t("users.invitation.errors.usernameRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!currentUser || !db || !userId) {
      toast.error(t("users.invitation.errors.mustBeLoggedIn"));
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(
        db,
        "restaurants",
        currentUser.establishmentId!,
        "users",
        userId
      );

      await updateDoc(userRef, {
        username: formData.username,
        role: formData.role,
        updatedAt: new Date()
      });

      toast.success(t("users.editSuccess"));
      router.push("/users");
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(t("users.errors.updateUser"));
    } finally {
      setLoading(false);
    }
  }

  if (fetchLoading) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">{t("commons.loading")}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userNotFound) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="mb-4">{t("users.userNotFound")}</p>
              <Button asChild>
                <Link href="/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("commons.back")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/users">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle>{t("users.editUser")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">{t("users.invitation.labels.username")}</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            <div>
              <Label htmlFor="role">{t("users.invitation.labels.role")}</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                disabled={loading}
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{t(`users.roles.${role.toLowerCase()}`)}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t("commons.saving") : t("commons.save")}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/users")}
                disabled={loading}
              >
                {t("commons.cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
