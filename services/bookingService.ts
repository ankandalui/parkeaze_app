import { firestore } from "@/config/firebase";
import { BookingType, PaymentDetailsType, BookingResponseType } from "@/types";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export const createBooking = async (
  bookingData: Partial<BookingType>
): Promise<BookingResponseType> => {
  try {
    const bookingRef = await addDoc(collection(firestore, "bookings"), {
      ...bookingData,
      bookingStatus: "pending",
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      bookingId: bookingRef.id,
      msg: "Booking created successfully",
    };
  } catch (error: any) {
    console.log("error creating booking: ", error);
    return { success: false, msg: error?.message };
  }
};

export const updateBookingPayment = async (
  bookingId: string,
  paymentDetails: PaymentDetailsType
): Promise<BookingResponseType> => {
  try {
    const bookingRef = doc(firestore, "bookings", bookingId);
    await updateDoc(bookingRef, {
      paymentStatus: paymentDetails.status,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      msg: "Payment updated successfully",
    };
  } catch (error: any) {
    console.log("error updating payment: ", error);
    return { success: false, msg: error?.message };
  }
};
