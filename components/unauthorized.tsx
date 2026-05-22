"use client"

import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "./ui/button"

export function UnauthorizedAccess() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>{t("errors.accessDenied.title")}</h1>
      <p>{t("errors.accessDenied.message")}</p>
      <Button asChild>
        <Link href="/">{t("errors.accessDenied.backHome")}</Link>
      </Button>
    </div>
  )
}
