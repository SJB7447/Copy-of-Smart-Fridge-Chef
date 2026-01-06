
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, MealTime, Store } from "../types";

const apiKey = process.env.API_KEY || "";

/**
 * 셰프의 시각으로 보는 요리 이미지 생성
 */
export const generateRecipeImage = async (recipeName: string, description: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `A professional cinematic food photography of ${recipeName}. ${description}. Realistic and authentic presentation suitable for its cuisine type. Rustic kitchen background, warm lighting, extreme detail, 8k.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "4:3" } },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image generation failed", error);
    return undefined;
  }
};

/**
 * 전 세계의 다양한 요리 스타일을 아우르는 레시피 제안
 */
export const generateRecipes = async (ingredients: string[], mealTime: MealTime): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `마스터 셰프님, 냉장고에 ${ingredients.join(", ")}가 있습니다. ${mealTime} 식사로 초보자도 실패 없이 만들 수 있는 '한식, 일식, 중식, 양식' 중 가장 잘 어울리는 특선 레시피 3가지를 다채롭게 제안해 주세요.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `당신은 전 세계 모든 요리 장르에 정통한 글로벌 미쉐린 스타 셰프입니다. 
        제공된 재료를 바탕으로 한식(Korean), 일식(Japanese), 중식(Chinese), 양식(Western) 중 가장 훌륭한 조화를 이루는 레시피 3가지를 선정하세요. 
        가급적이면 제안하는 3가지 요리의 국적이 서로 겹치지 않게 다양하게 구성해 주세요 (예: 하나는 한식, 하나는 양식, 하나는 일식).
        
        레시피 작성 시 다음 지침을 반드시 따르세요:
        1. 조리 단계(steps)는 아주 구체적이어야 합니다 (예: '중불에서 3분간', '고기가 갈색이 될 때까지', '종이컵 반 분량').
        2. 'cuisineType'에는 '정통 한식', '모던 일식', '중화풍 창작 요리', '클래식 프렌치' 등 요리의 국적과 성격을 명확히 기재하세요.
        3. 'chefTips' 섹션을 만들어 요리의 성패를 결정짓는 결정적인 팁이나 재료 손질법, 대체 가능한 재료 정보를 3-4개 포함하세요.
        4. 요리 이름은 품격 있고 먹음직스럽게 지어주세요.
        5. 말투는 우아하면서도 용기를 주는 스타일로 작성하세요.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              recipeName: { type: Type.STRING },
              cuisineType: { type: Type.STRING, description: "요리의 종류 (한식, 일식, 중식, 양식 등)" },
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
              chefTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              cookingTime: { type: Type.STRING },
              calories: { type: Type.STRING }
            },
            required: ["recipeName", "cuisineType", "description", "ingredients", "steps", "chefTips", "cookingTime"]
          }
        }
      }
    });

    return JSON.parse(response.text.trim()) as Recipe[];
  } catch (error) {
    throw new Error("셰프의 레시피를 가져오는 데 실패했습니다.");
  }
};

/**
 * 주변의 신선한 식재료 매장을 검색 (Google Maps Grounding)
 */
export const searchNearbyMarts = async (lat: number, lng: number): Promise<Store[]> => {
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "이 근처에서 신선한 식재료를 살 수 있는 대형 마트, 슈퍼마켓, 또는 유기농 식품점 5곳을 이름과 함께 찾아주세요.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { 
          retrievalConfig: { 
            latLng: { latitude: lat, longitude: lng } 
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
    return Array.from(new Map(stores.map(s => [s.name, s])).values()).slice(0, 5);
  } catch (error) {
    console.error("Store search failed", error);
    return [];
  }
};

export const identifyIngredientsFromImage = async (base64Image: string, mimeType: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ inlineData: { data: base64Image, mimeType } }, { text: "식재료 리스트를 JSON 배열로 알려주세요." }] },
      config: {
        systemInstruction: "식재료 식별 전문가. JSON 배열만 반환.",
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
    });
    return JSON.parse(response.text.trim()) as string[];
  } catch (error) {
    throw new Error("재료 분석 오류");
  }
};
