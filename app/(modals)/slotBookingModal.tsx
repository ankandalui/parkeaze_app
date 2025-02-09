// import React, { useState, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Dimensions,
//   Platform,
//   Alert,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { MaterialIcons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { collection, query, where, onSnapshot } from "firebase/firestore";
// import { firestore } from "@/config/firebase";
// import { colors, radius, spacingX, spacingY } from "@/constants/theme";
// import Typo from "@/components/Typo";
// import { ParkingSpotType, FloorType, SlotType } from "@/types";
// import { useAuth } from "@/context/authContext";
// import { verticalScale } from "@/utils/styling";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");
// const SLOT_SIZE = (SCREEN_WIDTH - 60) / 4;

// interface SlotStatus {
//   [key: string]: {
//     status: "available" | "selected" | "booked";
//     userId?: string;
//     slotNumber?: string;
//   };
// }

// const SlotBookingModal = () => {
//   const { user } = useAuth();
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const [parkingData, setParkingData] = useState<ParkingSpotType | null>(null);
//   const [selectedFloor, setSelectedFloor] = useState<FloorType | null>(null);
//   const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
//   const [selectedSlotNumber, setSelectedSlotNumber] = useState<string | null>(
//     null
//   );
//   const [slotStatus, setSlotStatus] = useState<SlotStatus>({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (params.parkingData) {
//       const data = JSON.parse(params.parkingData as string) as ParkingSpotType;
//       setParkingData(data);
//       if (data.floors && data.floors.length > 0) {
//         setSelectedFloor(data.floors[0]);
//       }
//       setLoading(false);
//     }
//   }, [params.parkingData]);

//   useEffect(() => {
//     if (!parkingData?.id) return;

//     const bookingsRef = collection(firestore, "bookings");
//     const activeBookingsQuery = query(
//       bookingsRef,
//       where("parkingSpotId", "==", parkingData.id),
//       where("bookingStatus", "in", ["pending", "confirmed"])
//     );

//     const unsubscribe = onSnapshot(activeBookingsQuery, (snapshot) => {
//       const newSlotStatus: SlotStatus = {};

//       // Initialize all slots as available
//       parkingData.floors.forEach((floor) => {
//         floor.slots.forEach((slot) => {
//           newSlotStatus[slot.id] = {
//             status: "available",
//             slotNumber: slot.slotNumber,
//           };
//         });
//       });

//       // Update booked slots
//       snapshot.forEach((doc) => {
//         const booking = doc.data();
//         if (booking.slotId) {
//           newSlotStatus[booking.slotId] = {
//             status: "booked",
//             userId: booking.userId,
//             slotNumber: booking.slotNumber,
//           };
//         }
//       });

//       setSlotStatus(newSlotStatus);
//     });

//     return () => unsubscribe();
//   }, [parkingData?.id]);

//   const handleSlotPress = (slot: SlotType) => {
//     if (!user?.uid) {
//       Alert.alert("Error", "Please login to book a slot");
//       return;
//     }

//     const currentStatus = slotStatus[slot.id];

//     // Can't select if booked by someone else
//     if (
//       currentStatus?.status === "booked" &&
//       currentStatus.userId !== user.uid
//     ) {
//       return;
//     }

//     // Toggle selection
//     if (selectedSlot === slot.id) {
//       setSelectedSlot(null);
//       setSelectedSlotNumber(null);
//     } else {
//       setSelectedSlot(slot.id);
//       setSelectedSlotNumber(slot.slotNumber);
//     }
//   };

//   const handleBooking = () => {
//     if (!selectedSlot || !parkingData || !user?.uid || !selectedSlotNumber)
//       return;

//     router.push({
//       pathname: "/bookingModal",
//       params: {
//         slotId: selectedSlot,
//         slotNumber: selectedSlotNumber,
//         parkingId: parkingData.id,
//         parkingName: parkingData.parkingName,
//         price: parkingData.price || 0,
//       },
//     });
//   };

//   if (loading || !parkingData) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={colors.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <Typo size={28} color={colors.neutral800} fontWeight="700">
//             {parkingData.parkingName}
//           </Typo>
//           <View style={styles.addressContainer}>
//             <MaterialIcons
//               name="location-on"
//               size={20}
//               color={colors.primary}
//             />
//             <Typo size={16} color={colors.neutral600}>
//               {parkingData.address}
//             </Typo>
//           </View>
//         </View>

