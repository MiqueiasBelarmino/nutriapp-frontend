
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  CalendarDays, 
  FileText, 
  Plus,
  Activity,
  Clock,
  Target
} from 'lucide-react'
import { usePatients } from '../hooks/usePatients'
import { useConsultations } from '../hooks/useConsultations'
import { useMealPlans } from '../hooks/useMealPlans'

const Dashboard: React.FC = () => {
  const { patients, fetchPatients } = usePatients()
  const { consultations, fetchConsultations } = useConsultations()
  const { mealPlans, fetchMealPlans } = useMealPlans()
  const [stats, setStats] = useState({
    totalPatients: 0,
    consultationsToday: 0,
    activeMealPlans: 0,
    completionRate: 0
  })

  useEffect(() => {
    fetchPatients()
    fetchConsultations()
    fetchMealPlans()
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const consultationsToday = consultations.filter(consultation => 
      consultation.date.startsWith(today)
    ).length

    const activeMealPlans = mealPlans.filter(plan => {
      const planDate = new Date(plan.date)
      const now = new Date()
      return planDate >= now
    }).length

    setStats({
      totalPatients: patients.length,
      consultationsToday,
      activeMealPlans,
      completionRate: patients.length > 0 ? Math.round((consultations.length / patients.length) * 100) : 0
    })
  }, [patients, consultations, mealPlans])

  const quickActions = [
    {
      title: 'Novo Paciente',
      description: 'Cadastrar novo paciente',
      icon: Users,
      link: '/patients',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Nova Consulta',
      description: 'Agendar consulta',
      icon: CalendarDays,
      link: '/consultations/new',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Plano Alimentar',
      description: 'Criar novo plano',
      icon: FileText,
      link: '/meal-plans/new',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  const statCards = [
    {
      title: 'Total de Pacientes',
      value: stats.totalPatients,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      change: '+12%'
    },
    {
      title: 'Consultas Hoje',
      value: stats.consultationsToday,
      icon: Clock,
      color: 'text-green-600 bg-green-100',
      change: '+5%'
    },
    {
      title: 'Planos Ativos',
      value: stats.activeMealPlans,
      icon: Activity,
      color: 'text-purple-600 bg-purple-100',
      change: '+8%'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${stats.completionRate}%`,
      icon: Target,
      color: 'text-orange-600 bg-orange-100',
      change: '+3%'
    }
  ]

  const recentPatients = patients.slice(-5).reverse()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao seu painel de controle nutricional</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {/* <p className="text-sm text-green-600 mt-1">{stat.change} vs mês anterior</p> */}
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} text-white p-6 rounded-xl transition-colors duration-200 block`}
            >
              <div className="flex items-center">
                <action.icon className="w-8 h-8 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
                <Plus className="w-5 h-5 ml-auto" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pacientes Recentes</h2>
            <Link to="/patients" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos
            </Link>
          </div>
          <div className="space-y-4">
            {recentPatients.length > 0 ? (
              recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-500">{patient.email}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum paciente cadastrado ainda</p>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Atividade Recente</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Sistema iniciado com sucesso</p>
                <p className="text-xs text-gray-500">Há 2 minutos</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Dashboard carregado</p>
                <p className="text-xs text-gray-500">Há 5 minutos</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Dashboard
