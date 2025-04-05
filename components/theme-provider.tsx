"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "system",
  setTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  storageKey?: string
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "restaurant-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (!isMounted) return

    const savedTheme = localStorage.getItem(storageKey)
    if (savedTheme) {
      setTheme(savedTheme as Theme)
    } else {
      setTheme(defaultTheme)
    }
  }, [defaultTheme, storageKey])

  React.useEffect(() => {
    if (!isMounted) return

    const root = window.document.documentElement

    function updateTheme(theme: Theme) {
      if (!theme) return

      root.setAttribute(attribute, theme)
      localStorage.setItem(storageKey, theme)
    }

    updateTheme(theme)
  }, [theme, attribute, storageKey, isMounted])

  if (!isMounted) return null

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
