
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, MealTime, Store } from "../types";

const apiKey = process.env.API_KEY || "";

/**
 * Generates a professional food photo for a specific recipe.
 */
export const generateRecipeImage = async (recipeName: string, description: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `A professional food photography shot of ${recipeName}, which is ${description}. Beautifully plated, gourmet presentation, soft natural lighting, high quality, 4k.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3"
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating image:", error);
    return undefined;
  }
};

/**
 * Generates recipes with categorized ingredients.
 */
export const generateRecipes = async (ingredients: string[], mealTime: MealTime): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `냉장고에 있는 재료: ${ingredients.join(", ")}. 식사 시간: ${mealTime}. 
  이 재료들을 주로 활용하여 만들 수 있는 맛있고 실용적인 요리 레시피 3가지를 추천해줘. 
  응답 시 각 요리의 ingredients는 사용자가 현재 '가지고 있는 재료(isAvailable: true)'와 '부족하여 구매가 필요한 재료(isAvailable: false)'로 명확히 구분해서 리스트업해줘.
  답변은 한국어로 작성해줘.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "당신은 전문 요리사입니다. 사용자가 가진 재료와 식사 시간에 맞춰 최고의 레시피 3가지를 제안합니다. 구조화된 JSON 형태로 응답하세요.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              recipeName: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    isAvailable: { type: Type.BOOLEAN }
                  },
                  required: ["name", "isAvailable"]
                }
              },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              cookingTime: { type: Type.STRING },
              calories: { type: Type.STRING }
            },
            required: ["recipeName", "description", "ingredients", "steps", "cookingTime"]
          }
        }
      }
    });

    return JSON.parse(response.text.trim()) as Recipe[];
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("레시피를 생성하는 중에 오류가 발생했습니다.");
  }
};

/**
 * Finds nearby grocery stores using Google Maps grounding.
 */
export const searchNearbyMarts = async (lat: number, lng: number): Promise<Store[]> => {
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "내 주변에 있는 대형 마트나 슈퍼마켓 5곳을 추천해줘.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const stores: Store[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          stores.push({
            name: chunk.maps.title,
            uri: chunk.maps.uri
          });
        }
      });
    }

    return stores;
  } catch (error) {
    console.error("Error searching marts:", error);
    return [];
  }
};

/**
 * Identifies ingredients from a base64 encoded image.
 */
export const identifyIngredientsFromImage = async (base64Image: string, mimeType: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const promptPart = {
    text: "이 냉장고 내부 사진에서 식재료들을 찾아서 한국어 단어 리스트로 알려줘.",
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, promptPart] },
      config: {
        systemInstruction: "식재료 이름들의 JSON 배열 형태여야 합니다.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    return JSON.parse(response.text.trim()) as string[];
  } catch (error) {
    console.error("Error identifying ingredients:", error);
    throw new Error("이미지 분석 오류");
  }
};
