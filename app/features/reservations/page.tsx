"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, CheckCircle, Clock, Users, Bell, Smartphone } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export default function ReservationsFeaturePage() {
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
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/10 mb-6">
              <Calendar className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("landing.features.reservations.title")}
            </h1>
            <p className="text-xl text-orange-100">
              {t("landing.features.reservations.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">
              {t("landing.features.reservations.details.title")}
            </h2>
            
            <div className="grid gap-6">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.reservations.details.easyScheduling.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.reservations.details.easyScheduling.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.reservations.details.capacityManagement.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.reservations.details.capacityManagement.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10">
                      <Bell className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.reservations.details.notifications.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.reservations.details.notifications.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10">
                      <Smartphone className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">
                        {t("landing.features.reservations.details.mobileBooking.title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("landing.features.reservations.details.mobileBooking.description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8 text-slate-800">
                {t("landing.features.reservations.benefits.title")}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {(["benefit1", "benefit2", "benefit3", "benefit4"] as const).map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">
                      {t(`landing.features.reservations.benefits.${benefit}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link href="/register">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  {t("landing.features.reservations.cta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
