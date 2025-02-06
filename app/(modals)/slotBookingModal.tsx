import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  WithSpringConfig,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";
import Typo from "@/components/Typo";
import { ParkingSpotType, FloorType, SlotType } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLOT_SIZE = (SCREEN_WIDTH - 60) / 4;

const springConfig: WithSpringConfig = {
  damping: 15,
  stiffness: 120,
  mass: 0.8,
};

interface SlotStatus {
  [key: string]: "available" | "selected" | "booked";
}

const SlotBookingModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // State
  const [parkingData, setParkingData] = useState<ParkingSpotType | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<FloorType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotStatus, setSlotStatus] = useState<SlotStatus>({});
  const [loading, setLoading] = useState(true);

  // Animation values
  const carX = useSharedValue(0);
  const carY = useSharedValue(60);
  const carRotate = useSharedValue("0deg");
  const carScale = useSharedValue(0);
  const carOpacity = useSharedValue(0);

  useEffect(() => {
    if (params.parkingData) {
      const data = JSON.parse(params.parkingData as string) as ParkingSpotType;
      setParkingData(data);
      if (data.floors && data.floors.length > 0) {
        setSelectedFloor(data.floors[0]);
        // Initialize random slot statuses for demonstration
        const initialStatus: SlotStatus = {};
        data.floors.forEach((floor) => {
          floor.slots.forEach((slot) => {
            initialStatus[slot.id] =
              Math.random() > 0.3 ? "available" : "booked";
          });
        });
        setSlotStatus(initialStatus);
      }
      setLoading(false);
    }
  }, [params.parkingData]);

  const handleSlotPress = (slot: SlotType) => {
    if (slotStatus[slot.id] === "booked") {
      Alert.alert("Slot Unavailable", "This parking slot is already booked.");
      return;
    }

    if (selectedSlot === slot.id) {
      setSelectedSlot(null);
      carScale.value = withSpring(0, springConfig);
      carOpacity.value = withSpring(0, springConfig);
      return;
    }

    setSelectedSlot(slot.id);

    // Calculate slot position for car animation
    const slotIndex =
      selectedFloor?.slots.findIndex((s) => s.id === slot.id) || 0;
    const row = Math.floor(slotIndex / 4);
    const col = slotIndex % 4;

    const newX = 30 + col * SLOT_SIZE + SLOT_SIZE / 2 - 20;
    const newY = 100 + row * (SLOT_SIZE + 10) + SLOT_SIZE / 2 - 20;

    carX.value = withSpring(newX, springConfig);
    carY.value = withSpring(newY, springConfig);
    carRotate.value = withSpring(col < 2 ? "-90deg" : "90deg", springConfig);

    if (carScale.value === 0) {
      carScale.value = withSpring(1, springConfig);
      carOpacity.value = withSpring(1, springConfig);
    }
  };

  const handleBooking = () => {
    if (!selectedSlot) return;

    Alert.alert(
      "Confirm Booking",
      "Do you want to proceed with booking this slot?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            // Here you would typically make an API call to book the slot
            Alert.alert("Success", "Slot booked successfully!", [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]);
          },
        },
      ]
    );
  };

  const animatedCarStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: carX.value },
      { translateY: carY.value },
      { rotate: carRotate.value },
      { scale: carScale.value },
    ],
    opacity: carOpacity.value,
  }));

  if (loading || !parkingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Typo size={24} color={colors.neutral800} fontWeight="700">
            {parkingData.parkingName}
          </Typo>
          <Typo size={16} color={colors.neutral600}>
            {parkingData.address}
          </Typo>
        </View>

        {/* Floor Selection */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.floorSelector}
          contentContainerStyle={styles.floorSelectorContent}
        >
          {parkingData.floors.map((floor) => (
            <TouchableOpacity
              key={floor.floorNumber}
              style={[
                styles.floorButton,
                selectedFloor?.floorNumber === floor.floorNumber &&
                  styles.selectedFloor,
              ]}
              onPress={() => setSelectedFloor(floor)}
            >
              <Typo
                size={14}
                color={
                  selectedFloor?.floorNumber === floor.floorNumber
                    ? colors.white
                    : colors.neutral600
                }
                fontWeight="600"
              >
                {floor.floorName}
              </Typo>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.primary }]}
            />
            <Typo size={14} color={colors.neutral600}>
              Available
            </Typo>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.green }]}
            />
            <Typo size={14} color={colors.neutral600}>
              Selected
            </Typo>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.rose }]}
            />
            <Typo size={14} color={colors.neutral600}>
              Booked
            </Typo>
          </View>
        </View>

        {/* Parking Layout */}
        <View style={styles.parkingLayout}>
          <Animated.View style={[styles.carImage, animatedCarStyle]}>
            <Image
              source={require("@/assets/images/car.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Animated.View>

          <View style={styles.slotsGrid}>
            {selectedFloor?.slots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slot,
                  slotStatus[slot.id] === "booked" && styles.bookedSlot,
                  selectedSlot === slot.id && styles.selectedSlot,
                ]}
                onPress={() => handleSlotPress(slot)}
                disabled={slotStatus[slot.id] === "booked"}
              >
                <Typo
                  size={14}
                  color={
                    slotStatus[slot.id] === "booked"
                      ? colors.rose
                      : selectedSlot === slot.id
                      ? colors.green
                      : colors.primary
                  }
                  fontWeight="600"
                >
                  {slot.slotNumber}
                </Typo>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        {selectedSlot ? (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleBooking}
          >
            <Typo size={16} color={colors.white} fontWeight="600">
              Confirm Booking
            </Typo>
            {parkingData.type === "private" && parkingData.price && (
              <Typo size={14} color={colors.white}>
                ${parkingData.price}/hr
              </Typo>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.selectPrompt}>
            <MaterialIcons
              name="touch-app"
              size={24}
              color={colors.neutral500}
            />
            <Typo size={16} color={colors.neutral500}>
              Select a parking slot
            </Typo>
          </View>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
  },
  floorSelector: {
    marginBottom: 20,
  },
  floorSelectorContent: {
    gap: 10,
  },
  floorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.neutral100,
    marginRight: 10,
  },
  selectedFloor: {
    backgroundColor: colors.primary,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  parkingLayout: {
    position: "relative",
    padding: 15,
    backgroundColor: colors.neutral100,
    borderRadius: 12,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  selectedSlot: {
    borderStyle: "solid",
    borderColor: colors.green,
    borderWidth: 2,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  bookedSlot: {
    borderStyle: "solid",
    borderColor: colors.rose,
    backgroundColor: "rgba(244, 63, 94, 0.1)",
  },
  carImage: {
    position: "absolute",
    width: 40,
    height: 40,
    zIndex: 10,
  },
  bottomAction: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  selectPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: colors.neutral100,
    borderRadius: 12,
  },
});

export default SlotBookingModal;
