import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Text,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollViewBase,
} from "react-native";
import MapView, {
  Marker,
  MapType,
  PROVIDER_GOOGLE,
  Region,
  Polyline,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, query, onSnapshot } from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { colors } from "@/constants/theme";
import debounce from "lodash/debounce";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ParkingSpotType } from "@/types";

const GOOGLE_MAPS_API_KEY = "AIzaSyDrIlKE-OzCydDLFrnffUK3Lazd3A3n7vg";
const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface Place {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  isParkingSpot?: boolean;
  parkingData?: ParkingSpotType;
}

interface RouteInfo {
  distance: string;
  duration: string;
  durationByCar: string;
  durationByBike: string;
  durationByWalk: string;
  placeName: string;
  points: Array<{ latitude: number; longitude: number }>;
}

interface LayoutRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CustomMapProps {
  onLocationChange?: (location: Region) => void;
}
export interface CustomMapRef {
  refresh: () => Promise<void>;
}

const CustomMap = forwardRef<CustomMapRef, CustomMapProps>(
  ({ onLocationChange }, ref) => {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const searchContainerRef = useRef<View>(null);
    const [refreshing, setRefreshing] = useState(false);
    const locationSubscription = useRef<Location.LocationSubscription | null>(
      null
    );

    // Map state
    const [mapType, setMapType] = useState<MapType>("standard");
    const [region, setRegion] = useState<Region>({
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });

    // Search and UI state
    const [searchText, setSearchText] = useState("");
    const [predictions, setPredictions] = useState<Place[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [originFocused, setOriginFocused] = useState(false);
    const [destinationFocused, setDestinationFocused] = useState(false);
    const [destinationMarker, setDestinationMarker] = useState<Region | null>(
      null
    );
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [userMarker, setUserMarker] = useState<Region | null>(null);
    const [isDirectionMode, setIsDirectionMode] = useState(false);
    const [originSearchText, setOriginSearchText] = useState("");
    const [destinationSearchText, setDestinationSearchText] = useState("");
    const [originPredictions, setOriginPredictions] = useState<Place[]>([]);
    const [destinationPredictions, setDestinationPredictions] = useState<
      Place[]
    >([]);
    const [selectedOrigin, setSelectedOrigin] = useState<Region | null>(null);
    const [originPlaceName, setOriginPlaceName] = useState("");
    const [isLocationTracking, setIsLocationTracking] = useState(false);
    const [isSatelliteView, setIsSatelliteView] = useState(false);
    const [searchContainerLayout, setSearchContainerLayout] =
      useState<LayoutRectangle | null>(null);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpotType[]>([]);
    const [nearbySpots, setNearbySpots] = useState<ParkingSpotType[]>([]);
    const [loadingParkingSpots, setLoadingParkingSpots] = useState(true);
    const [activeSpotId, setActiveSpotId] = useState<string | null>(null);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [locationPermissionStatus, setLocationPermissionStatus] =
      useState<Location.PermissionStatus | null>(null);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      try {
        // Refresh parking spots data
        setLoadingParkingSpots(true);

        // Get current location
        await getCurrentLocation();

        // Wait a bit to show the refresh animation
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error refreshing:", error);
        Alert.alert("Error", "Failed to refresh data");
      } finally {
        setRefreshing(false);
        setLoadingParkingSpots(false);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      refresh: onRefresh,
    }));

    // Load saved location tracking state
    useEffect(() => {
      const loadLocationTrackingState = async () => {
        try {
          const savedState = await AsyncStorage.getItem("isLocationTracking");
          if (savedState !== null) {
            setIsLocationTracking(savedState === "true");
          }
        } catch (error) {
          console.error("Error loading location tracking state:", error);
        }
      };

      loadLocationTrackingState();
    }, []);

    // Fetch parking spots
    useEffect(() => {
      const spotsRef = collection(firestore, "parking_spots");
      const unsubscribe = onSnapshot(
        query(spotsRef),
        (snapshot) => {
          const spots: ParkingSpotType[] = [];
          snapshot.forEach((doc) => {
            spots.push({ id: doc.id, ...doc.data() } as ParkingSpotType);
          });
          setParkingSpots(spots);
          setLoadingParkingSpots(false);

          // Update nearby spots if user location exists
          if (userMarker) {
            const nearbyRange = filterNearbySpots(spots, userMarker);
            setNearbySpots(nearbyRange);
          }
        },
        (error) => {
          console.error("Error fetching parking spots:", error);
          setLoadingParkingSpots(false);
        }
      );

      return () => unsubscribe();
    }, []);

    // Handle location permissions and setup
    useEffect(() => {
      const setupLocation = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermissionStatus(status);
          setHasLocationPermission(status === "granted");

          if (status === "granted") {
            // Get initial location
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });

            const newRegion = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            };

            setRegion(newRegion);
            setUserMarker(newRegion);
            onLocationChange?.(newRegion);
            mapRef.current?.animateToRegion(newRegion, 500);

            // Start location tracking if enabled
            if (isLocationTracking) {
              startLocationTracking();
            }
          }
        } catch (error) {
          console.error("Error setting up location:", error);
          Alert.alert("Error", "Failed to setup location services");
        }
      };

      setupLocation();

      // Cleanup
      return () => {
        if (locationSubscription.current) {
          locationSubscription.current.remove();
        }
      };
    }, []);

    // Search predictions effect
    useEffect(() => {
      const searchPlaces = async (
        text: string,
        setResults: (places: Place[]) => void
      ) => {
        if (text.length > 0) {
          try {
            // Search through parking spots first
            const matchingParkingSpots = parkingSpots
              .filter((spot) => {
                const parkingName = spot.parkingName?.toLowerCase() || "";
                const address = spot.address?.toLowerCase() || "";
                const searchText = text.toLowerCase();
                return (
                  parkingName.includes(searchText) ||
                  address.includes(searchText)
                );
              })
              .map((spot) => ({
                place_id: spot.id,
                description: `🅿️ ${spot.parkingName || "Unnamed Parking"}`,
                structured_formatting: {
                  main_text: spot.parkingName || "Unnamed Parking",
                  secondary_text: spot.address || "No address provided",
                },
                isParkingSpot: true,
                parkingData: spot,
              }));

            // Get Google Places predictions
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                text
              )}&key=${GOOGLE_MAPS_API_KEY}&location=${region.latitude},${
                region.longitude
              }&radius=50000&types=establishment|geocode`
            );
            const data = await response.json();

            if (data.predictions) {
              setResults([...matchingParkingSpots, ...data.predictions]);
            } else {
              setResults(matchingParkingSpots);
            }
          } catch (error) {
            console.error("Error fetching predictions:", error);
            setResults([]);
          }
        } else {
          setResults([]);
        }
      };

      const debouncedSearch = debounce(searchPlaces, 300);

      if (isDirectionMode) {
        if (originFocused && originSearchText.length > 0) {
          debouncedSearch(originSearchText, setOriginPredictions);
        } else if (destinationFocused && destinationSearchText.length > 0) {
          debouncedSearch(destinationSearchText, setDestinationPredictions);
        }
      } else if (searchText.length > 0) {
        debouncedSearch(searchText, setPredictions);
      }

      return () => {
        debouncedSearch.cancel();
      };
    }, [
      searchText,
      originSearchText,
      destinationSearchText,
      originFocused,
      destinationFocused,
      region,
      isDirectionMode,
      parkingSpots,
    ]);

    const startLocationTracking = async () => {
      try {
        // Clear existing subscription
        if (locationSubscription.current) {
          locationSubscription.current.remove();
        }

        // Start new subscription
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 10, // Or when user moves 10 meters
          },
          (location) => {
            const newLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            };

            setUserMarker(newLocation);
            onLocationChange?.(newLocation);

            // Update nearby spots
            const updatedNearby = filterNearbySpots(parkingSpots, newLocation);
            setNearbySpots(updatedNearby);
          }
        );
      } catch (error) {
        console.error("Error starting location tracking:", error);
        Alert.alert("Error", "Failed to start location tracking");
      }
    };

    const toggleLocationTracking = async () => {
      try {
        if (!hasLocationPermission) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission Required",
              "Please enable location services to use this feature"
            );
            return;
          }
          setHasLocationPermission(true);
        }

        const newTrackingState = !isLocationTracking;
        setIsLocationTracking(newTrackingState);

        // Save tracking state
        await AsyncStorage.setItem(
          "isLocationTracking",
          String(newTrackingState)
        );

        if (newTrackingState) {
          await startLocationTracking();
        } else if (locationSubscription.current) {
          locationSubscription.current.remove();
          locationSubscription.current = null;
        }
      } catch (error) {
        console.error("Error toggling location tracking:", error);
        Alert.alert("Error", "Failed to toggle location tracking");
      }
    };

    const filterNearbySpots = (spots: ParkingSpotType[], location: Region) => {
      const maxDistance = 5; // 5km radius
      return spots.filter((spot) => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          spot.latitude,
          spot.longitude
        );
        return distance <= maxDistance;
      });
    };

    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371; // Earth's radius in km
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

    const getCurrentLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };

        setRegion(newRegion);
        setUserMarker(newRegion);
        onLocationChange?.(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);

        // Update nearby spots
        const nearbyRange = filterNearbySpots(parkingSpots, newRegion);
        setNearbySpots(nearbyRange);

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          if (data.results?.[0]) {
            setOriginPlaceName(data.results[0].formatted_address);
            setOriginSearchText(data.results[0].formatted_address);
          }
        } catch (error) {
          console.error("Error getting place name:", error);
        }
      } catch (error) {
        console.error("Error getting current location:", error);
        Alert.alert("Error", "Failed to get your current location");
      }
    };

    const getDirections = async (
      origin: Region,
      destination: Region,
      placeName: string
    ) => {
      try {
        if (!origin || !destination) {
          console.log("Missing origin or destination");
          return;
        }

        const modes = ["driving", "bicycling", "walking"];
        const responses = await Promise.all(
          modes.map((mode) =>
            fetch(
              `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`
            ).then((res) => res.json())
          )
        );

        const [drivingData, bikingData, walkingData] = responses;

        if (drivingData.routes?.[0]?.legs?.[0]) {
          const route = drivingData.routes[0];
          const points = decodePolyline(route.overview_polyline.points);

          const routeInfo = {
            distance: route.legs[0].distance.text,
            duration: route.legs[0].duration.text,
            durationByCar: route.legs[0].duration.text,
            durationByBike:
              bikingData.routes?.[0]?.legs?.[0]?.duration?.text || "N/A",
            durationByWalk:
              walkingData.routes?.[0]?.legs?.[0]?.duration?.text || "N/A",
            placeName: placeName,
            points: points,
          };

          setRouteInfo(routeInfo);

          const coordinates = points.map((point) => ({
            latitude: point.latitude,
            longitude: point.longitude,
          }));

          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
            animated: true,
          });
        } else {
          console.log("No route found:", drivingData);
          Alert.alert("Error", "No route found for this destination");
        }
      } catch (error) {
        console.error("Error fetching directions:", error);
        Alert.alert("Error", "Failed to fetch route information");
      }
    };

    const handleOutsideTouch = (event: any) => {
      if (!searchContainerLayout) return;

      const touch = event.nativeEvent.locationX || event.nativeEvent.pageX;
      const touchY = event.nativeEvent.locationY || event.nativeEvent.pageY;

      if (
        touch < searchContainerLayout.x ||
        touch > searchContainerLayout.x + searchContainerLayout.width ||
        touchY < searchContainerLayout.y ||
        touchY > searchContainerLayout.y + searchContainerLayout.height
      ) {
        setIsSearching(false);
        setOriginFocused(false);
        setDestinationFocused(false);
      }
    };

    const handleMapPress = async (event: any) => {
      handleOutsideTouch(event);
      const { coordinate } = event.nativeEvent;

      if (destinationMarker) {
        const distance = Math.sqrt(
          Math.pow(coordinate.latitude - destinationMarker.latitude, 2) +
            Math.pow(coordinate.longitude - destinationMarker.longitude, 2)
        );

        if (distance < 0.005) {
          setDestinationMarker(null);
          setRouteInfo(null);
          setDestinationSearchText("");
          return;
        }
      }

      setDestinationMarker(coordinate);

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.results?.[0]) {
          const placeName = data.results[0].formatted_address;
          if (isDirectionMode) {
            setDestinationSearchText(placeName);
          } else {
            setSearchText(placeName);
          }

          const origin = isDirectionMode
            ? selectedOrigin || userMarker
            : userMarker;
          if (origin) {
            getDirections(origin, coordinate, placeName);
          }
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error);
        Alert.alert("Error", "Failed to get location information");
      }
    };

    const handlePlaceSelect = async (
      place: Place,
      isOrigin: boolean = false
    ) => {
      try {
        let location: Region;

        if (place.isParkingSpot && place.parkingData) {
          location = {
            latitude: place.parkingData.latitude,
            longitude: place.parkingData.longitude,
            latitudeDelta: LATITUDE_DELTA * 4,
            longitudeDelta: LONGITUDE_DELTA * 4,
          };
        } else {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address`
          );
          const data = await response.json();

          if (!data.result?.geometry?.location) {
            throw new Error("No location data found");
          }

          location = {
            latitude: data.result.geometry.location.lat,
            longitude: data.result.geometry.location.lng,
            latitudeDelta: LATITUDE_DELTA * 4,
            longitudeDelta: LONGITUDE_DELTA * 4,
          };
        }

        if (isDirectionMode) {
          if (isOrigin) {
            setSelectedOrigin(location);
            setOriginPlaceName(place.description);
            setOriginSearchText(place.description);
            setOriginPredictions([]);
            setOriginFocused(false);

            if (destinationMarker) {
              getDirections(location, destinationMarker, destinationSearchText);
            }
          } else {
            setDestinationMarker(location);
            setDestinationSearchText(place.description);
            setDestinationPredictions([]);
            setDestinationFocused(false);

            const origin = selectedOrigin || userMarker;
            if (origin) {
              getDirections(origin, location, place.description);
            }
          }
        } else {
          setDestinationMarker(location);
          setSearchText(place.description);
          setPredictions([]);
          setIsSearching(false);

          const origin = userMarker;
          if (origin) {
            getDirections(origin, location, place.description);
          }
        }

        mapRef.current?.animateToRegion(location, 500);
        if (routeInfo?.points) {
          const coordinates = routeInfo.points.map((point) => ({
            latitude: point.latitude,
            longitude: point.longitude,
          }));

          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 150, right: 50, bottom: 150, left: 50 },
            animated: true,
          });
        }
      } catch (error) {
        console.error("Error fetching place details:", error);
        Alert.alert("Error", "Failed to get place details");
      }
    };

    const toggleDirectionMode = () => {
      setIsDirectionMode(!isDirectionMode);
      if (!isDirectionMode) {
        setOriginSearchText(originPlaceName || "My Location");
        if (userMarker) {
          setSelectedOrigin(userMarker);
        }
      } else {
        setOriginSearchText("");
        setDestinationSearchText("");
        setOriginPredictions([]);
        setDestinationPredictions([]);
        setSelectedOrigin(null);
        setRouteInfo(null);
        setDestinationMarker(null);
      }
    };

    const toggleMapType = () => {
      setIsSatelliteView(!isSatelliteView);
      setMapType(isSatelliteView ? "standard" : "satellite");
    };

    const handleShowNearbyParking = () => {
      if (destinationMarker) {
        router.push({
          pathname: "/(tabs)/nearby",
          params: {
            latitude: destinationMarker.latitude.toString(),
            longitude: destinationMarker.longitude.toString(),
          },
        });
      }
    };

    const handleParkingSpotSelect = (spot: ParkingSpotType) => {
      setActiveSpotId(spot.id);
      const spotRegion = {
        latitude: spot.latitude,
        longitude: spot.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      mapRef.current?.animateToRegion(spotRegion, 500);
    };

    const decodePolyline = (
      encoded: string
    ): Array<{ latitude: number; longitude: number }> => {
      const poly: Array<{ latitude: number; longitude: number }> = [];
      let index = 0,
        len = encoded.length;
      let lat = 0,
        lng = 0;

      while (index < len) {
        let b,
          shift = 0,
          result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        const dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        const dlng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        poly.push({
          latitude: lat / 1e5,
          longitude: lng / 1e5,
        });
      }
      return poly;
    };

    const renderParkingSpots = () => {
      return parkingSpots.map((spot) => (
        <Marker
          key={spot.id}
          coordinate={{
            latitude: spot.latitude,
            longitude: spot.longitude,
          }}
          title={spot.parkingName}
          description={`${spot.totalSpots} total spots`}
        >
          <View
            style={[
              styles.parkingMarker,
              activeSpotId === spot.id && styles.activeParkingMarker,
            ]}
          >
            <MaterialIcons
              name="local-parking"
              size={24}
              color={spot.type === "public" ? colors.green : colors.primary}
            />
          </View>
        </Marker>
      ));
    };

    const renderNearbySpots = () => {
      if (!userMarker || nearbySpots.length === 0) return null;

      return (
        <View style={styles.nearbyCardsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.nearbyScroll}
            contentContainerStyle={styles.nearbyScrollContent}
          >
            {nearbySpots.map((spot) => (
              <TouchableOpacity
                key={spot.id}
                style={[
                  styles.nearbyCard,
                  activeSpotId === spot.id && styles.activeNearbyCard,
                ]}
                onPress={() => {
                  handleParkingSpotSelect(spot);
                  router.push({
                    pathname: "/(modals)/slotBookingModal",
                    params: {
                      parkingData: JSON.stringify(spot),
                    },
                  });
                }}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.cardType,
                      {
                        backgroundColor:
                          spot.type === "public"
                            ? colors.green
                            : colors.primary,
                      },
                    ]}
                  >
                    <Text style={styles.cardTypeText}>
                      {spot.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.cardPrice}>
                    {spot.price ? `$${spot.price}/hr` : "Free"}
                  </Text>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {spot.parkingName}
                </Text>

                <View style={styles.cardDetails}>
                  <View style={styles.cardDetail}>
                    <MaterialIcons
                      name="local-parking"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.cardDetailText}>
                      {spot.totalSpots} spots
                    </Text>
                  </View>

                  <View style={styles.cardDetail}>
                    <MaterialIcons
                      name="access-time"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.cardDetailText}>
                      {spot.operatingHours.open} - {spot.operatingHours.close}
                    </Text>
                  </View>

                  <View style={styles.cardDetail}>
                    <MaterialIcons
                      name="place"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.cardDetailText}>
                      {calculateDistance(
                        userMarker.latitude,
                        userMarker.longitude,
                        spot.latitude,
                        spot.longitude
                      ).toFixed(1)}{" "}
                      km
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Search Bar */}
          <View style={styles.searchBarWrapper}>
            {isDirectionMode ? (
              <View
                ref={searchContainerRef}
                style={styles.searchContainer}
                onLayout={(event) => {
                  setSearchContainerLayout(event.nativeEvent.layout);
                }}
              >
                <View style={styles.directionSearchContainer}>
                  <View style={styles.searchInputContainer}>
                    <Ionicons name="location-outline" size={22} color="#666" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Choose start location"
                      placeholderTextColor="#666"
                      value={originSearchText}
                      onChangeText={setOriginSearchText}
                      onFocus={() => {
                        setOriginFocused(true);
                        setDestinationFocused(false);
                      }}
                      onBlur={() => setOriginFocused(false)}
                    />
                  </View>

                  {originFocused && originPredictions.length > 0 && (
                    <ScrollView style={styles.predictionsContainer}>
                      {originPredictions.map((place) => (
                        <TouchableOpacity
                          key={place.place_id}
                          style={styles.predictionItem}
                          onPress={() => handlePlaceSelect(place, true)}
                        >
                          <View style={styles.predictionContent}>
                            <Text style={styles.mainText}>
                              {place.structured_formatting.main_text}
                            </Text>
                            <Text style={styles.secondaryText}>
                              {place.structured_formatting.secondary_text}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  <View
                    style={[styles.searchInputContainer, { marginTop: 10 }]}
                  >
                    <Ionicons name="location" size={22} color="#666" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Choose destination"
                      placeholderTextColor="#666"
                      value={destinationSearchText}
                      onChangeText={setDestinationSearchText}
                      onFocus={() => {
                        setDestinationFocused(true);
                        setOriginFocused(false);
                      }}
                      onBlur={() => setDestinationFocused(false)}
                    />
                  </View>

                  {destinationFocused && destinationPredictions.length > 0 && (
                    <ScrollView style={styles.predictionsContainer}>
                      {destinationPredictions.map((place) => (
                        <TouchableOpacity
                          key={place.place_id}
                          style={styles.predictionItem}
                          onPress={() => handlePlaceSelect(place, false)}
                        >
                          <View style={styles.predictionContent}>
                            <Text style={styles.mainText}>
                              {place.structured_formatting.main_text}
                            </Text>
                            <Text style={styles.secondaryText}>
                              {place.structured_formatting.secondary_text}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            ) : (
              <View
                ref={searchContainerRef}
                style={styles.searchContainer}
                onLayout={(event) => {
                  setSearchContainerLayout(event.nativeEvent.layout);
                }}
              >
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={22} color="#666" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search here"
                    placeholderTextColor="#666"
                    value={searchText}
                    onChangeText={setSearchText}
                    onFocus={() => setIsSearching(true)}
                  />
                </View>

                {isSearching && predictions.length > 0 && (
                  <ScrollView style={styles.predictionsContainer}>
                    {predictions.map((place) => (
                      <TouchableOpacity
                        key={place.place_id}
                        style={styles.predictionItem}
                        onPress={() => {
                          handlePlaceSelect(place);
                          setIsSearching(false);
                        }}
                      >
                        <View style={styles.predictionContent}>
                          <Text style={styles.mainText}>
                            {place.structured_formatting.main_text}
                          </Text>
                          <Text style={styles.secondaryText}>
                            {place.structured_formatting.secondary_text}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {/* Nearby Spots Cards */}
          {renderNearbySpots()}

          {/* Map View */}
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            mapType={mapType}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            rotateEnabled={true}
            zoomEnabled={true}
          >
            {userMarker && (
              <Marker coordinate={userMarker} title="My Location">
                <View style={styles.currentLocationMarker}>
                  <View style={styles.currentLocationDot} />
                  <View style={styles.currentLocationRing} />
                </View>
              </Marker>
            )}
            {renderParkingSpots()}
            {destinationMarker && (
              <Marker
                coordinate={destinationMarker}
                title={destinationSearchText || "Selected Location"}
              >
                <View style={styles.destinationMarker}>
                  <MaterialIcons
                    name="location-on"
                    size={36}
                    color={colors.primary}
                  />
                </View>
              </Marker>
            )}
            {routeInfo?.points && (
              <Polyline
                coordinates={routeInfo.points}
                strokeWidth={4}
                strokeColor={colors.primary}
                lineDashPattern={[1]}
              />
            )}
          </MapView>

          {/* Route Info */}
          {routeInfo && (
            <View style={styles.routeInfoContainer}>
              <Text style={styles.routeInfoTitle}>{routeInfo.placeName}</Text>
              <Text style={styles.distanceText}>
                Distance: {routeInfo.distance}
              </Text>
              <View style={styles.transportInfo}>
                <View style={styles.transportItem}>
                  <FontAwesome5 name="car" size={20} color={colors.primary} />
                  <Text style={styles.transportTime}>
                    {routeInfo.durationByCar}
                  </Text>
                </View>
                <View style={styles.transportItem}>
                  <FontAwesome5
                    name="bicycle"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.transportTime}>
                    {routeInfo.durationByBike}
                  </Text>
                </View>
                <View style={styles.transportItem}>
                  <FontAwesome5
                    name="walking"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.transportTime}>
                    {routeInfo.durationByWalk}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.nearbyParkingButton}
                onPress={handleShowNearbyParking}
              >
                <MaterialIcons
                  name="local-parking"
                  size={24}
                  color={colors.white}
                />
                <Text style={styles.nearbyParkingButtonText}>
                  See Nearby Parking
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Floating Buttons */}
          <View style={styles.floatingButtons}>
            <TouchableOpacity
              style={[
                styles.floatingButton,
                isDirectionMode && styles.activeButton,
              ]}
              onPress={toggleDirectionMode}
            >
              <MaterialIcons
                name="directions"
                size={24}
                color={isDirectionMode ? colors.white : "#666"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.floatingButton,
                isSatelliteView && styles.activeButton,
              ]}
              onPress={toggleMapType}
            >
              <MaterialIcons
                name="layers"
                size={24}
                color={isSatelliteView ? colors.white : "#666"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.floatingButton,
                isLocationTracking && styles.activeButton,
              ]}
              onPress={toggleLocationTracking}
            >
              <MaterialIcons
                name="my-location"
                size={24}
                color={isLocationTracking ? colors.white : "#666"}
              />
            </TouchableOpacity>
          </View>

          {loadingParkingSpots && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flex: 1,
    height: "100%",
  },
  searchBarWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 15,
  },
  searchContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.neutral800,
  },
  nearbyCardsWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 260 : 240,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  nearbyScroll: {
    paddingVertical: 5,
  },
  nearbyScrollContent: {
    paddingHorizontal: 15,
  },
  nearbyCard: {
    width: 200,
    backgroundColor: colors.white,
    marginRight: 10,
    borderRadius: 8,
    padding: 10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeNearbyCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardTypeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  cardPrice: {
    color: colors.neutral800,
    fontSize: 12,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral800,
    marginBottom: 8,
  },
  cardDetails: {
    gap: 4,
  },
  cardDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDetailText: {
    fontSize: 12,
    color: colors.neutral600,
  },
  parkingMarker: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeParkingMarker: {
    transform: [{ scale: 1.2 }],
    borderColor: colors.primary,
    borderWidth: 2,
  },
  destinationMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  routeInfoContainer: {
    position: "absolute",
    bottom: 90,
    left: 15,
    right: 15,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral800,
    marginBottom: 6,
  },
  distanceText: {
    fontSize: 12,
    color: colors.neutral600,
    marginBottom: 8,
  },
  transportInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  transportItem: {
    alignItems: "center",
  },
  transportTime: {
    marginTop: 4,
    fontSize: 12,
    color: colors.neutral800,
  },
  floatingButtons: {
    position: "absolute",
    right: 15,
    bottom: 100,
    gap: 10,
  },
  floatingButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeButton: {
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  predictionsContainer: {
    backgroundColor: colors.white,
    marginTop: 5,
    borderRadius: 8,
    maxHeight: 200,
  },
  predictionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  predictionContent: {
    flexDirection: "column",
  },
  mainText: {
    fontSize: 16,
    color: colors.neutral800,
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 14,
    color: colors.neutral500,
  },
  directionSearchContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocationMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  currentLocationRing: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 0.3,
  },
  nearbyParkingButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  nearbyParkingButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default CustomMap;
