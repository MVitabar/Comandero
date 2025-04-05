"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { UserProfile } from "@/components/settings/user-profile"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { LanguageSettings } from "@/components/settings/language-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { TableMapSettings } from "@/components/settings/table-map-settings"
import { User, Settings, Bell, Globe, Palette, Grid } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("profile")

  const tabItems = [
    { value: "profile", icon: User, label: t("profile") },
    { value: "notifications", icon: Bell, label: t("notifications") },
    { value: "language", icon: Globe, label: t("language") },
    { value: "appearance", icon: Palette, label: t("appearance") },
    { value: "tables", icon: Grid, label: t("tableMaps") },
    { value: "system", icon: Settings, label: t("system") },
  ]

  const ActiveTabIcon = tabItems.find(item => item.value === activeTab)?.icon || Settings

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("settings")}</h1>
        
        {/* Mobile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="md:hidden flex items-center gap-2">
              <ActiveTabIcon className="h-4 w-4" />
              <span>{tabItems.find(item => item.value === activeTab)?.label}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {tabItems.map((item) => (
              <DropdownMenuItem 
                key={item.value} 
                onSelect={() => setActiveTab(item.value)}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="hidden md:grid grid-cols-6 gap-2">
          {tabItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="flex items-center gap-2">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="p-6">
          <TabsContent value="profile" className="mt-0">
            <UserProfile />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="language" className="mt-0">
            <LanguageSettings />
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="tables" className="mt-0">
            <TableMapSettings />
          </TabsContent>

          <TabsContent value="system" className="mt-0">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("system")}</h2>
              <p className="text-muted-foreground">{t("systemSettingsDescription")}</p>
              {/* System settings content */}
            </div>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  )
}
