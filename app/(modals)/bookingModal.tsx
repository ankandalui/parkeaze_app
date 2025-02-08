// import React, { useState } from "react";
// import {
//   Alert,
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   ScrollView,
//   SafeAreaView,
//   TextInput,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useAuth } from "@/context/authContext";
// import { BookingType, CarType, ParkingSpotType } from "@/types";
// import { colors, radius, spacingX, spacingY } from "@/constants/theme";
// import Typo from "@/components/Typo";
// import Input from "@/components/Input";
// import { MaterialIcons } from "@expo/vector-icons";
// import { CarSimple } from "phosphor-react-native";
// import { createBooking } from "@/services/bookingService";
// import { verticalScale } from "@/utils/styling";

// const carTypeOptions: { label: string; value: CarType }[] = [
//   { label: "Sedan", value: "sedan" },
//   { label: "SUV", value: "suv" },
//   { label: "Coupe", value: "coupe" },
// ];

// const BookingModal = () => {
//   const { user } = useAuth();
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const [showCarTypeDropdown, setShowCarTypeDropdown] = useState(false);

//   // Validate and parse required parameters
//   if (
//     !params.parkingId ||
//     !params.parkingName ||
//     !params.slotId ||
//     !params.slotNumber
//   ) {
//     Alert.alert("Error", "Missing required booking information");
//     router.back();
//     return null;
//   }

//   // Initialize parkingData with required fields
//   const parkingPrice = params.price ? Number(params.price) : 0;
//   const parkingData: ParkingSpotType = {
//     id: params.parkingId as string,
//     parkingName: params.parkingName as string,
//     price: parkingPrice,
//     type: "private",
//     operatingHours: {
//       open: "06:00",
//       close: "23:00",
//     },
//     address: (params.address as string) || "",
//     latitude: 0,
//     longitude: 0,
//     totalSpots: 0,
//     locationName: "",
//     floors: [],
//   };

//   const [form, setForm] = useState({
//     phoneNumber: "",
//     carType: "sedan" as CarType,
//     carName: "",
//     carNumber: "",
//     hours: "1",
//     minutes: "0",
//   });

//   const [bookingStartTime] = useState(new Date());
//   const [totalAmount, setTotalAmount] = useState(parkingPrice);
//   const [loading, setLoading] = useState(false);

//   // Calculate total amount whenever duration changes
//   React.useEffect(() => {
//     const totalHours = Number(form.hours) + Number(form.minutes) / 60;
//     if (totalHours <= 1) {
//       setTotalAmount(parkingPrice);
//     } else {
//       const additionalHours = totalHours - 1;
//       setTotalAmount(parkingPrice + parkingPrice * additionalHours);
//     }
//   }, [form.hours, form.minutes, parkingPrice]);

//   const handleCarTypeSelect = (type: CarType) => {
//     setForm((prev) => ({ ...prev, carType: type }));
//     setShowCarTypeDropdown(false);
//   };

//   const handleDurationChange = (type: "hours" | "minutes", value: string) => {
//     const numericValue = value.replace(/[^0-9]/g, "");

//     if (type === "hours") {
//       const hours = Math.min(Number(numericValue), 24);
//       setForm((prev) => ({ ...prev, hours: hours.toString() }));
//     } else {
//       const minutes = Math.min(Number(numericValue), 59);
//       setForm((prev) => ({ ...prev, minutes: minutes.toString() }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!user?.uid) {
//       Alert.alert("Error", "You must be logged in to book");
//       return;
//     }

//     if (!form.phoneNumber || !form.carName || !form.carNumber) {
//       Alert.alert("Error", "Please fill all fields");
//       return;
//     }

//     if (!/^\d{10}$/.test(form.phoneNumber)) {
//       Alert.alert("Error", "Please enter a valid phone number");
//       return;
//     }

//     const totalHours = Number(form.hours) + Number(form.minutes) / 60;
//     if (totalHours < 0.5) {
//       Alert.alert("Error", "Minimum booking duration is 30 minutes");
//       return;
//     }