//         {/* Floor Selection */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.floorSelector}
//           contentContainerStyle={styles.floorSelectorContent}
//         >
//           {parkingData.floors.map((floor) => (
//             <TouchableOpacity
//               key={floor.floorNumber}
//               style={[
//                 styles.floorButton,
//                 selectedFloor?.floorNumber === floor.floorNumber &&
//                   styles.selectedFloor,
//               ]}
//               onPress={() => setSelectedFloor(floor)}
//             >
//               <Typo
//                 size={16}
//                 color={
//                   selectedFloor?.floorNumber === floor.floorNumber
//                     ? colors.white
//                     : colors.neutral600
//                 }
//                 fontWeight="600"
//               >
//                 {floor.floorName}
//               </Typo>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Legend */}
//         <View style={styles.legend}>
//           <View style={styles.legendItem}>
//             <View
//               style={[styles.legendDot, { backgroundColor: colors.primary }]}
//             />
//             <Typo size={14} color={colors.neutral600}>
//               Available
//             </Typo>
//           </View>
//           <View style={styles.legendItem}>
//             <View
//               style={[styles.legendDot, { backgroundColor: colors.green }]}
//             />
//             <Typo size={14} color={colors.neutral600}>
//               Selected
//             </Typo>
//           </View>
//           <View style={styles.legendItem}>
//             <View
//               style={[styles.legendDot, { backgroundColor: colors.rose }]}
//             />
//             <Typo size={14} color={colors.neutral600}>
//               Booked
//             </Typo>
//           </View>
//         </View>

//         {/* Parking Layout */}
//         <View style={styles.parkingLayout}>
//           <View style={styles.slotsGrid}>
//             {selectedFloor?.slots.map((slot) => {
//               const status = slotStatus[slot.id];
//               const isBooked = status?.status === "booked";
//               const isSelected = selectedSlot === slot.id;

//               return (
//                 <TouchableOpacity
//                   key={slot.id}
//                   style={[
//                     styles.slot,
//                     isBooked && styles.bookedSlot,
//                     isSelected && styles.selectedSlot,
//                   ]}
//                   onPress={() => handleSlotPress(slot)}
//                   disabled={isBooked && status.userId !== user?.uid}
//                 >
//                   <Typo
//                     size={16}
//                     color={
//                       isBooked
//                         ? colors.rose
//                         : isSelected
//                           ? colors.green
//                           : colors.primary
//                     }
//                     fontWeight="600"
//                   >
//                     {slot.slotNumber}
//                   </Typo>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom Action */}
//       <View style={styles.bottomAction}>
//         {selectedSlot ? (
//           <TouchableOpacity
//             style={styles.confirmButton}
//             onPress={handleBooking}
//           >
//             <LinearGradient
//               colors={[colors.primary, colors.primaryDark]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               style={styles.gradientButton}
//             >
//               <Typo size={18} color={colors.white} fontWeight="600">
//                 Book slot {selectedSlotNumber}
//               </Typo>
//               {parkingData.type === "private" && parkingData.price && (
//                 <Typo size={14} color={colors.white}>
//                   ₹{parkingData.price}/hr
//                 </Typo>
//               )}
//             </LinearGradient>
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.selectPrompt}>
//             <MaterialIcons
//               name="touch-app"
//               size={24}
//               color={colors.neutral500}
//             />
//             <Typo size={16} color={colors.neutral500}>
//               Select a parking slot to continue
//             </Typo>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   scrollContent: {
//     padding: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   header: {
//     marginBottom: 24,
//   },
//   addressContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//     gap: 4,
//   },
//   floorSelector: {
//     marginBottom: 24,
//   },
//   floorSelectorContent: {
//     gap: 12,
//   },
//   floorButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 12,
//     backgroundColor: colors.neutral100,
//     marginRight: 12,
//     ...Platform.select({
//       ios: {
//         shadowColor: colors.neutral900,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   selectedFloor: {
//     backgroundColor: colors.primary,
//   },
//   legend: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 24,
//     padding: 16,
//     backgroundColor: colors.neutral50,
//     borderRadius: 12,
//   },
//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   legendDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//   },
//   parkingLayout: {
//     padding: 20,
//     backgroundColor: colors.neutral100,
//     borderRadius: 16,
//     ...Platform.select({
//       ios: {
//         shadowColor: colors.neutral900,
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   slotsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 12,
//     justifyContent: "center",
//   },
//   slot: {
//     width: SLOT_SIZE,
//     height: SLOT_SIZE,
//     borderWidth: 2,
//     borderColor: colors.primary,
//     borderStyle: "dashed",
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: colors.white,
//   },
//   selectedSlot: {
//     borderStyle: "solid",
//     borderColor: colors.green,
//     borderWidth: 2,
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//   },
//   bookedSlot: {
//     borderStyle: "solid",
//     borderColor: colors.rose,
//     backgroundColor: "rgba(244, 63, 94, 0.1)",
//   },
//   bottomAction: {
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: colors.neutral200,
//     backgroundColor: colors.white,
//   },
//   confirmButton: {
//     overflow: "hidden",
//     borderRadius: 16,
//   },
//   gradientButton: {
//     padding: 20,
//     alignItems: "center",
//     borderRadius: 16,
//   },
//   selectPrompt: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//     padding: 16,
//     backgroundColor: colors.neutral100,
//     borderRadius: 12,
//   },
// });

