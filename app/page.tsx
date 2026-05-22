
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

      {/* Hero Section */}
      <section className="relative landing-mesh animate-landing-gradient text-white py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 landing-grid-pattern" aria-hidden />
        <div className="absolute top-16 left-[8%] w-80 h-80 bg-blue-500/30 rounded-full blur-[120px] animate-landing-float-slow" aria-hidden />
        <div className="absolute bottom-12 right-[6%] w-96 h-96 bg-purple-500/25 rounded-full blur-[140px] animate-landing-float-slow [animation-delay:-5s]" aria-hidden />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" aria-hidden />
        <div className="landing-container flex flex-col items-center text-center relative z-10">
          <div className="landing-reveal landing-visible inline-flex items-center px-4 py-2 rounded-full landing-glass-dark mb-8 shadow-lg shadow-blue-500/10">
            <Sparkles className="h-4 w-4 mr-2 text-amber-300 animate-pulse" />
            <span className="text-sm font-medium tracking-wide">{t("landing.hero.badge")}</span>
          </div>
          <h1 className="landing-reveal landing-visible landing-reveal-delay-1 text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight max-w-5xl">
            {t("landing.hero.titleLine1")}{" "}
            <span className="block sm:inline mt-1 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-violet-300 to-purple-400 animate-landing-shine bg-[length:200%_auto]">
              {t("landing.hero.titleLine2")}
            </span>
          </h1>
          <p className="landing-reveal landing-visible landing-reveal-delay-2 text-lg md:text-xl lg:text-2xl mb-10 max-w-2xl text-slate-300/95 leading-relaxed font-light">
            {t("landing.hero.subtitle")}
          </p>
          <div className="landing-reveal landing-visible landing-reveal-delay-3 flex flex-col sm:flex-row gap-4 mb-14">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-7 text-lg rounded-xl shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-[1.03] transition-all duration-300"
              >
                {t("landing.hero.ctaPrimary")}
                <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            {/* <Link href="/login">
              <Button variant="outline" size="lg" className="border-white/30 text-blue-400 hover:bg-white/10 hover:text-white px-8 py-6 text-lg backdrop-blur-sm">
                <Play className="mr-2 h-5 w-5" />
                Ver demo
              </Button>
            </Link> */}
          </div>
          <div className="landing-reveal landing-visible landing-reveal-delay-4 flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-slate-400">
            <div className="flex items-center gap-2 landing-glass-dark px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{t("landing.hero.trust.noCreditCard")}</span>
            </div>
            <div className="flex items-center gap-2 landing-glass-dark px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{t("landing.hero.trust.freeTrialDays")}</span>
            </div>
            <div className="flex items-center gap-2 landing-glass-dark px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{t("landing.hero.trust.easyCancel")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas Melhoradas */}
      <section className="py-20 -mt-8 relative z-20">
        <div className="landing-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="landing-reveal landing-glass-card landing-stat-card landing-card-modern p-8 rounded-2xl text-center group">
              <div className="relative mb-5 inline-flex">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity scale-150" />
                <div className="relative p-4 rounded-2xl bg-blue-500/10 ring-1 ring-blue-200/60">
                  <TrendingUp className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2 tabular-nums">{t("landing.stats.restaurants.value")}</div>
              <p className="text-slate-700 font-semibold">{t("landing.stats.restaurants.title")}</p>
              <p className="text-sm text-slate-500 mt-1">{t("landing.stats.restaurants.subtitle")}</p>
            </div>
            <div className="landing-reveal landing-reveal-delay-1 landing-glass-card landing-stat-card landing-card-modern p-8 rounded-2xl text-center group">
              <div className="relative mb-5 inline-flex">
                <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity scale-150" />
                <div className="relative p-4 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-200/60">
                  <Clock className="h-10 w-10 text-emerald-600" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2 tabular-nums">{t("landing.stats.timeReduction.value")}</div>
              <p className="text-slate-700 font-semibold">{t("landing.stats.timeReduction.title")}</p>
              <p className="text-sm text-slate-500 mt-1">{t("landing.stats.timeReduction.subtitle")}</p>
            </div>
            <div className="landing-reveal landing-reveal-delay-2 landing-glass-card landing-stat-card landing-card-modern p-8 rounded-2xl text-center group">
              <div className="relative mb-5 inline-flex">
                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity scale-150" />
                <div className="relative p-4 rounded-2xl bg-purple-500/10 ring-1 ring-purple-200/60">
                  <Award className="h-10 w-10 text-purple-600" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2 tabular-nums">{t("landing.stats.satisfaction.value")}</div>
              <p className="text-slate-700 font-semibold">{t("landing.stats.satisfaction.title")}</p>
              <p className="text-sm text-slate-500 mt-1">{t("landing.stats.satisfaction.subtitle")}</p>
            </div>
            <div className="landing-reveal landing-reveal-delay-3 landing-glass-card landing-stat-card landing-card-modern p-8 rounded-2xl text-center group">
              <div className="relative mb-5 inline-flex">
                <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity scale-150" />
                <div className="relative p-4 rounded-2xl bg-orange-500/10 ring-1 ring-orange-200/60">
                  <Headphones className="h-10 w-10 text-orange-600" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2 tabular-nums">{t("landing.stats.support.value")}</div>
              <p className="text-slate-700 font-semibold">{t("landing.stats.support.title")}</p>
              <p className="text-sm text-slate-500 mt-1">{t("landing.stats.support.subtitle")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4 ring-1 ring-blue-100">
              <Zap className="h-4 w-4 mr-2" />
              {t("landing.features.badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 landing-gradient-text tracking-tight">
              {t("landing.features.title")}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="landing-reveal landing-feature-glow landing-card-modern group border-slate-200/80 shadow-sm hover:border-blue-400/50 rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("landing.features.orders.title")}</h3>
                <p className="text-gray-600">
                  {t("landing.features.orders.description")}
                </p>
                <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>{t("landing.features.learnMore")}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-1 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-sm hover:border-purple-400/50 rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Utensils className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("landing.features.tables.title")}</h3>
                <p className="text-gray-600">
                  {t("landing.features.tables.description")}
                </p>
                <div className="mt-4 flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>{t("landing.features.learnMore")}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-2 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-sm hover:border-emerald-400/50 rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("landing.features.reports.title")}</h3>
                <p className="text-gray-600">
                  {t("landing.features.reports.description")}
                </p>
                <div className="mt-4 flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>{t("landing.features.learnMore")}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-3 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-sm hover:border-orange-400/50 rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("landing.features.reservations.title")}</h3>
                <p className="text-gray-600">
                  {t("landing.features.reservations.description")}
                </p>
                <div className="mt-4 flex items-center text-orange-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>{t("landing.features.learnMore")}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-1 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-sm hover:border-pink-400/50 rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("landing.features.staff.title")}</h3>
                <p className="text-gray-600">
                  {t("landing.features.staff.description")}
                </p>
                <div className="mt-4 flex items-center text-pink-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>{t("landing.features.learnMore")}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="landing-reveal landing-reveal-delay-2 landing-feature-glow landing-card-modern group border-slate-200/80 shadow-sm hover:border-cyan-400/50 rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("landing.features.inventory.title")}</h3>
                <p className="text-gray-600">
                  {t("landing.features.inventory.description")}
                </p>
                <div className="mt-4 flex items-center text-cyan-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>{t("landing.features.learnMore")}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 landing-section-alt">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 landing-gradient-text tracking-tight">{t("landing.benefits.title")}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
              {t("landing.benefits.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="landing-reveal flex items-start gap-4 p-6 rounded-2xl landing-glass-card landing-card-modern">
              <div className="p-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-200/60 shrink-0">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{t("landing.benefits.efficiency.title")}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("landing.benefits.efficiency.description")}
                </p>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-1 flex items-start gap-4 p-6 rounded-2xl landing-glass-card landing-card-modern">
              <div className="p-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-200/60 shrink-0">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{t("landing.benefits.errors.title")}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("landing.benefits.errors.description")}
                </p>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-2 flex items-start gap-4 p-6 rounded-2xl landing-glass-card landing-card-modern">
              <div className="p-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-200/60 shrink-0">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{t("landing.benefits.inventory.title")}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("landing.benefits.inventory.description")}
                </p>
              </div>
            </div>

            <div className="landing-reveal flex items-start gap-4 p-6 rounded-2xl landing-glass-card landing-card-modern">
              <div className="p-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-200/60 shrink-0">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{t("landing.benefits.data.title")}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("landing.benefits.data.description")}
                </p>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-1 flex items-start gap-4 p-6 rounded-2xl landing-glass-card landing-card-modern">
              <div className="p-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-200/60 shrink-0">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{t("landing.benefits.experience.title")}</h3>
                <p className="text-slate-600 leading-relaxed">{t("landing.benefits.experience.description")}</p>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-2 flex items-start gap-4 p-6 rounded-2xl landing-glass-card landing-card-modern">
              <div className="p-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-200/60 shrink-0">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{t("landing.benefits.scalability.title")}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("landing.benefits.scalability.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-24 bg-white">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-semibold mb-4 ring-1 ring-purple-100">
              <Target className="h-4 w-4 mr-2" />
              {t("landing.howItWorks.badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 landing-gradient-text tracking-tight">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-[4.5rem] left-[12%] right-[12%] h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 rounded-full opacity-60 -z-0" aria-hidden />
            {howItWorksSteps.map((step, i) => {
              const StepIcon = step.icon
              return (
              <div key={step.stepKey} className={`landing-reveal ${i > 0 ? `landing-reveal-delay-${Math.min(i, 3)}` : ""} flex flex-col items-center text-center relative z-10`}>
                <div className={`relative rounded-2xl bg-gradient-to-br ${step.color} p-8 mb-6 shadow-xl shadow-blue-500/10 landing-card-modern group`}>
                  <div className="absolute top-3 right-3 text-white/25 font-bold text-2xl tabular-nums">{step.number}</div>
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <StepIcon className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{t(`landing.howItWorks.steps.${step.stepKey}.title`)}</h3>
                <p className="text-slate-600 leading-relaxed max-w-[220px]">{t(`landing.howItWorks.steps.${step.stepKey}.description`)}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 landing-section-alt">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-4 ring-1 ring-emerald-100">
              <Shield className="h-4 w-4 mr-2" />
              {t("landing.pricing.badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 landing-gradient-text tracking-tight">
              {t("landing.pricing.title")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {t("landing.pricing.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Básico */}
            <Card className="landing-reveal landing-card-modern border-slate-200/80 rounded-2xl shadow-sm hover:border-blue-300/80 hover:shadow-xl">
              <CardContent className="pt-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-slate-800">{t("landing.pricing.plans.basic.name")}</h3>
                  <p className="text-gray-600 mb-6">{t("landing.pricing.plans.basic.description")}</p>
                  <p className="text-5xl font-bold mb-2">
                    {t("landing.pricing.plans.basic.price")}<span className="text-lg text-gray-600">{t("landing.pricing.perMonth")}</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-8">{t("landing.pricing.billedMonthly")}</p>
                  <ul className="space-y-4 mb-8 text-left">
                    {(["users3", "ordersTables", "basicReports", "emailSupport", "mobileApp"] as const).map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{t(`landing.pricing.plans.basic.features.${feature}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline">
                    {t("landing.pricing.ctaStart")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Profissional */}
            <Card className="landing-reveal landing-reveal-delay-1 border-2 border-blue-500/80 shadow-2xl shadow-blue-500/15 relative md:scale-[1.03] rounded-2xl ring-4 ring-blue-500/10 landing-card-modern">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                {t("landing.pricing.plans.pro.badge")}
              </div>
              <CardContent className="pt-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{t("landing.pricing.plans.pro.name")}</h3>
                  <p className="text-gray-600 mb-6">{t("landing.pricing.plans.pro.description")}</p>
                  <p className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t("landing.pricing.plans.pro.price")}<span className="text-lg text-gray-600">{t("landing.pricing.perMonth")}</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-8">{t("landing.pricing.billedMonthly")}</p>
                  <ul className="space-y-4 mb-8 text-left">
                    {(["users10", "allBasic", "inventory", "advancedReports", "delivery", "chatSupport", "basicApi"] as const).map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{t(`landing.pricing.plans.pro.features.${feature}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {t("landing.pricing.ctaStart")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Empresarial */}
            <Card className="landing-reveal landing-reveal-delay-2 landing-card-modern border-slate-200/80 rounded-2xl shadow-sm hover:border-purple-300/80 hover:shadow-xl">
              <CardContent className="pt-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-slate-800">{t("landing.pricing.plans.enterprise.name")}</h3>
                  <p className="text-gray-600 mb-6">{t("landing.pricing.plans.enterprise.description")}</p>
                  <p className="text-5xl font-bold mb-2">
                    {t("landing.pricing.plans.enterprise.price")}<span className="text-lg text-gray-600">{t("landing.pricing.perMonth")}</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-8">{t("landing.pricing.billedMonthly")}</p>
                  <ul className="space-y-4 mb-8 text-left">
                    {(["unlimitedUsers", "allPro", "multiUnit", "advancedApi", "prioritySupport", "accountManager", "fullCustomization"] as const).map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{t(`landing.pricing.plans.enterprise.features.${feature}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline">
                    {t("landing.pricing.ctaContactSales")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">{t("landing.pricing.allPlansInclude")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>{t("landing.pricing.trust.freeTrialDays")}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>{t("landing.pricing.trust.noCreditCard")}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>{t("landing.pricing.trust.cancelAnytime")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrações */}
      <section className="py-24 bg-white">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 landing-gradient-text tracking-tight">{t("landing.integrations.title")}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              {t("landing.integrations.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {INTEGRATION_KEYS.map((key, i) => {
              const Icon = INTEGRATION_ICONS[i]
              return (
              <div
                key={key}
                className={`landing-reveal ${i % 4 === 1 ? "landing-reveal-delay-1" : i % 4 === 2 ? "landing-reveal-delay-2" : i % 4 === 3 ? "landing-reveal-delay-3" : ""} flex flex-col items-center text-center p-6 landing-glass-card landing-card-modern rounded-2xl group`}
              >
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 group-hover:from-blue-50 group-hover:to-purple-50 transition-colors duration-300">
                  <div className="text-slate-600 group-hover:text-blue-600 transition-colors">
                    <Icon className="h-10 w-10" />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-700 text-sm">{t(`landing.integrations.${key}`)}</h3>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 landing-section-alt">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 landing-gradient-text tracking-tight">{t("landing.faq.title")}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              {t("landing.faq.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {FAQ_KEYS.map((key, i) => (
              <div
                key={key}
                className={`landing-reveal ${i % 3 === 1 ? "landing-reveal-delay-1" : i % 3 === 2 ? "landing-reveal-delay-2" : ""} p-6 rounded-2xl landing-glass-card landing-card-modern`}
              >
                <h3 className="text-lg font-bold mb-2 text-slate-800">{t(`landing.faq.items.${key}.title`)}</h3>
                <p className="text-slate-600 leading-relaxed">{t(`landing.faq.items.${key}.answer`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos Detalhados */}
      <section className="py-24 bg-white">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold mb-4 ring-1 ring-amber-100">
              <Star className="h-4 w-4 mr-2 fill-amber-500 text-amber-500" />
              {t("landing.testimonials.badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 landing-gradient-text tracking-tight">
              {t("landing.testimonials.title")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {t("landing.testimonials.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIAL_KEYS.map((key, i) => {
              const name = t(`landing.testimonials.items.${key}.name`)
              const stars = TESTIMONIAL_STARS[i]
              return (
              <Card key={key} className={`landing-reveal ${i % 3 === 1 ? "landing-reveal-delay-1" : i % 3 === 2 ? "landing-reveal-delay-2" : ""} overflow-hidden landing-card-modern border-slate-200/80 rounded-2xl hover:border-blue-300/60 group shadow-sm`}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="rounded-full overflow-hidden w-20 h-20 flex-shrink-0 ring-4 ring-blue-100/80 group-hover:ring-blue-200 transition-all duration-300">
                      <div className={`w-full h-full bg-gradient-to-br ${TESTIMONIAL_COLORS[i]} flex items-center justify-center`}>
                        <span className="text-white text-2xl font-bold">{name.charAt(0)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{name}</h3>
                      <p className="text-sm text-gray-600">{t(`landing.testimonials.items.${key}.role`)}</p>
                      <div className="flex mt-2">
                        {Array(stars)
                          .fill(0)
                          .map((_, starIndex) => (
                            <Star key={starIndex} className="h-4 w-4 text-yellow-500 fill-current" />
                          ))}
                        {Array(5 - stars)
                          .fill(0)
                          .map((_, starIndex) => (
                            <Star key={starIndex} className="h-4 w-4 text-gray-300 fill-current" />
                          ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed">&quot;{t(`landing.testimonials.items.${key}.quote`)}&quot;</p>
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t("landing.testimonials.verified")}</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contact" className="py-16 md:py-24 landing-section-alt">
        <div className="landing-container">
          <div className="landing-reveal text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4 ring-1 ring-blue-100">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("landing.contact.badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 landing-gradient-text tracking-tight">
              {t("landing.contact.title")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {t("landing.contact.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 auto-rows-fr">
              <a
                href={LANDING_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-reveal landing-contact-card landing-glass-card landing-card-modern p-6 rounded-2xl group"
              >
                <div className="flex items-start gap-4 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 p-3.5 rounded-2xl shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg mb-1">{t("landing.contact.whatsapp.title")}</h3>
                    <p className="text-gray-600 break-words">{LANDING_CONTACT.phoneDisplay}</p>
                    <p className="text-sm text-gray-500">{t("landing.contact.whatsapp.hint")}</p>
                  </div>
                </div>
              </a>

              <a
                href={LANDING_CONTACT.emailUrl}
                className="landing-reveal landing-reveal-delay-1 landing-contact-card landing-glass-card landing-card-modern p-6 rounded-2xl group"
              >
                <div className="flex items-start gap-4 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 p-3.5 rounded-2xl shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg mb-1">{t("landing.contact.email.title")}</h3>
                    <p className="text-gray-600 break-all">{LANDING_CONTACT.email}</p>
                    <p className="text-sm text-gray-500">{t("landing.contact.email.hint")}</p>
                  </div>
                </div>
              </a>

              <a
                href={LANDING_CONTACT.supportUrl}
                className="landing-reveal landing-reveal-delay-2 landing-contact-card landing-glass-card landing-card-modern p-6 rounded-2xl group"
              >
                <div className="flex items-start gap-4 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600 p-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg mb-1">{t("landing.contact.support.title")}</h3>
                    <p className="text-gray-600 break-all">{LANDING_CONTACT.email}</p>
                    <p className="text-sm text-gray-500">{t("landing.contact.support.hint")}</p>
                  </div>
                </div>
              </a>

              <a
                href={LANDING_CONTACT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-reveal landing-contact-card landing-glass-card landing-card-modern p-6 rounded-2xl group"
              >
                <div className="flex items-start gap-4 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 p-3.5 rounded-2xl shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg mb-1">{t("landing.contact.headquarters.title")}</h3>
                    <p className="text-gray-600">{t("landing.contact.headquarters.city")}</p>
                    <p className="text-sm text-gray-500">{t("landing.contact.headquarters.state")}</p>
                  </div>
                </div>
              </a>

              <a
                href={LANDING_CONTACT.studioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-reveal landing-reveal-delay-1 landing-contact-card p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-blue-200/60 ring-1 ring-blue-100 landing-card-modern md:col-span-2"
              >
                <div className="flex items-start gap-4 w-full min-w-0">
                  <div className="shrink-0 bg-gradient-to-br from-blue-600 to-purple-600 p-3.5 rounded-2xl shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg mb-1">{t("landing.contact.developer.label")}</h3>
                    <p className="text-gray-800 font-semibold">{t("landing.contact.developer.name")}</p>
                    <p className="text-blue-600 group-hover:text-blue-700 text-sm">www.polaristudio.com.br</p>
                  </div>
                </div>
              </a>
            </div>

            {/* <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-gray-100">
              <h3 className="text-2xl font-bold mb-6">Envie-nos uma mensagem</h3>
              
              {submitStatus === "success" && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <p className="text-green-800 font-medium">Mensagem enviada com sucesso! Entraremos em contato em breve.</p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <X className="h-6 w-6 text-red-600" />
                    <p className="text-red-800 font-medium">Erro ao enviar mensagem. Por favor, tente novamente.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder="Descreva sua mensagem..."
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar mensagem
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div> */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 landing-cta-mesh text-white overflow-hidden">
        <div className="absolute inset-0 landing-grid-pattern opacity-40" aria-hidden />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-landing-float" aria-hidden />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-landing-float-slow" aria-hidden />
        <div className="landing-container text-center relative z-10 landing-reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t("landing.cta.title")}</h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-blue-100/90 leading-relaxed">
            {t("landing.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 shadow-xl hover:scale-[1.03] transition-all duration-300 px-8">
                {t("landing.cta.primary")}
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 backdrop-blur-sm px-8 transition-all duration-300">
                {t("landing.cta.secondary")}
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-14 border-t border-slate-800">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/icons/icon-192x192.png" alt={t("landing.brand.logoAlt")} width={28} height={28} className="rounded-md" />
                <span className="text-xl font-bold landing-gradient-text">{t("landing.brand.name")}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">{t("landing.footer.tagline")}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">{t("landing.footer.product.title")}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    {t("landing.nav.features")}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                    {t("landing.nav.pricing")}
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-white transition-colors">
                    {t("landing.nav.faq")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">{t("landing.footer.contact.title")}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.polaristudio.com.br" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Polaris Studio
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/5548996209954" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="mailto:contato@polaristudio.com.br" className="text-gray-400 hover:text-white transition-colors">
                    contato@polaristudio.com.br
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">{t("landing.footer.legal.title")}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {t("landing.footer.legal.terms")}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {t("landing.footer.legal.privacy")}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {t("landing.footer.legal.cookies")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/80 mt-12 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} {t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}