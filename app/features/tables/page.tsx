"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Utensils, CheckCircle, Map, Layers, Smartphone, Zap } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export default function TablesFeaturePage() {
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
      <section className="bg-gradient-to-br from-purple-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/10 mb-6">
              <Utensils className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("landing.features.tables.title")}
            </h1>
            <p className="text-xl text-purple-100">
              {t("landing.features.tables.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">
              {t("landing.features.tables.details.title")}
            </h2>
            
            <div className="grid gap-6">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Map className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.tables.details.tableMaps.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.tables.details.tableMaps.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Layers className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.tables.details.bulkCreation.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.tables.details.bulkCreation.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Smartphone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.tables.details.mobileAccess.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.tables.details.mobileAccess.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.tables.details.realTimeStatus.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.tables.details.realTimeStatus.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8 text-slate-800">
                {t("landing.features.tables.benefits.title")}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {(["benefit1", "benefit2", "benefit3", "benefit4"] as const).map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">
                      {t(`landing.features.tables.benefits.${benefit}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link href="/register">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  {t("landing.features.tables.cta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
