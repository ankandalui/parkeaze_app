// modals/PaymentModal.tsx
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import { MaterialIcons } from "@expo/vector-icons";
import { updateBookingPayment } from "@/services/bookingService";
import { PaymentStatus } from "@/types";
import { verticalScale } from "@/utils/styling";
import { Timestamp } from "firebase/firestore";

const PaymentModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const slideAnim = new Animated.Value(0);

  // Get params passed from BookingModal
  const bookingId = params.bookingId as string;
  const amount = Number(params.amount) || 0;
  const parkingName = params.parkingName as string;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePayment = async () => {
    console.log("Starting payment process for booking:", bookingId);
    console.log("Payment amount:", amount);
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const transactionId = `TXN${Date.now()}`;

      const paymentDetails = {
        bookingId,
        amount,
        parkingName,
        transactionId,
        status: "paid" as PaymentStatus,
        paymentTime: Timestamp.now(), // Changed from new Date() to Timestamp.now()
      };

      const response = await updateBookingPayment(bookingId, paymentDetails);

      if (response.success) {
        router.push({
          pathname: "/(tabs)",
        });
      } else {
        throw new Error(response.msg);
      }
    } catch (error: any) {
      Alert.alert("Payment Failed", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => router.back());
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <MaterialIcons
            name="close"
            size={verticalScale(24)}
            color={colors.neutral600}
          />
        </TouchableOpacity>
        <Typo
          size={verticalScale(18)}
          color={colors.neutral800}
          fontWeight="600"
        >
          Payment Details
        </Typo>
      </View>

      <View style={styles.content}>
        <View style={styles.parkingDetails}>
          <Typo size={verticalScale(16)} color={colors.neutral800}>
            {parkingName}
          </Typo>
          <Typo
            size={verticalScale(24)}
            color={colors.primary}
            fontWeight="700"
          >
            ${amount.toFixed(2)}
          </Typo>
        </View>

        <View style={styles.paymentMethods}>
          <Typo
            size={verticalScale(16)}
            color={colors.neutral800}
            fontWeight="600"
          >
            Payment Method
          </Typo>

          <TouchableOpacity style={styles.paymentMethod}>
            <MaterialIcons
              name="payment"
              size={verticalScale(24)}
              color={colors.primary}
            />
            <View style={styles.paymentMethodText}>
              <Typo size={verticalScale(16)} color={colors.neutral800}>
                Test Payment
              </Typo>
              <Typo size={verticalScale(14)} color={colors.neutral600}>
                Simulated Payment
              </Typo>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Typo size={verticalScale(14)} color={colors.neutral600}>
              Parking Fee
            </Typo>
            <Typo size={verticalScale(14)} color={colors.neutral800}>
              ${amount.toFixed(2)}
            </Typo>
          </View>
          <View style={styles.summaryRow}>
            <Typo size={verticalScale(14)} color={colors.neutral600}>
              Platform Fee
            </Typo>
            <Typo size={verticalScale(14)} color={colors.neutral800}>
              $0.00
            </Typo>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Typo
              size={verticalScale(16)}
              color={colors.neutral800}
              fontWeight="600"
            >
              Total
            </Typo>
            <Typo
              size={verticalScale(16)}
              color={colors.neutral800}
              fontWeight="600"
            >
              ${amount.toFixed(2)}
            </Typo>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.disabledButton]}
          onPress={handlePayment}
          disabled={loading}
        >
          <Typo size={verticalScale(16)} color={colors.white} fontWeight="600">
            {loading ? "Processing..." : "Pay Now"}
          </Typo>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default PaymentModal;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(54),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  closeButton: {
    position: "absolute",
    left: spacingX._15,
    padding: spacingX._5,
  },
  content: {
    padding: spacingX._20,
    gap: spacingY._20,
  },
  parkingDetails: {
    alignItems: "center",
    gap: spacingY._10,
  },
  paymentMethods: {
    gap: spacingY._10,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    height: verticalScale(54),
    paddingHorizontal: spacingX._15,
    backgroundColor: colors.neutral100,
    borderRadius: radius._17,
    borderCurve: "continuous",
    gap: spacingX._10,
  },
  paymentMethodText: {
    flex: 1,
  },
  summary: {
    gap: spacingY._10,
    paddingTop: spacingY._10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRow: {
    paddingTop: spacingY._10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  payButton: {
    height: verticalScale(54),
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._17,
    borderCurve: "continuous",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
