import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { collection, query, onSnapshot } from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { ParkingSpotType } from "@/types";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import io from "socket.io-client";
import Button from "@/components/Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const FILTER_TYPES = ["all", "public", "private"] as const;
type FilterType = (typeof FILTER_TYPES)[number];

interface RealTimeData {
  [key: string]: {
    availableSpots: number;
    slots: {
      [key: string]: boolean;
    };
  };
}

interface SocketData {
  client_id: number;
  parkingId: string;
  output: number;
  slots: {
    [key: string]: boolean;
  };
}

const NearBy = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [spots, setSpots] = useState<ParkingSpotType[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<ParkingSpotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [socketStatus, setSocketStatus] = useState<{
    connected: boolean;
    lastError: string;
    retryCount: number;
    lastMessage: SocketData | null;
  }>({
    connected: false,
    lastError: "",
    retryCount: 0,
    lastMessage: null,
  });

  // Socket Connection Setup
  useEffect(() => {
    console.log("Setting up socket connection...");

    const SOCKET_URL = "https://websocket-parking.onrender.com";
    console.log("Connecting to:", SOCKET_URL);

    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      upgrade: true,
      rememberUpgrade: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 30000,
      autoConnect: true,
      forceNew: true,
    });

    // Connection state tracking
    socket.io.on("open", () => {
      console.log("Transport open");
      setSocketStatus((prev) => ({
        ...prev,
        lastError: "",
        retryCount: 0,
      }));
    });

    socket.io.on("error", (error: { message: any }) => {
      console.log("Transport error:", error);
      setSocketStatus((prev) => ({
        ...prev,
        lastError: error.message || "Transport error",
        retryCount: prev.retryCount + 1,
      }));
    });

    socket.on("connect", () => {
      console.log("Socket Connected! ID:", socket.id);
      setSocketStatus((prev) => ({
        ...prev,
        connected: true,
        lastError: "",
        retryCount: 0,
      }));
      setIsConnected(true);

      // Test message to verify connection
      socket.emit("test", { message: "Hello server" });
    });

    socket.on("connect_error", (error: { message: any }) => {
      console.error("Connection Error:", error.message);
      setSocketStatus((prev) => ({
        ...prev,
        connected: false,
        lastError: error.message,
      }));
      setIsConnected(false);
    });

    socket.on("disconnect", (reason: any) => {
      console.log("Disconnected. Reason:", reason);
      setSocketStatus((prev) => ({
        ...prev,
        connected: false,
        lastError: `Disconnected: ${reason}`,
      }));
      setIsConnected(false);
    });

    socket.on("client_data", (data: SocketData) => {
      console.log("Received data:", data);
      setSocketStatus((prev) => ({
        ...prev,
        lastMessage: data,
      }));

      if (!data) return;

      try {
        if (data.client_id === 1) {
          setRealTimeData((prev) => ({
            ...prev,
            [data.parkingId]: {
              availableSpots: data.output,
              slots: data.slots || {},
            },
          }));
        }
      } catch (error) {
        console.error("Error processing data:", error);
        setSocketStatus((prev) => ({
          ...prev,
          lastError: `Data processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
        }));
      }
    });

    // Initial connection
    try {
      if (!socket.connected) {
        console.log("Attempting initial connection...");
        socket.connect();
      }
    } catch (error) {
      console.error("Initial connection error:", error);
      setSocketStatus((prev) => ({
        ...prev,
        lastError: `Initial connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }));
    }

    return () => {
      console.log("Cleaning up socket connection...");
      socket.disconnect();
    };
  }, []);

  // Location Setup
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission denied",
            "Please enable location services to find nearby parking spots"
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    if (!params.latitude || !params.longitude) {
      getUserLocation();
    } else {
      setUserLocation({
        latitude: parseFloat(params.latitude as string),
        longitude: parseFloat(params.longitude as string),
      });
    }
  }, [params.latitude, params.longitude]);

  // Firestore Data Fetching
  useEffect(() => {
    const spotsRef = collection(firestore, "parking_spots");
    const unsubscribe = onSnapshot(
      query(spotsRef),
      (snapshot) => {
        const parkingSpots: ParkingSpotType[] = [];
        snapshot.forEach((doc) => {
          parkingSpots.push({ id: doc.id, ...doc.data() } as ParkingSpotType);
        });
        console.log("Fetched parking spots:", parkingSpots);
        setSpots(parkingSpots);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching parking spots:", error);
        Alert.alert("Error", "Failed to load parking spots");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtering and Sorting Spots
  useEffect(() => {
    if (spots.length > 0 && userLocation) {
      const filtered = spots.filter((spot) => {
        if (activeFilter !== "all" && spot.type !== activeFilter) {
          return false;
        }

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          spot.latitude,
          spot.longitude
        );
        return distance <= 5;
      });

      const sortedSpots = filtered.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distanceA - distanceB;
      });

      setFilteredSpots(sortedSpots);
    }
  }, [spots, activeFilter, userLocation]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const renderDebugInfo = () => (
    <View style={styles.debugContainer}>
      <View
      // style={[
      //   styles.connectionIndicator,
      //   {
      //     backgroundColor: socketStatus.connected
      //       ? colors.green
      //       : colors.rose,
      //   },
      // ]}
      />
      {/* <Typo size={12} color={colors.neutral600}>
        Status: {socketStatus.connected ? "Connected" : "Disconnected"}
      </Typo> */}
      {/* {socketStatus.lastError && (
        <Typo size={12} color={colors.rose}>
          Error: {socketStatus.lastError}
        </Typo>
      )} */}
      {socketStatus.lastMessage && (
        <Typo size={12} color={colors.neutral600}>
          Last message: {JSON.stringify(socketStatus.lastMessage).slice(0, 50)}
          ...
        </Typo>
      )}
    </View>
  );

  const renderParkingCard = (spot: ParkingSpotType) => {
    const distance = userLocation
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          spot.latitude,
          spot.longitude
        )
      : null;

    const spotRealTimeData = realTimeData[spot.id];
    const availableSpots =
      spot.type === "public" && spotRealTimeData !== undefined
        ? spotRealTimeData.availableSpots
        : spot.totalSpots;

    return (
      <Animated.View
        entering={FadeInDown}
        key={spot.id}
        style={styles.parkingCard}
      >
        <TouchableOpacity
          onPress={() => {
            if (spot.type === "public") {
              router.push({
                pathname: "/(modals)/publicParkingView",
                params: {
                  parkingId: spot.id,
                  parkingData: JSON.stringify({
                    ...spot,
                    realTimeData: spotRealTimeData,
                  }),
                },
              });
            } else {
              router.push({
                pathname: "/(modals)/slotBookingModal",
                params: {
                  parkingData: JSON.stringify(spot),
                },
              });
            }
          }}
          style={styles.parkingCardContent}
        >
          <View style={styles.parkingHeader}>
            <View style={styles.parkingMainInfo}>
              <Typo size={18} color={colors.neutral800} fontWeight="600">
                {spot.parkingName}
              </Typo>
              <View
                style={[
                  styles.parkingType,
                  {
                    backgroundColor:
                      spot.type === "public" ? colors.green : colors.primary,
                  },
                ]}
              >
                <Typo size={12} color={colors.white} fontWeight="600">
                  {spot.type.toUpperCase()}
                </Typo>
              </View>
            </View>
            <Typo size={14} color={colors.neutral500} style={styles.address}>
              {spot.address}
            </Typo>
          </View>

          <View style={styles.parkingDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Icons.Clock size={20} color={colors.primary} />
                <Typo size={14} color={colors.neutral600}>
                  {spot.operatingHours.open} - {spot.operatingHours.close}
                </Typo>
              </View>

              <View style={styles.detailItem}>
                <Icons.CarSimple size={20} color={colors.primary} />
                <View style={styles.availabilityInfo}>
                  {spot.type === "public" && (
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: isConnected
                            ? colors.green
                            : colors.neutral400,
                        },
                      ]}
                    />
                  )}
                  <Typo size={14} color={colors.neutral600}>
                    {availableSpots} / {spot.totalSpots} spots
                  </Typo>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              {distance !== null && (
                <View style={styles.detailItem}>
                  <Icons.MapPin size={20} color={colors.primary} />
                  <Typo size={14} color={colors.neutral600}>
                    {distance < 1
                      ? `${(distance * 1000).toFixed(0)}m`
                      : `${distance.toFixed(1)}km`}
                  </Typo>
                </View>
              )}
              {spot.type === "private" && spot.price !== null && (
                <View style={styles.detailItem}>
                  <Icons.CurrencyDollar size={20} color={colors.primary} />
                  <Typo size={14} color={colors.neutral600}>
                    ₹{spot.price}/hr
                  </Typo>
                </View>
              )}
            </View>

            {spot.features && spot.features.length > 0 && (
              <View style={styles.features}>
                {spot.features.map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Typo size={12} color={colors.neutral600}>
                      {feature}
                    </Typo>
                  </View>
                ))}
              </View>
            )}

            <View
              style={[
                styles.actionButton,
                {
                  backgroundColor:
                    spot.type === "public" ? colors.green : colors.primary,
                },
              ]}
            >
              <Typo size={16} color={colors.white} fontWeight="600">
                {spot.type === "public" ? "View Live Status" : "Book Now"}
              </Typo>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderDebugInfo()}
      <View style={styles.filterContainer}>
        {FILTER_TYPES.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Typo
              size={14}
              color={activeFilter === filter ? colors.white : colors.neutral600}
              fontWeight="600"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Typo>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredSpots.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icons.Car size={48} color={colors.neutral400} />
          <Typo size={16} color={colors.neutral800} style={styles.noSpotsText}>
            No parking spots found nearby
          </Typo>
          <Typo size={14} color={colors.neutral500}>
            Try changing the filter or searching in a different area
          </Typo>
        </View>
      ) : (
        <ScrollView
          style={styles.parkingList}
          contentContainerStyle={styles.parkingListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredSpots.map(renderParkingCard)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  debugContainer: {
    padding: 10,
    backgroundColor: colors.neutral100,
    borderRadius: radius._6,
    margin: 10,
  },
  connectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
    position: "absolute",
    right: 10,
    top: 10,
  },
  noSpotsText: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: "row",
    padding: spacingX._15,
    gap: spacingX._10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButton: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius._10,
    backgroundColor: colors.neutral100,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  parkingList: {
    flex: 1,
  },
  parkingListContent: {
    padding: spacingX._15,
    gap: spacingY._15,
    paddingBottom: spacingY._20,
  },
  parkingCard: {
    backgroundColor: colors.white,
    borderRadius: radius._12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: spacingY._15,
  },
  parkingCardContent: {
    padding: spacingX._15,
  },
  parkingHeader: {
    marginBottom: spacingY._10,
  },
  parkingMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  address: {
    marginTop: spacingY._5,
  },
  parkingDetails: {
    gap: spacingY._12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacingY._7,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  parkingType: {
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
    minWidth: 70,
    alignItems: "center",
  },
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: spacingY._10,
  },
  featureTag: {
    backgroundColor: colors.neutral100,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
  },
  actionButton: {
    padding: spacingY._12,
    borderRadius: radius._10,
    alignItems: "center",
    marginTop: spacingY._15,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  availabilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default NearBy;
