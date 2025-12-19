export interface MealItem {
  id: string
  foodId: string
  food?: {
    id: string
    name: string
    servingQuantity?: number
    servingUnit?: string
    calories?: number
    protein?: number
    carbs?: number
    fats?: number
    fiber?: number
    sodium?: number
  }
  quantity?: string
  observation?: string
  substitutes?: MealItem[]
}