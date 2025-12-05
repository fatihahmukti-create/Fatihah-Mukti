
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FoodLogEntry, ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const analyzeFoodWithGemini = async (
  imageBase64: string | null,
  textDescription: string,
  history: ChatMessage[],
  profile: UserProfile,
  todaysLogs: FoodLogEntry[]
) => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const modelId = "gemini-2.5-flash"; 

  // Calculate context data
  const consumedCals = todaysLogs.reduce((acc, log) => acc + log.food.calories, 0);
  const consumedProtein = todaysLogs.reduce((acc, log) => acc + log.food.protein, 0);
  const remainingCals = profile.targetCalories - consumedCals;
  
  const languageInstruction = profile.language === 'id' 
    ? "ALWAYS Respond in Indonesian (Bahasa Indonesia). Gunakan bahasa yang gaul, ramah, tapi tetap sopan." 
    : "Respond in English.";

  const contextPrompt = `
    CURRENT USER CONTEXT:
    - Name: ${profile.name}
    - Goal: ${profile.goal}
    - Daily Target: ${profile.targetCalories} kcal
    - Consumed Today: ${consumedCals} kcal (${remainingCals} left)
    - Protein Consumed: ${consumedProtein}g (Target: ${profile.targetProtein}g)
    
    RECENT MEALS LOGGED TODAY:
    ${todaysLogs.map(l => `- ${l.food.name} (${l.food.calories}kcal)`).join('\n')}
  `;

  const systemInstruction = `
    You are NutriTrack, a smart, friendly, and empathetic nutritionist AI. 
    ${languageInstruction}

    YOUR PERSONALITY:
    - Friendly and encouraging (like a supportive coach).
    - If the user eats something unhealthy, gently suggest a healthier alternative for next time or suggest a small activity (e.g., "Maybe take a 10-minute walk?"), but NEVER judge or shame them.
    - If they eat well, praise them!
    - Be proactive: Suggest what they might need next based on their macros (e.g., "You're low on protein, how about chicken for dinner?").
    - Remember previous context from the chat history.

    YOUR TASKS:
    1. Analyze the user's input (Text or Image).
    2. Identify if it is food.
    3. If it IS food, estimate the nutrition strictly.
    4. If it is NOT food, just chat conversationally about health/diet.
    
    OUTPUT FORMAT:
    Return JSON ONLY.
  `;

  // Construct history for the prompt (Last 5 messages for context)
  const recentHistory = history.slice(-5).map(msg => 
    `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.text}`
  ).join('\n');

  const fullPrompt = `
    ${systemInstruction}

    HISTORY OF CONVERSATION:
    ${recentHistory}

    CONTEXT:
    ${contextPrompt}

    CURRENT USER INPUT:
    ${textDescription}
    ${imageBase64 ? "[Image Attached]" : ""}
  `;

  const parts: any[] = [{ text: fullPrompt }];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: "Your friendly, conversational response including advice/critique." },
            isFood: { type: Type.BOOLEAN, description: "True if food was identified and needs logging." },
            foodData: {
              type: Type.OBJECT,
              description: "Nutritional data if isFood is true",
              properties: {
                name: { type: Type.STRING, description: "Short descriptive name of the food" },
                portion: { type: Type.STRING, description: "Estimated portion (e.g., 1 bowl, 200g)" },
                calories: { type: Type.NUMBER, description: "Total calories (kcal)" },
                protein: { type: Type.NUMBER, description: "Protein in grams" },
                carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
                fat: { type: Type.NUMBER, description: "Fat in grams" },
                micros: {
                  type: Type.OBJECT,
                  properties: {
                    vitaminA: { type: Type.NUMBER, description: "Vitamin A % DV (approx)" },
                    vitaminC: { type: Type.NUMBER, description: "Vitamin C % DV (approx)" },
                    calcium: { type: Type.NUMBER, description: "Calcium % DV (approx)" },
                    iron: { type: Type.NUMBER, description: "Iron % DV (approx)" },
                  }
                }
              },
              required: ["name", "portion", "calories", "protein", "carbs", "fat"],
            }
          },
          required: ["message", "isFood"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No data returned from AI");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
