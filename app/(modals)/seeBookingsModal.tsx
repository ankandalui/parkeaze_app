import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import { verticalScale } from "@/utils/styling";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { useAuth } from "@/context/authContext";

interface Ticket {
  id: string;
  parkingName: string;
  slotNumber: string;
  amount: number;
  bookingTime: string;
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
}

const SeeBookingsModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    if (!user?.uid) return;

    try {
      const ticketsRef = collection(firestore, "users", user.uid, "tickets");
      const q = query(ticketsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const ticketData: Ticket[] = [];
      querySnapshot.forEach((doc) => {
        ticketData.push({ id: doc.id, ...doc.data() } as Ticket);
      });

      setTickets(ticketData);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.green;
      case "completed":
        return colors.neutral600;
      case "cancelled":
        return colors.rose;
      default:
        return colors.neutral600;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.neutral800}
          />
        </TouchableOpacity>
        <Typo size={20} color={colors.neutral800} fontWeight="600">
          My Bookings
        </Typo>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {tickets.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="local-parking"
                size={48}
                color={colors.neutral400}
              />
              <Typo size={16} color={colors.neutral600}>
                No bookings found
              </Typo>
            </View>
          ) : (
            tickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() => {
                  router.push({
                    pathname: "/(modals)/ticketModal",
                    params: {
                      bookingId: ticket.id,
                      parkingName: ticket.parkingName,
                      amount: ticket.amount,
                      slotNumber: ticket.slotNumber,
                      transactionId: ticket.id, // Using ticket.id as transactionId if not available
                    },
                  });
                }}
              >
                <View style={styles.ticketHeader}>
                  <Typo size={16} color={colors.neutral800} fontWeight="600">
                    {ticket.parkingName}
                  </Typo>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status) + "20" },
                    ]}
                  >
                    <Typo
                      size={12}
                      color={getStatusColor(ticket.status)}
                      fontWeight="500"
                    >
                      {ticket.status.toUpperCase()}
                    </Typo>
                  </View>
                </View>

                <View style={styles.ticketDetails}>
                  <View style={styles.detailRow}>
                    <Typo size={14} color={colors.neutral600}>
                      Slot Number
                    </Typo>
                    <Typo size={14} color={colors.neutral800} fontWeight="500">
                      {ticket.slotNumber}
                    </Typo>
                  </View>

                  <View style={styles.detailRow}>
                    <Typo size={14} color={colors.neutral600}>
                      Amount Paid
                    </Typo>
                    <Typo size={14} color={colors.primary} fontWeight="500">
                      ₹{ticket.amount}
                    </Typo>
                  </View>

                  <View style={styles.detailRow}>
                    <Typo size={14} color={colors.neutral600}>
                      Booking Time
                    </Typo>
                    <Typo size={14} color={colors.neutral800}>
                      {new Date(ticket.bookingTime).toLocaleString()}
                    </Typo>
                  </View>
                </View>

                <View style={styles.ticketFooter}>
                  <MaterialIcons
                    name="qr-code"
                    size={20}
                    color={colors.neutral600}
                  />
                  <Typo size={12} color={colors.neutral600}>
                    Tap to view QR code
                  </Typo>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacingX._20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  backButton: {
    marginRight: spacingX._15,
    padding: spacingX._5,
  },
  content: {
    padding: spacingX._20,
    gap: spacingY._15,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacingY._40,
    gap: spacingY._10,
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: radius._17,
    overflow: "hidden",
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
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacingX._15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  statusBadge: {
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: radius._20,
  },
  ticketDetails: {
    padding: spacingX._15,
    gap: spacingY._10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._5,
    padding: spacingX._10,
    backgroundColor: colors.neutral50,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});

export default SeeBookingsModal;
