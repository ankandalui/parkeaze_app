// src/components/ActiveBookingCard.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { BookingType } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import { ParkingTimer } from "./ParkingTimer";
import { completeBooking } from "@/services/bookingService";
import {
  sendParkingReminder,
  sendParkingExpired,
} from "@/services/notificationService";
import { Timestamp } from "firebase/firestore";
// import { ParkingTimerTest } from "./ParkingTimerTest";

interface ActiveBookingCardProps {
  booking: BookingType;
  onStatusChange?: () => void;
}

// Helper function to convert Timestamp to Date
const getFormattedTime = (time: Date | Timestamp): string => {
  if (time instanceof Date) {
    return time.toLocaleTimeString();
  }
  return time.toDate().toLocaleTimeString();
};

export const ActiveBookingCard: React.FC<ActiveBookingCardProps> = ({
  booking,
  onStatusChange,
}) => {
  const handleTimeWarning = async () => {
    console.log("Sending 15-minute warning notification...");
    await sendParkingReminder(booking);
  };

  const handleTimeExpired = async () => {
    console.log("Handling parking expiry...");
    if (booking.bookingStatus === "confirmed" && booking.id) {
      console.log("Completing booking and sending expiry notification...");
      const result = await completeBooking(booking.id);

      if (result.success) {
        await sendParkingExpired(booking);
        onStatusChange?.();
      } else {
        console.error("Failed to complete booking on expiry");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typo size={18} color={colors.neutral800} fontWeight="600">
          {booking.parkingSpotDetails.parkingName}
        </Typo>
        <ParkingTimer
          booking={booking}
          onTimeWarning={handleTimeWarning}
          onTimeExpired={handleTimeExpired}
        />
        {/* <ParkingTimerTest booking={booking} /> */}
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Typo size={14} color={colors.neutral600}>
            Slot Number
          </Typo>
          <Typo size={14} color={colors.neutral800}>
            {booking.slotNumber}
          </Typo>
        </View>
        <View style={styles.detailRow}>
          <Typo size={14} color={colors.neutral600}>
            Car Details
          </Typo>
          <Typo size={14} color={colors.neutral800}>
            {booking.carName} ({booking.carNumber})
          </Typo>
        </View>
        <View style={styles.detailRow}>
          <Typo size={14} color={colors.neutral600}>
            Duration
          </Typo>
          <Typo size={14} color={colors.neutral800}>
            {booking.duration}h
          </Typo>
        </View>
        {booking.startTime && (
          <View style={styles.detailRow}>
            <Typo size={14} color={colors.neutral600}>
              Start Time
            </Typo>
            <Typo size={14} color={colors.neutral800}>
              {getFormattedTime(booking.startTime)}
            </Typo>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius._17,
    padding: spacingX._15,
    gap: spacingY._15,
    borderWidth: 1,
    borderColor: colors.neutral200,
    marginBottom: spacingY._15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  details: {
    gap: spacingY._7,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
