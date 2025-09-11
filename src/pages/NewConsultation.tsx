
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Patient, usePatients } from '@/hooks/usePatients'
import { useConsultations } from '@/hooks/useConsultations'
import { calculateBodyFat, calculateBodyComposition, calculateAge } from '@/lib/utils'
import { Stethoscope, ArrowLeft, Calculator } from 'lucide-react'

const NewConsultation: React.FC = () => {
  const navigate = useNavigate()
  const { patients, getPatientById } = usePatients()
  const { createConsultation } = useConsultations()
  const [loading, setLoading] = useState(false)
  const { patientId } = useParams<{ patientId: string }>();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const [formData, setFormData] = useState({
    patientId: patientId || '',
    date: new Date().toISOString().split('T')[0],
    weight: '',
    triceps: '',
    subscapular: '',
    suprailiac: '',
    abdominal: '',
    waistCirc: '',
    abdomenCirc: '',
    fatFormula: '' as 'Faulkner4d' | 'Pollock4d' | 'Jackson3d' | '',
    notes: ''
  })

  const [calculations, setCalculations] = useState({
    fatPercent: 0,
    leanMass: 0,
    fatMass: 0
  })

  useEffect(() => {
    if (!formData.patientId) {
      setSelectedPatient(null)
      return
    }

    // se getPatientById for assíncrono
    const fetchPatient = async () => {
      try {
        const patient = await getPatientById(formData.patientId)
        setSelectedPatient(patient)
      } catch (err) {
        console.error("Erro ao carregar paciente:", err)
        setSelectedPatient(null)
      }
    }

    fetchPatient()
  }, [formData.patientId])

  const calculateResults = () => {
    if (!formData.weight || !formData.fatFormula || !selectedPatient) {
      setCalculations({ fatPercent: 0, leanMass: 0, fatMass: 0 })
      return
    }

    const measurements = {
      triceps: Number(formData.triceps) || 0,
      subscapular: Number(formData.subscapular) || 0,
      suprailiac: Number(formData.suprailiac) || 0,
      abdominal: Number(formData.abdominal) || 0
    }

    const age = calculateAge(selectedPatient.birthDate)
    const fatPercent = calculateBodyFat(
      formData.fatFormula,
      measurements,
      selectedPatient.gender as 'male' | 'female',
      age
    )

    const { fatMass, leanMass } = calculateBodyComposition(Number(formData.weight), fatPercent)

    setCalculations({
      fatPercent,
      leanMass,
      fatMass
    })
  }

  useEffect(() => {
    calculateResults()
  }, [formData.weight, formData.triceps, formData.subscapular, formData.suprailiac, formData.abdominal, formData.fatFormula, selectedPatient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patientId || !formData.weight) return

    setLoading(true)
    try {
      await createConsultation({
        patientId: formData.patientId,
        date: new Date(formData.date).toISOString(),
        weight: Number(formData.weight),
        triceps: formData.triceps ? Number(formData.triceps) : undefined,
        subscapular: formData.subscapular ? Number(formData.subscapular) : undefined,
        suprailiac: formData.suprailiac ? Number(formData.suprailiac) : undefined,
        abdominal: formData.abdominal ? Number(formData.abdominal) : undefined,
        waistCirc: formData.waistCirc ? Number(formData.waistCirc) : undefined,
        abdomenCirc: formData.abdomenCirc ? Number(formData.abdomenCirc) : undefined,
        fatFormula: formData.fatFormula || undefined,
        fatPercent: calculations.fatPercent || undefined,
        leanMass: calculations.leanMass || undefined,
        fatMass: calculations.fatMass || undefined,
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

  // Verificar se há dados suficientes para calcular
  const hasEnoughDataForCalculation = () => {
    if (!formData.weight || !formData.fatFormula || !selectedPatient) return false

    // Verificar se há pelo menos uma medida de dobra cutânea
    const hasMeasurements = formData.triceps || formData.subscapular ||
      formData.suprailiac || formData.abdominal

    return hasMeasurements
  }

  const getFormulaDescription = () => {
    switch (formData.fatFormula) {
      case 'Faulkner4d':
        return 'Fórmula de Faulkner - Utiliza 4 dobras cutâneas (tríceps, subescapular, supra-ilíaca, abdominal)'
      case 'Pollock4d':
        return 'Fórmula de Pollock - Método de 4 dobras com correção por idade'
      case 'Jackson3d':
        return 'Fórmula de Jackson-Pollock - Método de 3 dobras (tríceps, subescapular, supra-ilíaca)'
      default:
        return 'Selecione uma fórmula para ver a descrição'
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Nova Consulta</h1>
          <p className="text-gray-600 mt-2">
            Registre uma nova consulta com avaliação antropométrica
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-2 mb-6">
              <Stethoscope className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Informações Básicas</h2>
            </div>

            <div className="space-y-4">
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

              {selectedPatient && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Paciente:</strong> {selectedPatient.name} •
                    {calculateAge(selectedPatient.birthDate)} anos •
                    {selectedPatient.gender === 'male' ? 'Masculino' : 'Feminino'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Data da Consulta *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Ex: 70.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações da consulta..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Anthropometric Measurements */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">Medidas Antropométricas</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fatFormula">Fórmula para % Gordura</Label>
                <Select
                  value={formData.fatFormula}
                  onValueChange={handleSelectChange('fatFormula')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fórmula" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faulkner4d">Faulkner (4 dobras)</SelectItem>
                    <SelectItem value="Pollock4d">Pollock (4 dobras)</SelectItem>
                    <SelectItem value="Jackson3d">Jackson-Pollock (3 dobras)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.fatFormula && (
                  <p className="text-xs text-gray-600 mt-1">
                    {getFormulaDescription()}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="triceps">Tríceps (mm)</Label>
                  <Input
                    id="triceps"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.triceps}
                    onChange={(e) => handleInputChange('triceps', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscapular">Subescapular (mm)</Label>
                  <Input
                    id="subscapular"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.subscapular}
                    onChange={(e) => handleInputChange('subscapular', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suprailiac">Supra-ilíaca (mm)</Label>
                  <Input
                    id="suprailiac"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.suprailiac}
                    onChange={(e) => handleInputChange('suprailiac', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abdominal">Abdominal (mm)</Label>
                  <Input
                    id="abdominal"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.abdominal}
                    onChange={(e) => handleInputChange('abdominal', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waistCirc">Cintura (cm)</Label>
                  <Input
                    id="waistCirc"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.waistCirc}
                    onChange={(e) => handleInputChange('waistCirc', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abdomenCirc">Abdômen (cm)</Label>
                  <Input
                    id="abdomenCirc"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.abdomenCirc}
                    onChange={(e) => handleInputChange('abdomenCirc', e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculations Results */}
        {hasEnoughDataForCalculation() && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Resultados da Composição Corporal</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Baseado na fórmula: {formData.fatFormula}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {calculations.fatPercent.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-blue-800">Percentual de Gordura</div>
                <div className="text-xs text-blue-600 mt-1">Body Fat Percentage</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {calculations.leanMass.toFixed(1)} kg
                </div>
                <div className="text-sm font-medium text-green-800">Massa Magra</div>
                <div className="text-xs text-green-600 mt-1">Lean Body Mass</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {calculations.fatMass.toFixed(1)} kg
                </div>
                <div className="text-sm font-medium text-orange-800">Massa Gorda</div>
                <div className="text-xs text-orange-600 mt-1">Fat Mass</div>
              </div>
            </div>
          </div>
        )}

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
            disabled={loading || !formData.patientId || !formData.weight}
          >
            {loading ? 'Salvando...' : 'Salvar Consulta'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NewConsultation
