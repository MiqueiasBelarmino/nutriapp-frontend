
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  Heart, 
  Apple, 
  Leaf, 
  Users, 
  Target, 
  TrendingUp,
  Shield,
  Clock,
  Award,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const Login: React.FC = () => {
  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      await signIn()
      toast.success('Login realizado com sucesso!')
      navigate('/')
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Users,
      title: 'Gestão de Pacientes',
      description: 'Cadastre e acompanhe todos os seus pacientes em um só lugar'
    },
    {
      icon: Target,
      title: 'Planos Personalizados',
      description: 'Crie planos alimentares customizados para cada necessidade'
    },
    {
      icon: TrendingUp,
      title: 'Acompanhamento',
      description: 'Monitore o progresso e evolução dos seus pacientes'
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Dados protegidos com criptografia de ponta a ponta'
    },
    {
      icon: Clock,
      title: 'Agenda Integrada',
      description: 'Gerencie consultas e compromissos de forma eficiente'
    },
    {
      icon: Award,
      title: 'Relatórios',
      description: 'Gere relatórios detalhados sobre o progresso dos pacientes'
    }
  ]

  const benefits = [
    'Interface intuitiva e fácil de usar',
    'Acesso em qualquer dispositivo',
    'Backup automático na nuvem',
    'Suporte técnico especializado',
    'Atualizações constantes',
    'Conformidade com LGPD'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                NutriApp Pro
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-gray-600">Já tem uma conta?</span>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Transforme sua
                  <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent"> prática nutricional</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  A plataforma completa para nutricionistas modernos. Gerencie pacientes, 
                  crie planos alimentares personalizados e acompanhe resultados em tempo real.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? 'Entrando...' : 'Começar Agora'}
                </button>
                <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition-colors">
                  Ver Demonstração
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">500+</div>
                  <div className="text-gray-600">Nutricionistas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">10k+</div>
                  <div className="text-gray-600">Pacientes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">98%</div>
                  <div className="text-gray-600">Satisfação</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Apple className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Plano Alimentar</h3>
                      <p className="text-gray-500">Maria Silva - Emagrecimento</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Café da Manhã</span>
                      <span className="text-green-600 font-semibold">320 kcal</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700">Almoço</span>
                      <span className="text-blue-600 font-semibold">450 kcal</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-gray-700">Jantar</span>
                      <span className="text-purple-600 font-semibold">380 kcal</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Total do Dia</span>
                      <span className="text-2xl font-bold text-green-600">1,150 kcal</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Leaf className="w-5 h-5" />
                  <span className="font-semibold">Meta Atingida!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ferramentas profissionais para elevar sua prática nutricional ao próximo nível
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o NutriApp Pro?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Desenvolvido especialmente para nutricionistas que buscam excelência 
                no atendimento e gestão de pacientes.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Teste Grátis</h3>
                  <p className="text-gray-600">30 dias sem compromisso</p>
                </div>
                
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? 'Entrando...' : 'Começar Teste Grátis'}
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  Não é necessário cartão de crédito
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">NutriApp Pro</h1>
            </div>
            <p className="text-gray-400 mb-8">
              Transformando a nutrição através da tecnologia
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2025 NutriApp Pro. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Login
