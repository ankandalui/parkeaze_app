// // import { firestore } from "@/config/firebase";
// // import {
// //   BookingType,
// //   PaymentDetailsType,
// //   BookingResponseType,
// //   BookingStatus,
// //   PaymentStatus,
// // } from "@/types";
// // import {
// //   addDoc,
// //   collection,
// //   doc,
// //   serverTimestamp,
// //   updateDoc,
// //   query,
// //   where,
// //   getDocs,
// //   getDoc,
// //   DocumentData,
// //   Timestamp,
// //   orderBy,
// // } from "firebase/firestore";

// // /**
// //  * Creates a new booking
// //  */
// // export const createBooking = async (
// //   bookingData: Partial<BookingType>
// // ): Promise<BookingResponseType> => {
// //   try {
// //     // Validate required fields
// //     if (
// //       !bookingData.userId ||
// //       !bookingData.parkingSpotId ||
// //       !bookingData.slotId
// //     ) {
// //       return {
// //         success: false,
// //         msg: "Missing required booking information",
// //       };
// //     }

// //     // Check if slot is already booked
// //     const bookingsRef = collection(firestore, "bookings");
// //     const activeBookingsQuery = query(
// //       bookingsRef,
// //       where("parkingSpotId", "==", bookingData.parkingSpotId),
// //       where("slotId", "==", bookingData.slotId),
// //       where("bookingStatus", "in", ["pending", "confirmed"])
// //     );

// //     const existingBookings = await getDocs(activeBookingsQuery);
// //     if (!existingBookings.empty) {
// //       return {
// //         success: false,
// //         msg: "This slot is already booked. Please choose another slot.",
// //       };
// //     }

// //     // Prepare booking data with defaults
// //     const newBooking = {
// //       ...bookingData,
// //       bookingStatus: "pending" as BookingStatus,
// //       paymentStatus: "pending" as PaymentStatus,
// //       createdAt: serverTimestamp(),
// //       updatedAt: serverTimestamp(),
// //     };

// //     // Create the booking
// //     const bookingRef = await addDoc(
// //       collection(firestore, "bookings"),
// //       newBooking
// //     );

// //     return {
// //       success: true,
// //       bookingId: bookingRef.id,
// //       msg: "Booking created successfully",
// //     };
// //   } catch (error: any) {
// //     console.error("Error creating booking:", error);
// //     return {
// //       success: false,
// //       msg: error?.message || "Failed to create booking",
// //     };
// //   }
// // };

// // /**
// //  * Updates booking payment status and related details
// //  */
// // export const updateBookingPayment = async (
// //   bookingId: string,
// //   paymentDetails: PaymentDetailsType
// // ): Promise<BookingResponseType> => {
// //   try {
// //     if (!bookingId) {
// //       throw new Error("Booking ID is required");
// //     }

// //     const bookingRef = doc(firestore, "bookings", bookingId);
// //     const bookingDoc = await getDoc(bookingRef);

// //     if (!bookingDoc.exists()) {
// //       return {
// //         success: false,
// //         msg: "Booking not found",
// //       };
// //     }

// //     const updateData = {
// //       paymentStatus: paymentDetails.status,
// //       bookingStatus: paymentDetails.status === "paid" ? "confirmed" : "pending",
// //       updatedAt: serverTimestamp(),
// //       transactionId: paymentDetails.transactionId,
// //       paymentTime: paymentDetails.paymentTime || serverTimestamp(),
// //       paymentMethod: paymentDetails.paymentMethod,
// //     };

// //     await updateDoc(bookingRef, updateData);

// //     return {
// //       success: true,
// //       msg: "Payment updated successfully",
// //       paymentDetails,
// //     };
// //   } catch (error: any) {
// //     console.error("Error updating payment:", error);
// //     return {
// //       success: false,
// //       msg: error?.message || "Failed to update payment",
// //     };
// //   }
// // };

// // /**
// //  * Gets active bookings for a parking spot
// //  */
// // export const getActiveBookings = async (
// //   parkingSpotId: string
// // ): Promise<BookingType[]> => {
// //   try {
// //     if (!parkingSpotId) {
// //       throw new Error("Parking spot ID is required");
// //     }

// //     const bookingsRef = collection(firestore, "bookings");
// //     const activeBookingsQuery = query(
// //       bookingsRef,
// //       where("parkingSpotId", "==", parkingSpotId),
// //       where("bookingStatus", "in", ["pending", "confirmed"]),
// //       orderBy("createdAt", "desc")
// //     );

// //     const querySnapshot = await getDocs(activeBookingsQuery);
// //     return querySnapshot.docs.map((doc) => ({
// //       id: doc.id,
// //       ...doc.data(),
// //     })) as BookingType[];
// //   } catch (error: any) {
// //     console.error("Error getting active bookings:", error);
// //     throw error;
// //   }
// // };

