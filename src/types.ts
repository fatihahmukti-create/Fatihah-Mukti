
export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
  SNACK = 'Snack',
}

export interface MacroNutrients {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface MicroNutrients {
  vitaminA?: number; // % DV or IU
  vitaminC?: number; // % DV or mg
  calcium?: number; // % DV or mg
  iron?: number; // % DV or mg
}

export interface FoodItem extends MacroNutrients {
  id: string;
  name: string;
  portion: string;
  micros?: MicroNutrients;
  image?: string; // Base64 or URL
  isAiGenerated?: boolean;
}

export interface FoodLogEntry {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  mealType: MealType;
  food: FoodItem;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  language: 'en' | 'id'; // Added language preference
  // Calculated values
  calculatedTdee: number;
  // Actual targets (either calculated or manual)
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  // Manual override
  useManualTargets: boolean;
  manualCalories: number;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  foodData?: FoodItem; // If the message contains a food analysis result
  isLogged?: boolean; // If the user has accepted/logged this food
  timestamp: number;
}
