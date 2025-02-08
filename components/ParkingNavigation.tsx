import React, { useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { View, Button, ActivityIndicator, Alert } from "react-native";

const GOOGLE_MAPS_API_KEY = "AIzaSyDrIlKE-OzCydDLFrnffUK3Lazd3A3n7vg"; // Replace with your key

const ParkingNavigation = () => {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Enable location permissions to use this feature."
        );
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{ flex: 1 }} />
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE} // Google Maps provider
          style={{ flex: 1 }}
          showsUserLocation={true}
          followsUserLocation={true}
          initialRegion={{
            latitude: location?.latitude || 37.7749,
            longitude: location?.longitude || -122.4194,
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
              title="Your Location"
              description="You are here"
              pinColor="blue"
            />
          )}
        </MapView>
      )}
      <Button title="Refresh Location" onPress={() => setLoading(true)} />
    </View>
  );
};

export default ParkingNavigation;
