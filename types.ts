
export enum MealTime {
  BREAKFAST = '아침',
  LUNCH = '점심',
  DINNER = '저녁'
}

export interface RecipeIngredient {
  name: string;
  isAvailable: boolean;
}

export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  cookingTime: string;
  calories?: string;
  imageUrl?: string;
}

export interface Store {
  name: string;
  uri: string;
  address?: string;
}

export interface RefrigeratorState {
  ingredients: string[];
  mealTime: MealTime;
}
