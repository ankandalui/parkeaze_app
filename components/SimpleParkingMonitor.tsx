import { StyleSheet, Text, View, Alert, AppState } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Manager, Socket as SocketType } from "socket.io-client";

interface UpdateData {
  client_id: number;
  output: number;
}

interface SocketError {
  message: string;
}

const SOCKET_URL = "https://websocket-parking.onrender.com";
const TOTAL_SPOTS = 5;

const SimpleParkingMonitor = () => {
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [availableSpots, setAvailableSpots] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const socketRef = useRef<typeof SocketType | null>(null);
  const reconnectAttempts = useRef(0);
  const appState = useRef(AppState.currentState);

  const setupSocket = () => {
    try {
      const manager = new Manager(SOCKET_URL, {
        transports: ["polling", "websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true,
        path: "/socket.io",
      });

      const socket = manager.socket("/");
      socketRef.current = socket;

      // Connection handlers
      socket.on("connect", () => {
        console.log("Socket connected successfully:", socket.id);
        setConnectionStatus("Connected");
        setErrorMessage("");
        reconnectAttempts.current = 0;
      });

      socket.on("connect_error", (error: SocketError) => {
        const errorMsg = `Connection error: ${error.message}`;
        console.error("Connection error details:", {
          error,
          attempts: reconnectAttempts.current,
        });
        setConnectionStatus("Disconnected");
        setErrorMessage(errorMsg);

        reconnectAttempts.current += 1;
        if (reconnectAttempts.current === 1) {
          Alert.alert("Connection Error", errorMsg);
        }
      });

      socket.on("disconnect", (reason: string) => {
        console.log("Socket disconnected:", reason);
        setConnectionStatus("Disconnected");
        if (reason === "io server disconnect") {
          // Server initiated disconnect, attempt reconnection
          socket.connect();
        }
      });

      // Data update handler
      socket.on("update_data", (data: UpdateData) => {
        console.log("Received parking update:", data);
        if (typeof data.output === "number" && !isNaN(data.output)) {
          setAvailableSpots(data.output);
          setLastUpdate(new Date().toLocaleTimeString());
        } else {
          console.warn("Received invalid parking data:", data);
        }
      });

      // Reconnection handlers
      socket.io.on("reconnect_attempt", (attempt: number) => {
        console.log("Attempting to reconnect:", attempt);
        setConnectionStatus(`Reconnecting (${attempt})...`);

        // Switch transport strategy after multiple failures
        if (attempt > 2) {
          socket.io.opts.transports = ["polling", "websocket"];
        }
      });

      socket.io.on("reconnect_failed", () => {
        setConnectionStatus("Connection Failed");
        setErrorMessage("Failed to connect after multiple attempts");
        Alert.alert(
          "Connection Failed",
          "Unable to connect to parking server. Please check your connection and try again."
        );
      });

      return socket;
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Socket setup error:", error);
      setErrorMessage(`Setup error: ${error.message}`);
      return null;
    }
  };

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground!");
        // Reconnect socket if needed
        if (!socketRef.current?.connected) {
          socketRef.current?.connect();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Setup socket connection
  useEffect(() => {
    const socket = setupSocket();

    return () => {
      console.log("Cleaning up socket connection");
      if (socket) {
        socket.disconnect();
        socket.removeAllListeners();
      }
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "Connected":
        return "#4CAF50";
      case "Disconnected":
        return "#F44336";
      default:
        return "#FFA726";
    }
  };

  const getSpotsColor = () => {
    const ratio = availableSpots / TOTAL_SPOTS;
    if (ratio > 0.5) return "#4CAF50";
    if (ratio > 0.2) return "#FFA726";
    return "#F44336";
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <Text style={styles.title}>Parking Monitor</Text>

        <View
          style={[
            styles.connectionIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        >
          <Text style={styles.connectionText}>{connectionStatus}</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Available Spots:</Text>
          <Text style={[styles.value, { color: getSpotsColor() }]}>
            {availableSpots} / {TOTAL_SPOTS}
          </Text>
        </View>

        {lastUpdate && (
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>{lastUpdate}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  connectionIndicator: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: "center",
  },
  connectionText: {
    color: "white",
    fontWeight: "bold",
  },
  errorContainer: {
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SimpleParkingMonitor;
