import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { BookingType } from "@/types";

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
    await Notifications.setNotificationChannelAsync("parking-alerts", {
      name: "Parking Alerts",
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
  data?: Record<string, unknown>,
  channelId: string = "parking-alerts"
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

// Payment Confirmation Notification
export const sendPaymentConfirmation = async (booking: BookingType) => {
  const title = "Payment Successful";
  const body = `Successfully paid ₹${booking.amount} for parking slot ${booking.slotNumber}. Your parking time starts now.`;

  await sendNotification(
    title,
    body,
    {
      type: "PAYMENT_CONFIRMATION",
      bookingId: booking.id,
    },
    "parking-alerts"
  );
};

// Booking Confirmation Notification
export const sendBookingConfirmation = async (booking: BookingType) => {
  const title = "Booking Confirmed";
  const body = `Your parking slot ${booking.slotNumber} at ${booking.parkingSpotDetails.parkingName} has been booked successfully.`;

  await sendNotification(
    title,
    body,
    {
      type: "BOOKING_CONFIRMATION",
      bookingId: booking.id,
    },
    "parking-alerts"
  );
};

// Parking notifications
export const sendParkingReminder = async (booking: BookingType) => {
  const totalDurationMinutes = booking.duration * 60;
  const warningMinutes =
    booking.duration < 0.5
      ? Math.ceil(totalDurationMinutes / 3) // 1/3 of total time for short bookings
      : 15; // 15 minutes for longer bookings

  const title = "Parking Time Reminder";
  const body = `Your parking at ${booking.parkingSpotDetails.parkingName} will expire in ${warningMinutes} minute${warningMinutes !== 1 ? "s" : ""}.`;

  await sendNotification(
    title,
    body,
    {
      type: "PARKING_REMINDER",
      bookingId: booking.id,
    },
    "parking-alerts"
  );
};

export const sendParkingExpiryWarning = async (booking: BookingType) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Parking Duration Ending Soon",
        body: `Your parking at ${booking.parkingSpotDetails.parkingName} (Slot ${booking.slotNumber}) will expire in 15 minutes.`,
        data: { bookingId: booking.id },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error sending expiry warning:", error);
  }
};

export const sendParkingExpired = async (booking: BookingType) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Parking Duration Expired",
        body: `Your parking duration at ${booking.parkingSpotDetails.parkingName} (Slot ${booking.slotNumber}) has ended. Please move your vehicle.`,
        data: { bookingId: booking.id },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error sending expiry notification:", error);
  }
};
