import { Meal } from './meal.interface';

export interface MealPlan {
  id: string
  patientId: string
  date: string
  Meal: Meal[]
  notes?: string
  createdAt?: string
  updatedAt?: string
  content?: any
}