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
} from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/icons/icon-192x192.png" alt="Comandero Logo" width={32} height={32} />
            <span className="text-xl font-bold">Comandero</span>
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
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-black text-white py-20">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Gestão de restaurantes <span className="text-blue-400">simplificada</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl">
            Uma plataforma completa para administrar todos os aspectos do seu restaurante, desde pedidos até estoque.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Começar grátis
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estatísticas Melhoradas */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">+500</div>
              <p className="text-gray-600">Restaurantes ativos</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">30%</div>
              <p className="text-gray-600">Redução no tempo de gestão</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <p className="text-gray-600">Satisfação do cliente</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-600">Suporte técnico disponível</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Recursos principais</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece todas as ferramentas que você precisa para gerenciar seu restaurante de maneira
              eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão de pedidos</h3>
                <p className="text-gray-600">
                  Faça pedidos de maneira rápida e eficiente, com atualizações em tempo real para a cozinha.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Utensils className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão de mesas</h3>
                <p className="text-gray-600">
                  Visualize e administre a disposição das suas mesas, com status em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Relatórios e análises</h3>
                <p className="text-gray-600">
                  Obtenha relatórios detalhados sobre vendas, estoque e desempenho do seu restaurante.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Reservas</h3>
                <p className="text-gray-600">
                  Gerencie as reservas dos seus clientes de maneira simples e evite sobrecargas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão de pessoal</h3>
                <p className="text-gray-600">
                  Administre os papéis e permissões da sua equipe, atribuindo tarefas específicas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Estoque</h3>
                <p className="text-gray-600">
                  Controle seu estoque em tempo real, com alertas de estoque baixo e gestão de fornecedores.
                </p>
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Como funciona</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Implementar o RestaurantOS no seu negócio é simples e rápido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Download className="h-10 w-10 text-blue-600" />,
                title: "1. Cadastre-se",
                description: "Crie sua conta e configure o perfil do seu restaurante em minutos.",
              },
              {
                icon: <Settings className="h-10 w-10 text-blue-600" />,
                title: "2. Personalize",
                description: "Configure seu cardápio, mesas, pessoal e preferências de acordo com suas necessidades.",
              },
              {
                icon: <Users className="h-10 w-10 text-blue-600" />,
                title: "3. Treine",
                description: "Capacite sua equipe com nossos tutoriais e suporte personalizado.",
              },
              {
                icon: <Play className="h-10 w-10 text-blue-600" />,
                title: "4. Comece!",
                description: "Comece a gerenciar seu restaurante de maneira mais eficiente desde o primeiro dia.",
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-100 p-6 mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planos simples e transparentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Escolha o plano que melhor se adapta às necessidades do seu restaurante.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Básico */}
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Básico</h3>
                  <p className="text-gray-600 mb-4">Para pequenos restaurantes</p>
                  <p className="text-4xl font-bold mb-6">
                    R$49<span className="text-lg text-gray-600">/mês</span>
                  </p>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Até 3 usuários</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Gestão de pedidos e mesas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Relatórios básicos</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Suporte por email</span>
                    </li>
                  </ul>
                  <Button className="w-full">Começar</Button>
                </div>
              </CardContent>
            </Card>
            {/* Profissional */}
            <Card className="border-blue-600 shadow-lg relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Mais popular
              </div>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Profissional</h3>
                  <p className="text-gray-600 mb-4">Para restaurantes em crescimento</p>
                  <p className="text-4xl font-bold mb-6">
                    R$129<span className="text-lg text-gray-600">/mês</span>
                  </p>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Até 10 usuários</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Todos os recursos do Básico</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Gestão de estoque</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Relatórios avançados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Integração com delivery</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Suporte por chat</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Começar</Button>
                </div>
              </CardContent>
            </Card>
            {/* Empresarial */}
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Empresarial</h3>
                  <p className="text-gray-600 mb-4">Para redes de restaurantes</p>
                  <p className="text-4xl font-bold mb-6">
                    R$299<span className="text-lg text-gray-600">/mês</span>
                  </p>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Usuários ilimitados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Todos os recursos do Profissional</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Múltiplas unidades</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>API e integrações avançadas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Suporte prioritário 24/7</span>
                    </li>
                  </ul>
                  <Button className="w-full">Contatar vendas</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integrações */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Integrações</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              O RestaurantOS se integra com as ferramentas que você já utiliza.
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">O que dizem nossos clientes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubra como o RestaurantOS transformou negócios como o seu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                role: "Proprietária, Sabor Carioca",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "Desde que implementamos o RestaurantOS, reduzimos o tempo de serviço em 35% e os erros nos pedidos praticamente desapareceram. O sistema é intuitivo e nossa equipe o adotou rapidamente.",
                stars: 5,
              },
              {
                name: "Carlos Oliveira",
                role: "Diretor de Operações, Grupo Gourmet Brasil",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "O controle de estoque em tempo real nos permitiu reduzir desperdícios e otimizar nossas compras. Vimos um aumento de 20% em nossa margem de lucro em apenas três meses.",
                stars: 5,
              },
              {
                name: "Fernanda Santos",
                role: "CEO, Rede Sabores do Brasil",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "A capacidade de gerenciar múltiplas unidades a partir de uma única plataforma foi uma mudança radical para nossa rede. A visibilidade e controle que temos agora é incomparável.",
                stars: 5,
              },
              {
                name: "Roberto Almeida",
                role: "Gerente, Bistrô Paulista",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "O suporte técnico é excepcional. Qualquer problema é resolvido rapidamente, e a equipe está sempre disposta a ajudar com novas funcionalidades que precisamos.",
                stars: 4,
              },
              {
                name: "Juliana Costa",
                role: "Chef Executiva, Sabores do Mundo",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "Como chef, posso me concentrar na cozinha enquanto o sistema gerencia eficientemente os pedidos. A comunicação entre a equipe de salão e a cozinha melhorou enormemente.",
                stars: 5,
              },
              {
                name: "Marcelo Souza",
                role: "Proprietário, Café Mineiro",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "Para um café pequeno como o nosso, o RestaurantOS tem sido perfeito. Fácil de usar, acessível e com todas as funções que precisamos sem complicações desnecessárias.",
                stars: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-full overflow-hidden w-16 h-16 flex-shrink-0">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <div className="flex mt-1">
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
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog e Recursos */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Blog e Recursos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Aprenda mais sobre gestão de restaurantes e maximize o potencial do seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "10 estratégias para aumentar as vendas no seu restaurante",
                excerpt:
                  "Descubra táticas comprovadas para aumentar sua receita sem a necessidade de grandes investimentos.",
                image: "/placeholder.svg?height=200&width=400",
                category: "Marketing",
              },
              {
                title: "Guia completo de gestão de estoque para restaurantes",
                excerpt: "Aprenda a otimizar seu estoque, reduzir desperdícios e aumentar a lucratividade.",
                image: "/placeholder.svg?height=200&width=400",
                category: "Operações",
              },
              {
                title: "Como criar um ambiente de trabalho positivo no seu restaurante",
                excerpt:
                  "Estratégias para melhorar a satisfação dos seus funcionários e reduzir a rotatividade de pessoal.",
                image: "/placeholder.svg?height=200&width=400",
                category: "Recursos Humanos",
              },
            ].map((post, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative h-48">
                  <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {post.category}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Ler mais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline">
              Ver todos os artigos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Tem perguntas?</h2>
              <p className="text-gray-600 mb-8">
                Nossa equipe está disponível para ajudá-lo com qualquer dúvida que você tenha sobre o RestaurantOS.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Ligue para nós</h3>
                    <p className="text-gray-600">+55 11 4000-1234</p>
                    <p className="text-sm text-gray-500">Segunda a sexta, 9:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Escreva para nós</h3>
                    <p className="text-gray-600">info@restaurantos.com.br</p>
                    <p className="text-sm text-gray-500">Respondemos em menos de 24 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Headphones className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Suporte técnico</h3>
                    <p className="text-gray-600">suporte@restaurantos.com.br</p>
                    <p className="text-sm text-gray-500">Disponível 24/7 para clientes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-6">Envie-nos uma mensagem</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Escreva sua mensagem aqui..."
                  ></textarea>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Enviar mensagem</Button>
              </form>
            </div>
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
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
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
              <h3 className="text-lg font-bold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Sobre nós
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contato
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