"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
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
  Table,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { doc, getDoc, db } from "firebase/firestore"

// Dynamically import Link to ensure client-side rendering
const Link = dynamic(() => import('next/link'), { ssr: false })

// Create a more specific type that includes className
type ExtendedLinkProps = {
  className?: string
  children?: React.ReactNode
} & React.ComponentProps<typeof Link>

const ExtendedLink: React.FC<ExtendedLinkProps> = ({ className, children, ...props }) => (
  <Link className={className} {...props}>
    {children}
  </Link>
)

export function Sidebar() {
  const { t, language, setLanguage } = useI18n()
  const { user } = useAuth()
  const { auth } = useFirebase()
  const { toast } = useToast()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [navItems, setNavItems] = useState<Array<{name: string, href: string, icon: React.ComponentType}>>([])
  const [isClient, setIsClient] = useState(false)
  const [restaurantName, setRestaurantName] = useState<string>("Comandero")

  useEffect(() => {
    setIsClient(true)
    setNavItems([
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
    ])
  }, [t, language])

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

  if (!isClient || !user) return null

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
            <h2 className="text-lg font-bold truncate">{restaurantName}</h2>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <ExtendedLink
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md text-sm transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </ExtendedLink>
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
              {t("logout")}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
