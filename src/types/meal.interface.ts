import { MealItem } from './meal-item.interface';

export interface Meal {
  id: string
  name: string
  items: MealItem[]
}