import { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { ParkingSpotType, ParkingSearchFilters } from "@/types";
import { calculateDistance } from "@/utils/locationUtils";

const SEARCH_RADIUS_KM = 5;

export const useParkingSpots = (
  location?: { latitude: number; longitude: number },
  filters?: ParkingSearchFilters
) => {
  const [spots, setSpots] = useState<ParkingSpotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchSpots = async () => {
      try {
        setLoading(true);
        const spotsRef = collection(firestore, "parking_spots");

        let parkingQuery = query(spotsRef, orderBy("name"));

        if (filters?.type && filters.type !== "all") {
          parkingQuery = query(parkingQuery, where("type", "==", filters.type));
        }

        if (filters?.minAvailableSpots) {
          parkingQuery = query(
            parkingQuery,
            where("availableSpots", ">=", filters.minAvailableSpots)
          );
        }

        // Set up real-time listener
        unsubscribe = onSnapshot(
          parkingQuery,
          (snapshot) => {
            const parkingSpots: ParkingSpotType[] = [];

            snapshot.forEach((doc) => {
              const spot = {
                id: doc.id,
                ...(doc.data() as Omit<ParkingSpotType, "id">),
              };

              // Client-side filtering for location if provided
              if (location) {
                const distance = calculateDistance(
                  location.latitude,
                  location.longitude,
                  spot.latitude,
                  spot.longitude
                );

                if (distance <= (filters?.radius || SEARCH_RADIUS_KM)) {
                  parkingSpots.push(spot);
                }
              } else {
                parkingSpots.push(spot);
              }
            });

            // Client-side filtering for price if needed
            if (filters?.maxPrice) {
              const maxPrice = filters.maxPrice;
              const filteredSpots = parkingSpots.filter(
                (spot) => !spot.price || spot.price <= maxPrice
              );
              setSpots(filteredSpots);
            } else {
              setSpots(parkingSpots);
            }

            setLoading(false);
          },
          (error) => {
            console.error("Error fetching parking spots:", error);
            setError("Failed to fetch parking spots");
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error setting up parking spots listener:", error);
        setError("Failed to set up parking spots listener");
        setLoading(false);
      }
    };

    fetchSpots();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [location, filters]);

  return { spots, loading, error };
};
