import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import api from "../services/api";

let Notifications;
try { Notifications = require("expo-notifications"); } catch {}

if (Notifications && Notifications.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

const isWeb = Platform.OS === "web";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushToken, setPushToken] = useState(null);
  const intervalRef = useRef(null);

  const registerPush = useCallback(async () => {
    if (isWeb || !Notifications) return null;
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      const token = await Notifications.getExpoPushTokenAsync();
      setPushToken(token.data);
      return token.data;
    } catch {
      return null;
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.acknowledged).length);
    } catch {}
  }, []);

  const acknowledge = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/acknowledge`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const acknowledgeAll = useCallback(async () => {
    try {
      const pending = notifications.filter((n) => !n.acknowledged);
      await Promise.all(pending.map((n) => api.put(`/notifications/${n._id}/acknowledge`)));
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  }, [notifications]);

  useEffect(() => {
    registerPush();
    loadNotifications();
    intervalRef.current = setInterval(loadNotifications, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [registerPush, loadNotifications]);

  return { notifications, unreadCount, acknowledge, acknowledgeAll, refresh: loadNotifications, pushToken };
};
