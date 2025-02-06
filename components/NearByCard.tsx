import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import Typo from "@/components/Typo";
import { ParkingSpotType } from "@/types";
import { Region } from "react-native-maps";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;

interface NearbyCardProps {
  spots: ParkingSpotType[];
  userLocation: Region | null;
  onSpotSelect: (spot: ParkingSpotType) => void;
  activeSpotId: string | null;
}

const NearbyCard = ({
  spots,
  userLocation,
  onSpotSelect,
  activeSpotId,
}: NearbyCardProps) => {
  const router = useRouter();

  const calculateDistance = (spot: ParkingSpotType) => {
    if (!userLocation) return "N/A";

    const R = 6371; // Earth's radius in km
    const dLat = (spot.latitude - userLocation.latitude) * (Math.PI / 180);
    const dLon = (spot.longitude - userLocation.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.latitude * (Math.PI / 180)) *
        Math.cos(spot.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance < 1
      ? `${(distance * 1000).toFixed(0)}m`
      : `${distance.toFixed(1)}km`;
  };

  if (spots.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      snapToInterval={CARD_WIDTH + 20}
      decelerationRate="fast"
    >
      {spots.map((spot) => (
        <TouchableOpacity
          key={spot.id}
          style={[styles.card, activeSpotId === spot.id && styles.activeCard]}
          onPress={() => {
            onSpotSelect(spot);
            router.push({
              pathname: "/(modals)/slotBookingModal",
              params: {
                parkingData: JSON.stringify(spot),
              },
            });
          }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Typo
                size={18}
                color={colors.neutral800}
                fontWeight="600"
                style={styles.parkingName}
              >
                {spot.parkingName}
              </Typo>
              <View style={styles.distanceRow}>
                <MaterialIcons
                  name="location-on"
                  size={16}
                  color={colors.primary}
                />
                <Typo size={14} color={colors.neutral600}>
                  {calculateDistance(spot)}
                </Typo>
              </View>
            </View>
            <View
              style={[
                styles.typeTag,
                {
                  backgroundColor:
                    spot.type === "public" ? colors.green : colors.primary,
                },
              ]}
            >
              <Typo size={12} color={colors.white} fontWeight="600">
                {spot.type.toUpperCase()}
              </Typo>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MaterialIcons
                name="local-parking"
                size={18}
                color={colors.primary}
              />
              <Typo size={14} color={colors.neutral600}>
                {spot.totalSpots} total spots
              </Typo>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons
                name="access-time"
                size={18}
                color={colors.primary}
              />
              <Typo size={14} color={colors.neutral600}>
                {spot.operatingHours.open} - {spot.operatingHours.close}
              </Typo>
            </View>

            {spot.type === "private" && spot.price !== null && (
              <View style={styles.priceTag}>
                <MaterialIcons
                  name="attach-money"
                  size={16}
                  color={colors.white}
                />
                <Typo size={14} color={colors.white} fontWeight="600">
                  {spot.price === 0 ? "Free" : `${spot.price}/hr`}
                </Typo>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Typo size={13} color={colors.neutral500}>
              {spot.address}
            </Typo>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    marginRight: 15,
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
  activeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    transform: [{ scale: 1.02 }],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  parkingName: {
    marginBottom: 4,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  infoContainer: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceTag: {
    position: "absolute",
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    paddingTop: 10,
  },
});

export default NearbyCard;
