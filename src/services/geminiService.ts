import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ProductInput {
  type: string;
  style: string;
  theme: string;
  audience: string;
  palette?: string[];
}

export interface GeneratedProduct {
  name: string;
  prompt: string;
  negativePrompt: string;
  etsyTitle: string;
  tags: string[];
  description: string;
  canvaSpecs: {
    dimensions: string;
    layout: string;
    fonts: string[];
  };
  mockupSuggestion: string;
}

export async function generateProductIdeas(input: ProductInput): Promise<GeneratedProduct[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 creative Etsy digital product ideas for:
      Type: ${input.type}
      Style: ${input.style}
      Theme: ${input.theme}
      Target Audience: ${input.audience}
      Color Palette: ${input.palette?.join(', ') || 'AI Choice'}
      
      Each idea must include:
      - A catchy product name
      - A detailed AI image generation prompt for the product
      - A negative prompt
      - An optimized Etsy title (max 140 chars)
      - 13 SEO tags
      - A persuasive Etsy product description
      - Canva specifications (dimensions, layout tips, suggested fonts)
      - Mockup context/setup suggestions`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            prompt: { type: Type.STRING },
            negativePrompt: { type: Type.STRING },
            etsyTitle: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            description: { type: Type.STRING },
            canvaSpecs: {
              type: Type.OBJECT,
              properties: {
                dimensions: { type: Type.STRING },
                layout: { type: Type.STRING },
                fonts: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["dimensions", "layout", "fonts"]
            },
            mockupSuggestion: { type: Type.STRING }
          },
          required: ["name", "prompt", "negativePrompt", "etsyTitle", "tags", "description", "canvaSpecs", "mockupSuggestion"]
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
