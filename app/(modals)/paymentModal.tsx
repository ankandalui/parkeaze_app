// import {
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   Animated,
//   Alert,
//   Platform,
//   ScrollView,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { colors, radius, spacingX, spacingY } from "@/constants/theme";
// import Typo from "@/components/Typo";
// import { MaterialIcons } from "@expo/vector-icons";
// import { updateBookingPayment } from "@/services/bookingService";
// import { PaymentStatus } from "@/types";
// import { verticalScale } from "@/utils/styling";
// import { Timestamp, doc, getDoc } from "firebase/firestore";
// import { firestore } from "@/config/firebase";
// import { LinearGradient } from "expo-linear-gradient";

// const PaymentModal = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const [loading, setLoading] = useState(false);
//   const [selectedMethod, setSelectedMethod] = useState<string>("upi");
//   const slideAnim = React.useRef(new Animated.Value(0)).current;
//   const [isClosing, setIsClosing] = useState(false);

//   // Get params passed from BookingModal
//   const bookingId = params.bookingId as string;
//   const amount = Number(params.amount) || 0;
//   const parkingName = params.parkingName as string;
//   const slotNumber = params.slotNumber as string;

//   useEffect(() => {
//     Animated.timing(slideAnim, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const handlePayment = async () => {
//     if (!bookingId || !amount) {
//       Alert.alert("Error", "Invalid booking details");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Simulate payment processing
//       await new Promise((resolve) => setTimeout(resolve, 2000));

//       const transactionId = `TXN${Date.now()}`;

//       const paymentDetails = {
//         bookingId,
//         amount,
//         parkingName,
//         transactionId,
//         status: "paid" as PaymentStatus,
//         paymentTime: Timestamp.now(),
//         paymentMethod: selectedMethod,
//       };

//       // First fetch the booking details to get the slot number
//       const bookingDoc = await getDoc(doc(firestore, "bookings", bookingId));
//       if (!bookingDoc.exists()) {
//         throw new Error("Booking not found");
//       }

//       const bookingData = bookingDoc.data();
//       const slotNumber = bookingData.slotNumber;

//       const response = await updateBookingPayment(bookingId, paymentDetails);

//       if (response.success) {
//         router.push({
//           pathname: "/(modals)/ticketModal",
//           params: {
//             bookingId,
//             parkingName,
//             amount,
//             slotNumber: slotNumber || "Not assigned",
//             transactionId,
//           },
//         });
//       } else {
//         throw new Error(response.msg);
//       }
//     } catch (error: any) {
//       Alert.alert("Payment Failed", error.message || "Please try again");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     if (isClosing) return;
//     setIsClosing(true);

//     Animated.timing(slideAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start(() => {
//       router.back();
//     });
//   };

//   const handleMethodSelect = React.useCallback((method: string) => {
//     setSelectedMethod(method);
//   }, []);

//   const paymentMethods = [
//     {
//       id: "upi",
//       name: "UPI Payment",
//       icon: "smartphone",
//       description: "Pay using any UPI app",
//     },
//     {
//       id: "card",
//       name: "Credit/Debit Card",
//       icon: "credit-card",
//       description: "Pay using your card",
//     },
//     {
//       id: "netbanking",
//       name: "Net Banking",
//       icon: "account-balance",
//       description: "Pay using net banking",
//     },
//   ];

//   return (
//     <View style={styles.overlay}>
//       <Animated.View
//         style={[
//           styles.container,
//           {
//             transform: [
//               {
//                 translateY: slideAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [600, 0],
//                 }),
//               },
//             ],
//           },
//         ]}
//       >
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
//             <MaterialIcons
//               name="close"
//               size={verticalScale(24)}
//               color={colors.neutral600}
//             />
//           </TouchableOpacity>
//           <Typo
//             size={verticalScale(18)}
//             color={colors.neutral800}
//             fontWeight="600"
//           >
//             Payment Details
//           </Typo>
//         </View>

