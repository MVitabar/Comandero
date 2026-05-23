"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import {toast} from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/types/permissions"
import { useEffect } from "react"
import { collection, addDoc } from 'firebase/firestore';
import { useFirebase } from "@/components/firebase-provider";
import { useI18n } from "@/components/i18n-provider";

export default function AddTeamMemberPage() {
  const [formData, setFormData] = useState({
    username: "",
    role: UserRole.WAITER
  });
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invitationLink, setInvitationLink] = useState<string>('');

  const { t } = useI18n()
  const { user } = useAuth()
  const { db } = useFirebase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear any existing errors for this field
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

    // Ya no necesitamos validar password y confirmPassword
    // porque ahora usamos sistema de invitación

    if (!user?.currentEstablishmentName) {
      newErrors.form = t("users.invitation.errors.establishmentNotFound")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!user || !db) { // Agregamos la verificación de db
      toast.error(t("users.invitation.errors.mustBeLoggedIn"));
      return;
    }

    setLoading(true);

    try {
      // Crear un nuevo documento de invitación en Firestore
      const invitationData = {
        email: generatedEmail,
        username: formData.username,
        role: formData.role,
        establishmentName: user?.currentEstablishmentName || '',
        establishmentId: user?.establishmentId,
        createdBy: user.uid,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas desde ahora
        status: 'pending'
      };

      const invitationRef = await addDoc(collection(db, 'invitations'), invitationData);
      
      // Generar el enlace de invitación con el ID del documento
      const invitationLink = `${window.location.origin}/invitation/register?id=${invitationRef.id}`;
      setInvitationLink(invitationLink);

      toast.success(t("users.invitation.success.invitationCreated"));
      new Notification(t("users.invitation.success.invitationCreated"));
      
      // Limpiar el formulario
      setFormData({
        username: "",
        role: UserRole.WAITER
      });
      setGeneratedEmail('');
      
    } catch (error: any) {
      console.error("Error al generar invitación:", error);
      toast.error(t("users.invitation.errors.invitationFailed"));
    } finally {
      setLoading(false);
    }
}

  useEffect(() => {
    const establishmentName = user?.currentEstablishmentName?.replace(/\s+/g, '-').toLowerCase() || '';
    const sanitizedUsername = formData.username.trim().replace(/\s+/g, '.').toLowerCase();
    setGeneratedEmail(`${sanitizedUsername}@${establishmentName}.com`);
  }, [formData.username, user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast.success(t("users.invitation.success.emailCopied"));
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>{t("users.invitation.title")}</CardTitle>
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
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full p-2 border rounded"
                disabled={loading}
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{t(`users.roles.${role.toLowerCase()}`)}</option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? t("users.invitation.actions.generating") : t("users.invitation.actions.generate")}
              
            </Button>
          </form>

          {/* Mostrar el enlace de invitación si existe */}
          {invitationLink && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <div className="flex flex-col gap-2">
                <span className="font-medium">{t("users.invitation.invitationLinkLabel")}</span>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={invitationLink}
                    readOnly
                    className="flex-1 p-2 border rounded mr-2"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(invitationLink);
                      toast.success(t("users.invitation.success.linkCopied"));
                    }}
                  >
                    {t("commons.copy")}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("users.invitation.invitationExpiry")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Email preview block */}
        {formData.username && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t("users.invitation.generatedEmailLabel")} {generatedEmail}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyToClipboard}
              >
                <span className="mr-2">{t("commons.copy")}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}