
import { FoodLogEntry, UserProfile, WeightEntry, ChatMessage, MealType } from '../types';

const KEYS = {
  PROFILE: 'nutritrack_profile',
  LOGS: 'nutritrack_logs',
  WEIGHT: 'nutritrack_weight',
  CHAT_HISTORY: 'nutritrack_chat_history',
};

// Default Profile
const defaultProfile: UserProfile = {
  name: 'Guest User',
  age: 30,
  gender: 'male',
  weight: 70,
  height: 175,
  activityLevel: 'moderate',
  goal: 'maintain',
  language: 'id', // Default to Indonesian as requested
  calculatedTdee: 2500,
  targetCalories: 2500,
  targetProtein: 150,
  targetCarbs: 300,
  targetFat: 80,
  useManualTargets: false,
  manualCalories: 2500,
};

export const getProfile = (): UserProfile => {
  const data = localStorage.getItem(KEYS.PROFILE);
  return data ? JSON.parse(data) : defaultProfile;
};

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const getLogs = (dateStr: string): FoodLogEntry[] => {
  const allLogs = JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
  return allLogs.filter((log: FoodLogEntry) => log.date === dateStr);
};

export const addLog = (entry: FoodLogEntry) => {
  const allLogs = JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
  allLogs.push(entry);
  localStorage.setItem(KEYS.LOGS, JSON.stringify(allLogs));
};

export const deleteLog = (id: string) => {
  const allLogs = JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
  const newLogs = allLogs.filter((log: FoodLogEntry) => log.id !== id);
  localStorage.setItem(KEYS.LOGS, JSON.stringify(newLogs));
};

export const getWeightHistory = (): WeightEntry[] => {
  const history = JSON.parse(localStorage.getItem(KEYS.WEIGHT) || '[]');
  // If empty, return something based on profile
  if (history.length === 0) {
     const current = getProfile().weight;
     return [{ date: new Date().toISOString().split('T')[0], weight: current }];
  }
  return history;
};

// Chat History Persistence
export const getChatHistory = (): ChatMessage[] => {
    const history = localStorage.getItem(KEYS.CHAT_HISTORY);
    return history ? JSON.parse(history) : [];
};

export const saveChatHistory = (messages: ChatMessage[]) => {
    // Keep only last 50 messages to prevent storage overflow
    const trimmed = messages.slice(-50); 
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(trimmed));
};

export const clearChatHistory = () => {
    localStorage.removeItem(KEYS.CHAT_HISTORY);
}

export const calculateTargets = (p: UserProfile): UserProfile => {
    // Mifflin-St Jeor Equation
    let bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age;
    bmr += p.gender === 'male' ? 5 : -161;

    let multiplier = 1.2;
    switch (p.activityLevel) {
        case 'light': multiplier = 1.375; break;
        case 'moderate': multiplier = 1.55; break;
        case 'active': multiplier = 1.725; break;
        case 'very_active': multiplier = 1.9; break;
    }

    let tdee = Math.round(bmr * multiplier);

    if (p.goal === 'lose') tdee -= 500;
    if (p.goal === 'gain') tdee += 500;

    const calculatedTdee = tdee;

    // Decide whether to use manual or calculated
    const finalCalories = p.useManualTargets ? p.manualCalories : calculatedTdee;

    // Simple Macro Split (30% P, 40% C, 30% F) approx
    return {
        ...p,
        calculatedTdee: calculatedTdee,
        targetCalories: finalCalories,
        targetProtein: Math.round((finalCalories * 0.3) / 4),
        targetCarbs: Math.round((finalCalories * 0.4) / 4),
        targetFat: Math.round((finalCalories * 0.3) / 9),
    };
}
