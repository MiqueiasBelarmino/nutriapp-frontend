
import { useState, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

export interface MealPlan {
  id: string
  patientId: string
  date: string
  content: string
  calories: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export const useMealPlans = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMealPlans = useCallback(async () => {
    setLoading(true)
    try {
      const { list } = await lumi.entities.mealPlans.list()
      setMealPlans(list as unknown as MealPlan[])
    } catch (error) {
      console.error('Erro ao buscar planos alimentares:', error)
      toast.error('Erro ao carregar planos alimentares')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMealPlansByPatient = useCallback(async (patientId: string) => {
    try {
      const { list } = await lumi.entities.mealPlans.list()
      const allMealPlans = list as unknown as MealPlan[]
      const patientMealPlans = allMealPlans.filter(
        (mealPlan) => mealPlan.patientId === patientId
      )
      setMealPlans(patientMealPlans)
    } catch (error) {
      console.error('Erro ao buscar planos do paciente:', error)
      toast.error('Erro ao carregar planos do paciente')
    }
  }, [])

  const createMealPlan = async (mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMealPlan = await lumi.entities.mealPlans.create({
        ...mealPlanData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      await fetchMealPlans()
      toast.success('Plano alimentar criado com sucesso')
      return newMealPlan
    } catch (error) {
      console.error('Erro ao criar plano alimentar:', error)
      toast.error('Erro ao criar plano alimentar')
      throw error
    }
  }

  const updateMealPlan = async (id: string, updates: Partial<MealPlan>) => {
    try {
      const updatedMealPlan = await lumi.entities.mealPlans.update(id, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      await fetchMealPlans()
      toast.success('Plano alimentar atualizado com sucesso')
      return updatedMealPlan
    } catch (error) {
      console.error('Erro ao atualizar plano alimentar:', error)
      toast.error('Erro ao atualizar plano alimentar')
      throw error
    }
  }

  const deleteMealPlan = async (id: string) => {
    try {
      await lumi.entities.mealPlans.delete(id)
      await fetchMealPlans()
      toast.success('Plano alimentar excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir plano alimentar:', error)
      toast.error('Erro ao excluir plano alimentar')
      throw error
    }
  }

  return {
    mealPlans,
    loading,
    fetchMealPlans,
    fetchMealPlansByPatient,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan
  }
}
