import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { GeminiNavigationService } from "@/services/GeminiNavigation";
import { PathInfo, Coordinates } from "@/types";
const GEMINI_API_KEY = "AIzaSyDmRxYJVe99wvGKUe4PK_mFiVXaqXISrUk";
const API_URL = "http://192.168.182.44:5000";

interface ApiResponse {
  nodes: string[];
  coordinates: Coordinates;
  image?: string;
  path?: string[];
  distance?: number;
  error?: string;
}

export default function NavigationScreen() {
  const [nodes, setNodes] = useState<string[]>([]);
  const [source, setSource] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [pathImage, setPathImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pathInfo, setPathInfo] = useState<PathInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [navigationStatus, setNavigationStatus] = useState<string>("");
  const [coords, setCoords] = useState<Coordinates>({});

  const navigationService = useRef(new GeminiNavigationService(GEMINI_API_KEY));

  useEffect(() => {
    fetchNodes();
    return () => navigationService.current.stopNavigation();
  }, []);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/get-nodes`);
      if (!response.ok) throw new Error("Network response was not ok");

      const data: ApiResponse = await response.json();
      setNodes(data.nodes.sort());
      setCoords(data.coordinates);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      Alert.alert(
        "Error",
        "Failed to fetch nodes. Please check server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculatePath = async () => {
    if (!source || !destination) {
      Alert.alert(
        "Input Required",
        "Please select both source and destination nodes"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/calculate-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data: ApiResponse = await response.json();
      if (data.error) throw new Error(data.error);

      if (data.image && data.path && data.distance) {
        setPathImage(`data:image/png;base64,${data.image}`);
        setPathInfo({
          path: data.path,
          distance: Math.round(data.distance * 100) / 100,
        });
        setCurrentStep(0);
        setIsNavigating(true);
        await startNavigation(data.path);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      Alert.alert("Error", "Failed to calculate path");
    } finally {
      setLoading(false);
    }
  };

  const startNavigation = async (path: string[]) => {
    if (path.length < 2) return;

    setIsNavigating(true);
    setCurrentStep(0);
    await nextNavigationStep();
  };

  const nextNavigationStep = async () => {
    if (!pathInfo?.path || currentStep >= pathInfo.path.length - 1) {
      await navigationService.current.announceArrival();
      setIsNavigating(false);
      setNavigationStatus("Destination reached");
      return;
    }

    const currentNode = pathInfo.path[currentStep];
    const nextNode = pathInfo.path[currentStep + 1];

    const instruction = await navigationService.current.navigateStep(
      currentNode,
      nextNode,
      coords
    );

    if (instruction) {
      setNavigationStatus(instruction);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const resetNavigation = () => {
    navigationService.current.stopNavigation();
    setPathImage(null);
    setPathInfo(null);
    setSource("");
    setDestination("");
    setIsNavigating(false);
    setCurrentStep(0);
    setNavigationStatus("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Parking Lot Navigation</Text>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Enter Your Starting Point:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={source}
                onValueChange={(value: string) => setSource(value)}
                style={styles.picker}
                enabled={!loading}
              >
                <Picker.Item label="Select source" value="" />
                {nodes.map((node) => (
                  <Picker.Item
                    key={`source-${node}`}
                    label={`Node ${node}`}
                    value={node}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Choose Destination:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={destination}
                onValueChange={(value: string) => setDestination(value)}
                style={styles.picker}
                enabled={!loading}
              >
                <Picker.Item label="Select destination" value="" />
                {nodes.map((node) => (
                  <Picker.Item
                    key={`dest-${node}`}
                    label={`Node ${node}`}
                    value={node}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={calculatePath}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Find Path</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={resetNavigation}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          {isNavigating && pathInfo && (
            <View style={styles.navigationControls}>
              <Text style={styles.navigationText}>
                Current: Node {pathInfo.path[currentStep]}
                {currentStep < pathInfo.path.length - 1
                  ? ` → Next: Node ${pathInfo.path[currentStep + 1]}`
                  : " (Destination)"}
              </Text>
              <Text style={styles.statusText}>{navigationStatus}</Text>
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={nextNavigationStep}
              >
                <Text style={styles.buttonText}>Next Direction</Text>
              </TouchableOpacity>
            </View>
          )}

          {pathInfo && (
            <View style={styles.pathInfo}>
              <Text style={styles.pathInfoText}>
                Path: {pathInfo.path.join(" → ")}
              </Text>
              <Text style={styles.pathInfoText}>
                Distance: {pathInfo.distance} units
              </Text>
            </View>
          )}

          {pathImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: pathImage }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    fontWeight: "500",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: "#FF3B30",
  },
  nextButton: {
    backgroundColor: "#4CAF50",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  navigationControls: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  navigationText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
  pathInfo: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  pathInfoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  image: {
    width: Dimensions.get("window").width - 40,
    height: Dimensions.get("window").width - 40,
    backgroundColor: "#f8f8f8",
  },
  error: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
  },
});
