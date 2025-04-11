import * as Speech from "expo-speech";

// Types
interface Coordinates {
  [key: string]: [number, number];
}

interface GeminiPrompt {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiNavigationService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = "AIzaSyDmRxYJVe99wvGKUe4PK_mFiVXaqXISrUk";
    this.baseUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  }

  /**
   * Calculate angle between two points in degrees
   */
  private calculateAngle(
    current: [number, number],
    next: [number, number]
  ): number {
    return (
      (Math.atan2(next[1] - current[1], next[0] - current[0]) * 180) / Math.PI
    );
  }

  /**
   * Calculate distance between two points in meters (assuming 1 pixel = 0.1 meters)
   */
  private calculateDistance(
    current: [number, number],
    next: [number, number]
  ): number {
    const dx = next[0] - current[0];
    const dy = next[1] - current[1];
    return Math.sqrt(dx * dx + dy * dy) * 0.1;
  }

  /**
   * Get direction based on angle
   */
  private getDirection(angle: number): string {
    if (angle >= -20 && angle <= 20) return "go straight";
    if (angle > 20 && angle <= 160) return "turn right";
    if (angle >= -160 && angle < -20) return "turn left";
    return "turn around";
  }

  /**
   * Generate a natural language navigation instruction using Gemini AI
   */
  async getNavigationInstruction(
    currentNode: string,
    nextNode: string,
    coords: Coordinates
  ): Promise<string> {
    const current = coords[currentNode];
    const next = coords[nextNode];

    if (!current || !next) {
      throw new Error(
        `Invalid coordinates for nodes ${currentNode} or ${nextNode}`
      );
    }

    const angle = this.calculateAngle(current, next);
    const distance = this.calculateDistance(current, next);
    const direction = this.getDirection(angle);

    const prompt: GeminiPrompt = {
      contents: [
        {
          parts: [
            {
              text: `Generate a brief, natural voice navigation instruction for moving from Node ${currentNode} to Node ${nextNode}.
                Current position: (${current[0]}, ${current[1]})
                Next position: (${next[0]}, ${next[1]})
                Calculated direction: ${direction}
                Distance: ${distance.toFixed(1)} meters
                
                Requirements:
                - Use the calculated direction: "${direction}"
                - Distance is approximately ${distance.toFixed(0)} meters
                - Keep the instruction brief and natural
                - Format: "<direction> for <distance> meters to reach Node <nextNode>"
                - Return only the instruction text, no additional context
                - Must be suitable for voice navigation`,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(prompt),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response format from Gemini API");
      }

      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fallback to basic instruction if API fails
      return `${direction} for ${distance.toFixed(0)} meters to reach Node ${nextNode}`;
    }
  }

  /**
   * Execute a single navigation step with voice guidance
   */
  async navigateStep(
    currentNode: string,
    nextNode: string,
    coords: Coordinates,
    options: Speech.SpeechOptions = {}
  ): Promise<string | null> {
    try {
      const instruction = await this.getNavigationInstruction(
        currentNode,
        nextNode,
        coords
      );

      // Configure speech options
      const speechOptions: Speech.SpeechOptions = {
        language: "en",
        pitch: 1.0,
        rate: 0.9,
        ...options,
      };

      // Speak the instruction
      await Speech.speak(instruction, speechOptions);

      return instruction;
    } catch (error) {
      console.error("Navigation step error:", error);
      return null;
    }
  }

  /**
   * Announce arrival at destination
   */
  async announceArrival(options: Speech.SpeechOptions = {}): Promise<void> {
    const speechOptions: Speech.SpeechOptions = {
      language: "en",
      pitch: 1.1,
      rate: 0.9,
      ...options,
    };

    await Speech.speak("You have reached your destination", speechOptions);
  }

  /**
   * Stop any ongoing voice navigation
   */
  stopNavigation(): void {
    Speech.stop();
  }

  /**
   * Calculate orientation guidance between nodes
   */
  calculateOrientation(
    currentNode: string,
    nextNode: string,
    coords: Coordinates
  ): { direction: string; distance: number; angle: number } | null {
    try {
      const current = coords[currentNode];
      const next = coords[nextNode];

      if (!current || !next) {
        return null;
      }

      const angle = this.calculateAngle(current, next);
      const distance = this.calculateDistance(current, next);
      const direction = this.getDirection(angle);

      return {
        direction,
        distance,
        angle,
      };
    } catch (error) {
      console.error("Orientation calculation error:", error);
      return null;
    }
  }
}
