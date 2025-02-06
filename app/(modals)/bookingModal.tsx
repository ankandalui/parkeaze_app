import {
  Alert,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import { BookingType, CarType, ParkingSpotType } from "@/types";
import ModalWrapper from "@/components/ModalWrapper";
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

  // Parse the parking data from params
  const parkingData: ParkingSpotType = params.parkingData
    ? JSON.parse(params.parkingData as string)
    : null;

  const [form, setForm] = useState({
    phoneNumber: "",
    carType: "sedan" as CarType,
    carName: "",
    carNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCarTypeSelect = (type: CarType) => {
    setForm({ ...form, carType: type });
    setShowCarTypeDropdown(false);
  };

  const handleSubmit = async () => {
    if (!user?.uid || !parkingData) {
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
            parkingName: parkingData.name,
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

  // Validate parking data and type
  if (!parkingData?.id || parkingData.type !== "private") {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Typo
          size={verticalScale(20)}
          color={colors.neutral100}
          fontWeight="600"
        >
          Booking Details
        </Typo>
      </View>

      {/* Pre-filled user info */}
      <View style={styles.section}>
        <Typo size={15} color={colors.neutral400} fontWeight="500">
          Personal Information
        </Typo>

        <Input
          value={user?.name || ""}
          editable={false}
          icon={
            <MaterialIcons
              name="person"
              size={verticalScale(20)}
              color={colors.neutral600}
            />
          }
        />

        <Input
          value={user?.email || ""}
          editable={false}
          icon={
            <MaterialIcons
              name="email"
              size={verticalScale(20)}
              color={colors.neutral600}
            />
          }
        />

        <Input
          value={form.phoneNumber}
          onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          icon={
            <MaterialIcons
              name="phone"
              size={verticalScale(20)}
              color={colors.neutral600}
            />
          }
        />
      </View>

      {/* Car details section */}
      <View style={styles.section}>
        <Typo
          size={verticalScale(16)}
          color={colors.neutral800}
          fontWeight="600"
        >
          Car Details
        </Typo>

        {/* Custom Car Type Selector */}
        <TouchableOpacity
          style={styles.carTypeSelector}
          onPress={() => setShowCarTypeDropdown(!showCarTypeDropdown)}
        >
          <MaterialIcons
            name="directions-car"
            size={verticalScale(20)}
            color={colors.neutral600}
          />
          <Typo
            size={verticalScale(16)}
            color={colors.neutral800}
            style={styles.selectedCarType}
          >
            {carTypeOptions.find((option) => option.value === form.carType)
              ?.label || "Select Car Type"}
          </Typo>
          <MaterialIcons
            name={
              showCarTypeDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"
            }
            size={verticalScale(24)}
            color={colors.neutral600}
          />
        </TouchableOpacity>

        {/* Dropdown options */}
        {showCarTypeDropdown && (
          <View style={styles.dropdownContent}>
            {carTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownItem,
                  form.carType === option.value && styles.selectedDropdownItem,
                ]}
                onPress={() => handleCarTypeSelect(option.value)}
              >
                <Typo
                  size={verticalScale(16)}
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
          onChangeText={(text) => setForm({ ...form, carName: text })}
          placeholder="Car Name"
          icon={
            <CarSimple size={verticalScale(20)} color={colors.neutral600} />
          }
        />

        <Input
          value={form.carNumber}
          onChangeText={(text) =>
            setForm({ ...form, carNumber: text.toUpperCase() })
          }
          placeholder="Car Number"
          autoCapitalize="characters"
          icon={
            <CarSimple size={verticalScale(20)} color={colors.neutral600} />
          }
        />
      </View>

      {/* Parking spot details */}
      <View style={styles.section}>
        <Typo
          size={verticalScale(16)}
          color={colors.neutral800}
          fontWeight="600"
        >
          Parking Details
        </Typo>

        <View style={styles.parkingInfo}>
          <View style={styles.parkingInfoRow}>
            <Typo size={verticalScale(14)} color={colors.neutral600}>
              Location
            </Typo>
            <Typo size={verticalScale(14)} color={colors.neutral800}>
              {parkingData.name}
            </Typo>
          </View>

          <View style={styles.parkingInfoRow}>
            <Typo size={verticalScale(14)} color={colors.neutral600}>
              Address
            </Typo>
            <Typo size={verticalScale(14)} color={colors.neutral800}>
              {parkingData.address}
            </Typo>
          </View>

          <View style={styles.parkingInfoRow}>
            <Typo size={verticalScale(14)} color={colors.neutral600}>
              Available Spots
            </Typo>
            <Typo size={verticalScale(14)} color={colors.neutral800}>
              {parkingData.availableSpots}/{parkingData.totalSpots}
            </Typo>
          </View>

          <View style={styles.parkingInfoRow}>
            <Typo size={verticalScale(14)} color={colors.neutral600}>
              Operating Hours
            </Typo>
            <Typo size={verticalScale(14)} color={colors.neutral800}>
              {parkingData.operatingHours.open} -{" "}
              {parkingData.operatingHours.close}
            </Typo>
          </View>

          {parkingData.price && (
            <View style={styles.parkingInfoRow}>
              <Typo size={verticalScale(14)} color={colors.neutral600}>
                Price
              </Typo>
              <Typo size={verticalScale(14)} color={colors.neutral800}>
                ${parkingData.price}/hr
              </Typo>
            </View>
          )}

          {parkingData.rating && (
            <View style={styles.parkingInfoRow}>
              <Typo size={verticalScale(14)} color={colors.neutral600}>
                Rating
              </Typo>
              <Typo size={verticalScale(14)} color={colors.neutral800}>
                {parkingData.rating} ({parkingData.reviews} reviews)
              </Typo>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Typo size={verticalScale(16)} color={colors.white} fontWeight="600">
          {loading ? "Processing..." : "Continue to Payment"}
        </Typo>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BookingModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacingX._20,
    backgroundColor: colors.neutral800,
  },
  header: {
    marginBottom: spacingY._12,
  },
  section: {
    gap: spacingY._10,
    marginBottom: spacingY._12,
  },
  carTypeSelector: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
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
    backgroundColor: colors.neutral100,
    borderRadius: radius._17,
    borderCurve: "continuous",
    gap: spacingY._10,
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
    borderCurve: "continuous",
    marginBottom: spacingY._20,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
