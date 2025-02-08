// App.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";

// Types
interface Car {
  id: string;
  duration: number;
}

interface CarPosition {
  [key: string]: string;
}

// Constants
const T_LOW = 2;
const T_MEDIUM = 4;
const L0_CAPACITY = 5;
const L1_CAPACITY = 5;
const L2_CAPACITY = 5;

export default function StackParkingModal() {
  // State
  const [L0, setL0] = useState<Car[]>([]);
  const [L1, setL1] = useState<Car[]>([]);
  const [L2, setL2] = useState<Car[]>([]);
  const [carPositions, setCarPositions] = useState<CarPosition>({});
  const [carId, setCarId] = useState("");
  const [duration, setDuration] = useState("");

  // Park car function
  const parkCar = (carId: string, duration: number) => {
    if (!carId.trim() || duration <= 0) {
      Alert.alert("Error", "Please enter valid car ID and duration");
      return;
    }

    if (carPositions[carId]) {
      Alert.alert("Error", "Car ID already exists");
      return;
    }

    if (duration <= T_LOW && L0.length < L0_CAPACITY) {
      setL0([...L0, { id: carId, duration }]);
      setCarPositions({ ...carPositions, [carId]: "L0" });
      Alert.alert("Success", `Car ${carId} parked in Ground Level (L0)`);
    } else if (duration <= T_MEDIUM && L1.length < L1_CAPACITY) {
      setL1([...L1, { id: carId, duration }]);
      setCarPositions({ ...carPositions, [carId]: "L1" });
      Alert.alert("Success", `Car ${carId} parked in Middle Level (L1)`);
    } else if (L2.length < L2_CAPACITY) {
      setL2([...L2, { id: carId, duration }]);
      setCarPositions({ ...carPositions, [carId]: "L2" });
      Alert.alert("Success", `Car ${carId} parked in Top Level (L2)`);
    } else {
      Alert.alert("Error", `Parking Full! Car ${carId} cannot be parked.`);
    }

    // Clear inputs
    setCarId("");
    setDuration("");
  };

  // Exit car function
  const exitCar = (carId: string) => {
    if (!carPositions[carId]) {
      Alert.alert("Error", `Car ${carId} not found.`);
      return;
    }

    const level = carPositions[carId];
    if (level === "L0") {
      setL0(L0.filter((car) => car.id !== carId));
      const newPositions = { ...carPositions };
      delete newPositions[carId];
      setCarPositions(newPositions);
      Alert.alert("Success", `Car ${carId} exited from L0.`);
    } else {
      Alert.alert(
        "Error",
        `Car ${carId} is in ${level} and cannot exit until L0 is clear.`
      );
    }
  };

  // Render parking level status
  const renderParkingStatus = (
    level: Car[],
    capacity: number,
    levelName: string
  ) => (
    <View style={styles.levelStatus}>
      <Text style={styles.levelTitle}>{levelName}</Text>
      <Text style={styles.levelInfo}>
        Occupied: {level.length} / {capacity}
      </Text>
      <ScrollView style={styles.carList}>
        {level.map((car) => (
          <Text key={car.id} style={styles.carItem}>
            {car.id} ({car.duration}h)
          </Text>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Smart Parking System</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Car ID"
          value={carId}
          onChangeText={setCarId}
        />
        <TextInput
          style={styles.input}
          placeholder="Duration (hours)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => parkCar(carId, Number(duration))}
        >
          <Text style={styles.buttonText}>Park Car</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.exitButton]}
          onPress={() => exitCar(carId)}
        >
          <Text style={styles.buttonText}>Exit Car</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.statusContainer}>
        {renderParkingStatus(L0, L0_CAPACITY, "Ground Level (L0)")}
        {renderParkingStatus(L1, L1_CAPACITY, "Middle Level (L1)")}
        {renderParkingStatus(L2, L2_CAPACITY, "Top Level (L2)")}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  exitButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  statusContainer: {
    flex: 1,
  },
  levelStatus: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  levelInfo: {
    marginBottom: 5,
  },
  carList: {
    maxHeight: 100,
  },
  carItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
