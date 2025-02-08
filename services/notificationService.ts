import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { BookingType, PaymentStatus } from "@/types";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Initialize notification channels
export const initializeNotifications = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });

    await Notifications.setNotificationChannelAsync("payment-alerts", {
      name: "Payment Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
};

// Request permissions
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

// Basic notification sender
export const sendNotification = async (
  title: string,
  body: string,
  data?: Record<string, unknown>
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Payment-specific notifications
export const sendPaymentConfirmation = async (
  booking: BookingType,
  status: PaymentStatus
) => {
  const title = status === "paid" ? "Payment Successful" : "Payment Failed";

  const body =
    status === "paid"
      ? `Successfully paid ₹${booking.amount} for parking slot ${booking.slotNumber} at ${booking.parkingSpotDetails.parkingName}`
      : `Payment of ₹${booking.amount} for parking slot ${booking.slotNumber} failed. Please try again.`;

  await sendNotification(title, body, {
    type: "PAYMENT_STATUS",
    bookingId: booking.id,
    status,
  });
};

// Booking notifications
export const sendBookingConfirmation = async (booking: BookingType) => {
  const title = "Booking Confirmed";
  const body = `Your parking slot ${booking.slotNumber} at ${booking.parkingSpotDetails.parkingName} has been booked successfully.`;

  await sendNotification(title, body, {
    type: "BOOKING_CONFIRMATION",
    bookingId: booking.id,
  });
};

// Parking notifications
export const sendParkingReminder = async (booking: BookingType) => {
  const title = "Parking Time Reminder";
  const body = `Your parking at ${booking.parkingSpotDetails.parkingName} will expire in 15 minutes.`;

  await sendNotification(title, body, {
    type: "PARKING_REMINDER",
    bookingId: booking.id,
  });
};

export const sendParkingExpired = async (booking: BookingType) => {
  const title = "Parking Time Expired";
  const body = `Your parking duration for slot ${booking.slotNumber} at ${booking.parkingSpotDetails.parkingName} has expired.`;

  await sendNotification(title, body, {
    type: "PARKING_EXPIRED",
    bookingId: booking.id,
  });
};
