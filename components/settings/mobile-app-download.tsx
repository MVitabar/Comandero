"use client"

import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Smartphone, CheckCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const APK_DOWNLOAD_URL = "https://github.com/MVitabar/Comandero/releases/download/ComanPOS-v-1.0/ComanderoMovil.apk"

export function MobileAppDownload() {
  const { t } = useI18n()

  const handleDownload = () => {
    window.open(APK_DOWNLOAD_URL, '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t("settings.mobileApp.title")}</h2>
        <p className="text-gray-600">{t("settings.mobileApp.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {t("settings.mobileApp.appName")}
          </CardTitle>
          <CardDescription>
            {t("settings.mobileApp.appDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* App Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Smartphone className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">{t("settings.mobileApp.platform")}</div>
                <div className="text-sm text-blue-700">{t("settings.mobileApp.version")}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{t("settings.mobileApp.features.pos.title")}</span> - {t("settings.mobileApp.features.pos.description")}
                </div>
              </div>
            
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{t("settings.mobileApp.features.sync.title")}</span> - {t("settings.mobileApp.features.sync.description")}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{t("settings.mobileApp.features.printer.title")}</span> - {t("settings.mobileApp.features.printer.description")}
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="space-y-3">
            <Button
              onClick={handleDownload}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              {t("settings.mobileApp.downloadButton")}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              {t("settings.mobileApp.fileInfo")}
            </p>
          </div>

          {/* Installation Instructions */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              {t("settings.mobileApp.installation.title")}
            </h3>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>{t("settings.mobileApp.installation.step1")}</li>
              <li>{t("settings.mobileApp.installation.step2")}</li>
              <li>{t("settings.mobileApp.installation.step3")}</li>
              <li>{t("settings.mobileApp.installation.step4")}</li>
              <li>{t("settings.mobileApp.installation.step5")}</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
