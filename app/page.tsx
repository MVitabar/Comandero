
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
import { useState } from "react"
import emailjs from "@emailjs/browser"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

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
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
              <Image src="/icons/icon-192x192.png" alt="Comandero Logo" width={32} height={32} className="relative" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Comandero</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Recursos
            </a>
            <a href="#benefits" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Benefícios
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Preços
            </a>
            <a href="#faq" className="text-sm font-medium hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Cadastrar
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <a href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Recursos
              </a>
              <a href="#benefits" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Benefícios
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Preços
              </a>
              <a href="#faq" className="text-sm font-medium hover:text-blue-600 transition-colors">
                FAQ
              </a>
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full">
                  Entrar
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6 border border-white/20">
            <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
            <span className="text-sm font-medium">Plataforma #1 para gestão de restaurantes</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Gestão de restaurantes <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">simplificada</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl text-gray-300">
            Uma plataforma completa para administrar todos os aspectos do seu restaurante, desde pedidos até estoque.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/25">
                Começar grátis
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm">
                <Play className="mr-2 h-5 w-5" />
                Ver demo
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Cancelamento fácil</span>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas Melhoradas */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto relative" />
              </div>
              <div className="text-5xl font-bold text-blue-600 mb-2">+500</div>
              <p className="text-gray-600 font-medium">Restaurantes ativos</p>
              <p className="text-sm text-gray-400 mt-2">Em todo o Brasil</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-green-500 rounded-full filter blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <Clock className="h-12 w-12 text-green-600 mx-auto relative" />
              </div>
              <div className="text-5xl font-bold text-green-600 mb-2">30%</div>
              <p className="text-gray-600 font-medium">Redução no tempo</p>
              <p className="text-sm text-gray-400 mt-2">De gestão</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-purple-500 rounded-full filter blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <Award className="h-12 w-12 text-purple-600 mx-auto relative" />
              </div>
              <div className="text-5xl font-bold text-purple-600 mb-2">98%</div>
              <p className="text-gray-600 font-medium">Satisfação</p>
              <p className="text-sm text-gray-400 mt-2">Dos clientes</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-orange-500 rounded-full filter blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <Headphones className="h-12 w-12 text-orange-600 mx-auto relative" />
              </div>
              <div className="text-5xl font-bold text-orange-600 mb-2">24/7</div>
              <p className="text-gray-600 font-medium">Suporte técnico</p>
              <p className="text-sm text-gray-400 mt-2">Sempre disponível</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              <Zap className="h-4 w-4 mr-2" />
              Recursos poderosos
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recursos principais
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Nossa plataforma oferece todas as ferramentas que você precisa para gerenciar seu restaurante de maneira eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-500">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestão de pedidos</h3>
                <p className="text-gray-600">
                  Faça pedidos de maneira rápida e eficiente, com atualizações em tempo real para a cozinha.
                </p>
                <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>Saiba mais</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-500">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Utensils className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestão de mesas</h3>
                <p className="text-gray-600">
                  Visualize e administre a disposição das suas mesas, com status em tempo real.
                </p>
                <div className="mt-4 flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>Saiba mais</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-500">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Relatórios e análises</h3>
                <p className="text-gray-600">
                  Obtenha relatórios detalhados sobre vendas, estoque e desempenho do seu restaurante.
                </p>
                <div className="mt-4 flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>Saiba mais</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-orange-500">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Reservas</h3>
                <p className="text-gray-600">
                  Gerencie as reservas dos seus clientes de maneira simples e evite sobrecargas.
                </p>
                <div className="mt-4 flex items-center text-orange-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>Saiba mais</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-pink-500">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestão de pessoal</h3>
                <p className="text-gray-600">
                  Administre os papéis e permissões da sua equipe, atribuindo tarefas específicas.
                </p>
                <div className="mt-4 flex items-center text-pink-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>Saiba mais</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-cyan-500">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Estoque</h3>
                <p className="text-gray-600">
                  Controle seu estoque em tempo real, com alertas de estoque baixo e gestão de fornecedores.
                </p>
                <div className="mt-4 flex items-center text-cyan-600 font-medium group-hover:translate-x-2 transition-transform">
                  <span>Saiba mais</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Benefícios para seu negócio</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubra como nossa plataforma pode transformar a operação do seu restaurante.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Aumento de eficiência</h3>
                <p className="text-gray-600">
                  Reduza o tempo dedicado a tarefas administrativas e concentre-se no que realmente importa: seus
                  clientes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Redução de erros</h3>
                <p className="text-gray-600">
                  Minimize erros em pedidos e faturamento com um sistema digital integrado.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Melhor controle de estoque</h3>
                <p className="text-gray-600">
                  Evite perdas e otimize suas compras com um acompanhamento preciso do seu estoque.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Dados para decisões</h3>
                <p className="text-gray-600">
                  Tome decisões baseadas em dados reais sobre o desempenho do seu restaurante.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Melhoria da experiência do cliente</h3>
                <p className="text-gray-600">Ofereça um serviço mais rápido e personalizado aos seus clientes.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Escalabilidade</h3>
                <p className="text-gray-600">
                  Nosso sistema cresce com seu negócio, adaptando-se às suas necessidades em constante mudança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-4">
              <Target className="h-4 w-4 mr-2" />
              Processo simples
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Como funciona
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Implementar o Comandero no seu negócio é simples e rápido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 -translate-y-1/2"></div>
            {[
              {
                icon: <Download className="h-12 w-12 text-white" />,
                title: "1. Cadastre-se",
                description: "Crie sua conta e configure o perfil do seu restaurante em minutos.",
                color: "from-blue-500 to-blue-600",
                number: "01"
              },
              {
                icon: <Settings className="h-12 w-12 text-white" />,
                title: "2. Personalize",
                description: "Configure seu cardápio, mesas, pessoal e preferências de acordo com suas necessidades.",
                color: "from-purple-500 to-purple-600",
                number: "02"
              },
              {
                icon: <Users className="h-12 w-12 text-white" />,
                title: "3. Treine",
                description: "Capacite sua equipe com nossos tutoriais e suporte personalizado.",
                color: "from-pink-500 to-pink-600",
                number: "03"
              },
              {
                icon: <Rocket className="h-12 w-12 text-white" />,
                title: "4. Comece!",
                description: "Comece a gerenciar seu restaurante de maneira mais eficiente desde o primeiro dia.",
                color: "from-orange-500 to-orange-600",
                number: "04"
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div className={`rounded-2xl bg-gradient-to-br ${step.color} p-8 mb-6 shadow-lg hover:shadow-2xl transition-shadow group hover:scale-105 transition-transform`}>
                  <div className="absolute top-2 right-2 text-white/30 font-bold text-2xl">{step.number}</div>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
              <Shield className="h-4 w-4 mr-2" />
              Planos flexíveis
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Planos simples e transparentes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Escolha o plano que melhor se adapta às necessidades do seu restaurante.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Básico */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Básico</h3>
                  <p className="text-gray-600 mb-6">Para pequenos restaurantes</p>
                  <p className="text-5xl font-bold mb-2">
                    R$49<span className="text-lg text-gray-600">/mês</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-8">Cobrado mensalmente</p>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Até 3 usuários</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Gestão de pedidos e mesas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Relatórios básicos</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Suporte por email</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Aplicativo móvel</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Começar
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Profissional */}
            <Card className="border-2 border-blue-600 shadow-2xl relative transform scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                Mais popular
              </div>
              <CardContent className="pt-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Profissional</h3>
                  <p className="text-gray-600 mb-6">Para restaurantes em crescimento</p>
                  <p className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    R$129<span className="text-lg text-gray-600">/mês</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-8">Cobrado mensalmente</p>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Até 10 usuários</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Todos os recursos do Básico</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Gestão de estoque</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Relatórios avançados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Integração com delivery</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Suporte por chat</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>API básica</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Começar
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Empresarial */}
            <Card className="border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Empresarial</h3>
                  <p className="text-gray-600 mb-6">Para redes de restaurantes</p>
                  <p className="text-5xl font-bold mb-2">
                    R$299<span className="text-lg text-gray-600">/mês</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-8">Cobrado mensalmente</p>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Usuários ilimitados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Todos os recursos do Profissional</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Múltiplas unidades</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>API e integrações avançadas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Suporte prioritário 24/7</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Gerente de conta dedicado</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Personalização completa</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Contatar vendas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Todos os planos incluem:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>14 dias grátis</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Cancelamento a qualquer momento</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrações */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Integrações</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              O Comandero se integra com as ferramentas que você já utiliza.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: <CreditCard className="h-10 w-10 text-gray-700" />,
                name: "Gateways de pagamento",
              },
              {
                icon: <ShoppingCart className="h-10 w-10 text-gray-700" />,
                name: "Plataformas de delivery",
              },
              {
                icon: <MessageSquare className="h-10 w-10 text-gray-700" />,
                name: "CRM",
              },
              {
                icon: <BarChart3 className="h-10 w-10 text-gray-700" />,
                name: "Contabilidade",
              },
              {
                icon: <Calendar className="h-10 w-10 text-gray-700" />,
                name: "Reservas online",
              },
              {
                icon: <Globe className="h-10 w-10 text-gray-700" />,
                name: "Marketing digital",
              },
              {
                icon: <Code className="h-10 w-10 text-gray-700" />,
                name: "API personalizada",
              },
              {
                icon: <HelpCircle className="h-10 w-10 text-gray-700" />,
                name: "Suporte técnico",
              },
            ].map((integration, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="mb-3">{integration.icon}</div>
                <h3 className="font-medium">{integration.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Perguntas frequentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Respostas para as perguntas mais comuns sobre nossa plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-bold mb-2">Preciso de conhecimentos técnicos?</h3>
              <p className="text-gray-600">
                Não, nossa plataforma foi projetada para ser intuitiva e fácil de usar, sem necessidade de conhecimentos
                técnicos prévios.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Posso testar antes de comprar?</h3>
              <p className="text-gray-600">
                Sim, oferecemos um teste gratuito de 14 dias para que você possa explorar todas as funcionalidades.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Como é o processo de implementação?</h3>
              <p className="text-gray-600">
                Nossa equipe irá guiá-lo em todo o processo, desde a configuração inicial até o treinamento do seu
                pessoal.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">
                Sim, não há contratos de longo prazo. Você pode cancelar sua assinatura a qualquer momento.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Vocês oferecem suporte técnico?</h3>
              <p className="text-gray-600">
                Sim, todos os nossos planos incluem suporte técnico, com diferentes níveis de acordo com o plano
                escolhido.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Meus dados estão seguros?</h3>
              <p className="text-gray-600">
                Absolutamente. Utilizamos criptografia de nível bancário e cumprimos com todas as regulamentações de
                proteção de dados, incluindo a LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos Detalhados */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mb-4">
              <Star className="h-4 w-4 mr-2 fill-current" />
              Avaliações de clientes
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              O que dizem nossos clientes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Descubra como o Comandero transformou negócios como o seu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                role: "Proprietária, Sabor Carioca",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "Desde que implementamos o Comandero, reduzimos o tempo de serviço em 35% e os erros nos pedidos praticamente desapareceram. O sistema é intuitivo e nossa equipe o adotou rapidamente.",
                stars: 5,
                color: "from-blue-500 to-blue-600"
              },
              {
                name: "Carlos Oliveira",
                role: "Diretor de Operações, Grupo Gourmet Brasil",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "O controle de estoque em tempo real nos permitiu reduzir desperdícios e otimizar nossas compras. Vimos um aumento de 20% em nossa margem de lucro em apenas três meses.",
                stars: 5,
                color: "from-purple-500 to-purple-600"
              },
              {
                name: "Fernanda Santos",
                role: "CEO, Rede Sabores do Brasil",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "A capacidade de gerenciar múltiplas unidades a partir de uma única plataforma foi uma mudança radical para nossa rede. A visibilidade e controle que temos agora é incomparável.",
                stars: 5,
                color: "from-pink-500 to-pink-600"
              },
              {
                name: "Roberto Almeida",
                role: "Gerente, Bistrô Paulista",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "O suporte técnico é excepcional. Qualquer problema é resolvido rapidamente, e a equipe está sempre disposta a ajudar com novas funcionalidades que precisamos.",
                stars: 4,
                color: "from-green-500 to-green-600"
              },
              {
                name: "Juliana Costa",
                role: "Chef Executiva, Sabores do Mundo",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "Como chef, posso me concentrar na cozinha enquanto o sistema gerencia eficientemente os pedidos. A comunicação entre a equipe de salão e a cozinha melhorou enormemente.",
                stars: 5,
                color: "from-orange-500 to-orange-600"
              },
              {
                name: "Marcelo Souza",
                role: "Proprietário, Café Mineiro",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "Para um café pequeno como o nosso, o Comandero tem sido perfeito. Fácil de usar, acessível e com todas as funções que precisamos sem complicações desnecessárias.",
                stars: 5,
                color: "from-cyan-500 to-cyan-600"
              },
            ].map((testimonial, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 group">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="rounded-full overflow-hidden w-20 h-20 flex-shrink-0 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-ring">
                      <div className={`w-full h-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center`}>
                        <span className="text-white text-2xl font-bold">{testimonial.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <div className="flex mt-2">
                        {Array(testimonial.stars)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                          ))}
                        {Array(5 - testimonial.stars)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-gray-300 fill-current" />
                          ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Verificado</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-20  bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              <MessageSquare className="h-4 w-4 mr-2" />
              Entre em contato
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tem perguntas?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Nossa equipe está disponível para ajudá-lo com qualquer dúvida que você tenha sobre o Comandero.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">WhatsApp</h3>
                    <p className="text-gray-600">+55 48 996 209954</p>
                    <p className="text-sm text-gray-500">Disponível para contato rápido</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email</h3>
                    <p className="text-gray-600">contato@polaristudio.com.br</p>
                    <p className="text-sm text-gray-500">Respondemos em menos de 24 horas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Suporte técnico</h3>
                    <p className="text-gray-600">contato@polaristudio.com.br</p>
                    <p className="text-sm text-gray-500">Disponível 24/7 para clientes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Sede</h3>
                    <p className="text-gray-600">Criciúma, Brasil</p>
                    <p className="text-sm text-gray-500">Santa Catarina</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Desenvolvido por</h3>
                    <p className="text-gray-800 font-semibold">Polaris Studio</p>
                    <a href="https://www.polaristudio.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                      www.polaristudio.com.br
                    </a>
                  </div>
                </div>
              </div>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para transformar seu restaurante?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de restaurantes que já estão melhorando sua gestão com nossa plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                Começar grátis
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="border-white text-black hover:bg-white/10">
                Saiba mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image src="/icons/icon-192x192.png" alt="Comandero Logo" width={24} height={24} />
                <span className="text-xl font-bold">Comandero</span>
              </div>
              <p className="text-gray-400">A solução completa para a gestão de restaurantes.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Produto</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contato</h3>
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
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Termos de serviço
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Política de privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Comandero. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}