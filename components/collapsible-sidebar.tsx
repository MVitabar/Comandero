"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "./i18n-provider"
import { useAuth } from "./auth-provider"
import { signOut } from "firebase/auth"
import { useFirebase } from "./firebase-provider"
import { doc, getDoc } from "firebase/firestore"
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
  ChevronLeft,
  ChevronRight,
  Table,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function CollapsibleSidebar() {
  const { t, language, setLanguage } = useI18n()
  const { user } = useAuth()
  const { auth, db } = useFirebase()
  const { toast } = useToast()
  const pathname = usePathname()

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // State for desktop sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Check if we're on mobile based on screen width
  const [isMobile, setIsMobile] = useState(false)

  // Restaurant name state
  const [restaurantName, setRestaurantName] = useState<string>("Comandero")

  // Effect to fetch restaurant name
  useEffect(() => {
    const fetchRestaurantName = async () => {
      try {
        if (user && db) {
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setRestaurantName(userData.restaurantName || "Comandero")
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant name:", error)
        setRestaurantName("Comandero")
      }
    }

    fetchRestaurantName()
  }, [user, db])

  // Effect to handle window resize and set mobile state
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // If switching to desktop, close mobile menu
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setIsCollapsed(savedState === "true")
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  const handleLogout = async () => {
    if (!auth) return

    try {
      await signOut(auth)
      toast({
        title: t("logout"),
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
      name: t("inventory"),
      href: "/inventory",
      icon: Package,
    },
    {
      name: t("tables"),
      href: "/tables",
      icon: Table,
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
      {/* Mobile menu button - fixed position */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm shadow-sm border"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-background border-r transform transition-all duration-300 ease-in-out md:translate-x-0 shadow-lg",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-[70px]" : "w-[250px]",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with logo and collapse button */}
          <div className={cn("flex items-center p-4 border-b", isCollapsed ? "justify-center" : "justify-between")}>
            {!isCollapsed && (
              <h2 className="text-lg font-bold truncate">{restaurantName}</h2>
            )}
            {isCollapsed && <span className="text-xl font-bold">R</span>}

            {/* Collapse toggle button - only visible on desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="hidden md:flex"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  {isCollapsed ? (
                    <div className="relative group">
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center p-2 rounded-md transition-colors",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => isMobile && setIsMobileMenuOpen(false)}
                        title={item.name}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.name}</span>
                      </Link>
                      <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                        {item.name}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 rounded-md transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer with language selector and logout */}
          <div className={cn("p-4 border-t", isCollapsed ? "flex flex-col items-center" : "")}>
            {/* Language selector */}
            {!isCollapsed && (
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
            )}

            {isCollapsed ? (
              <div className="relative group">
                <Button variant="outline" size="icon" onClick={handleLogout} className="mt-2" title={t("logout")}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">{t("logout")}</span>
                </Button>
                <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                  {t("logout")}
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" />
                {t("logout")}
              </Button>
            )}

            {/* Collapsed language selector */}
            {isCollapsed && (
              <DropdownMenu>
                <div className="relative group">
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="mt-2" title={t("language")}>
                      <span className="font-bold">{language.toUpperCase()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                    {t("language")}
                  </div>
                </div>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>{t("english")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("es")}>{t("spanish")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("pt")}>{t("portuguese")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Spacer div to push content away from the sidebar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-[70px]" : "md:ml-[250px]",
          "ml-0", // No margin on mobile
        )}
      />
    </>
  )
}
