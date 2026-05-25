"use client"

import { useInstallPrompt } from "@/contexts/InstallPromptContext"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

export function InstallBanner() {
  const { deferredPrompt, triggerInstallPrompt, dismissInstallPrompt } = useInstallPrompt()
  const { t } = useI18n()

  if (!deferredPrompt) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Download className="h-6 w-6 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">{t("settings.installBanner.title")}</p>
            <p className="text-blue-100">{t("settings.installBanner.description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={triggerInstallPrompt}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            {t("settings.installBanner.install")}
          </Button>
          <button
            onClick={dismissInstallPrompt}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
