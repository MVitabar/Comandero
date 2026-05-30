
"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronRight,
  Code,
  CreditCard,
  Download,
  Globe,
  Headphones,
  HelpCircle,
  MessageSquare,
  Phone,
  Play,
  Settings,
  ShoppingCart,
  Star,
  Utensils,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Award,
  Smartphone,
  Menu,
  X,
  Sparkles,
  Target,
  Rocket,
  Send,
} from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import emailjs from "@emailjs/browser"
import "./landing.css"
import { useI18n } from "@/components/i18n-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { CookieConsentBanner } from "@/components/cookie-consent-banner"
import { WebsiteJsonLd, OrganizationJsonLd, SoftwareApplicationJsonLd } from "@/components/seo-json-ld"

const LANDING_CONTACT = {
  whatsappUrl: "https://wa.me/5548996209954",
  phoneDisplay: "+55 48 99620-9954",
  email: "contato@polaristudio.com.br",
  emailUrl: "mailto:contato@polaristudio.com.br",
  supportUrl: "mailto:contato@polaristudio.com.br?subject=Comandero%20Support",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Crici%C3%BAma,Santa+Catarina,Brazil",
  studioUrl: "https://www.polaristudio.com.br",
} as const

const TESTIMONIAL_KEYS = ["maria", "carlos", "fernanda", "roberto", "juliana", "marcelo"] as const
const TESTIMONIAL_COLORS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-cyan-500 to-cyan-600",
] as const
const TESTIMONIAL_STARS = [5, 5, 5, 4, 5, 5] as const

const INTEGRATION_KEYS = [
  "paymentGateways",
  "delivery",
  "crm",
  "accounting",
  "reservations",
  "marketing",
  "customApi",
  "support",
] as const

const INTEGRATION_ICONS = [
  CreditCard,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Calendar,
  Globe,
  Code,
  HelpCircle,
] as const

const FAQ_KEYS = ["technical", "trial", "implementation", "cancel", "support", "security"] as const

