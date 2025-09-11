
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePatients } from '@/hooks/usePatients'
import { useMealPlans, type MealPlan } from '@/hooks/useMealPlans'
import RichTextEditor from '@/components/RichTextEditor'
import {ArrowLeft, Utensils, Edit3, Save, X, Calendar, User, Zap, FileText, Clock} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MealPlanDetail: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { patients, fetchPatients } = usePatients()
  const { mealPlans, fetchMealPlans, updateMealPlan } = useMealPlans()
  
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    content: '',
    // calories: '',
    notes: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchPatients(), fetchMealPlans()])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [fetchPatients, fetchMealPlans])

  useEffect(() => {
    if (id && mealPlans.length > 0) {
      const foundMealPlan = mealPlans.find(mp => mp.id === id)
      if (foundMealPlan) {
        setMealPlan(foundMealPlan)
        setFormData({
          patientId: foundMealPlan.patientId,
          date: foundMealPlan.date.split('T')[0],
          content: foundMealPlan.content,
        //   calories: foundMealPlan.calories.toString(),
          notes: foundMealPlan.notes || ''
        })
      }
    }
  }, [id, mealPlans])

  const handleSave = async () => {
    if (!mealPlan || !formData.patientId || !formData.content) {
      return
    }

    setSaving(true)
    try {
      await updateMealPlan(mealPlan.id, {
        patientId: formData.patientId,
        date: new Date(formData.date).toISOString(),
        content: formData.content,
        // calories: Number(formData.calories),
        notes: formData.notes || undefined
      })
      
      setIsEditing(false)
      // Recarregar dados
      await fetchMealPlans()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (mealPlan) {
      setFormData({
        patientId: mealPlan.patientId,
        date: mealPlan.date.split('T')[0],
        content: mealPlan.content,
        // calories: mealPlan.calories.toString(),
        notes: mealPlan.notes || ''
      })
    }
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando plano alimentar...</p>
        </div>
      </div>
    )
  }

  if (!mealPlan) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Plano não encontrado</h2>
          <p className="text-gray-600 mb-6">O plano alimentar solicitado não foi encontrado.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const patient = patients.find(p => p.id === mealPlan.patientId)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Plano Alimentar' : 'Detalhes do Plano Alimentar'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Modifique as informações do plano' : 'Visualize e gerencie o plano alimentar'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving || !formData.patientId || !formData.content}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Patient Info Card */}
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações do Paciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{patient.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Utensils className="h-5 w-5" />
            <span>Informações do Plano</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditing ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Data do Plano</p>
                    <p className="font-medium">
                      {format(new Date(mealPlan.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                {/* <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Calorias Totais</p>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {mealPlan.calories} kcal
                    </Badge>
                  </div>
                </div> */}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Criado em</p>
                    <p className="font-medium">
                      {format(new Date(mealPlan.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                {mealPlan.updatedAt !== mealPlan.createdAt && (
                  <div className="flex items-center space-x-2">
                    <Edit3 className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Última atualização</p>
                      <p className="font-medium">
                        {format(new Date(mealPlan.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="patientId">Paciente *</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={handleSelectChange('patientId')}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data do Plano *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              {/* <div className="space-y-2 md:col-span-2">
                <Label htmlFor="calories">Calorias Totais *</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => handleInputChange('calories', e.target.value)}
                  placeholder="Ex: 2000"
                  className="max-w-xs"
                  required
                />
              </div> */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Conteúdo do Plano Alimentar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: mealPlan.content }}
            />
          ) : (
            <div className="space-y-2">
              <Label>Plano Alimentar Detalhado *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Descreva o plano alimentar detalhado..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {(mealPlan.notes || isEditing) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Observações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <p className="text-gray-700 whitespace-pre-wrap">
                {mealPlan.notes || 'Nenhuma observação adicional.'}
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Adicionais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações, restrições, orientações especiais..."
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MealPlanDetail
