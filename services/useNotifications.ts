// src/hooks/useNotifications.ts
import { useEffect, useCallback } from "react";
import * as Notifications from "expo-notifications";
import {
  initializeNotifications,
  requestNotificationPermissions,
} from "@/services/notificationService";

export const useNotifications = () => {
  const setupNotifications = useCallback(async () => {
    try {
      // Initialize notification channels
      await initializeNotifications();

      // Request permissions
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        console.log("No notification permissions granted");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error setting up notifications:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    setupNotifications();

    // Set up notification handlers
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // Handle notification interaction here
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [setupNotifications]);

  return {
    setupNotifications,
  };
};

export default useNotifications;
