import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/theme";
import Typo from "@/components/Typo";
import { ParkingSpotType, FloorType, SlotType } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLOT_SIZE = (SCREEN_WIDTH - 60) / 4;

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
      return;
    }

    setSelectedSlot(selectedSlot === slot.id ? null : slot.id);
  };

  const handleBooking = () => {
    if (!selectedSlot || !parkingData) return;

    router.push({
      pathname: "/bookingModal",
      params: {
        slotId: selectedSlot,
        parkingId: parkingData.id,
        parkingName: parkingData.parkingName,
        price: parkingData.price || 0,
      },
    });
  };

  if (loading || !parkingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderBottomAction = () => {
    if (!parkingData) return null;

    if (parkingData.type === "public") {
      return (
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: colors.green }]}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/publicparking",
              params: { parkingId: parkingData.id },
            })
          }
        >
          <Typo size={16} color={colors.white} fontWeight="600">
            See Available Slots
          </Typo>
        </TouchableOpacity>
      );
    }

    return selectedSlot ? (
      <TouchableOpacity style={styles.confirmButton} onPress={handleBooking}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Typo size={18} color={colors.white} fontWeight="600">
            Book your slot
          </Typo>
          {parkingData.type === "private" && parkingData.price && (
            <Typo size={14} color={colors.white}>
              ₹{parkingData.price}/hr
            </Typo>
          )}
        </LinearGradient>
      </TouchableOpacity>
    ) : (
      <View style={styles.selectPrompt}>
        <MaterialIcons name="touch-app" size={24} color={colors.neutral500} />
        <Typo size={16} color={colors.neutral500}>
          Select a parking slot to continue
        </Typo>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Typo size={28} color={colors.neutral800} fontWeight="700">
            {parkingData.parkingName}
          </Typo>
          <View style={styles.addressContainer}>
            <MaterialIcons
              name="location-on"
              size={20}
              color={colors.primary}
            />
            <Typo size={16} color={colors.neutral600}>
              {parkingData.address}
            </Typo>
          </View>
        </View>

        {parkingData.floors && parkingData.floors.length > 0 ? (
          <>
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
                    size={16}
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
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.primary },
                  ]}
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
                      size={16}
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
          </>
        ) : (
          <View style={styles.noFloorsMessage}>
            <MaterialIcons name="info" size={24} color={colors.neutral500} />
            <Typo size={16} color={colors.neutral500}>
              No floor plan available for this parking spot
            </Typo>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>{renderBottomAction()}</View>
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
    marginBottom: 24,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  floorSelector: {
    marginBottom: 24,
  },
  floorSelectorContent: {
    gap: 12,
  },
  floorButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.neutral100,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedFloor: {
    backgroundColor: colors.primary,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.neutral50,
    borderRadius: 12,
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
    padding: 20,
    backgroundColor: colors.neutral100,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral900,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
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
  bottomAction: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.white,
  },
  confirmButton: {
    overflow: "hidden",
    borderRadius: 16,
  },
  gradientButton: {
    padding: 20,
    alignItems: "center",
    borderRadius: 16,
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
  noFloorsMessage: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 20,
  },
});

export default SlotBookingModal;
