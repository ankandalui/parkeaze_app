import { firestore } from "@/config/firebase";
import {
  BookingType,
  PaymentDetailsType,
  BookingResponseType,
  BookingStatus,
  PaymentStatus,
} from "@/types";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc,
  DocumentData,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import {
  sendPaymentConfirmation,
  sendBookingConfirmation,
  sendParkingExpiryWarning,
  sendParkingExpired,
} from "./notificationService";

/**
 * Checks if a booking is expired
 */
const isBookingExpired = (booking: BookingType): boolean => {
  if (!booking.startTime || !booking.duration) return false;

  const startTime =
    booking.startTime instanceof Date
      ? booking.startTime
      : new Date(booking.startTime);

  const endTime = new Date(startTime.getTime() + booking.duration * 60 * 1000);
  return new Date() > endTime;
};

/**
 * Gets time remaining in minutes for a booking
 */
const getTimeRemaining = (booking: BookingType): number => {
  if (!booking.startTime || !booking.duration) return 0;

  const startTime =
    booking.startTime instanceof Date
      ? booking.startTime
      : new Date(booking.startTime);

  const endTime = new Date(
    startTime.getTime() + booking.duration * 60 * 60 * 1000
  );
  const remaining = endTime.getTime() - new Date().getTime();
  return Math.max(0, Math.floor(remaining / (1000 * 60)));
};

/**
 * Checks and updates expired bookings
 */
