"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { UserProfile } from "@/components/settings/user-profile"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { LanguageSettings } from "@/components/settings/language-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { User, Settings, Bell, Globe, Palette, Grid, ChevronDown } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function SettingsPage() {
  const { t } = useI18n() as { t: (key: string) => string }
  const [activeTab, setActiveTab] = useState("profile")

  const settingsTabs = [
    { value: "profile", icon: User, label: t("settings.profile.title") },
    { value: "notifications", icon: Bell, label: t("settings.notifications.title") },
    { value: "language", icon: Globe, label: t("settings.language.title") },
    { value: "appearance", icon: Palette, label: t("settings.appearance.title") },
    { value: "system", icon: Settings, label: t("settings.system.title") }
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t("settings.title")}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Mobile Dropdown */}
        <div className="block md:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {settingsTabs.find(tab => tab.value === activeTab)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {settingsTabs.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs */}
        <TabsList className="hidden md:grid grid-cols-6 gap-2">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="p-6">
          <TabsContent value="profile" className="mt-0">
            <UserProfile />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
          <TabsContent value="language">
            <LanguageSettings />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceSettings />
          </TabsContent>
          
          <TabsContent value="system">
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
