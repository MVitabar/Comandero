"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "./i18n-provider"
import { useAuth } from "./auth-provider"
import { signOut } from "firebase/auth"
import { useFirebase } from "./firebase-provider"
import { useToast } from "@/components/ui/use-toast"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { t, language, setLanguage } = useI18n()
  const { user } = useAuth()
  const { auth } = useFirebase()
  const { toast } = useToast()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    if (!auth) return

    try {
      await signOut(auth)
      toast({
        title: t("sidebar.logout"),
        description: "You have been logged out successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    {
      name: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("orders"),
      href: "/orders",
      icon: ClipboardList,
    },
    {
      name: t("tables"),
      href: "/tables",
      icon: FileSpreadsheet,
    },
    {
      name: t("inventory"),
      href: "/inventory",
      icon: Package,
    },
    {
      name: t("users"),
      href: "/users",
      icon: Users,
    },
    {
      name: t("advancedReports"),
      href: "/advanced-reports",
      icon: FileSpreadsheet,
    },
    {
      name: t("settings"),
      href: "/settings",
      icon: Settings,
    },
  ]

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
            <h2 className="text-xl font-bold">Restaurant PWA</h2>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
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

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">{t("language")}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    {language === "en" && t("english")}
                    {language === "es" && t("spanish")}
                    {language === "pt" && t("portuguese")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>{t("english")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("es")}>{t("spanish")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("pt")}>{t("portuguese")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
