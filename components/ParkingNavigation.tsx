import React, { useEffect, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Text, View, Button } from "react-native";
import * as Speech from "expo-speech";

const ParkingNavigation = () => {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>(
    []
  );

  // Define parking lot layout (Custom Coordinates)
  const parkingLotNodes: {
    [key: string]: { latitude: number; longitude: number };
  } = {
    gateA: { latitude: 37.7749, longitude: -122.4194 },
    slot1: { latitude: 37.7752, longitude: -122.4188 },
    slot2: { latitude: 37.7753, longitude: -122.4185 },
    destination: { latitude: 37.7755, longitude: -122.4182 },
  };

  // Shortest Path Calculation (Dijkstra Placeholder, Add real logic)
  const findShortestPath = () => {
    setRoute([
      parkingLotNodes.gateA,
      parkingLotNodes.slot1,
      parkingLotNodes.destination,
    ]);
    Speech.speak(
      "Navigating to your parking spot. Follow the path highlighted on the map."
    );
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You"
            pinColor="blue"
          />
        )}
        {Object.keys(parkingLotNodes).map((key) => (
          <Marker key={key} coordinate={parkingLotNodes[key]} title={key} />
        ))}
        {route.length > 1 && (
          <Polyline coordinates={route} strokeWidth={4} strokeColor="red" />
        )}
      </MapView>
      <Button title="Start Navigation" onPress={findShortestPath} />
    </View>
  );
};

export default ParkingNavigation;
