import { useEffect, useRef, useState } from "react";
import axiosInstance from "./axiosInstance.js";
import { useAuthentication } from "./Provider.jsx";
import { useNotificationSocket } from "./useNotificationSocket.js";

export function useMessageBadge({ includeWelcome = true, pollInterval = 30000 } = {}) {
  const [count, setCount] = useState(0);
  const { userData } = useAuthentication();
  const isMountedRef = useRef(true);
  const userId =
    userData?.id ??
    userData?.user_id ??
    userData?.userId ??
    userData?.pk ??
    null;
  const readMessagesKey = userId ? `fultang_read_messages_${userId}` : null;
  const deletedMessagesKey = userId ? `fultang_deleted_messages_${userId}` : null;

  const getStoredIds = (key) => {
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const computeTotal = (messages, notifications) => {
    const deletedIds = new Set(getStoredIds(deletedMessagesKey));
    const readIds = new Set(getStoredIds(readMessagesKey));
    const unreadMessages = messages.filter(
      (message) => !deletedIds.has(message?.id) && !readIds.has(message?.id)
    );
    let total = unreadMessages.length + notifications.length;
    if (includeWelcome && userId && userData.role !== "Admin") {
      const welcomeKey = `fultang_welcome_message_${userId}`;
      if (!localStorage.getItem(welcomeKey)) {
        total += 1;
      }
    }
    return total;
  };

  const fetchCounts = async () => {
    try {
      const [messagesRes, notificationsRes] = await Promise.all([
        axiosInstance.get("/message/"),
        axiosInstance.get("/notification/"),
      ]);
      const messages = messagesRes.data?.results ?? messagesRes.data ?? [];
      const notifications = notificationsRes.data?.results ?? notificationsRes.data ?? [];
      if (isMountedRef.current) {
        setCount(computeTotal(messages, notifications));
      }
    } catch (error) {
      // Ignore to avoid breaking navigation if API is down.
    }
  };

  useEffect(() => {
    if (!userId) return undefined;
    isMountedRef.current = true;
    fetchCounts();
    const interval = setInterval(fetchCounts, pollInterval);
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [userId, pollInterval]);

  useNotificationSocket((payload) => {
    if (!payload?.id) return;
    setCount((prev) => prev + 1);
  });

  return count;
}
