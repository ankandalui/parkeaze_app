import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import io, { Socket } from "socket.io-client";

// Define types for the WebSocket data
interface ParkingData {
  client_id: number;
  output: number;
}

// Define types for component props
interface ParkingSlotProps {
  isAvailable: boolean;
  index: number;
}

const PublicParkingView: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastData, setLastData] = useState<ParkingData | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [parkingSlots, setParkingSlots] = useState<boolean[]>(
    Array(5).fill(false)
  );
  const socketRef = useRef<typeof Socket | null>(null);

  const getSocketUrl = () => {
    if (__DEV__) {
      // For Android emulator, use 10.0.2.2 to access localhost
      if (Platform.OS === "android") {
        return "http://192.168.60.44:5000";
      }
      // For iOS simulator, use localhost
      return "http://192.168.60.44:5000";
    }
    return "http://192.168.60.44:5000";
  };

  const updateParkingSlots = (availableSlots: number): void => {
    const slots = Array(5).fill(false);
    for (let i = 0; i < Math.min(availableSlots, 5); i++) {
      slots[i] = true;
    }
    setParkingSlots(slots);
  };

  useEffect(() => {
    const connectSocket = () => {
      console.log("Attempting to connect to server...");

      const socket = io(getSocketUrl(), {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true,
      });

      socket.on("connect", () => {
        console.log("Connected to server successfully");
        setIsConnected(true);
        setLastError(null);
      });

      socket.on("connect_error", (error: Error) => {
        console.error("Connection Error:", error.message);
        setIsConnected(false);
        setLastError(error.message);
      });

      socket.on("update_data", (data: ParkingData) => {
        console.log("Received data:", data);
        setLastData(data);
        if (data) {
          updateParkingSlots(data.output);
        }
      });

      socket.on("disconnect", (reason: string) => {
        console.log("Disconnected from server:", reason);
        setIsConnected(false);
        setLastError(`Disconnected: ${reason}`);
      });

      socket.on("error", (error: { message: string }) => {
        console.error("Socket error:", error);
        setLastError(error.message);
      });

      socketRef.current = socket;

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    };

    connectSocket();
  }, []);

  const reconnectToServer = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  const ParkingSlot: React.FC<ParkingSlotProps> = ({ isAvailable, index }) => (
    <View
      style={[
        styles.slot,
        {
          backgroundColor: isAvailable ? colors.green : colors.rose,
        },
      ]}
    >
      <Text style={styles.slotText}>{index + 1}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
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
            <Text style={styles.statusText}>
              {isConnected ? "Live" : "Offline"}
            </Text>
          </View>
          <Text style={styles.availableText}>
            {lastData?.output || 0} spots available
          </Text>
          {lastError && (
            <>
              <Text style={styles.errorText}>{lastError}</Text>
              <TouchableOpacity onPress={reconnectToServer}>
                <Text style={styles.reconnectText}>Tap to reconnect</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Parking Slots Grid */}
        <View style={styles.slotsGrid}>
          {parkingSlots.map((isAvailable, index) => (
            <ParkingSlot key={index} isAvailable={isAvailable} index={index} />
          ))}
        </View>

        {/* Last Data Section */}
        {lastData && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Last Update</Text>
            <View style={styles.dataContent}>
              <Text style={styles.dataText}>
                Client ID: {lastData.client_id}
              </Text>
              <Text style={styles.dataText}>
                Available Slots: {lastData.output}
              </Text>
              <Text style={styles.dataText}>
                Last Updated: {new Date().toLocaleTimeString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Define colors object
const colors = {
  white: "#FFFFFF",
  green: "#22c55e",
  rose: "#ef4444",
  neutral50: "#f9fafb",
  neutral400: "#9ca3af",
  neutral600: "#4b5563",
  neutral800: "#1f2937",
};

// Define spacing constants
const spacing = {
  _5: 5,
  _10: 10,
  _15: 15,
  _20: 20,
};

// Define border radius constants
const radius = {
  _8: 8,
  _12: 12,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing._20,
  },
  statusContainer: {
    backgroundColor: colors.neutral50,
    padding: spacing._15,
    borderRadius: radius._12,
    marginBottom: spacing._20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing._5,
    marginBottom: spacing._5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 16,
    color: colors.neutral600,
  },
  availableText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.neutral800,
  },
  errorText: {
    fontSize: 14,
    color: colors.rose,
    marginTop: spacing._5,
  },
  reconnectText: {
    fontSize: 14,
    color: colors.green,
    marginTop: spacing._5,
    textDecorationLine: "underline",
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing._10,
    marginTop: spacing._10,
  },
  slot: {
    width: "18%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._8,
    marginBottom: spacing._10,
  },
  slotText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  dataContainer: {
    marginTop: spacing._20,
    backgroundColor: colors.neutral50,
    padding: spacing._15,
    borderRadius: radius._12,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral800,
    marginBottom: spacing._10,
  },
  dataContent: {
    backgroundColor: colors.white,
    padding: spacing._15,
    borderRadius: radius._8,
  },
  dataText: {
    fontSize: 14,
    color: colors.neutral600,
    marginBottom: spacing._5,
  },
});

export default PublicParkingView;
