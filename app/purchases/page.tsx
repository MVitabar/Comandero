"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/components/i18n-provider"
import { usePermissions } from "@/components/permissions-provider"
import { UnauthorizedAccess } from "@/components/unauthorized-access"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Truck, Package, BarChart3 } from "lucide-react"
import { PurchasesList } from "@/components/purchases/purchases-list"
import { SuppliersList } from "@/components/purchases/suppliers-list"
import { PurchaseReports } from "@/components/purchases/purchase-reports"

export default function PurchasesPage() {
  const { t } = useI18n()
  const { canView } = usePermissions()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("purchases")

  // Verificar si puede ver la sección de compras
  if (!canView('purchases')) {
    return <UnauthorizedAccess />
  }

  return (
    <div className="container mx-auto p-4 md:p-6 py-4 md:py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{t("purchases.title")}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="purchases">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t("purchases.purchases.title")}
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Truck className="h-4 w-4 mr-2" />
            {t("purchases.suppliers.title")}
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("purchases.reports.title")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <Card className="p-4 md:p-6">
            <PurchasesList />
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card className="p-4 md:p-6">
            <SuppliersList />
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-4 md:p-6">
            <PurchaseReports />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
