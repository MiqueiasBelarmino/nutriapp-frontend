
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { usePatients } from '@/hooks/usePatients'
import { useMealPlans } from '@/hooks/useMealPlans'
import RichTextEditor from '@/components/RichTextEditor'
import { ArrowLeft, Utensils } from 'lucide-react'

const NewMealPlan: React.FC = () => {
  const navigate = useNavigate()
  const { patientId } = useParams<{ patientId: string }>()
  const { patients, fetchPatients } = usePatients()
  const { createMealPlan } = useMealPlans()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    calories: '',
    notes: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patientId || !formData.content || !formData.calories) return

    setLoading(true)
    try {
      await createMealPlan({
        patientId: formData.patientId,
        date: new Date(formData.date).toISOString(),
        content: formData.content,
        calories: Number(formData.calories) || 0,
        notes: formData.notes || undefined
      })
      
      navigate('/')
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectedPatient = patients.find(p => p.id === formData.patientId)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">(EM CONSTRUÇÃO) Novo Plano Alimentar</h1>
          <p className="text-gray-600 mt-2">
            Crie um plano alimentar personalizado para o paciente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-6">
            <Utensils className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Informações do Plano</h2>
          </div>
          
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

            <div className="space-y-2">
              <Label htmlFor="calories">Calorias Totais</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                placeholder="Ex: 2000"
              />
            </div>

            {/* {selectedPatient && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Paciente:</strong> {selectedPatient.name}
                </p>
              </div>
            )} */}
          </div>
        </div>

        {/* Meal Plan Content */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Conteúdo do Plano Alimentar</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plano Alimentar Detalhado *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Descreva o plano alimentar detalhado..."
              />
            </div>

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
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.patientId || !formData.content || !formData.calories}
          >
            {loading ? 'Salvando...' : 'Salvar Plano'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NewMealPlan