export default function LandingPage() {
  const { t } = useI18n()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const elements = document.querySelectorAll(".landing-reveal")
    if (prefersReduced) {
      elements.forEach((el) => el.classList.add("landing-visible"))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-visible")
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const howItWorksSteps = [
    { icon: Download, color: "from-blue-500 to-blue-600", number: "01", stepKey: "signup" as const },
    { icon: Settings, color: "from-purple-500 to-purple-600", number: "02", stepKey: "customize" as const },
    { icon: Users, color: "from-pink-500 to-pink-600", number: "03", stepKey: "train" as const },
    { icon: Rocket, color: "from-orange-500 to-orange-600", number: "04", stepKey: "launch" as const },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      await emailjs.send(
        "YOUR_SERVICE_ID", // Reemplazar con tu Service ID de EmailJS
        "YOUR_TEMPLATE_ID", // Reemplazar con tu Template ID de EmailJS
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: "contato@polaristudio.com.br"
        },
        "YOUR_PUBLIC_KEY" // Reemplazar con tu Public Key de EmailJS
      )
      setSubmitStatus("success")
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      console.error("Error sending email:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="landing-page flex flex-col min-h-screen w-full bg-slate-50 antialiased">
      {/* Navbar */}
      <header
        className={`landing-nav border-b ${
          scrolled ? "landing-nav-scrolled py-2" : "landing-nav-top py-3 md:py-3.5"
        }`}
      >
        <div className="landing-container flex items-center justify-between relative">
          <Link href="/" className="landing-nav-logo flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-md opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
              <Image src="/icons/icon-192x192.png" alt={t("landing.brand.logoAlt")} width={36} height={36} className="relative rounded-lg ring-2 ring-white/80 shadow-sm" />
            </div>
            <span className="text-xl font-bold tracking-tight landing-gradient-text animate-landing-shine">{t("landing.brand.name")}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="landing-nav-link text-sm font-medium">
              {t("landing.nav.features")}
            </a>
            <a href="#benefits" className="landing-nav-link text-sm font-medium">
              {t("landing.nav.benefits")}
            </a>
            <a href="#pricing" className="landing-nav-link text-sm font-medium">
              {t("landing.nav.pricing")}
            </a>
            <a href="#faq" className="landing-nav-link text-sm font-medium">
              {t("landing.nav.faq")}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300">
                {t("landing.nav.login")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300">
                {t("landing.nav.register")}
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label={mobileMenuOpen ? t("landing.nav.closeMenu") : t("landing.nav.openMenu")}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out border-t border-slate-200/80 bg-white/95 backdrop-blur-xl ${
            mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 border-t-0"
          }`}
        >
          <nav className="landing-container py-4 flex flex-col gap-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="landing-nav-link text-sm font-medium py-1">
              {t("landing.nav.features")}
            </a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="landing-nav-link text-sm font-medium py-1">
              {t("landing.nav.benefits")}
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="landing-nav-link text-sm font-medium py-1">
              {t("landing.nav.pricing")}
            </a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="landing-nav-link text-sm font-medium py-1">
              {t("landing.nav.faq")}
            </a>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full mt-1">
                {t("landing.nav.login")}
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <div className="landing-nav-spacer" aria-hidden="true" />

      {/* Hero Section - Modernizado */}
      <section className="relative landing-mesh animate-landing-gradient text-white py-28 md:py-40 overflow-hidden">
        <div className="absolute inset-0 landing-grid-pattern" aria-hidden />
        <div className="absolute top-20 left-[5%] w-96 h-96 bg-blue-500/40 rounded-full blur-[150px] animate-landing-float-slow" aria-hidden />
        <div className="absolute bottom-20 right-[5%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[180px] animate-landing-float-slow [animation-delay:-8s]" aria-hidden />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/15 rounded-full blur-[120px] animate-pulse" aria-hidden />
        <div className="landing-container flex flex-col items-center text-center relative z-10">
          <div className="landing-reveal landing-visible inline-flex items-center px-5 py-2.5 rounded-full landing-glass-dark mb-8 shadow-2xl shadow-blue-500/20 border border-white/10 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 mr-2.5 text-amber-300 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">{t("landing.hero.badge")}</span>
          </div>
          <h1 className="landing-reveal landing-visible landing-reveal-delay-1 text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.05] tracking-tight max-w-6xl">
            {t("landing.hero.titleLine1")}{" "}
            <span className="block sm:inline mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-violet-300 to-purple-400 animate-landing-shine bg-[length:200%_auto]">
              {t("landing.hero.titleLine2")}
            </span>
          </h1>
          <p className="landing-reveal landing-visible landing-reveal-delay-2 text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl text-slate-300/95 leading-relaxed font-light">
            {t("landing.hero.subtitle")}
          </p>
          <div className="landing-reveal landing-visible landing-reveal-delay-3 flex flex-col sm:flex-row gap-5 mb-16">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-blue-600/40 hover:shadow-3xl hover:shadow-purple-500/30 hover:scale-[1.05] transition-all duration-300 font-semibold"
              >
                {t("landing.hero.ctaPrimary")}
                <Rocket className="ml-2.5 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="landing-reveal landing-visible landing-reveal-delay-4 flex flex-wrap justify-center gap-5 md:gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2.5 landing-glass-dark px-5 py-2.5 rounded-full border border-white/10">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="font-medium">{t("landing.hero.trust.freeTrialDays")}</span>
            </div>
            <div className="flex items-center gap-2.5 landing-glass-dark px-5 py-2.5 rounded-full border border-white/10">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="font-medium">{t("landing.hero.trust.easyCancel")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas - Modernizadas */}
      <section className="py-24 -mt-16 relative z-20">
        <div className="landing-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="landing-reveal landing-glass-card landing-stat-card landing-card-modern p-10 rounded-3xl text-center group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6 inline-flex">
                <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity scale-150" />
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 ring-2 ring-blue-300/60 backdrop-blur-sm">
                  <TrendingUp className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <div className="text-5xl md:text-6xl font-bold text-blue-600 mb-3 tabular-nums">{t("landing.stats.restaurants.value")}</div>
              <p className="text-slate-800 font-bold text-lg">{t("landing.stats.restaurants.title")}</p>
              <p className="text-sm text-slate-500 mt-2">{t("landing.stats.restaurants.subtitle")}</p>
            </div>
            <div className="landing-reveal landing-reveal-delay-1 landing-glass-card landing-stat-card landing-card-modern p-10 rounded-3xl text-center group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6 inline-flex">
                <div className="absolute inset-0 bg-emerald-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity scale-150" />
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 ring-2 ring-emerald-300/60 backdrop-blur-sm">
                  <Clock className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
              <div className="text-5xl md:text-6xl font-bold text-emerald-600 mb-3 tabular-nums">{t("landing.stats.timeReduction.value")}</div>
              <p className="text-slate-800 font-bold text-lg">{t("landing.stats.timeReduction.title")}</p>
              <p className="text-sm text-slate-500 mt-2">{t("landing.stats.timeReduction.subtitle")}</p>
            </div>
            <div className="landing-reveal landing-reveal-delay-2 landing-glass-card landing-stat-card landing-card-modern p-10 rounded-3xl text-center group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6 inline-flex">
                <div className="absolute inset-0 bg-purple-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity scale-150" />
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 ring-2 ring-purple-300/60 backdrop-blur-sm">
                  <Award className="h-12 w-12 text-purple-600" />
                </div>
              </div>
              <div className="text-5xl md:text-6xl font-bold text-purple-600 mb-3 tabular-nums">{t("landing.stats.satisfaction.value")}</div>
              <p className="text-slate-800 font-bold text-lg">{t("landing.stats.satisfaction.title")}</p>
              <p className="text-sm text-slate-500 mt-2">{t("landing.stats.satisfaction.subtitle")}</p>
            </div>
            <div className="landing-reveal landing-reveal-delay-3 landing-glass-card landing-stat-card landing-card-modern p-10 rounded-3xl text-center group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6 inline-flex">
                <div className="absolute inset-0 bg-orange-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity scale-150" />
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 ring-2 ring-orange-300/60 backdrop-blur-sm">
                  <Headphones className="h-12 w-12 text-orange-600" />
                </div>
              </div>
              <div className="text-5xl md:text-6xl font-bold text-orange-600 mb-3 tabular-nums">{t("landing.stats.support.value")}</div>
              <p className="text-slate-800 font-bold text-lg">{t("landing.stats.support.title")}</p>
              <p className="text-sm text-slate-500 mt-2">{t("landing.stats.support.subtitle")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modernizada */}
      <section id="features" className="py-28 bg-white">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-20">
            <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm font-bold mb-6 ring-2 ring-blue-100/60 shadow-lg">
              <Zap className="h-4 w-4 mr-2.5" />
              {t("landing.features.badge")}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 landing-gradient-text tracking-tight">
              {t("landing.features.title")}
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-xl leading-relaxed">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <Card className="landing-reveal landing-feature-glow landing-card-modern group border-slate-200/80 shadow-lg hover:shadow-2xl hover:border-blue-400/60 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 w-20 h-20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-blue-500/30">
                  <ShoppingCart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("landing.features.orders.title")}</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {t("landing.features.orders.description")}
                </p>
                <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                  <Link href="/features/orders" className="flex items-center">
                    <span>{t("landing.features.learnMore")}</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-1 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-lg hover:shadow-2xl hover:border-purple-400/60 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 w-20 h-20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-purple-500/30">
                  <Utensils className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("landing.features.tables.title")}</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {t("landing.features.tables.description")}
                </p>
                <div className="flex items-center text-purple-600 font-bold group-hover:translate-x-2 transition-transform">
                  <Link href="/features/tables" className="flex items-center">
                    <span>{t("landing.features.learnMore")}</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-2 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-lg hover:shadow-2xl hover:border-emerald-400/60 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="rounded-3xl bg-gradient-to-br from-green-500 to-green-600 p-5 w-20 h-20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-emerald-500/30">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("landing.features.reports.title")}</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {t("landing.features.reports.description")}
                </p>
                <div className="flex items-center text-green-600 font-bold group-hover:translate-x-2 transition-transform">
                  <Link href="/features/reports" className="flex items-center">
                    <span>{t("landing.features.learnMore")}</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-3 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-lg hover:shadow-2xl hover:border-orange-400/60 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 w-20 h-20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-orange-500/30">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("landing.features.reservations.title")}</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {t("landing.features.reservations.description")}
                </p>
                <div className="flex items-center text-orange-600 font-bold group-hover:translate-x-2 transition-transform">
                  <Link href="/features/reservations" className="flex items-center">
                    <span>{t("landing.features.learnMore")}</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-1 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-lg hover:shadow-2xl hover:border-pink-400/60 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="rounded-3xl bg-gradient-to-br from-pink-500 to-pink-600 p-5 w-20 h-20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-pink-500/30">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("landing.features.staff.title")}</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {t("landing.features.staff.description")}
                </p>
                <div className="flex items-center text-pink-600 font-bold group-hover:translate-x-2 transition-transform">
                  <Link href="/features/staff" className="flex items-center">
                    <span>{t("landing.features.learnMore")}</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-2 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-lg hover:shadow-2xl hover:border-cyan-400/60 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-5 w-20 h-20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-cyan-500/30">
                  <Settings className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t("landing.features.inventory.title")}</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {t("landing.features.inventory.description")}
                </p>
                <div className="flex items-center text-cyan-600 font-bold group-hover:translate-x-2 transition-transform">
                  <Link href="/features/inventory" className="flex items-center">
                    <span>{t("landing.features.learnMore")}</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section - Modernizada */}
      <section id="benefits" className="py-28 landing-section-alt">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 landing-gradient-text tracking-tight">{t("landing.benefits.title")}</h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-xl leading-relaxed">
              {t("landing.benefits.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="landing-reveal flex items-start gap-5 p-8 rounded-3xl landing-glass-card landing-card-modern group hover:scale-105 transition-transform duration-300">
              <div className="p-3 rounded-2xl bg-emerald-500/15 ring-2 ring-emerald-300/60 shrink-0">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">{t("landing.benefits.efficiency.title")}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {t("landing.benefits.efficiency.description")}
                </p>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-1 flex items-start gap-5 p-8 rounded-3xl landing-glass-card landing-card-modern group hover:scale-105 transition-transform duration-300">
              <div className="p-3 rounded-2xl bg-emerald-500/15 ring-2 ring-emerald-300/60 shrink-0">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">{t("landing.benefits.errors.title")}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {t("landing.benefits.errors.description")}
                </p>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-2 flex items-start gap-5 p-8 rounded-3xl landing-glass-card landing-card-modern group hover:scale-105 transition-transform duration-300">
              <div className="p-3 rounded-2xl bg-emerald-500/15 ring-2 ring-emerald-300/60 shrink-0">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">{t("landing.benefits.inventory.title")}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {t("landing.benefits.inventory.description")}
                </p>
              </div>
            </div>

            <div className="landing-reveal flex items-start gap-5 p-8 rounded-3xl landing-glass-card landing-card-modern group hover:scale-105 transition-transform duration-300">
              <div className="p-3 rounded-2xl bg-emerald-500/15 ring-2 ring-emerald-300/60 shrink-0">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">{t("landing.benefits.data.title")}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {t("landing.benefits.data.description")}
                </p>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-1 flex items-start gap-5 p-8 rounded-3xl landing-glass-card landing-card-modern group hover:scale-105 transition-transform duration-300">
              <div className="p-3 rounded-2xl bg-emerald-500/15 ring-2 ring-emerald-300/60 shrink-0">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">{t("landing.benefits.experience.title")}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{t("landing.benefits.experience.description")}</p>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-2 flex items-start gap-5 p-8 rounded-3xl landing-glass-card landing-card-modern group hover:scale-105 transition-transform duration-300">
              <div className="p-3 rounded-2xl bg-emerald-500/15 ring-2 ring-emerald-300/60 shrink-0">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">{t("landing.benefits.scalability.title")}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {t("landing.benefits.scalability.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Modernizado */}
      <section className="py-28 bg-white">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-20">
            <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-sm font-bold mb-6 ring-2 ring-purple-100/60 shadow-lg">
              <Target className="h-4 w-4 mr-2.5" />
              {t("landing.howItWorks.badge")}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 landing-gradient-text tracking-tight">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-xl">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
            <div className="hidden md:block absolute top-[5rem] left-[10%] right-[10%] h-1.5 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 rounded-full opacity-70 -z-0" aria-hidden />
            {howItWorksSteps.map((step, i) => {
              const StepIcon = step.icon
              return (
              <div key={step.stepKey} className={`landing-reveal ${i > 0 ? `landing-reveal-delay-${Math.min(i, 3)}` : ""} flex flex-col items-center text-center relative z-10`}>
                <div className={`relative rounded-3xl bg-gradient-to-br ${step.color} p-10 mb-8 shadow-2xl shadow-blue-500/20 landing-card-modern group hover:scale-110 transition-transform duration-300`}>
                  <div className="absolute top-4 right-4 text-white/30 font-bold text-3xl tabular-nums">{step.number}</div>
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <StepIcon className="h-14 w-14 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">{t(`landing.howItWorks.steps.${step.stepKey}.title`)}</h3>
                <p className="text-slate-600 leading-relaxed max-w-[240px] text-lg">{t(`landing.howItWorks.steps.${step.stepKey}.description`)}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Pricing Section - Modernizada */}
      <section id="pricing" className="py-28 landing-section-alt">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-20">
            <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-bold mb-6 ring-2 ring-emerald-100/60 shadow-lg">
              <Shield className="h-4 w-4 mr-2.5" />
              {t("landing.pricing.badge")}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 landing-gradient-text tracking-tight">
              {t("landing.pricing.title")}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-xl">
              {t("landing.pricing.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {/* Básico */}
            <Card className="landing-reveal landing-card-modern border-slate-200/80 rounded-3xl shadow-xl hover:shadow-2xl hover:border-blue-300/80 hover:-translate-y-2 transition-all duration-300">
              <CardContent className="pt-10 pb-10">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-3 text-slate-800">{t("landing.pricing.plans.basic.name")}</h3>
                  <p className="text-gray-600 mb-8 text-lg">{t("landing.pricing.plans.basic.description")}</p>
                  <p className="text-6xl font-bold mb-3">
                    {t("landing.pricing.plans.basic.price")}<span className="text-xl text-gray-600">{t("landing.pricing.perMonth")}</span>
                  </p>
                  <p className="text-base text-gray-500 mb-10">{t("landing.pricing.billedMonthly")}</p>
                  <ul className="space-y-5 mb-10 text-left">
                    {(["users3", "ordersTables", "basicReports", "emailSupport", "mobileApp", "inventory50"] as const).map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                        <span className="text-lg">{t(`landing.pricing.plans.basic.features.${feature}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full py-6 text-lg rounded-2xl" variant="outline">
                    {t("landing.pricing.ctaStart")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Profissional */}
            <Card className="landing-reveal landing-reveal-delay-1 border-3 border-blue-500/90 shadow-3xl shadow-blue-500/25 relative md:scale-[1.05] rounded-3xl ring-4 ring-blue-500/15 landing-card-modern hover:-translate-y-3 transition-all duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-base font-bold shadow-2xl animate-pulse">
                {t("landing.pricing.plans.pro.badge")}
              </div>
              <CardContent className="pt-10 pb-10">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-3">{t("landing.pricing.plans.pro.name")}</h3>
                  <p className="text-gray-600 mb-8 text-lg">{t("landing.pricing.plans.pro.description")}</p>
                  <p className="text-6xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t("landing.pricing.plans.pro.price")}<span className="text-xl text-gray-600">{t("landing.pricing.perMonth")}</span>
                  </p>
                  <p className="text-base text-gray-500 mb-10">{t("landing.pricing.billedMonthly")}</p>
                  <ul className="space-y-5 mb-10 text-left">
                    {(["users10", "allBasic", "inventory200", "advancedReports", "delivery", "chatSupport", "basicApi"] as const).map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                        <span className="text-lg">{t(`landing.pricing.plans.pro.features.${feature}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl">
                    {t("landing.pricing.ctaStart")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Empresarial */}
            <Card className="landing-reveal landing-reveal-delay-2 landing-card-modern border-slate-200/80 rounded-3xl shadow-xl hover:shadow-2xl hover:border-purple-300/80 hover:-translate-y-2 transition-all duration-300">
              <CardContent className="pt-10 pb-10">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-3 text-slate-800">{t("landing.pricing.plans.enterprise.name")}</h3>
                  <p className="text-gray-600 mb-8 text-lg">{t("landing.pricing.plans.enterprise.description")}</p>
                  <p className="text-6xl font-bold mb-3">
                    {t("landing.pricing.plans.enterprise.price")}<span className="text-xl text-gray-600">{t("landing.pricing.perMonth")}</span>
                  </p>
                  <p className="text-base text-gray-500 mb-10">{t("landing.pricing.billedMonthly")}</p>
                  <ul className="space-y-5 mb-10 text-left">
                    {(["unlimitedUsers", "allPro", "inventoryUnlimited", "multiUnit", "advancedApi", "prioritySupport", "accountManager", "fullCustomization"] as const).map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                        <span className="text-lg">{t(`landing.pricing.plans.enterprise.features.${feature}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full py-6 text-lg rounded-2xl" variant="outline">
                    {t("landing.pricing.ctaContactSales")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6 text-lg">{t("landing.pricing.allPlansInclude")}</p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center text-base text-gray-500">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>{t("landing.pricing.trust.freeTrialDays")}</span>
              </div>
              <div className="flex items-center text-base text-gray-500">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span>{t("landing.pricing.trust.cancelAnytime")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrações - Modernizada */}
      <section className="py-28 bg-white">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 landing-gradient-text tracking-tight">{t("landing.integrations.title")}</h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-xl">
              {t("landing.integrations.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {INTEGRATION_KEYS.map((key, i) => {
              const Icon = INTEGRATION_ICONS[i]
              return (
              <div
                key={key}
                className={`landing-reveal ${i % 4 === 1 ? "landing-reveal-delay-1" : i % 4 === 2 ? "landing-reveal-delay-2" : i % 4 === 3 ? "landing-reveal-delay-3" : ""} flex flex-col items-center text-center p-8 landing-glass-card landing-card-modern rounded-3xl group hover:scale-105 transition-transform duration-300`}
              >
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 group-hover:from-blue-50 group-hover:to-purple-50 transition-colors duration-300 shadow-lg">
                  <div className="text-slate-600 group-hover:text-blue-600 transition-colors">
                    <Icon className="h-12 w-12" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-700 text-base">{t(`landing.integrations.${key}`)}</h3>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* FAQ Section - Modernizada */}
      <section id="faq" className="py-28 landing-section-alt">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 landing-gradient-text tracking-tight">{t("landing.faq.title")}</h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-xl">
              {t("landing.faq.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {FAQ_KEYS.map((key, i) => (
              <div
                key={key}
                className={`landing-reveal ${i % 3 === 1 ? "landing-reveal-delay-1" : i % 3 === 2 ? "landing-reveal-delay-2" : ""} p-8 rounded-3xl landing-glass-card landing-card-modern hover:scale-105 transition-transform duration-300`}
              >
                <h3 className="text-xl font-bold mb-3 text-slate-800">{t(`landing.faq.items.${key}.title`)}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{t(`landing.faq.items.${key}.answer`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Modernizados */}
      <section className="py-28 bg-white">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-20">
            <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-sm font-bold mb-6 ring-2 ring-amber-100/60 shadow-lg">
              <Star className="h-4 w-4 mr-2.5 fill-amber-500 text-amber-500" />
              {t("landing.testimonials.badge")}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 landing-gradient-text tracking-tight">
              {t("landing.testimonials.title")}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-xl">
              {t("landing.testimonials.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {TESTIMONIAL_KEYS.map((key, i) => {
              const name = t(`landing.testimonials.items.${key}.name`)
              const stars = TESTIMONIAL_STARS[i]
              return (
              <Card key={key} className={`landing-reveal ${i % 3 === 1 ? "landing-reveal-delay-1" : i % 3 === 2 ? "landing-reveal-delay-2" : ""} overflow-hidden landing-card-modern border-slate-200/80 rounded-3xl hover:border-blue-300/60 group shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}>
                <CardContent className="p-10">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="rounded-full overflow-hidden w-24 h-24 flex-shrink-0 ring-4 ring-blue-100/80 group-hover:ring-blue-200 transition-all duration-300">
                      <div className={`w-full h-full bg-gradient-to-br ${TESTIMONIAL_COLORS[i]} flex items-center justify-center`}>
                        <span className="text-white text-3xl font-bold">{name.charAt(0)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{name}</h3>
                      <p className="text-base text-gray-600">{t(`landing.testimonials.items.${key}.role`)}</p>
                      <div className="flex mt-3">
                        {Array(stars)
                          .fill(0)
                          .map((_, starIndex) => (
                            <Star key={starIndex} className="h-5 w-5 text-yellow-500 fill-current" />
                          ))}
                        {Array(5 - stars)
                          .fill(0)
                          .map((_, starIndex) => (
                            <Star key={starIndex} className="h-5 w-5 text-gray-300 fill-current" />
                          ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-xl leading-relaxed">&quot;{t(`landing.testimonials.items.${key}.quote`)}&quot;</p>
                  <div className="mt-8 pt-8 border-t">
                    <div className="flex items-center justify-between text-base">
                      <span className="text-gray-500">{t("landing.testimonials.verified")}</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        </div>
      </section>

      {/* Contacto - Modernizado */}
      <section id="contact" className="py-20 md:py-28 landing-section-alt">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-20">
            <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm font-bold mb-6 ring-2 ring-blue-100/60 shadow-lg">
              <MessageSquare className="h-4 w-4 mr-2.5" />
              {t("landing.contact.badge")}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 landing-gradient-text tracking-tight">
              {t("landing.contact.title")}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-xl">
              {t("landing.contact.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 auto-rows-fr">
              <a
                href={LANDING_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-reveal landing-contact-card landing-glass-card landing-card-modern p-8 rounded-3xl group hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-start gap-5 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-3xl shadow-2xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xl mb-2">{t("landing.contact.whatsapp.title")}</h3>
                    <p className="text-gray-600 break-words text-lg">{LANDING_CONTACT.phoneDisplay}</p>
                    <p className="text-base text-gray-500 mt-1">{t("landing.contact.whatsapp.hint")}</p>
                  </div>
                </div>
              </a>

              <a
                href={LANDING_CONTACT.emailUrl}
                className="landing-reveal landing-reveal-delay-1 landing-contact-card landing-glass-card landing-card-modern p-8 rounded-3xl group hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-start gap-5 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-3xl shadow-2xl shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xl mb-2">{t("landing.contact.email.title")}</h3>
                    <p className="text-gray-600 break-all text-lg">{LANDING_CONTACT.email}</p>
                    <p className="text-base text-gray-500 mt-1">{t("landing.contact.email.hint")}</p>
                  </div>
                </div>
              </a>

              <a
                href={LANDING_CONTACT.supportUrl}
                className="landing-reveal landing-reveal-delay-2 landing-contact-card landing-glass-card landing-card-modern p-8 rounded-3xl group hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-start gap-5 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-3xl shadow-2xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xl mb-2">{t("landing.contact.support.title")}</h3>
                    <p className="text-gray-600 break-all text-lg">{LANDING_CONTACT.email}</p>
                    <p className="text-base text-gray-500 mt-1">{t("landing.contact.support.hint")}</p>
                  </div>
                </div>
              </a>

              <a
                href={LANDING_CONTACT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-reveal landing-contact-card landing-glass-card landing-card-modern p-8 rounded-3xl group hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-start gap-5 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-3xl shadow-2xl shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xl mb-2">{t("landing.contact.headquarters.title")}</h3>
                    <p className="text-gray-600 text-lg">{t("landing.contact.headquarters.city")}</p>
                    <p className="text-base text-gray-500 mt-1">{t("landing.contact.headquarters.state")}</p>
                  </div>
                </div>
              </a>

              <a
                href={LANDING_CONTACT.studioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-reveal landing-reveal-delay-1 landing-contact-card p-8 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-200/60 ring-2 ring-blue-100 landing-card-modern md:col-span-2 group hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-start gap-5 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-blue-600 to-purple-600 p-5 rounded-3xl shadow-2xl shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Code className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xl mb-2">{t("landing.contact.developer.label")}</h3>
                    <p className="text-gray-800 font-bold text-lg">{t("landing.contact.developer.name")}</p>
                    <p className="text-blue-600 group-hover:text-blue-700 text-base">www.polaristudio.com.br</p>
                  </div>
                </div>
              </a>
            </div>
        </div>
      </section>

      {/* CTA Section - Modernizada */}
      <section className="relative py-32 landing-cta-mesh text-white overflow-hidden">
        <div className="absolute inset-0 landing-grid-pattern opacity-40" aria-hidden />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-landing-float" aria-hidden />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-400/30 rounded-full blur-3xl animate-landing-float-slow [animation-delay:-5s]" aria-hidden />
        <div className="landing-container text-center relative z-10 landing-reveal">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">{t("landing.cta.title")}</h2>
          <p className="text-2xl md:text-3xl mb-14 max-w-3xl mx-auto text-blue-100/90 leading-relaxed">
            {t("landing.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 shadow-2xl hover:scale-[1.05] transition-all duration-300 px-12 py-8 text-xl rounded-2xl font-bold">
                {t("landing.cta.primary")}
                <Rocket className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Modernizado */}
      <footer className="bg-slate-950 text-white py-20 border-t border-slate-800">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image src="/icons/icon-192x192.png" alt={t("landing.brand.logoAlt")} width={36} height={36} className="rounded-xl" />
                <span className="text-2xl font-bold landing-gradient-text">{t("landing.brand.name")}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-lg">{t("landing.footer.tagline")}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">{t("landing.footer.product.title")}</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors text-lg">
                    {t("landing.nav.features")}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-lg">
                    {t("landing.nav.pricing")}
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-white transition-colors text-lg">
                    {t("landing.nav.faq")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">{t("landing.footer.contact.title")}</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://www.polaristudio.com.br" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-lg">
                    Polaris Studio
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/5548996209954" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-lg">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="mailto:contato@polaristudio.com.br" className="text-gray-400 hover:text-white transition-colors text-lg">
                    contato@polaristudio.com.br
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">{t("landing.footer.legal.title")}</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors text-lg">
                    {t("landing.footer.legal.terms")}
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-lg">
                    {t("landing.footer.legal.privacy")}
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy#cookies" className="text-gray-400 hover:text-white transition-colors text-lg">
                    {t("landing.footer.legal.cookies")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/80 mt-16 pt-10 text-center text-slate-500 text-base">
            <p>&copy; {new Date().getFullYear()} {t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
      <CookieConsentBanner />
      
      {/* SEO JSON-LD Structured Data */}
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
    </div>
  )
}