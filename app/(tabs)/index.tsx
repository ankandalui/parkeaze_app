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
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { colors, radius } from "@/constants/theme";
import MapView, {
  Marker,
  MapType,
  PROVIDER_GOOGLE,
  Region,
  Polyline,
} from "react-native-maps";
import * as Location from "expo-location";
import { verticalScale } from "@/utils/styling";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

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

const Home = () => {
  // State definitions
  const [mapType, setMapType] = useState<MapType>("standard");
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
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
  const [destinationPredictions, setDestinationPredictions] = useState<Place[]>(
    []
  );
  const [selectedOrigin, setSelectedOrigin] = useState<Region | null>(null);
  const [originPlaceName, setOriginPlaceName] = useState("");
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [searchContainerLayout, setSearchContainerLayout] =
    useState<LayoutRectangle | null>(null);

  // Refs
  const mapRef = useRef<MapView>(null);
  const searchContainerRef = useRef(null);
  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Initial location permission effect
  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, []);

  // Search places effect
  useEffect(() => {
    const searchPlaces = async (
      text: string,
      setResults: (places: Place[]) => void
    ) => {
      if (text.length > 0) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
              text
            )}&key=${GOOGLE_MAPS_API_KEY}&location=${region.latitude},${
              region.longitude
            }&radius=50000&types=establishment|geocode`
          );
          const data = await response.json();
          if (data.predictions) {
            setResults(data.predictions);
          }
        } catch (error) {
          console.error("Error fetching predictions:", error);
          setResults([]);
        }
      } else {
        setResults([]);
      }
    };

    const timeoutId = setTimeout(() => {
      if (isDirectionMode) {
        if (originFocused && originSearchText.length > 0) {
          searchPlaces(originSearchText, setOriginPredictions);
        } else if (destinationFocused && destinationSearchText.length > 0) {
          searchPlaces(destinationSearchText, setDestinationPredictions);
        }
      } else if (searchText.length > 0) {
        searchPlaces(searchText, setPredictions);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    searchText,
    originSearchText,
    destinationSearchText,
    originFocused,
    destinationFocused,
    region,
    isDirectionMode,
  ]);

  // Touch handling for closing search
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

  // Location permission request
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        getCurrentLocation();
        setIsLocationTracking(true);
      } else {
        Alert.alert(
          "Permission Denied",
          "Please enable location services to use this feature"
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert("Error", "Failed to request location permission");
    }
  };

  // Get current location
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
      mapRef.current?.animateToRegion(newRegion, 500);

      if (isLocationTracking) {
        if (locationUpdateInterval.current) {
          clearInterval(locationUpdateInterval.current);
        }
        locationUpdateInterval.current = setInterval(async () => {
          const updatedLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setUserMarker({
            latitude: updatedLocation.coords.latitude,
            longitude: updatedLocation.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
        }, 10000);
      }

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
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your current location");
    }
  };

  // Toggle location tracking
  const toggleLocationTracking = () => {
    if (!isLocationTracking) {
      getCurrentLocation();
    } else if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
    }
    setIsLocationTracking(!isLocationTracking);
  };

  // Polyline decoder for routes
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

  // Get directions between two points
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

  // Handle place selection from search
  const handlePlaceSelect = async (place: Place, isOrigin: boolean = false) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address`
      );
      const data = await response.json();

      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        const location = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };

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
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      Alert.alert("Error", "Failed to get place details");
    }
  };

  // Handle map press
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

  // Toggle map type
  const toggleMapType = () => {
    setIsSatelliteView(!isSatelliteView);
    setMapType(isSatelliteView ? "standard" : "satellite");
  };

  // Toggle direction mode
  const toggleDirectionMode = () => {
    setIsDirectionMode(!isDirectionMode);
    if (!isDirectionMode) {
      // Entering direction mode
      setOriginSearchText(originPlaceName || "My Location");
      if (userMarker) {
        setSelectedOrigin(userMarker);
      }
    } else {
      // Exiting direction mode
      setOriginSearchText("");
      setDestinationSearchText("");
      setOriginPredictions([]);
      setDestinationPredictions([]);
      setSelectedOrigin(null);
      setRouteInfo(null);
      setDestinationMarker(null);
    }
  };

  return (
    <View style={styles.container}>
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

              <View style={[styles.searchInputContainer, { marginTop: 10 }]}>
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
        {destinationMarker && (
          <Marker
            coordinate={destinationMarker}
            title={destinationSearchText || "Selected Location"}
          >
            <View style={styles.destinationMarker}>
              <MaterialIcons name="location-on" size={36} color="#8BC34A" />
            </View>
          </Marker>
        )}
        {routeInfo?.points && (
          <Polyline
            coordinates={routeInfo.points}
            strokeWidth={4}
            strokeColor="#8BC34A"
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoTitle}>{routeInfo.placeName}</Text>
          <Text style={styles.distanceText}>
            Distance: {routeInfo.distance}
          </Text>
          <View style={styles.transportInfo}>
            <View style={styles.transportItem}>
              <FontAwesome5 name="car" size={20} color="#8BC34A" />
              <Text style={styles.transportTime}>
                {routeInfo.durationByCar}
              </Text>
            </View>
            <View style={styles.transportItem}>
              <FontAwesome5 name="bicycle" size={20} color="#8BC34A" />
              <Text style={styles.transportTime}>
                {routeInfo.durationByBike}
              </Text>
            </View>
            <View style={styles.transportItem}>
              <FontAwesome5 name="walking" size={20} color="#8BC34A" />
              <Text style={styles.transportTime}>
                {routeInfo.durationByWalk}
              </Text>
            </View>
          </View>
        </View>
      )}

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
            color={isDirectionMode ? "#fff" : "#666"}
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
            color={isSatelliteView ? "#fff" : "#666"}
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
            color={isLocationTracking ? "#fff" : "#666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  searchBarWrapper: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  searchContainer: {
    paddingHorizontal: 15,
  },
  directionSearchContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  predictionsContainer: {
    backgroundColor: "#fff",
    marginTop: 5,
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  predictionContent: {
    flexDirection: "column",
  },
  mainText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 14,
    color: "#666",
  },
  routeInfoContainer: {
    position: "absolute",
    bottom: 90,
    left: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  transportInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  transportItem: {
    alignItems: "center",
  },
  transportTime: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
  },
  floatingButtons: {
    position: "absolute",
    right: 15,
    bottom: 100,
    alignItems: "center",
  },
  floatingButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeButton: {
    backgroundColor: "#8BC34A",
  },
  currentLocationMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#8BC34A",
  },
  currentLocationRing: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8BC34A",
    opacity: 0.3,
  },
  destinationMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Home;
