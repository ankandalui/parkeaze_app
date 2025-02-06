import { useState, useCallback } from "react";
import { Place } from "@/types";
import { debounce } from "lodash";

const GOOGLE_MAPS_API_KEY = "AIzaSyDrIlKE-OzCydDLFrnffUK3Lazd3A3n7vg"; // Replace with your API key

export const useLocationSearch = () => {
  const [predictions, setPredictions] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);

  const searchPlaces = useCallback(
    debounce(
      async (
        text: string,
        location?: { latitude: number; longitude: number },
        parkingSpots?: Place[]
      ) => {
        if (!text) {
          setPredictions([]);
          return;
        }

        try {
          setSearching(true);
          const locationString = location
            ? `&location=${location.latitude},${location.longitude}&radius=50000`
            : "";

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
              text
            )}&key=${GOOGLE_MAPS_API_KEY}${locationString}&types=establishment|geocode`
          );

          const data = await response.json();
          if (data.predictions) {
            // Combine parking spots with place predictions
            const combinedPredictions = [
              ...(parkingSpots || []),
              ...data.predictions,
            ];
            setPredictions(combinedPredictions);
          }
        } catch (error) {
          console.error("Error fetching predictions:", error);
          setPredictions(parkingSpots || []);
        } finally {
          setSearching(false);
        }
      },
      300
    ),
    []
  );

  return { predictions, searching, searchPlaces };
};