export const checkExpiredBookings = async (): Promise<void> => {
  try {
    const bookingsRef = collection(firestore, "bookings");
    const activeBookingsQuery = query(
      bookingsRef,
      where("bookingStatus", "==", "confirmed")
    );

    const querySnapshot = await getDocs(activeBookingsQuery);
    const batch = writeBatch(firestore);
    const notifications = [];

    for (const doc of querySnapshot.docs) {
      const booking = { id: doc.id, ...doc.data() } as BookingType;

      if (isBookingExpired(booking)) {
        // Update booking status
        batch.set(
          doc.ref,
          {
            bookingStatus: "completed" as BookingStatus,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        // Queue expiration notification
        notifications.push(sendParkingExpired(booking));
      } else {
        // Check if we need to send warning notification
        const remainingMinutes = getTimeRemaining(booking);
        if (remainingMinutes <= 15 && !booking.warningNotificationSent) {
          notifications.push(sendParkingExpiryWarning(booking));

          // Mark warning as sent
          batch.set(
            doc.ref,
            {
              warningNotificationSent: true,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
    }

    // Execute all updates and notifications in parallel
    await Promise.all([batch.commit(), ...notifications]);
  } catch (error) {
    console.error("Error checking expired bookings:", error);
  }
};

/**
 * Creates a new booking
 */
export const createBooking = async (
  bookingData: Partial<BookingType>
): Promise<BookingResponseType> => {
  try {
    // Validate required fields
    if (
      !bookingData.userId ||
      !bookingData.parkingSpotId ||
      !bookingData.slotId ||
      !bookingData.duration
    ) {
      return {
        success: false,
        msg: "Missing required booking information",
      };
    }

    // Check if slot is already booked
    const isAvailable = await validateSlotAvailability(
      bookingData.parkingSpotId,
      bookingData.slotId
    );

    if (!isAvailable) {
      return {
        success: false,
        msg: "This slot is already booked. Please choose another slot.",
      };
    }

    // Prepare booking data with defaults
    const newBooking = {
      ...bookingData,
      bookingStatus: "pending" as BookingStatus,
      paymentStatus: "pending" as PaymentStatus,
      startTime: null,
      timerStarted: false,
      warningNotificationSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Create the booking
    const bookingRef = await addDoc(
      collection(firestore, "bookings"),
      newBooking
    );

    // Start monitoring for expiration
    setInterval(() => {
      checkExpiredBookings();
    }, 60000); // Check every minute

    return {
      success: true,
      bookingId: bookingRef.id,
      msg: "Booking created successfully",
    };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      msg: error?.message || "Failed to create booking",
    };
  }
};

/**
 * Updates booking payment status and starts the parking timer
 */
export const updateBookingPayment = async (
  bookingId: string,
  paymentDetails: PaymentDetailsType
): Promise<BookingResponseType> => {
  try {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    const bookingRef = doc(firestore, "bookings", bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      return {
        success: false,
        msg: "Booking not found",
      };
    }

    const booking = bookingDoc.data() as BookingType;
    const now = new Date();

    // Prepare the data to update in Firestore
    const updateData = {
      paymentStatus: paymentDetails.status,
      bookingStatus:
        paymentDetails.status === "paid"
          ? ("confirmed" as BookingStatus)
          : ("pending" as BookingStatus),
      startTime: now,
      updatedAt: serverTimestamp(),
      paymentTime: paymentDetails.paymentTime || now,
      paymentMethod: paymentDetails.paymentMethod,
      transactionId: paymentDetails.transactionId,
      timerStarted: paymentDetails.status === "paid" ? true : false,
    };

    await updateDoc(bookingRef, updateData);

    if (paymentDetails.status === "paid") {
      const updatedBookingForNotification: BookingType = {
        ...booking,
        id: bookingId,
        paymentTime: now,
        updatedAt: now,
        startTime: now,
        timerStarted: true,
        paymentStatus: paymentDetails.status,
        bookingStatus: "confirmed" as BookingStatus,
        paymentMethod: paymentDetails.paymentMethod,
        transactionId: paymentDetails.transactionId,
      };

      // Send notifications
      await Promise.all([
        sendPaymentConfirmation(updatedBookingForNotification),
        sendBookingConfirmation(updatedBookingForNotification),
      ]);
    }

    return {
      success: true,
      msg: "Payment updated successfully",
      paymentDetails,
    };
  } catch (error: any) {
    console.error("Error updating payment:", error);
    return {
      success: false,
      msg: error?.message || "Failed to update payment",
    };
  }
};

/**
 * Validates if a slot is available for booking
 */
export const validateSlotAvailability = async (
  parkingSpotId: string,
  slotId: string
): Promise<boolean> => {
  try {
    if (!parkingSpotId || !slotId) {
      throw new Error("Parking spot ID and slot ID are required");
    }

    const bookingsRef = collection(firestore, "bookings");
    const activeBookingsQuery = query(
      bookingsRef,
      where("parkingSpotId", "==", parkingSpotId),
      where("slotId", "==", slotId),
      where("bookingStatus", "in", ["pending", "confirmed"])
    );

    const querySnapshot = await getDocs(activeBookingsQuery);
    return querySnapshot.empty;
  } catch (error) {
    console.error("Error checking slot availability:", error);
    return false;
  }
};

/**
 * Gets booking details by ID
 */
export const getBookingDetails = async (
  bookingId: string
): Promise<DocumentData | null> => {
  try {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    const bookingRef = doc(firestore, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return null;
    }

    return {
      id: bookingSnap.id,
      ...bookingSnap.data(),
    };
  } catch (error: any) {
    console.error("Error getting booking details:", error);
    throw error;
  }
};

/**
 * Gets active bookings for a parking spot
 */
export const getActiveBookings = async (
  parkingSpotId: string
): Promise<BookingType[]> => {
  try {
    if (!parkingSpotId) {
      throw new Error("Parking spot ID is required");
    }

    const bookingsRef = collection(firestore, "bookings");
    const activeBookingsQuery = query(
      bookingsRef,
      where("parkingSpotId", "==", parkingSpotId),
      where("bookingStatus", "in", ["pending", "confirmed"]),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(activeBookingsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BookingType[];
  } catch (error: any) {
    console.error("Error getting active bookings:", error);
    throw error;
  }
};

/**
 * Gets user's booking history with optional status filter
 */
export const getUserBookings = async (
  userId: string,
  status?: BookingStatus
): Promise<BookingType[]> => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const bookingsRef = collection(firestore, "bookings");
    let bookingsQuery = query(
      bookingsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    if (status) {
      bookingsQuery = query(
        bookingsRef,
        where("userId", "==", userId),
        where("bookingStatus", "==", status),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(bookingsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BookingType[];
  } catch (error: any) {
    console.error("Error getting user bookings:", error);
    throw error;
  }
};

/**
 * Cancels a booking if it hasn't started
 */
export const cancelBooking = async (
  bookingId: string
): Promise<BookingResponseType> => {
  try {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    const bookingRef = doc(firestore, "bookings", bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      return {
        success: false,
        msg: "Booking not found",
      };
    }

    const bookingData = bookingDoc.data();

    // Can't cancel if parking has already started
    if (bookingData.startTime) {
      return {
        success: false,
        msg: "Cannot cancel an active booking",
      };
    }

    await updateDoc(bookingRef, {
      bookingStatus: "cancelled" as BookingStatus,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      msg: "Booking cancelled successfully",
    };
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      msg: error?.message || "Failed to cancel booking",
    };
  }
};
/**
 * Completes a booking
 */
export const completeBooking = async (
  bookingId: string
): Promise<BookingResponseType> => {
  try {
    const bookingRef = doc(firestore, "bookings", bookingId);
    await updateDoc(bookingRef, {
      bookingStatus: "completed" as BookingStatus,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      msg: "Booking completed successfully",
    };
  } catch (error: any) {
    console.error("Error completing booking:", error);
    return {
      success: false,
      msg: error?.message || "Failed to complete booking",
    };
  }
};
