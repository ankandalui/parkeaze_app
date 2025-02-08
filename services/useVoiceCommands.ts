import { useEffect, useRef } from "react";

interface VoiceCommandHookProps {
  onNextDirection: () => void;
  isListening: boolean;
}

export const useVoiceCommands = ({
  onNextDirection,
  isListening,
}: VoiceCommandHookProps) => {
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const startListening = async () => {
    try {
      const response = await fetch("http://172.16.16.165:5000/listen");

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse the JSON response
      const data = await response.json();

      if (data.success && data.command === "next_direction") {
        onNextDirection();
      }
    } catch (error) {
      // More detailed error logging
      if (error instanceof SyntaxError) {
        console.error("Voice command error: Invalid JSON response from server");
      } else {
        console.error(
          "Voice command error:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  };

  useEffect(() => {
    if (isListening) {
      // Poll the voice command server every 2 seconds
      pollRef.current = setInterval(startListening, 2000);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [isListening, onNextDirection]);
};
