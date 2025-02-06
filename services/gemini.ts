import { GeminiResponse } from "../types";

const GEMINI_API_KEY = "AIzaSyDmRxYJVe99wvGKUe4PK_mFiVXaqXISrUk"; // Replace with your actual API key
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Gemini API");
      }

      const data = (await response.json()) as GeminiResponse;
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  public async processVoiceCommand(command: string): Promise<string> {
    const prompt = `You are ParkEaze, a parking assistant AI. Process this voice command and respond naturally: "${command}"`;
    return this.generateResponse(prompt);
  }
}

export default GeminiService.getInstance();
