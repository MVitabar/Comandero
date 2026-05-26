"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/types"
import { Loader2, Store } from "lucide-react"
import { toast } from "sonner"

export default function SetupPage() {
  const [establishmentName, setEstablishmentName] = useState("")
  const [loading, setLoading] = useState(false)
  const { completeSetup } = useAuth()
  const { t } = useI18n()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(false)

    if (!establishmentName.trim()) {
      toast.error(t("setup.establishmentNameRequired"))
      setLoading(false)
      return
    }

    try {
      const result = await completeSetup(establishmentName.trim())

      if (result.success) {
        toast.success(t("setup.success"))
        router.push("/dashboard")
      } else {
        toast.error(result.error || t("setup.error"))
      }
    } catch (error) {
      console.error("Setup error:", error)
      toast.error(t("setup.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t("setup.title")}</CardTitle>
          <CardDescription>{t("setup.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="establishmentName">{t("setup.establishmentNameLabel")}</Label>
              <Input
                id="establishmentName"
                type="text"
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                placeholder={t("setup.establishmentNamePlaceholder")}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("setup.creating")}
                </>
              ) : (
                t("setup.createEstablishment")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
