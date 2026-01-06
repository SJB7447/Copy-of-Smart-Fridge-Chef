
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
  cuisineType: string; // 한식, 일식, 중식, 양식 등
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  chefTips?: string[];
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