// // /**
// //  * Gets slot availability status
// //  */
// // export const getSlotStatus = async (
// //   parkingSpotId: string,
// //   slotId: string
// // ): Promise<boolean> => {
// //   try {
// //     const bookingsRef = collection(firestore, "bookings");
// //     const slotQuery = query(
// //       bookingsRef,
// //       where("parkingSpotId", "==", parkingSpotId),
// //       where("slotId", "==", slotId),
// //       where("bookingStatus", "in", ["pending", "confirmed"])
// //     );

// //     const querySnapshot = await getDocs(slotQuery);
// //     return querySnapshot.empty; // true if slot is available
// //   } catch (error) {
// //     console.error("Error checking slot status:", error);
// //     return false;
// //   }
// // };

// // /**
// //  * Retrieves booking details
// //  */
// // export const getBookingDetails = async (
// //   bookingId: string
// // ): Promise<DocumentData | null> => {
// //   try {
// //     if (!bookingId) {
// //       throw new Error("Booking ID is required");
// //     }

// //     const bookingRef = doc(firestore, "bookings", bookingId);
// //     const bookingSnap = await getDoc(bookingRef);

// //     if (!bookingSnap.exists()) {
// //       return null;
// //     }

// //     return {
// //       id: bookingSnap.id,
// //       ...bookingSnap.data(),
// //     };
// //   } catch (error: any) {
// //     console.error("Error getting booking details:", error);
// //     throw error;
// //   }
// // };

// // /**
// //  * Cancels a booking
// //  */
// // export const cancelBooking = async (
// //   bookingId: string
// // ): Promise<BookingResponseType> => {
// //   try {
// //     if (!bookingId) {
// //       throw new Error("Booking ID is required");
// //     }

// //     const bookingRef = doc(firestore, "bookings", bookingId);
// //     const bookingDoc = await getDoc(bookingRef);

// //     if (!bookingDoc.exists()) {
// //       return {
// //         success: false,
// //         msg: "Booking not found",
// //       };
// //     }

// //     // Check if booking can be cancelled
// //     const bookingData = bookingDoc.data();
// //     if (bookingData.bookingStatus === "completed") {
// //       return {
// //         success: false,
// //         msg: "Cannot cancel a completed booking",
// //       };
// //     }

// //     await updateDoc(bookingRef, {
// //       bookingStatus: "cancelled" as BookingStatus,
// //       updatedAt: serverTimestamp(),
// //     });

// //     return {
// //       success: true,
// //       msg: "Booking cancelled successfully",
// //     };
// //   } catch (error: any) {
// //     console.error("Error cancelling booking:", error);
// //     return {
// //       success: false,
// //       msg: error?.message || "Failed to cancel booking",
// //     };
// //   }
// // };

// // /**
// //  * Gets user's booking history
// //  */
// // export const getUserBookings = async (
// //   userId: string,
// //   status?: BookingStatus
// // ): Promise<BookingType[]> => {
// //   try {
// //     if (!userId) {
// //       throw new Error("User ID is required");
// //     }

// //     const bookingsRef = collection(firestore, "bookings");
// //     let bookingsQuery = query(
// //       bookingsRef,
// //       where("userId", "==", userId),
// //       orderBy("createdAt", "desc")
// //     );

// //     if (status) {
// //       bookingsQuery = query(
// //         bookingsRef,
// //         where("userId", "==", userId),
// //         where("bookingStatus", "==", status),
// //         orderBy("createdAt", "desc")
// //       );
// //     }

// //     const querySnapshot = await getDocs(bookingsQuery);
// //     return querySnapshot.docs.map((doc) => ({
// //       id: doc.id,
// //       ...doc.data(),
// //     })) as BookingType[];
// //   } catch (error: any) {
// //     console.error("Error getting user bookings:", error);
// //     throw error;
// //   }
// // };

// import { firestore } from "@/config/firebase";
// import {
//   BookingType,
//   PaymentDetailsType,
//   BookingResponseType,
//   BookingStatus,
//   PaymentStatus,
// } from "@/types";
// import {
//   addDoc,
//   collection,
//   doc,
//   serverTimestamp,
//   updateDoc,
//   query,
//   where,
//   getDocs,
//   getDoc,
//   DocumentData,
//   Timestamp,
//   orderBy,
// } from "firebase/firestore";
// import * as Notifications from "expo-notifications";

// /**
//  * Creates a new booking
//  */
// export const createBooking = async (
//   bookingData: Partial<BookingType>
// ): Promise<BookingResponseType> => {
//   try {
//     // Validate required fields
//     if (
//       !bookingData.userId ||
//       !bookingData.parkingSpotId ||
//       !bookingData.slotId
//     ) {
//       return {
//         success: false,
//         msg: "Missing required booking information",
//       };
//     }

