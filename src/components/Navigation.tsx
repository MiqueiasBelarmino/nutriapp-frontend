
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {Users, Calendar, FileText, Home, LogOut, ChefHat} from 'lucide-react'

const Navigation = () => {
  const location = useLocation()
  const { signOut, user } = useAuth()

  const handleSignOut = () => {
    try {
      signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navItems = [
    {
      to: '/',
      icon: Home,
      label: 'Dashboard',
      isActive: isActive('/')
    },
    {
      to: '/patients',
      icon: Users,
      label: 'Pacientes',
      isActive: isActive('/patients')
    },
    {
      to: '/new-consultation',
      icon: Calendar,
      label: 'Nova Consulta',
      isActive: isActive('/new-consultation')
    },
    {
      to: '/new-meal-plan',
      icon: ChefHat,
      label: 'Novo Plano',
      isActive: isActive('/new-meal-plan')
    }
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">
                NutriDash
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span>Olá, {user?.name.split(' ')[0] || user?.email || 'Usuário'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-2 pb-2">
          <div className="grid grid-cols-3 gap-1">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                    item.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
