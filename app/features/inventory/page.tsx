"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Settings, CheckCircle, Package, AlertTriangle, TrendingDown, BarChart3 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export default function InventoryFeaturePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("landing.features.backToHome")}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/10 mb-6">
              <Settings className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("landing.features.inventory.title")}
            </h1>
            <p className="text-xl text-cyan-100">
              {t("landing.features.inventory.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">
              {t("landing.features.inventory.details.title")}
            </h2>
            
            <div className="grid gap-6">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10">
                      <Package className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.inventory.details.stockManagement.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.inventory.details.stockManagement.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10">
                      <AlertTriangle className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.inventory.details.lowStockAlerts.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.inventory.details.lowStockAlerts.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10">
                      <TrendingDown className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.inventory.details.costControl.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.inventory.details.costControl.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10">
                      <BarChart3 className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.inventory.details.usageTracking.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.inventory.details.usageTracking.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8 text-slate-800">
                {t("landing.features.inventory.benefits.title")}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {(["benefit1", "benefit2", "benefit3", "benefit4"] as const).map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">
                      {t(`landing.features.inventory.benefits.${benefit}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link href="/register">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
                  {t("landing.features.inventory.cta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
