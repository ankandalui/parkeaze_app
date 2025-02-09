import { useEffect, useState, useCallback } from "react";
import { BookingType } from "@/types";
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

const getDateFromTimestamp = (time: Date | any): Date => {
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

  const handleExpiry = useCallback(async () => {
    if (booking.id && !isExpiredShown) {
      setIsExpiredShown(true);
      await sendParkingExpired(booking);
      await completeBooking(booking.id);
      onTimeExpired?.();
    }
  }, [booking, isExpiredShown, onTimeExpired]);

  const handleWarning = useCallback(async () => {
    if (!isWarningShown) {
      setIsWarningShown(true);
      await sendParkingReminder(booking);
      onTimeWarning?.();
    }
  }, [booking, isWarningShown, onTimeWarning]);

  useEffect(() => {
    if (!booking.startTime) return;

    const startTime = getDateFromTimestamp(booking.startTime);
    const endTime = new Date(
      startTime.getTime() + booking.duration * 60 * 60 * 1000
    );

    const updateTimer = () => {
      const now = new Date();
      const remaining = endTime.getTime() - now.getTime();
      setTimeRemaining(remaining);

      if (remaining <= 15 * 60 * 1000 && remaining > 0) {
        handleWarning();
      }

      if (remaining <= 0) {
        handleExpiry();
      }
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(timer);
  }, [booking, handleWarning, handleExpiry]);

  const formatTimeRemaining = () => {
    if (!booking.startTime) return "Not Started";
    if (timeRemaining <= 0) return "Expired";

    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor(
      (timeRemaining % (60 * 60 * 1000)) / (60 * 1000)
    );
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

    if (booking.duration < 0.5) {
      return `${minutes}m ${seconds}s`;
    }

    return `${hours}h ${minutes}m`;
  };

  return {
    timeRemaining,
    formattedTime: formatTimeRemaining(),
    isExpired: timeRemaining <= 0,
    isWarningTime: timeRemaining <= 15 * 60 * 1000 && timeRemaining > 0,
    isStarted: !!booking.startTime,
  };
};
