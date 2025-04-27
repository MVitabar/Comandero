"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "./i18n-provider"
import { useAuth } from "./auth-provider"
import { signOut } from "firebase/auth"
import { useFirebase } from "./firebase-provider"
import {toast} from "sonner"
import { usePermissions } from "@/hooks/usePermissions"
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileSpreadsheet,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ModulePermissions } from "@/types/permissions"

export function Sidebar() {
  const { t, language, setLanguage } = useI18n()
  const { user } = useAuth()
  const { auth } = useFirebase()
  const { canView } = usePermissions()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Install app state and handler
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault()
      // Store the event for later use
      setInstallPrompt(e as any)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!installPrompt) return

    try {
      // Show the install prompt
      const result = await (installPrompt as any).prompt()
      
      // Wait for the user to respond to the prompt
      const choiceResult = await result.userChoice

      if (choiceResult.outcome === 'accepted') {
        toast.success(t("commons.installSuccess"))
      }

      // Reset the install prompt
      setInstallPrompt(null)
    } catch (error) {
      toast.error(t("commons.installError"))
    }
  }

  const handleLogout = async () => {
    if (!auth) return

    try {
      await signOut(auth)
      toast.success(t("commons.logoutSuccess"))
    } catch (error) {
      toast.error(t("commons.logoutError"))
    }
  }

  // Establishment name from user's profile or restaurant settings
  const establishmentName = user?.username || user?.restaurantName || user?.currentEstablishmentName || "Comandero"
  
  // Detailed debug logging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.group('🏠 Sidebar Establishment Name Debug')
      console.log('Full User Object:', user)
      console.log('Establishment Name:', establishmentName)
      console.log('User Properties:', {
        username: user?.username,
        restaurantName: user?.restaurantName,
        currentEstablishmentName: user?.currentEstablishmentName
      })
      console.groupEnd()
    }
  }, [user])

  const navItems = [
    {
      name: pathname === "/dashboard" 
        ? `${t("sidebar.welcome")} ${user?.username || user?.email?.split('@')[0] || ""}` 
        : t("sidebar.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
      requiredPermission: 'dashboard'
    },
    {
      name: t("sidebar.orders"),
      href: "/orders",
      icon: ClipboardList,
      requiredPermission: 'orders'
    },
    {
      name: t("sidebar.tables"),
      href: "/tables",
      icon: FileSpreadsheet,
      requiredPermission: 'tables'
    },
    {
      name: t("sidebar.inventory"),
      href: "/inventory",
      icon: Package,
      requiredPermission: 'inventory'
    },
    {
      name: t("sidebar.users"),
      href: "/users",
      icon: Users,
      requiredPermission: 'users-management'
    },
    {
      name: t("sidebar.advancedReports"),
      href: "/advanced-reports",
      icon: FileSpreadsheet,
      requiredPermission: 'reports'
    },
    {
      name: t("sidebar.settings"),
      href: "/settings",
      icon: Settings,
      requiredPermission: 'settings'
    },
  ]

  // Filter navigation items based on user permissions
  const filteredNavItems = navItems.filter(item => 
    canView(item.requiredPermission as keyof ModulePermissions)
  )

  if (!user) return null

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden bg-background/80 backdrop-blur-sm shadow-sm border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[85%] max-w-[280px] bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">{establishmentName}</h2>
            <p className="text-sm text-muted-foreground">{t("sidebar.role")} {user.role?.toUpperCase()}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md text-sm transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t space-y-2">
            {/* Language Switcher */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">{t("sidebar.language")}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    {language === "en" && t("sidebar.languages.english")}
                    {language === "es" && t("sidebar.languages.spanish")}
                    {language === "pt" && t("sidebar.languages.portuguese")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>
                    {t("sidebar.languages.english")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("es")}>
                    {t("sidebar.languages.spanish")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("pt")}>
                    {t("sidebar.languages.portuguese")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Install App Button - Only show if install prompt is available */}
            {installPrompt && (
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleInstallApp}
              >
                <Download className="mr-2 h-5 w-5" />
                {t("sidebar.installApp")}
              </Button>
            )}

            {/* Logout Button */}
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              {t("sidebar.logout")}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
