import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants.ts";
import { PromptSet } from "../types.ts";

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      setId: {
        type: Type.STRING,
        description: "The identifier of the set (e.g., '프롬프트 세트 1')"
      },
      title: {
        type: Type.STRING,
        description: "The title of the section (e.g., '도입 - [Subject]')"
      },
      fullPrompt: {
        type: Type.STRING,
        description: "The complete, formatted prompt string for this set, including panel descriptions, dialogue, and style instructions, exactly matching the reference format."
      }
    },
    required: ["setId", "title", "fullPrompt"]
  }
};

export const generateComicPrompts = async (manuscript: string, count: number): Promise<PromptSet[]> => {
  try {
    // Re-instantiate to ensure we use the latest API Key if the user re-selected it.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const dynamicInstruction = SYSTEM_INSTRUCTION.replace('{{COUNT}}', count.toString());

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: `Here is the user manuscript. Please convert this into exactly ${count} webtoon prompt sets following the system instructions.` },
            { text: `[MANUSCRIPT START]\n${manuscript}\n[MANUSCRIPT END]` }
          ]
        }
      ],
      config: {
        systemInstruction: dynamicInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(jsonText) as PromptSet[];
    return data;

  } catch (error) {
    console.error("Gemini API Error (Text):", error);
    throw error;
  }
};

export const generateComicImage = async (prompt: string): Promise<string> => {
  try {
    // Re-instantiate to ensure we use the latest API Key if the user re-selected it.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // Nano Banana Pro / Gemini 3 Pro Image
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    // Find image part
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Gemini API Error (Image):", error);
    throw error;
  }
};