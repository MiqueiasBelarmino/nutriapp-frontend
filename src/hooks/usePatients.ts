
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api';

export interface Patient {
  id: string
  name: string
  gender: string
  birthDate: string
  weight?: number
  height?: number
  email: string
  userId: string
  createdAt: string
  updatedAt: string
  phone?: string
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/patients');
      setPatients(data as unknown as Patient[])
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
      toast.error('Erro ao carregar pacientes')
    } finally {
      setLoading(false)
    }
  }, [])

  const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const now = new Date().toISOString()
      const newPatient = await api.post('/patients', {
        ...patientData,
        createdAt: now,
        updatedAt: now
      })
      
      await fetchPatients()
      toast.success('Paciente criado com sucesso!')
      return newPatient
    } catch (error) {
      console.error('Failed to create patient:', error)
      toast.error('Erro ao criar paciente')
      throw error
    }
  }

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    try {
      const updatedPatient = await api.put(`/patients/${patientId}`, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      await fetchPatients()
      toast.success('Paciente atualizado com sucesso!')
      return updatedPatient
    } catch (error) {
      console.error('Failed to update patient:', error)
      toast.error('Erro ao atualizar paciente')
      throw error
    }
  }

  const deletePatient = async (patientId: string) => {
    try {
      await api.delete(`/patients/${patientId}`)
      await fetchPatients()
      toast.success('Paciente removido com sucesso!')
    } catch (error) {
      console.error('Failed to delete patient:', error.response.data.message)
      toast.error(error?.response?.data?.message ?? 'Erro ao remover paciente')
      throw error
    }
  }

  const getPatientById = useCallback(async (id: string) => {
    try {
      // Buscar na lista de pacientes já carregados
      await fetchPatients()
      const patient = patients.find(p => p.id === id)
      if (patient) {
        return patient
      }
      
      // Se não encontrou, buscar novamente
      const { data } = await api.get('/patients');
      const allPatients = data as unknown as Patient[]
      const foundPatient = allPatients.find(p => p.id === id)
      
      if (!foundPatient) {
        throw new Error('Paciente não encontrado')
      }
      
      return foundPatient
    } catch (error) {
      console.error('Erro ao buscar paciente:', error)
      toast.error('Erro ao carregar dados do paciente')
      throw error
    }
  }, [patients])

  useEffect(() => {
    fetchPatients()
  }, [])

  return {
    patients,
    loading,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById
  }
}
