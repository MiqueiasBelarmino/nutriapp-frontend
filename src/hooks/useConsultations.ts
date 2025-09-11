
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '@/lib/lumi'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Consultation {
  id: string
  patientId: string
  date: string
  weight: number
  triceps?: number
  subscapular?: number
  suprailiac?: number
  abdominal?: number
  waistCirc?: number
  abdomenCirc?: number
  fatFormula?: 'Faulkner' | 'Pollock' | 'Jackson'
  fatPercent?: number
  leanMass?: number
  fatMass?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export const useConsultations = (patientId?: string) => {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/consultations');
      
      let filteredConsultations = data || []
      if (patientId) {
        filteredConsultations = filteredConsultations.filter(
          (consultation: Consultation) => consultation.patientId === patientId
        )
      }
      
      setConsultations(filteredConsultations)
    } catch (error) {
      console.error('Failed to fetch consultations:', error)
      toast.error('Erro ao carregar consultas')
    } finally {
      setLoading(false)
    }
  }

  const createConsultation = async (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString()
      const newConsultation = await api.post('/consultations',{
        ...consultationData,
        createdAt: now,
        updatedAt: now
      })
      
      await fetchConsultations()
      toast.success('Consulta criada com sucesso!')
      return newConsultation
    } catch (error) {
      console.error('Failed to create consultation:', error)
      toast.error('Erro ao criar consulta')
      throw error
    }
  }

  const updateConsultation = async (consultationId: string, updates: Partial<Consultation>) => {
    try {
      const updatedConsultation = await lumi.entities.consultations.update(consultationId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      await fetchConsultations()
      toast.success('Consulta atualizada com sucesso!')
      return updatedConsultation
    } catch (error) {
      console.error('Failed to update consultation:', error)
      toast.error('Erro ao atualizar consulta')
      throw error
    }
  }

  const deleteConsultation = async (consultationId: string) => {
    try {
      await lumi.entities.consultations.delete(consultationId)
      await fetchConsultations()
      toast.success('Consulta removida com sucesso!')
    } catch (error) {
      console.error('Failed to delete consultation:', error)
      toast.error('Erro ao remover consulta')
      throw error
    }
  }

  // Get consultations from current month
  const getMonthlyConsultations = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return consultations.filter(consultation => {
      const consultationDate = new Date(consultation.date)
      return consultationDate.getMonth() === currentMonth && 
             consultationDate.getFullYear() === currentYear
    })
  }

  const fetchConsultationsByPatient = useCallback(async (patientId: string) => {
    setLoading(true)
    try {
      const { data } = await api.get('/consultations');
      const allConsultations = data as unknown as Consultation[]
      const patientConsultations = allConsultations.filter(
        (consultation) => consultation.patientId === patientId
      )
      setConsultations(patientConsultations)
    } catch (error) {
      console.error('Erro ao buscar consultas do paciente:', error)
      toast.error('Erro ao carregar consultas do paciente')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConsultations()
  }, [patientId])

  return {
    consultations,
    loading,
    fetchConsultations,
    createConsultation,
    updateConsultation,
    deleteConsultation,
    getMonthlyConsultations,
    fetchConsultationsByPatient
  }
}
