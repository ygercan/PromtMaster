import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface NicheInput {
  type: string;
  audience: string;
  style: string;
  season: string;
}

export interface NicheIdea {
  productType: string;
  targetAudience: string;
  style: string;
  season: string;
  nicheIdea: string;
  reasoning: string;
}

export async function findNicheIdeas(input: NicheInput): Promise<NicheIdea[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as an expert Etsy market researcher. Given the following criteria, suggest 5 creative and low-competition niche product ideas.
      Input Criteria:
      - Product Type: ${input.type}
      - Target Audience: ${input.audience}
      - Style: ${input.style}
      - Season/Occasion: ${input.season}
      
      For each suggestion, provide:
      - Product Type
      - Target Audience
      - Style
      - Season/Occasion
      - Brief description of the niche idea
      - Reasoning why this niche might have low competition and high potential.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            productType: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            style: { type: Type.STRING },
            season: { type: Type.STRING },
            nicheIdea: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["productType", "targetAudience", "style", "season", "nicheIdea", "reasoning"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return [];
  }
}
