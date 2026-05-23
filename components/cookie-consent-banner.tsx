"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setIsVisible(false)
    
    // Initialize cookies and tracking scripts here
    // Example: Set a cookie
    document.cookie = "analytics_consent=true; path=/; max-age=31536000"
    
    // Example: Load Google Analytics or other tracking scripts
    // You can dynamically load scripts here
    const loadScript = (src: string, id: string) => {
      if (!document.getElementById(id)) {
        const script = document.createElement('script')
        script.id = id
        script.src = src
        script.async = true
        document.head.appendChild(script)
      }
    }
    
    // Example: Load Google Analytics (replace with your tracking ID)
    // loadScript('https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX', 'google-analytics')
    
    // Example: Initialize gtag
    // window.dataLayer = window.dataLayer || []
    // function gtag() { window.dataLayer.push(arguments) }
    // gtag('js', new Date())
    // gtag('config', 'G-XXXXXXXXXX')
    
    console.log("Cookies accepted and tracking scripts initialized")
  }

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined")
    setIsVisible(false)
    console.log("Cookies declined")
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 text-sm text-gray-700">
          <p className="font-medium mb-1">We use cookies</p>
          <p className="text-gray-600">
            We use cookies to improve your experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Accept
          </Button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