//     // Check if slot is already booked
//     const bookingsRef = collection(firestore, "bookings");
//     const activeBookingsQuery = query(
//       bookingsRef,
//       where("parkingSpotId", "==", bookingData.parkingSpotId),
//       where("slotId", "==", bookingData.slotId),
//       where("bookingStatus", "in", ["pending", "confirmed"])
//     );

//     const existingBookings = await getDocs(activeBookingsQuery);
//     if (!existingBookings.empty) {
//       return {
//         success: false,
//         msg: "This slot is already booked. Please choose another slot.",
//       };
//     }

//     // Prepare booking data with defaults
//     const newBooking = {
//       ...bookingData,
//       bookingStatus: "pending" as BookingStatus,
//       paymentStatus: "pending" as PaymentStatus,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     // Create the booking
//     const bookingRef = await addDoc(
//       collection(firestore, "bookings"),
//       newBooking
//     );

//     return {
//       success: true,
//       bookingId: bookingRef.id,
//       msg: "Booking created successfully",
//     };
//   } catch (error: any) {
//     console.error("Error creating booking:", error);
//     return {
//       success: false,
//       msg: error?.message || "Failed to create booking",
//     };
//   }
// };

// /**
//  * Validates a parking booking with the Python backend
//  */
// export const validateParking = async (carNumber: string): Promise<boolean> => {
//   try {
//     const response = await fetch("/api/validate-parking", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ plate_number: carNumber }),
//     });

//     const data = await response.json();

//     if (data.status === "YES") {
//       // Send push notification
//       await scheduleNotification(
//         "Welcome to Your Parking Spot",
//         "Dear User, you have successfully entered the parking spot."
//       );
//       return true;
//     }

//     return false;
//   } catch (error) {
//     console.error("Error validating parking:", error);
//     return false;
//   }
// };

// // Helper function to send push notifications
// const scheduleNotification = async (title: string, body: string) => {
//   try {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title,
//         body,
//         sound: true,
//         priority: Notifications.AndroidNotificationPriority.HIGH,
//       },
//       trigger: null, // Send immediately
//     });
//   } catch (error) {
//     console.error("Error scheduling notification:", error);
//   }
// };

// /**
//  * Starts the parking timer after Python validation
//  */
// export const startParkingTimer = async (
//   bookingId: string
// ): Promise<BookingResponseType> => {
//   try {
//     if (!bookingId) {
//       throw new Error("Booking ID is required");
//     }

//     const bookingRef = doc(firestore, "bookings", bookingId);
//     const bookingDoc = await getDoc(bookingRef);

//     if (!bookingDoc.exists()) {
//       return {
//         success: false,
//         msg: "Booking not found",
//       };
//     }

//     // Update the booking with the actual start time
//     await updateDoc(bookingRef, {
//       startTime: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     });

//     return {
//       success: true,
//       msg: "Parking timer started",
//     };
//   } catch (error: any) {
//     console.error("Error starting parking timer:", error);
//     return {
//       success: false,
//       msg: error?.message || "Failed to start parking timer",
//     };
//   }
// };

// /**
//  * Updates booking payment status and related details
//  */
// export const updateBookingPayment = async (
//   bookingId: string,
//   paymentDetails: PaymentDetailsType
// ): Promise<BookingResponseType> => {
//   try {
//     if (!bookingId) {
//       throw new Error("Booking ID is required");
//     }

//     const bookingRef = doc(firestore, "bookings", bookingId);
//     const bookingDoc = await getDoc(bookingRef);

//     if (!bookingDoc.exists()) {
//       return {
//         success: false,
//         msg: "Booking not found",
//       };
//     }

//     const updateData = {
//       paymentStatus: paymentDetails.status,
//       bookingStatus: paymentDetails.status === "paid" ? "confirmed" : "pending",
//       updatedAt: serverTimestamp(),
//       transactionId: paymentDetails.transactionId,
//       paymentTime: paymentDetails.paymentTime || serverTimestamp(),
//       paymentMethod: paymentDetails.paymentMethod,
//     };

//     await updateDoc(bookingRef, updateData);

//     return {
//       success: true,
//       msg: "Payment updated successfully",
//       paymentDetails,
//     };
//   } catch (error: any) {
//     console.error("Error updating payment:", error);
//     return {
//       success: false,
//       msg: error?.message || "Failed to update payment",
//     };
//   }
// };

// /**
//  * Completes a booking
//  */
// export const completeBooking = async (
//   bookingId: string
// ): Promise<BookingResponseType> => {
//   try {
//     if (!bookingId) {
//       throw new Error("Booking ID is required");
//     }

