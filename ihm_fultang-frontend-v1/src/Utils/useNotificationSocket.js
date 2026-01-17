import { useEffect, useRef } from "react";

const defaultWsBase = "ws://127.0.0.1:8009";

function buildWsUrl() {
  const apiBase =
    import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL || "";
  const wsBase =
    apiBase.replace(/^http/, "ws").replace(/\/api\/v1\/medical\/?$/, "") ||
    defaultWsBase;
  const token = localStorage.getItem("token_key_fultang");
  return `${wsBase}/ws/notifications/?token=${token || ""}`;
}

export function useNotificationSocket(onMessage) {
  const socketRef = useRef(null);
  const handlerRef = useRef(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const wsUrl = buildWsUrl();
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handlerRef.current?.(payload);
      } catch (error) {
        console.error("Invalid notification payload:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Notification socket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return socketRef;
}
