
import api from '@/lib/api'
import { MealPlan } from '@/types/meal-plan.interface'
import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export const useMealPlans = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMealPlans = useCallback(async (id?: string) => {
    setLoading(true)
    try {
       if (id) {
        const { data } = await api.get(`/meal-plans/${id}`);
        const mealPlan = data as unknown as MealPlan;
        setMealPlans([mealPlan]);
        return;
      }

      const { data } = await api.get('/meal-plans');
      setMealPlans(data as unknown as MealPlan[])
    } catch (error) {
      console.error('Erro ao buscar planos alimentares:', error)
      toast.error('Erro ao carregar planos alimentares')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMealPlansByPatient = useCallback(async (patientId: string) => {
    try {
      const { data } = await api.get('/meal-plans');
      const allMealPlans = data as unknown as MealPlan[];
      const patientMealPlans = allMealPlans.filter(
        (mealPlan) => mealPlan.patientId === patientId
      );
      setMealPlans(patientMealPlans);
    } catch (error) {
      console.error('Erro ao buscar planos do paciente:', error)
      toast.error('Erro ao carregar planos do paciente')
    }
  }, [])

  const createMealPlan = async (mealPlanData: { patientId: string; date: string; content: any[]; notes?: string }) => {
    try {
      const newMealPlan = await api.post('/meal-plans', {
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
      const updatedMealPlan = await api.put(`/meal-plans/${id}`, {
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
      await api.delete(`/meal-plans/${id}`)
      await fetchMealPlans()
      toast.success('Plano alimentar excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir plano alimentar:', error)
      toast.error('Erro ao excluir plano alimentar')
      throw error
    }
    }

  const generateSuggestion = async (patientId: string) => {
    try {
      const { data } = await api.post('/meal-plans/suggestion', { patientId })
      return data
    } catch (error) {
      console.error('Erro ao gerar sugestão:', error)
      toast.error('Erro ao gerar sugestão de plano alimentar')
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
    deleteMealPlan,
    generateSuggestion
  }
}
