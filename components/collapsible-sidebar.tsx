"use client"

import { useState, useEffect } from "react"
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
  ChevronLeft,
  ChevronRight,
  Globe,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function CollapsibleSidebar() {
  const { t, language, setLanguage } = useI18n()
  const { user } = useAuth()
  const { auth } = useFirebase()
  const { toast } = useToast()
  const pathname = usePathname()

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // State for desktop sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Check if we're on mobile based on screen width
  const [isMobile, setIsMobile] = useState(false)

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
        toast({
          title: t("commons.success"),
          description: t("sidebar.installApp") + " " + t("commons.initiated")
        })
      }

      // Reset the install prompt
      setInstallPrompt(null)
    } catch (error) {
      toast({
        title: t("commons.error"),
        description: t("commons.installFailed"),
        variant: "destructive"
      })
    }
  }

  const navItems = [
    {
      name: t("sidebar.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("sidebar.orders"),
      href: "/orders",
      icon: ClipboardList,
    },
    {
      name: t("sidebar.tables"),
      href: "/tables",
      icon: FileSpreadsheet,
    },
    {
      name: t("sidebar.inventory"),
      href: "/inventory",
      icon: Package,
    },
    {
      name: t("sidebar.users"),
      href: "/users",
      icon: Users,
    },
    {
      name: t("sidebar.settings"),
      href: "/settings",
      icon: Settings,
    }
  ]

  return (
    <>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-background border-r transition-all duration-300 hidden md:block",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center">
                <span className="self-center text-xl font-semibold whitespace-nowrap">
                  {t("sidebar.appName")}
                </span>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCollapsed}
              className="ml-auto"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={cn(
                      "flex items-center p-2 rounded-lg group",
                      pathname === item.href 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className="h-5 w-5 transition duration-75" />
                    {!isCollapsed && (
                      <span className="ml-3 flex-1 whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language Switcher */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className={cn("text-sm font-medium", isCollapsed && "hidden")}>
                {t("sidebar.language")}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "h-8", 
                      isCollapsed && "w-full justify-center px-0"
                    )}
                  >
                    {!isCollapsed && (
                      <>
                        {language === "en" && t("sidebar.languages.english")}
                        {language === "es" && t("sidebar.languages.spanish")}
                        {language === "pt" && t("sidebar.languages.portuguese")}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                    {isCollapsed && <Globe className="h-5 w-5" />}
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
                className={cn(
                  "w-full justify-start mt-2", 
                  isCollapsed && "p-2 justify-center"
                )} 
                onClick={handleInstallApp}
              >
                <Download className="mr-2 h-5 w-5" />
                {!isCollapsed && t("sidebar.installApp")}
              </Button>
            )}
          </div>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start", 
                isCollapsed && "justify-center px-0"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              {!isCollapsed && t("sidebar.logout")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside 
            className="absolute top-0 left-0 w-64 h-full bg-background border-r shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full px-3 py-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <Link href="/dashboard" className="flex items-center">
                  <span className="self-center text-xl font-semibold whitespace-nowrap">
                    {t("sidebar.appName")}
                  </span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <nav>
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link 
                        href={item.href} 
                        className={cn(
                          "flex items-center p-2 rounded-lg group",
                          pathname === item.href 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 transition duration-75 mr-3" />
                        <span className="flex-1 whitespace-nowrap">
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Language Switcher */}
              <div className="mb-4 px-2">
                <div className="flex items-center justify-between">
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
                    className={cn(
                      "w-full justify-start mt-2", 
                      isCollapsed && "p-2 justify-center"
                    )} 
                    onClick={handleInstallApp}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {!isCollapsed && t("sidebar.installApp")}
                  </Button>
                )}
              </div>

              {/* Logout Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {t("sidebar.logout")}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
