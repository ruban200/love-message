
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ImageSize, AspectRatio } from "../types";

export const generateLoveContent = async (
  sender: string,
  receiver: string,
  memory: string,
  vibe: string
): Promise<{ letter: string; poem: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Write a romantic love proposal. 
  Sender: ${sender}
  Receiver: ${receiver}
  A special memory: ${memory}
  Vibe: ${vibe}
  
  Format the response as JSON with two fields: "letter" (a heartfelt 2-paragraph letter) and "poem" (a sweet 4-line poem).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          letter: { type: Type.STRING },
          poem: { type: Type.STRING }
        },
        required: ['letter', 'poem']
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    letter: data.letter || "My dearest, you mean the world to me.",
    poem: data.poem || "Roses are red, violets are blue, my heart is forever with you."
  };
};

export const generateRomanticImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize
): Promise<string | undefined> => {
  // Check for API key selection state as required for Pro Image models
  // @ts-ignore
  const hasKey = await window.aistudio?.hasSelectedApiKey();
  if (!hasKey) {
    // @ts-ignore
    await window.aistudio?.openSelectKey();
    // Proceed immediately to handle potential race condition as per guidelines
  }

  // Create a new instance right before the call to ensure the latest selected key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `A high-quality romantic digital illustration of ${prompt}, cute teddy bear style, soft pastel colors, dreamy atmosphere, professional cinematic lighting, 4k detail.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error: any) {
    // Convert error to string to catch nested properties in the JSON response
    const errorString = JSON.stringify(error);
    const errorMsg = error.message || "";
    
    // Check for various permission or project-related errors
    if (
      errorString.includes("PERMISSION_DENIED") || 
      errorString.includes("403") ||
      errorMsg.includes("permission") ||
      errorMsg.includes("not found")
    ) {
      console.warn("API Key issue or Permission Denied. Triggering key selection dialog.");
      // @ts-ignore
      await window.aistudio?.openSelectKey();
      // Re-throw or return undefined so the UI can handle the retry
    }
    console.error("Image generation failed:", error);
  }
  return undefined;
};
