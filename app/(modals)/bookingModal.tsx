import {
  Alert,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import { BookingType, CarType, ParkingSpotType } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { MaterialIcons } from "@expo/vector-icons";
import { CarSimple } from "phosphor-react-native";
import { createBooking } from "@/services/bookingService";
import { verticalScale } from "@/utils/styling";

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

  // Initialize parkingData directly from params with price handling
  const parkingPrice = params.price ? Number(params.price) : null;
  const parkingData: ParkingSpotType = {
    id: params.parkingId as string,
    parkingName: params.parkingName as string,
    price: parkingPrice,
    type: "private",
    operatingHours: {
      open: "06:00",
      close: "23:00",
    },
  } as ParkingSpotType;

  const [form, setForm] = useState({
    phoneNumber: "",
    carType: "sedan" as CarType,
    carName: "",
    carNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCarTypeSelect = useCallback((type: CarType) => {
    setForm((prev) => ({ ...prev, carType: type }));
    setShowCarTypeDropdown(false);
  }, []);

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

    setLoading(true);
    try {
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
        amount: parkingData.price || 0,
      };

      const response = await createBooking(bookingData);

      if (response.success && response.bookingId) {
        router.push({
          pathname: "/(modals)/paymentModal",
          params: {
            bookingId: response.bookingId,
            amount: parkingData.price || 0,
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

  if (!params.parkingId || !params.parkingName) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Typo size={16} color={colors.white}>
            Invalid booking data
          </Typo>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typo size={24} color={colors.white} fontWeight="600">
            Booking Details
          </Typo>
        </View>

        {/* Pre-filled user info */}
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

        {/* Car details section */}
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

        {/* Parking spot details */}
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
          <Typo size={16} color={colors.white} fontWeight="600">
            {loading ? "Processing..." : "Continue to Payment"}
          </Typo>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  disabledButton: {
    opacity: 0.7,
  },
});

export default BookingModal;
