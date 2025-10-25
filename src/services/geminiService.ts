import { GoogleGenAI } from "@google/genai";
import type { UserLocation, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchDestinationInfo(query: string, location: UserLocation | null) {
  try {
    const prompt = `日本の観光地「${query}」について、その魅力、歴史、見どころなどを詳しく教えてください。また、関連するウェブサイトや地図情報も提供してください。`;
    
    const config: any = {
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    };

    if (location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config,
    });

    const text = response.text;
    const groundingChunks: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, groundingChunks };
  } catch (error) {
    console.error("Error fetching destination info:", error);
    throw new Error("Failed to fetch data from Gemini API.");
  }
}