//         <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//           <View style={styles.amountContainer}>
//             <LinearGradient
//               colors={[colors.primary, colors.primaryDark]}
//               style={styles.amountGradient}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//             >
//               <Typo size={16} color={colors.white}>
//                 Amount to Pay
//               </Typo>
//               <Typo size={32} color={colors.white} fontWeight="700">
//                 ₹{amount.toFixed(2)}
//               </Typo>
//               <Typo size={14} color={colors.neutral100}>
//                 {parkingName}
//               </Typo>
//             </LinearGradient>
//           </View>

//           <View style={styles.methodsContainer}>
//             <Typo
//               size={16}
//               color={colors.neutral800}
//               fontWeight="600"
//               style={styles.sectionTitle}
//             >
//               Select Payment Method
//             </Typo>

//             {paymentMethods.map((method) => (
//               <TouchableOpacity
//                 key={method.id}
//                 style={[
//                   styles.methodCard,
//                   selectedMethod === method.id && styles.selectedMethod,
//                 ]}
//                 onPress={() => handleMethodSelect(method.id)}
//               >
//                 <MaterialIcons
//                   name={method.icon as any}
//                   size={24}
//                   color={
//                     selectedMethod === method.id
//                       ? colors.primary
//                       : colors.neutral600
//                   }
//                 />
//                 <View style={styles.methodInfo}>
//                   <Typo
//                     size={16}
//                     color={
//                       selectedMethod === method.id
//                         ? colors.primary
//                         : colors.neutral800
//                     }
//                     fontWeight={selectedMethod === method.id ? "600" : "500"}
//                   >
//                     {method.name}
//                   </Typo>
//                   <Typo size={12} color={colors.neutral600}>
//                     {method.description}
//                   </Typo>
//                 </View>
//                 <MaterialIcons
//                   name={
//                     selectedMethod === method.id
//                       ? "radio-button-checked"
//                       : "radio-button-unchecked"
//                   }
//                   size={24}
//                   color={
//                     selectedMethod === method.id
//                       ? colors.primary
//                       : colors.neutral400
//                   }
//                 />
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={styles.summary}>
//             <View style={styles.summaryRow}>
//               <Typo size={14} color={colors.neutral600}>
//                 Booking Amount
//               </Typo>
//               <Typo size={14} color={colors.neutral800}>
//                 ₹{amount.toFixed(2)}
//               </Typo>
//             </View>
//             <View style={styles.summaryRow}>
//               <Typo size={14} color={colors.neutral600}>
//                 Platform Fee
//               </Typo>
//               <Typo size={14} color={colors.neutral800}>
//                 ₹0.00
//               </Typo>
//             </View>
//             <View style={[styles.summaryRow, styles.totalRow]}>
//               <Typo size={16} color={colors.neutral800} fontWeight="600">
//                 Total Amount
//               </Typo>
//               <Typo size={16} color={colors.primary} fontWeight="600">
//                 ₹{amount.toFixed(2)}
//               </Typo>
//             </View>
//           </View>
//         </ScrollView>

