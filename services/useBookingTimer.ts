import { useEffect, useState } from "react";
import { BookingType } from "@/types";
import { Timestamp } from "firebase/firestore";
import { completeBooking } from "@/services/bookingService";
import {
  sendParkingReminder,
  sendParkingExpired,
} from "@/services/notificationService";

interface UseBookingTimerProps {
  booking: BookingType;
  onTimeWarning?: () => void;
  onTimeExpired?: () => void;
}

const getDateFromTimestamp = (time: Date | Timestamp): Date => {
  if (time instanceof Date) return time;
  return time.toDate();
};

export const useBookingTimer = ({
  booking,
  onTimeWarning,
  onTimeExpired,
}: UseBookingTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isWarningShown, setIsWarningShown] = useState(false);
  const [isExpiredShown, setIsExpiredShown] = useState(false);

  useEffect(() => {
    if (!booking.timerStarted) {
      return;
    }

    const startTime = getDateFromTimestamp(booking.startTime);
    const endTime = new Date(
      startTime.getTime() + booking.duration * 60 * 60 * 1000
    );

    const updateTimer = async () => {
      const now = new Date();
      const remaining = endTime.getTime() - now.getTime();
      setTimeRemaining(remaining);

      // Warning notification at 15 minutes
      if (remaining <= 15 * 60 * 1000 && !isWarningShown) {
        setIsWarningShown(true);
        await sendParkingReminder(booking);
        onTimeWarning?.();
      }

      // Handle expired time
      if (remaining <= 0 && !isExpiredShown) {
        setIsExpiredShown(true);
        await sendParkingExpired(booking);

        // Automatically complete the booking
        if (booking.id) {
          await completeBooking(booking.id);
        }

        onTimeExpired?.();
      }
    };

    const timer = setInterval(updateTimer, 60 * 1000);
    updateTimer(); // Initial update

    return () => clearInterval(timer);
  }, [booking, onTimeWarning, onTimeExpired, isWarningShown, isExpiredShown]);

  const formatTimeRemaining = () => {
    if (!booking.timerStarted) return "Waiting...";
    if (timeRemaining <= 0) return "Expired";

    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor(
      (timeRemaining % (60 * 60 * 1000)) / (60 * 1000)
    );

    return `${hours}h ${minutes}m`;
  };

  return {
    timeRemaining,
    formattedTime: formatTimeRemaining(),
    isExpired: timeRemaining <= 0,
    isWarningTime: timeRemaining <= 15 * 60 * 1000,
    isWaiting: !booking.timerStarted,
  };
};
