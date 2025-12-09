export interface MealItem {
  id: string
  foodName: string
  quantity?: string
  substitutes?: MealItem[]
}