//     const endTime = new Date(
//       bookingStartTime.getTime() + totalHours * 60 * 60 * 1000
//     );

//     setLoading(true);
//     try {
//       const bookingData: Partial<BookingType> = {
//         userId: user.uid,
//         userName: user.name || "",
//         userEmail: user.email || "",
//         phoneNumber: form.phoneNumber,
//         carType: form.carType,
//         carName: form.carName,
//         carNumber: form.carNumber,
//         parkingSpotId: parkingData.id,
//         parkingSpotDetails: parkingData,
//         slotId: params.slotId as string,
//         slotNumber: params.slotNumber as string,
//         startTime: bookingStartTime,
//         endTime: endTime,
//         duration: totalHours,
//         amount: totalAmount,
//       };

//       const response = await createBooking(bookingData);

//       if (response.success && response.bookingId) {
//         router.push({
//           pathname: "/(modals)/paymentModal",
//           params: {
//             bookingId: response.bookingId,
//             amount: totalAmount,
//             parkingName: parkingData.parkingName,
//           },
//         });
//       } else {
//         Alert.alert("Error", response.msg || "Failed to create booking");
//       }
//     } catch (error) {
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//         <View style={styles.header}>
//           <Typo size={24} color={colors.white} fontWeight="600">
//             Booking Details
//           </Typo>
//         </View>

//         {/* Personal Information Section */}
//         <View style={styles.section}>
//           <Typo
//             size={16}
//             color={colors.neutral100}
//             fontWeight="500"
//             style={styles.sectionTitle}
//           >
//             Personal Information
//           </Typo>

//           <Input
//             value={user?.name || ""}
//             editable={false}
//             icon={
//               <MaterialIcons
//                 name="person"
//                 size={20}
//                 color={colors.neutral600}
//               />
//             }
//           />

//           <Input
//             value={user?.email || ""}
//             editable={false}
//             icon={
//               <MaterialIcons name="email" size={20} color={colors.neutral600} />
//             }
//           />

//           <Input
//             value={form.phoneNumber}
//             onChangeText={(text) =>
//               setForm((prev) => ({ ...prev, phoneNumber: text }))
//             }
//             placeholder="Phone Number"
//             keyboardType="phone-pad"
//             icon={
//               <MaterialIcons name="phone" size={20} color={colors.neutral600} />
//             }
//           />
//         </View>

//         {/* Car Details Section */}
//         <View style={styles.section}>
//           <Typo
//             size={16}
//             color={colors.neutral100}
//             fontWeight="500"
//             style={styles.sectionTitle}
//           >
//             Car Details
//           </Typo>

//           <TouchableOpacity
//             style={styles.carTypeSelector}
//             onPress={() => setShowCarTypeDropdown((prev) => !prev)}
//           >
//             <MaterialIcons
//               name="directions-car"
//               size={20}
//               color={colors.neutral600}
//             />
//             <Typo
//               size={16}
//               color={colors.neutral800}
//               style={styles.selectedCarType}
//             >
//               {carTypeOptions.find((option) => option.value === form.carType)
//                 ?.label || "Select Car Type"}
//             </Typo>
//             <MaterialIcons
//               name={
//                 showCarTypeDropdown
//                   ? "keyboard-arrow-up"
//                   : "keyboard-arrow-down"
//               }
//               size={24}
//               color={colors.neutral600}
//             />
//           </TouchableOpacity>

//           {showCarTypeDropdown && (
//             <View style={styles.dropdownContent}>
//               {carTypeOptions.map((option) => (
//                 <TouchableOpacity
//                   key={option.value}
//                   style={[
//                     styles.dropdownItem,
//                     form.carType === option.value &&
//                       styles.selectedDropdownItem,
//                   ]}
//                   onPress={() => handleCarTypeSelect(option.value)}
//                 >
//                   <Typo
//                     size={16}
//                     color={
//                       form.carType === option.value
//                         ? colors.primary
//                         : colors.neutral800
//                     }
//                   >
//                     {option.label}
//                   </Typo>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}

