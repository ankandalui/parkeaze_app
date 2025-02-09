import React from "react";
import { View, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { colors, radius, spacingX } from "@/constants/theme";
import Typo from "@/components/Typo";
import { BookingType } from "@/types";
import { useBookingTimer } from "@/services/useBookingTimer";

interface ParkingTimerProps {
  booking: BookingType;
  onTimeWarning?: () => void;
  onTimeExpired?: () => void;
}

export const ParkingTimer: React.FC<ParkingTimerProps> = ({
  booking,
  onTimeWarning,
  onTimeExpired,
}) => {
  const { formattedTime, isExpired, isWarningTime, isStarted } =
    useBookingTimer({
      booking,
      onTimeWarning,
      onTimeExpired,
    });

  const getStatusColor = () => {
    if (!isStarted) return colors.neutral600;
    if (isExpired) return colors.error;
    if (isWarningTime) return colors.rose;
    return colors.primary;
  };

  const statusColor = getStatusColor();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: statusColor,
          backgroundColor: !isStarted ? colors.neutral100 : colors.white,
        },
      ]}
    >
      <Clock size={20} color={statusColor} />
      <Typo size={16} color={statusColor} fontWeight="600">
        {formattedTime}
      </Typo>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    backgroundColor: colors.white,
    padding: spacingX._12,
    borderRadius: radius._12,
    borderWidth: 1,
  },
});
