
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Weight, Ruler, FileText, TrendingUp, TrendingDown, Activity, Stethoscope, ChefHat, User, Plus, Edit } from 'lucide-react'
import { usePatients, Patient } from '../hooks/usePatients'
import { useConsultations } from '../hooks/useConsultations'
import { useMealPlans } from '../hooks/useMealPlans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { calculateAge, calculateBMI, parseGender } from '@/lib/utils'
import EditPatientModal from '@/components/EditPatientModal'

const PatientHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { getPatientById } = usePatients()
  const { fetchConsultationsByPatient, consultations } = useConsultations()
  const { fetchMealPlansByPatient, mealPlans } = useMealPlans()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const { updatePatient } = usePatients()

  useEffect(() => {
    if (id) {
      loadPatientData()
    }
  }, [id])

  const loadPatientData = async () => {
    if (!id) return

    try {
      console.log("resloading patient data...")
      setLoading(true)
      const patientData = await getPatientById(id)
      setPatient(patientData)

      await fetchConsultationsByPatient(id)
      await fetchMealPlansByPatient(id)
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getWeightTrend = () => {
    if (consultations.length < 2) return null

    const sortedConsultations = [...consultations].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const firstWeight = sortedConsultations[0]?.weight
    const lastWeight = sortedConsultations[sortedConsultations.length - 1]?.weight

    if (!firstWeight || !lastWeight) return null

    const difference = lastWeight - firstWeight
    return {
      difference: Math.abs(difference),
      trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Paciente não encontrado</p>
          <Link to="/patients" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para lista de pacientes
          </Link>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const sortedConsultations = [...consultations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const sortedMealPlans = [...mealPlans].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const latestConsultation = sortedConsultations[0]

  const weightTrend = getWeightTrend()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/patients"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para pacientes
        </Link>

        {/* Patient Overview */}
        <Card>
          <CardHeader>
          </CardHeader>

          <CardContent>
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-green-600 text-primary-foreground text-lg">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{patient.name}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {calculateAge(patient.birthDate)} anos
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {parseGender(patient.gender)}
                    </span>
                  </div>

                  {patient.weight && patient.height && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Weight className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {patient.weight} kg
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Ruler className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {patient.height} cm
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {patient.weight && patient.height && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        IMC Atual: {calculateBMI(patient.weight, patient.height)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Link to={`/consultations/${patient.id}/new`}>
                  <Button size="sm" variant="outline" className="w-full">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Nova Consulta
                  </Button>
                </Link>

                <Link to={`/new-meal-plan?patientId=${patient.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <ChefHat className="h-4 w-4 mr-2" />
                    Novo Plano
                  </Button>
                </Link>

                <Button variant="outline" size="sm" className="w-full"
                  onClick={() => { setEditingPatient(patient) }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditPatientModal
        patient={editingPatient}
        onsubmit={async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          if (!editingPatient) return

          const formData = new FormData(event.currentTarget)

          const updatedPatient = {
            ...editingPatient,
            name: formData.get('name') as string,
            gender: formData.get('gender') as string,
            birthDate: formData.get('birthDate') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            weight: Number(formData.get('weight')),
            height: Number(formData.get('height')),
          }

          try {
            const {data} = await updatePatient(editingPatient.id, updatedPatient)
            setPatient(data)
            setEditingPatient(null)
          } catch (error) {
            console.error('Erro ao atualizar paciente:', error)
          }
        }}

        oncancel={() => {
          setEditingPatient(null)
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total de Consultas</p>
              <p className="text-2xl font-bold text-gray-900">{consultations.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Planos Alimentares</p>
              <p className="text-2xl font-bold text-gray-900">{mealPlans.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Peso Atual</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultations.length > 0
                  ? `${consultations[consultations.length - 1]?.weight || 'N/A'} kg`
                  : 'N/A'
                }
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Weight className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tendência de Peso</p>
              <div className="flex items-center">
                {weightTrend ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900 mr-2">
                      {weightTrend.difference.toFixed(1)} kg
                    </p>
                    {weightTrend.trend === 'up' && <TrendingUp className="w-5 h-5 text-red-500" />}
                    {weightTrend.trend === 'down' && <TrendingDown className="w-5 h-5 text-green-500" />}
                    {weightTrend.trend === 'stable' && <span className="text-gray-500">Estável</span>}
                  </>
                ) : (
                  <p className="text-lg text-gray-500">N/A</p>
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <Ruler className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Consultation History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Histórico de Consultas</span>
              </div>
              <span className="text-sm text-gray-500">
                {consultations.length} consulta{consultations.length !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {consultations.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhuma consulta registrada</p>
                <Link to={`/consultations/${patient.id}/new`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Primeira Consulta
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sortedConsultations.map((consultation, index) => (
                  <div
                    key={consultation.id}
                    className={`p-4 rounded-lg border ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(consultation.date)}
                        {index === 0 && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Mais recente
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {consultation.weight} kg
                      </div>
                    </div>

                    {consultation.fatPercent && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">% Gordura:</span>
                          <div className="font-medium">{consultation.fatPercent}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Massa Magra:</span>
                          <div className="font-medium">{consultation.leanMass} kg</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Massa Gorda:</span>
                          <div className="font-medium">{consultation.fatMass} kg</div>
                        </div>
                      </div>
                    )}

                    {consultation.notes && (
                      <div className="mt-2 text-xs text-gray-600">
                        {consultation.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Planos Alimentares */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Planos Alimentares</h2>

          {mealPlans.length > 0 ? (
            <div className="space-y-4">
              {mealPlans
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((mealPlan) => (
                  <div key={mealPlan.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatDate(mealPlan.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {mealPlan.calories} calorias
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      <p className="whitespace-pre-wrap">{mealPlan.content}</p>
                    </div>
                    {mealPlan.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Observações: {mealPlan.notes}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhum plano alimentar criado ainda
            </p>
          )}
        </div>
      </div>

      {/* Medical History */}
      {/* {patient.medicalHistory && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico Médico</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{patient.medicalHistory}</p>
          </div>
        </div>
      )} */}
    </div>
  )
}

export default PatientHistory