//           <Input
//             value={form.carName}
//             onChangeText={(text) =>
//               setForm((prev) => ({ ...prev, carName: text }))
//             }
//             placeholder="Car Name"
//             icon={<CarSimple size={20} color={colors.neutral600} />}
//           />

//           <Input
//             value={form.carNumber}
//             onChangeText={(text) =>
//               setForm((prev) => ({ ...prev, carNumber: text.toUpperCase() }))
//             }
//             placeholder="Car Number"
//             autoCapitalize="characters"
//             icon={<CarSimple size={20} color={colors.neutral600} />}
//           />
//         </View>

//         {/* Duration Selection Section */}
//         <View style={styles.section}>
//           <Typo
//             size={16}
//             color={colors.neutral100}
//             fontWeight="500"
//             style={styles.sectionTitle}
//           >
//             Parking Duration
//           </Typo>

//           <View style={styles.durationSelector}>
//             <View style={styles.durationInputContainer}>
//               <TextInput
//                 style={styles.durationInput}
//                 value={form.hours}
//                 onChangeText={(value) => handleDurationChange("hours", value)}
//                 keyboardType="numeric"
//                 maxLength={2}
//               />
//               <Typo size={16} color={colors.neutral600}>
//                 hrs
//               </Typo>
//             </View>

//             <Typo size={16} color={colors.neutral600}>
//               :
//             </Typo>

//             <View style={styles.durationInputContainer}>
//               <TextInput
//                 style={styles.durationInput}
//                 value={form.minutes}
//                 onChangeText={(value) => handleDurationChange("minutes", value)}
//                 keyboardType="numeric"
//                 maxLength={2}
//               />
//               <Typo size={16} color={colors.neutral600}>
//                 min
//               </Typo>
//             </View>
//           </View>

//           <View style={styles.durationInfo}>
//             <Typo size={14} color={colors.neutral600}>
//               Start Time: {bookingStartTime.toLocaleTimeString()}
//             </Typo>
//             <Typo size={14} color={colors.neutral600}>
//               Duration: {form.hours}h {form.minutes}m
//             </Typo>
//             <View style={styles.priceBreakdown}>
//               <Typo size={14} color={colors.neutral600}>
//                 Base price (first hour): ₹{parkingPrice}
//               </Typo>
//               {Number(form.hours) > 1 ||
//               (Number(form.hours) === 1 && Number(form.minutes) > 0) ? (
//                 <Typo size={14} color={colors.neutral600}>
//                   Additional time: ₹{(totalAmount - parkingPrice).toFixed(2)}
//                 </Typo>
//               ) : null}
//               <Typo size={16} color={colors.primary} fontWeight="600">
//                 Total Amount: ₹{totalAmount.toFixed(2)}
//               </Typo>
//             </View>
//           </View>
//         </View>

//         {/* Parking Details Section */}
//         <View style={styles.section}>
//           <Typo
//             size={16}
//             color={colors.neutral100}
//             fontWeight="500"
//             style={styles.sectionTitle}
//           >
//             Parking Details
//           </Typo>

//           <View style={styles.parkingInfo}>
//             <View style={styles.parkingInfoRow}>
//               <Typo size={14} color={colors.neutral600}>
//                 Location
//               </Typo>
//               <Typo size={14} color={colors.neutral800}>
//                 {parkingData.parkingName}
//               </Typo>
//             </View>

//             <View style={styles.parkingInfoRow}>
//               <Typo size={14} color={colors.neutral600}>
//                 Slot Number
//               </Typo>
//               <Typo size={14} color={colors.neutral800}>
//                 {params.slotNumber}
//               </Typo>
//             </View>

//             {parkingData.price !== null &&
//               parkingData.price !== undefined &&
//               parkingData.price > 0 && (
//                 <View style={styles.parkingInfoRow}>
//                   <Typo size={14} color={colors.neutral600}>
//                     Price
//                   </Typo>
//                   <Typo size={14} color={colors.neutral800}>
//                     ₹{parkingData.price}/hr
//                   </Typo>
//                 </View>
//               )}

