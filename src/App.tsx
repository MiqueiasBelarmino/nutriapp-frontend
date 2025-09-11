
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Navigation from './components/Navigation'
import { Suspense, lazy, Component, ReactNode } from 'react'

// Lazy loading dos componentes para evitar problemas de bundle
const Login = lazy(() => import('./pages/Login').catch(() => ({ default: () => <div>Erro ao carregar Login</div> })))
const Dashboard = lazy(() => import('./pages/Dashboard').catch(() => ({ default: () => <div>Erro ao carregar Dashboard</div> })))
const Patients = lazy(() => import('./pages/Patients').catch(() => ({ default: () => <div>Erro ao carregar Pacientes</div> })))
const NewPatient = lazy(() => import('./pages/NewPatient').catch(() => ({ default: () => <div>Erro ao carregar Novo Paciente</div> })))
const PatientHistory = lazy(() => import('./pages/PatientHistory').catch(() => ({ default: () => <div>Erro ao carregar Histórico</div> })))
const NewConsultation = lazy(() => import('./pages/NewConsultation').catch(() => ({ default: () => <div>Erro ao carregar Nova Consulta</div> })))
const NewMealPlan = lazy(() => import('./pages/NewMealPlan').catch(() => ({ default: () => <div>Erro ao carregar Novo Plano</div> })))
const MealPlanDetail = lazy(() => import('./pages/MealPlanDetail').catch(() => ({ default: () => <div>Erro ao carregar Detalhes do Plano</div> })))

// Componente de Loading
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
)

// Error Boundary melhorado
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary details:', { error, errorInfo })
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Algo deu errado</h1>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <div className="space-y-2 mb-6">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined })
                }}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Recarregar Página
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left text-sm text-gray-500">
                <summary>Detalhes do erro</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Componente de rota pública
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />

        <Router>
          <Routes>
            {/* Rota de login */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Login />
                  </Suspense>
                </PublicRoute>
              }
            />

            {/* Rotas protegidas */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/new-patient" element={<NewPatient />} />
                      <Route path="/patient-history/:id" element={<PatientHistory />} />
                      <Route path="/new-consultation" element={<NewConsultation />} />
                      <Route path="/consultations/:patientId/new" element={<NewConsultation />} />
                      <Route path="/consultations/new" element={<NewConsultation />} />
                      <Route path="/new-meal-plan" element={<NewMealPlan />} />
                      <Route path="/meal-plans/new" element={<NewMealPlan />} />
                      <Route path="/meal-plan/:id" element={<MealPlanDetail />} />
                      <Route path="/meal-plans/:patientId/new" element={<NewMealPlan />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </main>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  )
}

export default App
