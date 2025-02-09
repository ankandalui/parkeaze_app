import { useState, useEffect } from "react";
import { BookingType } from "../types";

interface UseBookingTimerProps {
  booking: BookingType;
  onTimeWarning?: () => void;
  onTimeExpired?: () => void;
}

interface UseBookingTimerReturn {
  timeRemaining: number;
  formattedTime: string;
  isExpired: boolean;
  isWarningTime: boolean;
  isStarted: boolean;
  progress: number;
}

const getTimeInMillis = (date: Date | any): number => {
  // Handle Firebase Timestamp objects
  if (date && typeof date.toDate === "function") {
    return date.toDate().getTime();
  }
  // Handle regular Date objects
  if (date instanceof Date) {
    return date.getTime();
  }
  // Handle timestamp numbers
  if (typeof date === "number") {
    return date;
  }
  // Default case
  return new Date(date).getTime();
};

export const useBookingTimer = ({
  booking,
  onTimeWarning,
  onTimeExpired,
}: UseBookingTimerProps): UseBookingTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(1);
  const [formattedTime, setFormattedTime] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [isWarningTime, setIsWarningTime] = useState(false);
  const [isStarted, setIsStarted] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = getTimeInMillis(booking.endTime);
      const start = getTimeInMillis(booking.startTime);
      const total = end - start;
      const remaining = end - now;

      setTimeRemaining(remaining);
      const newProgress = Math.max(0, remaining / total);
      setProgress(newProgress);

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setFormattedTime(`${minutes}:${seconds.toString().padStart(2, "0")}`);

      if (remaining <= 0) {
        setIsExpired(true);
        onTimeExpired?.();
        clearInterval(interval);
      } else if (remaining <= 300000 && !isWarningTime) {
        // 5 minutes warning
        setIsWarningTime(true);
        onTimeWarning?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  return {
    timeRemaining,
    formattedTime,
    isExpired,
    isWarningTime,
    isStarted,
    progress,
  };
};