//         <View style={styles.bottomContainer}>
//           <TouchableOpacity
//             style={[styles.payButton, loading && styles.disabledButton]}
//             onPress={handlePayment}
//             disabled={loading}
//           >
//             <Typo size={16} color={colors.white} fontWeight="600">
//               {loading ? "Processing..." : "Pay Now"}
//             </Typo>
//           </TouchableOpacity>
//         </View>
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   container: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: colors.white,
//     borderTopLeftRadius: radius._30,
//     borderTopRightRadius: radius._30,
//     height: "90%",
//     minHeight: verticalScale(600),
//     maxHeight: "90%",
//     ...Platform.select({
//       ios: {
//         shadowColor: colors.black,
//         shadowOffset: { width: 0, height: -2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 5,
//       },
//     }),
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     height: verticalScale(60),
//     borderBottomWidth: 1,
//     borderBottomColor: colors.neutral200,
//   },
//   closeButton: {
//     position: "absolute",
//     left: spacingX._15,
//     padding: spacingX._5,
//   },
//   content: {
//     flex: 1,
//   },
//   amountContainer: {
//     padding: spacingX._20,
//   },
//   amountGradient: {
//     padding: spacingX._20,
//     borderRadius: radius._17,
//     alignItems: "center",
//   },
//   methodsContainer: {
//     padding: spacingX._20,
//   },
//   sectionTitle: {
//     marginBottom: spacingY._15,
//   },
//   methodCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: spacingX._15,
//     backgroundColor: colors.white,
//     borderRadius: radius._17,
//     marginBottom: spacingY._10,
//     borderWidth: 1,
//     borderColor: colors.neutral200,
//   },
//   selectedMethod: {
//     borderColor: colors.primary,
//     backgroundColor: colors.primary + "0A", // 5% opacity
//   },
//   methodInfo: {
//     flex: 1,
//     marginLeft: spacingX._15,
//   },
//   summary: {
//     padding: spacingX._20,
//     gap: spacingY._10,
//     backgroundColor: colors.neutral50,
//     margin: spacingX._20,
//     borderRadius: radius._17,
//   },
//   summaryRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   totalRow: {
//     paddingTop: spacingY._10,
//     borderTopWidth: 1,
//     borderTopColor: colors.neutral200,
//     marginTop: spacingY._5,
//   },
//   bottomContainer: {
//     padding: spacingX._20,
//     borderTopWidth: 1,
//     borderTopColor: colors.neutral200,
//     backgroundColor: colors.white,
//   },
//   payButton: {
//     height: verticalScale(54),
//     backgroundColor: colors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: radius._17,
//   },
//   disabledButton: {
//     opacity: 0.7,
//   },
// });

// export default PaymentModal;

// src/components/PaymentModal.tsx
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import { MaterialIcons } from "@expo/vector-icons";
import { updateBookingPayment } from "@/services/bookingService";
import { BookingType, PaymentStatus } from "@/types";
import { verticalScale } from "@/utils/styling";
import { Timestamp, doc, getDoc } from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { sendPaymentConfirmation } from "@/services/notificationService";
import useNotifications from "@/services/useNotifications";

const PaymentModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("upi");
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const [isClosing, setIsClosing] = useState(false);
  const { setupNotifications } = useNotifications();

  // Get params passed from BookingModal
  const bookingId = params.bookingId as string;
  const amount = Number(params.amount) || 0;
  const parkingName = params.parkingName as string;
  const slotNumber = params.slotNumber as string;

  useEffect(() => {
    setupNotifications();

    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePayment = async () => {
    if (!bookingId || !amount) {
      Alert.alert("Error", "Invalid booking details");
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const transactionId = `TXN${Date.now()}`;

      const paymentDetails = {
        bookingId,
        amount,
        parkingName,
        transactionId,
        status: "paid" as PaymentStatus,
        paymentTime: Timestamp.now(),
        paymentMethod: selectedMethod,
      };

      // First fetch the booking details
      const bookingRef = doc(firestore, "bookings", bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error("Booking not found");
      }

      const bookingData = bookingDoc.data();
      const bookingWithId = {
        ...bookingData,
        id: bookingId,
      } as BookingType;

      const response = await updateBookingPayment(bookingId, paymentDetails);

      if (response.success) {
        // Send success notification
        await sendPaymentConfirmation(bookingWithId);

        router.push({
          pathname: "/(modals)/ticketModal",
          params: {
            bookingId,
            parkingName,
            amount,
            slotNumber: bookingData.slotNumber || "Not assigned",
            transactionId,
          },
        });
      } else {
        // Send failure notification
        await sendPaymentConfirmation(bookingWithId);

        throw new Error(response.msg);
      }
    } catch (error: any) {
      Alert.alert("Payment Failed", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const handleMethodSelect = React.useCallback((method: string) => {
    setSelectedMethod(method);
  }, []);

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI Payment",
      icon: "smartphone",
      description: "Pay using any UPI app",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "credit-card",
      description: "Pay using your card",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: "account-balance",
      description: "Pay using net banking",
    },
  ];

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.amountContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.amountGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Typo size={16} color={colors.white}>
                Amount to Pay
              </Typo>
              <Typo size={32} color={colors.white} fontWeight="700">
                ₹{amount.toFixed(2)}
              </Typo>
              <Typo size={14} color={colors.neutral100}>
                {parkingName}
              </Typo>
            </LinearGradient>
          </View>

          <View style={styles.methodsContainer}>
            <Typo
              size={16}
              color={colors.neutral800}
              fontWeight="600"
              style={styles.sectionTitle}
            >
              Select Payment Method
            </Typo>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod === method.id && styles.selectedMethod,
                ]}
                onPress={() => handleMethodSelect(method.id)}
              >
                <MaterialIcons
                  name={method.icon as any}
                  size={24}
                  color={
                    selectedMethod === method.id
                      ? colors.primary
                      : colors.neutral600
                  }
                />
                <View style={styles.methodInfo}>
                  <Typo
                    size={16}
                    color={
                      selectedMethod === method.id
                        ? colors.primary
                        : colors.neutral800
                    }
                    fontWeight={selectedMethod === method.id ? "600" : "500"}
                  >
                    {method.name}
                  </Typo>
                  <Typo size={12} color={colors.neutral600}>
                    {method.description}
                  </Typo>
                </View>
                <MaterialIcons
                  name={
                    selectedMethod === method.id
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={24}
                  color={
                    selectedMethod === method.id
                      ? colors.primary
                      : colors.neutral400
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Typo size={14} color={colors.neutral600}>
                Booking Amount
              </Typo>
              <Typo size={14} color={colors.neutral800}>
                ₹{amount.toFixed(2)}
              </Typo>
            </View>
            <View style={styles.summaryRow}>
              <Typo size={14} color={colors.neutral600}>
                Platform Fee
              </Typo>
              <Typo size={14} color={colors.neutral800}>
                ₹0.00
              </Typo>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Typo size={16} color={colors.neutral800} fontWeight="600">
                Total Amount
              </Typo>
              <Typo size={16} color={colors.primary} fontWeight="600">
                ₹{amount.toFixed(2)}
              </Typo>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.payButton, loading && styles.disabledButton]}
            onPress={handlePayment}
            disabled={loading}
          >
            <Typo size={16} color={colors.white} fontWeight="600">
              {loading ? "Processing..." : "Pay Now"}
            </Typo>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    height: "90%",
    minHeight: verticalScale(600),
    maxHeight: "90%",
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(60),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  closeButton: {
    position: "absolute",
    left: spacingX._15,
    padding: spacingX._5,
  },
  content: {
    flex: 1,
  },
  amountContainer: {
    padding: spacingX._20,
  },
  amountGradient: {
    padding: spacingX._20,
    borderRadius: radius._17,
    alignItems: "center",
  },
  methodsContainer: {
    padding: spacingX._20,
  },
  sectionTitle: {
    marginBottom: spacingY._15,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderRadius: radius._17,
    marginBottom: spacingY._10,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  selectedMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "0A", // 5% opacity
  },
  methodInfo: {
    flex: 1,
    marginLeft: spacingX._15,
  },
  summary: {
    padding: spacingX._20,
    gap: spacingY._10,
    backgroundColor: colors.neutral50,
    margin: spacingX._20,
    borderRadius: radius._17,
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
    marginTop: spacingY._5,
  },
  bottomContainer: {
    padding: spacingX._20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.white,
  },
  payButton: {
    height: verticalScale(54),
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._17,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default PaymentModal;
