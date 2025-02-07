import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  Platform,
  TextStyle,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import { verticalScale } from "@/utils/styling";
import { doc, setDoc, collection } from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { useAuth } from "@/context/authContext";
import ViewShot, { captureRef } from "react-native-view-shot";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";

interface TicketData {
  bookingId: string;
  parkingName: string;
  amount: number;
  slotNumber: string;
  bookingTime: string;
  status: string;
  transactionId: string;
  paymentStatus: string;
}

type RouteParams = {
  bookingId?: string;
  parkingName?: string;
  amount?: string;
  slotNumber?: string;
  transactionId?: string;
};

const TicketModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ticketRef = useRef<ViewShot>(null);

  // Debug log for params
  useEffect(() => {
    console.log("Current Route Params:", {
      bookingId: params.bookingId,
      parkingName: params.parkingName,
      amount: params.amount,
      slotNumber: params.slotNumber,
      transactionId: params.transactionId,
    });
  }, [params]);

  const ticketData: TicketData = {
    bookingId: (params.bookingId as string) || "",
    parkingName: (params.parkingName as string) || "",
    amount: Number(params.amount) || 0,
    slotNumber: (params.slotNumber as string) || "Not assigned",
    bookingTime: new Date().toISOString(),
    status: "active",
    transactionId: (params.transactionId as string) || "",
    paymentStatus: "paid",
  };

  useEffect(() => {
    const initializeTicket = async () => {
      if (!params.bookingId || !params.parkingName || !params.amount) {
        console.log("Missing required params:", { params });
        setLoading(false);
        Alert.alert("Error", "Invalid ticket details", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      try {
        await saveTicketToFirebase();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Error initializing ticket:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to save ticket details");
      }
    };

    initializeTicket();
  }, [params]);

  const saveTicketToFirebase = async () => {
    if (!user?.uid || !ticketData.bookingId) {
      console.error("Missing user ID or booking ID:", {
        userId: user?.uid,
        bookingId: ticketData.bookingId,
      });
      throw new Error("Missing required data");
    }

    try {
      const ticketDocRef = doc(
        collection(firestore, "users", user.uid, "tickets"),
        ticketData.bookingId
      );

      await setDoc(ticketDocRef, {
        ...ticketData,
        createdAt: new Date(),
        userId: user.uid,
      });

      console.log("Ticket saved successfully");
      setLoading(false);
    } catch (error) {
      console.error("Error saving ticket:", error);
      throw error;
    }
  };

  const handleShare = async () => {
    if (!ticketRef.current) {
      console.error("ViewShot ref is not available");
      return;
    }

    try {
      const message = `Parking Ticket for ${
        ticketData.parkingName
      }\nBooking ID: ${ticketData.bookingId}\nAmount: ₹${
        ticketData.amount
      }\nSlot: ${ticketData.slotNumber}\nTransaction ID: ${
        ticketData.transactionId
      }\nBooking Time: ${new Date(ticketData.bookingTime).toLocaleString()}`;

      try {
        const uri = await captureRef(ticketRef, {
          format: "png",
          quality: 0.9,
          result: "data-uri",
        });

        await Share.share({
          message,
          url: uri,
        });
      } catch (error) {
        console.error("Error capturing or sharing:", error);
        // Fallback to sharing just text
        await Share.share({ message });
      }
    } catch (error) {
      console.error("Error in handleShare:", error);
      Alert.alert("Error", "Failed to share ticket");
    }
  };

  const handleViewBookings = () => {
    router.push("/(modals)/seeBookingsModal");
  };

  const TicketContent = () => (
    <View style={styles.ticketContainer}>
      <View style={styles.qrSection}>
        <View style={styles.qrBackground}>
          <QRCode
            value={JSON.stringify(ticketData)}
            size={200}
            backgroundColor={colors.white}
            color={colors.neutral800}
          />
        </View>
        <Typo size={12} color={colors.neutral600} style={styles.qrHelp}>
          Show this QR code at the parking entrance
        </Typo>
      </View>

      <View style={styles.ticketDetails}>
        <View style={styles.detailRow}>
          <Typo size={14} color={colors.neutral600}>
            Booking ID
          </Typo>
          <Typo size={14} color={colors.neutral800} fontWeight="600">
            {ticketData.bookingId}
          </Typo>
        </View>

        <View style={styles.detailRow}>
          <Typo size={14} color={colors.neutral600}>
            Location
          </Typo>
          <Typo size={14} color={colors.neutral800} fontWeight="600">
            {ticketData.parkingName}
          </Typo>
        </View>

        <View style={styles.detailRow}>
          <Typo size={14} color={colors.neutral600}>
            Slot Number
          </Typo>
          <Typo
            size={14}
            color={colors.neutral800}
            fontWeight="600"
            style={
              ticketData.slotNumber === "Not assigned"
                ? styles.pendingSlot
                : undefined
            }
          >
            {ticketData.slotNumber}
          </Typo>
        </View>

        <View style={styles.detailRow}>
          <Typo size={14} color={colors.neutral600}>
            Amount Paid
          </Typo>
          <Typo size={14} color={colors.primary} fontWeight="600">
            ₹{ticketData.amount}
          </Typo>
        </View>

        <View style={styles.detailRow}>
          <Typo size={14} color={colors.neutral600}>
            Transaction ID
          </Typo>
          <Typo size={14} color={colors.neutral800} fontWeight="600">
            {ticketData.transactionId}
          </Typo>
        </View>

        <View style={styles.detailRow}>
          <Typo size={14} color={colors.neutral600}>
            Booking Time
          </Typo>
          <Typo size={14} color={colors.neutral800}>
            {new Date(ticketData.bookingTime).toLocaleString()}
          </Typo>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <Header
          title="Update Profile"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        /> */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Header
            title="Booking Confirmed!"
            leftIcon={<BackButton />}
            style={{ marginBottom: spacingY._5 }}
          />
          {/* <Typo size={24} color={colors.white} fontWeight="700">
            Booking Confirmed!
          </Typo> */}
          <Typo size={16} color={colors.neutral100}>
            Your parking spot is reserved
          </Typo>
        </LinearGradient>

        <ViewShot
          ref={ticketRef}
          options={{
            format: "png",
            quality: 0.9,
            result: "data-uri",
          }}
        >
          <TicketContent />
        </ViewShot>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <MaterialIcons name="share" size={20} color={colors.primary} />
            <Typo size={14} color={colors.primary}>
              Share Ticket
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewBookings}
          >
            <MaterialIcons
              name="receipt-long"
              size={20}
              color={colors.primary}
            />
            <Typo size={14} color={colors.primary}>
              View All Bookings
            </Typo>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  header: {
    padding: spacingX._20,
    alignItems: "center",
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(30),
    borderBottomLeftRadius: radius._30,
    borderBottomRightRadius: radius._30,
  },
  ticketContainer: {
    margin: spacingX._20,
    backgroundColor: colors.white,
    borderRadius: radius._20,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pendingSlot: {
    color: colors.neutral600,
    fontStyle: "italic",
  } as TextStyle,
  qrSection: {
    alignItems: "center",
    padding: spacingX._20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  qrBackground: {
    backgroundColor: colors.white,
    padding: spacingX._15,
    borderRadius: radius._10,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  qrHelp: {
    marginTop: spacingY._10,
  },
  ticketDetails: {
    padding: spacingX._20,
    gap: spacingY._15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: spacingX._20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
    padding: spacingX._10,
  },
});

export default TicketModal;