//     const bookingRef = doc(firestore, "bookings", bookingId);
//     const bookingDoc = await getDoc(bookingRef);

//     if (!bookingDoc.exists()) {
//       return {
//         success: false,
//         msg: "Booking not found",
//       };
//     }

//     await updateDoc(bookingRef, {
//       bookingStatus: "completed" as BookingStatus,
//       updatedAt: serverTimestamp(),
//     });

//     return {
//       success: true,
//       msg: "Booking completed successfully",
//     };
//   } catch (error: any) {
//     console.error("Error completing booking:", error);
//     return {
//       success: false,
//       msg: error?.message || "Failed to complete booking",
//     };
//   }
// };

// /**
//  * Gets active bookings for a parking spot
//  */
// export const getActiveBookings = async (
//   parkingSpotId: string
// ): Promise<BookingType[]> => {
//   try {
//     if (!parkingSpotId) {
//       throw new Error("Parking spot ID is required");
//     }

//     const bookingsRef = collection(firestore, "bookings");
//     const activeBookingsQuery = query(
//       bookingsRef,
//       where("parkingSpotId", "==", parkingSpotId),
//       where("bookingStatus", "in", ["pending", "confirmed"]),
//       orderBy("createdAt", "desc")
//     );

//     const querySnapshot = await getDocs(activeBookingsQuery);
//     return querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as BookingType[];
//   } catch (error: any) {
//     console.error("Error getting active bookings:", error);
//     throw error;
//   }
// };

// /**
//  * Gets user's booking history
//  */
// export const getUserBookings = async (
//   userId: string,
//   status?: BookingStatus
// ): Promise<BookingType[]> => {
//   try {
//     if (!userId) {
//       throw new Error("User ID is required");
//     }

//     const bookingsRef = collection(firestore, "bookings");
//     let bookingsQuery = query(
//       bookingsRef,
//       where("userId", "==", userId),
//       orderBy("createdAt", "desc")
//     );

//     if (status) {
//       bookingsQuery = query(
//         bookingsRef,
//         where("userId", "==", userId),
//         where("bookingStatus", "==", status),
//         orderBy("createdAt", "desc")
//       );
//     }

//     const querySnapshot = await getDocs(bookingsQuery);
//     return querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as BookingType[];
//   } catch (error: any) {
//     console.error("Error getting user bookings:", error);
//     throw error;
//   }
// };

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
} from "firebase/firestore";

/**
 * Validates parking with Python backend
 */
export const validateParking = async (carNumber: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/validate-parking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plate_number: carNumber }),
    });

    const data = await response.json();
    if (data.status === "YES") {
      // If validated, update the booking
      const bookingsRef = collection(firestore, "bookings");
      const bookingQuery = query(
        bookingsRef,
        where("carNumber", "==", carNumber),
        where("bookingStatus", "==", "confirmed"),
        where("timerStarted", "==", false)
      );

      const querySnapshot = await getDocs(bookingQuery);
      if (!querySnapshot.empty) {
        const bookingDoc = querySnapshot.docs[0];
        await updateDoc(doc(firestore, "bookings", bookingDoc.id), {
          timerStarted: true,
          startTime: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error validating parking:", error);
    return false;
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
      !bookingData.slotId
    ) {
      return {
        success: false,
        msg: "Missing required booking information",
      };
    }

    // Check if slot is already booked
    const bookingsRef = collection(firestore, "bookings");
    const activeBookingsQuery = query(
      bookingsRef,
      where("parkingSpotId", "==", bookingData.parkingSpotId),
      where("slotId", "==", bookingData.slotId),
      where("bookingStatus", "in", ["pending", "confirmed"])
    );

    const existingBookings = await getDocs(activeBookingsQuery);
    if (!existingBookings.empty) {
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
      timerStarted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Create the booking
    const bookingRef = await addDoc(
      collection(firestore, "bookings"),
      newBooking
    );

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
 * Updates booking payment status and related details
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

    const updateData = {
      paymentStatus: paymentDetails.status,
      bookingStatus: paymentDetails.status === "paid" ? "confirmed" : "pending",
      updatedAt: serverTimestamp(),
      transactionId: paymentDetails.transactionId,
      paymentTime: paymentDetails.paymentTime || serverTimestamp(),
      paymentMethod: paymentDetails.paymentMethod,
    };

    await updateDoc(bookingRef, updateData);

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
 * Completes a booking
 */
export const completeBooking = async (
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
    return querySnapshot.empty; // Returns true if slot is available
  } catch (error) {
    console.error("Error checking slot availability:", error);
    return false;
  }
};

/**
 * Gets user's booking history
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
