import { GoogleGenAI, Type } from "@google/genai";
import { Property } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function aiSearchProperties(query: string, properties: Property[]): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a helpful real estate assistant. Given a user query and a list of properties, return the IDs of the properties that best match the query.
      
      User Query: "${query}"
      
      Properties:
      ${JSON.stringify(properties.map(p => ({ id: p.id, title: p.title, description: p.description, price: p.price, location: p.location, type: p.type, amenities: p.amenities })))}
      
      Return ONLY a JSON array of property IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Search Error:", error);
    return [];
  }
}

export async function getAiRecommendations(userPreferences: string, properties: Property[]): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the user's preferences: "${userPreferences}", recommend the best properties from the list below.
      
      Properties:
      ${JSON.stringify(properties.map(p => ({ id: p.id, title: p.title, description: p.description, price: p.price, location: p.location, type: p.type, amenities: p.amenities })))}
      
      Return ONLY a JSON array of property IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
}