// export default SlotBookingModal;

// src/components/SlotBookingModal.tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import { ParkingSpotType, FloorType, SlotType } from "@/types";
import { useAuth } from "@/context/authContext";
import { validateSlotAvailability } from "@/services/bookingService";
import useNotifications from "@/services/useNotifications";
import { verticalScale } from "@/utils/styling";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLOT_SIZE = (SCREEN_WIDTH - 60) / 4;

interface SlotStatus {
  [key: string]: {
    status: "available" | "selected" | "booked";
    userId?: string;
    slotNumber?: string;
  };
}

const SlotBookingModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setupNotifications } = useNotifications();

  const [parkingData, setParkingData] = useState<ParkingSpotType | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<FloorType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<string | null>(
    null
  );
  const [slotStatus, setSlotStatus] = useState<SlotStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    if (params.parkingData) {
      const data = JSON.parse(params.parkingData as string) as ParkingSpotType;
      setParkingData(data);
      if (data.floors && data.floors.length > 0) {
        setSelectedFloor(data.floors[0]);
      }
      setLoading(false);
    }
  }, [params.parkingData]);

  useEffect(() => {
    if (!parkingData?.id) return;

    const bookingsRef = collection(firestore, "bookings");
    const activeBookingsQuery = query(
      bookingsRef,
      where("parkingSpotId", "==", parkingData.id),
      where("bookingStatus", "in", ["pending", "confirmed"])
    );

    const unsubscribe = onSnapshot(activeBookingsQuery, (snapshot) => {
      const newSlotStatus: SlotStatus = {};

      // Initialize all slots as available
      parkingData.floors.forEach((floor) => {
        floor.slots.forEach((slot) => {
          newSlotStatus[slot.id] = {
            status: "available",
            slotNumber: slot.slotNumber,
          };
        });
      });

      // Update booked slots
      snapshot.forEach((doc) => {
        const booking = doc.data();
        if (booking.slotId) {
          newSlotStatus[booking.slotId] = {
            status: "booked",
            userId: booking.userId,
            slotNumber: booking.slotNumber,
          };
        }
      });

      setSlotStatus(newSlotStatus);
    });

    return () => unsubscribe();
  }, [parkingData?.id]);

  const handleSlotPress = async (slot: SlotType) => {
    if (!user?.uid) {
      Alert.alert("Error", "Please login to book a slot");
      return;
    }

    if (!parkingData) {
      Alert.alert("Error", "Parking data not available");
      return;
    }

    const currentStatus = slotStatus[slot.id];

    // Can't select if booked
    if (currentStatus?.status === "booked") {
      Alert.alert("Slot Unavailable", "This slot is already booked");
      return;
    }

    // Double-check availability before selection
    const isAvailable = await validateSlotAvailability(parkingData.id, slot.id);
    if (!isAvailable) {
      Alert.alert(
        "Slot Unavailable",
        "This slot was just booked by someone else"
      );
      return;
    }

    // Toggle selection
    if (selectedSlot === slot.id) {
      setSelectedSlot(null);
      setSelectedSlotNumber(null);
    } else {
      setSelectedSlot(slot.id);
      setSelectedSlotNumber(slot.slotNumber);
    }
  };

  const handleBooking = () => {
    if (!selectedSlot || !parkingData || !user?.uid || !selectedSlotNumber)
      return;

    router.push({
      pathname: "/bookingModal",
      params: {
        slotId: selectedSlot,
        slotNumber: selectedSlotNumber,
        parkingId: parkingData.id,
        parkingName: parkingData.parkingName,
        price: parkingData.price || 0,
        address: parkingData.address,
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
          <View style={styles.slotsGrid}>
            {selectedFloor?.slots.map((slot) => {
              const status = slotStatus[slot.id];
              const isBooked = status?.status === "booked";
              const isSelected = selectedSlot === slot.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slot,
                    isBooked && styles.bookedSlot,
                    isSelected && styles.selectedSlot,
                  ]}
                  onPress={() => handleSlotPress(slot)}
                  disabled={isBooked}
                >
                  <Typo
                    size={16}
                    color={
                      isBooked
                        ? colors.rose
                        : isSelected
                          ? colors.green
                          : colors.primary
                    }
                    fontWeight="600"
                  >
                    {slot.slotNumber}
                  </Typo>
                </TouchableOpacity>
              );
            })}
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
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Typo size={18} color={colors.white} fontWeight="600">
                Book slot {selectedSlotNumber}
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
            <MaterialIcons
              name="touch-app"
              size={24}
              color={colors.neutral500}
            />
            <Typo size={16} color={colors.neutral500}>
              Select a parking slot to continue
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
});

export default SlotBookingModal;