//             <View style={styles.parkingInfoRow}>
//               <Typo size={14} color={colors.neutral600}>
//                 Operating Hours
//               </Typo>
//               <Typo size={14} color={colors.neutral800}>
//                 {parkingData.operatingHours.open} -{" "}
//                 {parkingData.operatingHours.close}
//               </Typo>
//             </View>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[styles.continueButton, loading && styles.disabledButton]}
//           onPress={handleSubmit}
//           disabled={loading}
//         >
//           <Typo size={16} color={colors.white} fontWeight="600">
//             {loading ? "Processing..." : "Continue to Payment"}
//           </Typo>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: colors.neutral800,
//   },
//   container: {
//     flex: 1,
//     padding: spacingX._20,
//   },
//   header: {
//     marginBottom: spacingY._20,
//   },
//   section: {
//     gap: spacingY._12,
//     marginBottom: spacingY._25,
//   },
//   sectionTitle: {
//     marginBottom: spacingY._7,
//   },
//   carTypeSelector: {
//     flexDirection: "row",
//     height: verticalScale(54),
//     alignItems: "center",
//     backgroundColor: colors.white,
//     borderWidth: 1,
//     borderColor: colors.neutral300,
//     borderRadius: radius._17,
//     paddingHorizontal: spacingX._15,
//   },
//   selectedCarType: {
//     flex: 1,
//     marginLeft: spacingX._10,
//   },
//   dropdownContent: {
//     backgroundColor: colors.white,
//     borderWidth: 1,
//     borderColor: colors.neutral300,
//     borderRadius: radius._10,
//     marginTop: spacingY._5,
//     overflow: "hidden",
//   },
//   dropdownItem: {
//     padding: spacingX._15,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.neutral200,
//   },
//   selectedDropdownItem: {
//     backgroundColor: colors.neutral100,
//   },
//   durationSelector: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: spacingX._10,
//     backgroundColor: colors.white,
//     padding: spacingX._15,
//     borderRadius: radius._17,
//     borderWidth: 1,
//     borderColor: colors.neutral300,
//   },
//   durationInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacingX._5,
//   },
//   durationInput: {
//     fontSize: 24,
//     fontWeight: "600",
//     color: colors.neutral800,
//     textAlign: "center",
//     width: 50,
//     height: 50,
//     backgroundColor: colors.neutral50,
//     borderRadius: radius._10,
//   },
//   durationInfo: {
//     backgroundColor: colors.neutral50,
//     padding: spacingX._15,
//     borderRadius: radius._17,
//     marginTop: spacingY._10,
//   },
//   priceBreakdown: {
//     gap: spacingY._5,
//     paddingTop: spacingY._10,
//     borderTopWidth: 1,
//     borderTopColor: colors.neutral200,
//     marginTop: spacingY._10,
//   },
//   parkingInfo: {
//     padding: spacingX._15,
//     backgroundColor: colors.white,
//     borderRadius: radius._17,
//     gap: spacingY._12,
//   },
//   parkingInfoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   continueButton: {
//     height: verticalScale(54),
//     backgroundColor: colors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: radius._17,
//     marginBottom: spacingY._20,
//   },
//   disabledButton: {
//     opacity: 0.7,
//   },
// });

// export default BookingModal;

import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import { BookingType, CarType, ParkingSpotType } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { MaterialIcons } from "@expo/vector-icons";
import { CarSimple } from "phosphor-react-native";
import {
  createBooking,
  validateSlotAvailability,
} from "@/services/bookingService";
import useNotifications from "@/services/useNotifications";
import { verticalScale } from "@/utils/styling";
// import { sendBookingConfirmation } from "@/services/notificationService";
import { LinearGradient } from "expo-linear-gradient";

const carTypeOptions: { label: string; value: CarType }[] = [
  { label: "Sedan", value: "sedan" },
  { label: "SUV", value: "suv" },
  { label: "Coupe", value: "coupe" },
];

const BookingModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showCarTypeDropdown, setShowCarTypeDropdown] = useState(false);
  const { setupNotifications } = useNotifications();

  useEffect(() => {
    setupNotifications();
  }, []);

  // Validate and parse required parameters
  if (
    !params.parkingId ||
    !params.parkingName ||
    !params.slotId ||
    !params.slotNumber
  ) {
    Alert.alert("Error", "Missing required booking information");
    router.back();
    return null;
  }

  // Initialize parkingData with required fields
  const parkingPrice = params.price ? Number(params.price) : 0;
  const parkingData: ParkingSpotType = {
    id: params.parkingId as string,
    parkingName: params.parkingName as string,
    price: parkingPrice,
    type: "private",
    operatingHours: {
      open: "06:00",
      close: "23:00",
    },
    address: (params.address as string) || "",
    latitude: 0,
    longitude: 0,
    totalSpots: 0,
    locationName: "",
    floors: [],
  };

  const [form, setForm] = useState({
    phoneNumber: "",
    carType: "sedan" as CarType,
    carName: "",
    carNumber: "",
    hours: "1",
    minutes: "0",
  });

  const [bookingStartTime] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState(parkingPrice);
  const [loading, setLoading] = useState(false);

  // Calculate total amount whenever duration changes
  useEffect(() => {
    const totalHours = Number(form.hours) + Number(form.minutes) / 60;
    if (totalHours <= 1) {
      setTotalAmount(parkingPrice);
    } else {
      const additionalHours = totalHours - 1;
      setTotalAmount(parkingPrice + parkingPrice * additionalHours);
    }
  }, [form.hours, form.minutes, parkingPrice]);

  const handleCarTypeSelect = (type: CarType) => {
    setForm((prev) => ({ ...prev, carType: type }));
    setShowCarTypeDropdown(false);
  };

  const handleDurationChange = (type: "hours" | "minutes", value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    if (type === "hours") {
      const hours = Math.min(Number(numericValue), 24);
      setForm((prev) => ({ ...prev, hours: hours.toString() }));
    } else {
      const minutes = Math.min(Number(numericValue), 59);
      setForm((prev) => ({ ...prev, minutes: minutes.toString() }));
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "You must be logged in to book");
      return;
    }

    if (!form.phoneNumber || !form.carName || !form.carNumber) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!/^\d{10}$/.test(form.phoneNumber)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    const totalHours = Number(form.hours) + Number(form.minutes) / 60;
    if (totalHours < 0.5) {
      Alert.alert("Error", "Minimum booking duration is 30 minutes");
      return;
    }

    setLoading(true);
    try {
      // Verify slot is still available
      const isAvailable = await validateSlotAvailability(
        parkingData.id,
        params.slotId as string
      );

      if (!isAvailable) {
        Alert.alert(
          "Slot Unavailable",
          "This slot has just been booked by someone else. Please choose another slot."
        );
        router.back();
        return;
      }

      const endTime = new Date(
        bookingStartTime.getTime() + totalHours * 60 * 60 * 1000
      );

      const bookingData: Partial<BookingType> = {
        userId: user.uid,
        userName: user.name || "",
        userEmail: user.email || "",
        phoneNumber: form.phoneNumber,
        carType: form.carType,
        carName: form.carName,
        carNumber: form.carNumber,
        parkingSpotId: parkingData.id,
        parkingSpotDetails: parkingData,
        slotId: params.slotId as string,
        slotNumber: params.slotNumber as string,
        startTime: bookingStartTime,
        endTime: endTime,
        duration: totalHours,
        amount: totalAmount,
      };

      const response = await createBooking(bookingData);

      if (response.success && response.bookingId) {
        // Send booking confirmation notification
        // if (bookingData as BookingType) {
        //   await sendBookingConfirmation(bookingData as BookingType);
        // }

        router.push({
          pathname: "/(modals)/paymentModal",
          params: {
            bookingId: response.bookingId,
            amount: totalAmount,
            parkingName: parkingData.parkingName,
          },
        });
      } else {
        Alert.alert("Error", response.msg || "Failed to create booking");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typo size={24} color={colors.white} fontWeight="600">
            Booking Details
          </Typo>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Typo
            size={16}
            color={colors.neutral100}
            fontWeight="500"
            style={styles.sectionTitle}
          >
            Personal Information
          </Typo>

          <Input
            value={user?.name || ""}
            editable={false}
            icon={
              <MaterialIcons
                name="person"
                size={20}
                color={colors.neutral600}
              />
            }
          />

          <Input
            value={user?.email || ""}
            editable={false}
            icon={
              <MaterialIcons name="email" size={20} color={colors.neutral600} />
            }
          />

          <Input
            value={form.phoneNumber}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, phoneNumber: text }))
            }
            placeholder="Phone Number"
            keyboardType="phone-pad"
            icon={
              <MaterialIcons name="phone" size={20} color={colors.neutral600} />
            }
          />
        </View>

        {/* Car Details Section */}
        <View style={styles.section}>
          <Typo
            size={16}
            color={colors.neutral100}
            fontWeight="500"
            style={styles.sectionTitle}
          >
            Car Details
          </Typo>

          <TouchableOpacity
            style={styles.carTypeSelector}
            onPress={() => setShowCarTypeDropdown((prev) => !prev)}
          >
            <MaterialIcons
              name="directions-car"
              size={20}
              color={colors.neutral600}
            />
            <Typo
              size={16}
              color={colors.neutral800}
              style={styles.selectedCarType}
            >
              {carTypeOptions.find((option) => option.value === form.carType)
                ?.label || "Select Car Type"}
            </Typo>
            <MaterialIcons
              name={
                showCarTypeDropdown
                  ? "keyboard-arrow-up"
                  : "keyboard-arrow-down"
              }
              size={24}
              color={colors.neutral600}
            />
          </TouchableOpacity>

          {showCarTypeDropdown && (
            <View style={styles.dropdownContent}>
              {carTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    form.carType === option.value &&
                      styles.selectedDropdownItem,
                  ]}
                  onPress={() => handleCarTypeSelect(option.value)}
                >
                  <Typo
                    size={16}
                    color={
                      form.carType === option.value
                        ? colors.primary
                        : colors.neutral800
                    }
                  >
                    {option.label}
                  </Typo>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            value={form.carName}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, carName: text }))
            }
            placeholder="Car Name"
            icon={<CarSimple size={20} color={colors.neutral600} />}
          />

          <Input
            value={form.carNumber}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, carNumber: text.toUpperCase() }))
            }
            placeholder="Car Number"
            autoCapitalize="characters"
            icon={<CarSimple size={20} color={colors.neutral600} />}
          />
        </View>

        {/* Duration Selection Section */}
        <View style={styles.section}>
          <Typo
            size={16}
            color={colors.neutral100}
            fontWeight="500"
            style={styles.sectionTitle}
          >
            Parking Duration
          </Typo>

          <View style={styles.durationSelector}>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                value={form.hours}
                onChangeText={(value) => handleDurationChange("hours", value)}
                keyboardType="numeric"
                maxLength={2}
              />
              <Typo size={16} color={colors.neutral600}>
                hrs
              </Typo>
            </View>

            <Typo size={16} color={colors.neutral600}>
              :
            </Typo>

            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                value={form.minutes}
                onChangeText={(value) => handleDurationChange("minutes", value)}
                keyboardType="numeric"
                maxLength={2}
              />
              <Typo size={16} color={colors.neutral600}>
                min
              </Typo>
            </View>
          </View>

          <View style={styles.durationInfo}>
            <Typo size={14} color={colors.neutral600}>
              Start Time: {bookingStartTime.toLocaleTimeString()}
            </Typo>
            <Typo size={14} color={colors.neutral600}>
              Duration: {form.hours}h {form.minutes}m
            </Typo>
            <View style={styles.priceBreakdown}>
              <Typo size={14} color={colors.neutral600}>
                Base price (first hour): ₹{parkingPrice}
              </Typo>
              {Number(form.hours) > 1 ||
              (Number(form.hours) === 1 && Number(form.minutes) > 0) ? (
                <Typo size={14} color={colors.neutral600}>
                  Additional time: ₹{(totalAmount - parkingPrice).toFixed(2)}
                </Typo>
              ) : null}
              <Typo size={16} color={colors.primary} fontWeight="600">
                Total Amount: ₹{totalAmount.toFixed(2)}
              </Typo>
            </View>
          </View>
        </View>

        {/* Parking Details Section */}
        <View style={styles.section}>
          <Typo
            size={16}
            color={colors.neutral100}
            fontWeight="500"
            style={styles.sectionTitle}
          >
            Parking Details
          </Typo>

          <View style={styles.parkingInfo}>
            <View style={styles.parkingInfoRow}>
              <Typo size={14} color={colors.neutral600}>
                Location
              </Typo>
              <Typo size={14} color={colors.neutral800}>
                {parkingData.parkingName}
              </Typo>
            </View>

            <View style={styles.parkingInfoRow}>
              <Typo size={14} color={colors.neutral600}>
                Slot Number
              </Typo>
              <Typo size={14} color={colors.neutral800}>
                {params.slotNumber}
              </Typo>
            </View>

            {parkingData.price !== null &&
              parkingData.price !== undefined &&
              parkingData.price > 0 && (
                <View style={styles.parkingInfoRow}>
                  <Typo size={14} color={colors.neutral600}>
                    Price
                  </Typo>
                  <Typo size={14} color={colors.neutral800}>
                    ₹{parkingData.price}/hr
                  </Typo>
                </View>
              )}

            <View style={styles.parkingInfoRow}>
              <Typo size={14} color={colors.neutral600}>
                Operating Hours
              </Typo>
              <Typo size={14} color={colors.neutral800}>
                {parkingData.operatingHours.open} -{" "}
                {parkingData.operatingHours.close}
              </Typo>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient} // Changed to buttonGradient
          >
            <View style={styles.buttonContent}>
              <Typo size={16} color={colors.white} fontWeight="600">
                {loading ? "Processing..." : "Continue to Payment"}
              </Typo>
              {parkingData?.price !== null &&
                parkingData?.price !== undefined &&
                parkingData.price > 0 && (
                  <Typo size={14} color={colors.white}>
                    Total: ₹{totalAmount.toFixed(2)}
                  </Typo>
                )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral800,
  },
  container: {
    flex: 1,
    padding: spacingX._20,
  },
  header: {
    marginBottom: spacingY._20,
  },
  section: {
    gap: spacingY._12,
    marginBottom: spacingY._25,
  },
  sectionTitle: {
    marginBottom: spacingY._7,
  },
  carTypeSelector: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    paddingHorizontal: spacingX._15,
  },
  selectedCarType: {
    flex: 1,
    marginLeft: spacingX._10,
  },
  dropdownContent: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._10,
    marginTop: spacingY._5,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: spacingX._15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  selectedDropdownItem: {
    backgroundColor: colors.neutral100,
  },
  durationSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._10,
    backgroundColor: colors.white,
    padding: spacingX._15,
    borderRadius: radius._17,
    borderWidth: 1,
    borderColor: colors.neutral300,
  },
  durationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  durationInput: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.neutral800,
    textAlign: "center",
    width: 50,
    height: 50,
    backgroundColor: colors.neutral50,
    borderRadius: radius._10,
  },
  durationInfo: {
    backgroundColor: colors.neutral50,
    padding: spacingX._15,
    borderRadius: radius._17,
    marginTop: spacingY._10,
  },
  priceBreakdown: {
    gap: spacingY._5,
    paddingTop: spacingY._10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    marginTop: spacingY._10,
  },
  parkingInfo: {
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderRadius: radius._17,
    gap: spacingY._12,
  },
  parkingInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  continueButton: {
    height: verticalScale(54),
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._17,
    marginBottom: spacingY._20,
  },
  buttonGradient: {
    // Changed from gradientButton to buttonGradient
    width: "100%",
    height: "100%",
  },
  buttonContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: spacingX._15,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default BookingModal;
