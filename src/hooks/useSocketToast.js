// src/hooks/useSocketToast.js
// ✅ Global socket connection for dashboard-level real-time notifications
// Separate from useChat which is room-scoped per session
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useToast } from "../context/ToastContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useSocketToast = () => {
  const { showToast } = useToast();
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ Connect a dedicated socket just for notifications
    // Does NOT join any room — purely listens for user-level events
    const socket = io(BASE_URL, {
      auth:                 { token },
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    2000,
      transports:           ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔔 Notification socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Notification socket error:", err.message);
    });

    // ✅ Mentor receives this when mentee sends a request
    socket.on("new_connect_request", ({ title, message, type }) => {
      showToast({ type: type || "info", title, message });
    });

    // ✅ Mentee receives this when mentor accepts
    socket.on("request_accepted", ({ title, message, type }) => {
      showToast({ type: type || "success", title, message });
    });

    // ✅ Mentee receives this when mentor declines
    socket.on("request_declined", ({ title, message, type }) => {
      showToast({ type: type || "warning", title, message });
    });

    // ✅ Mentee receives this when mentor refers to another mentor
    socket.on("request_referred", ({ title, message, type }) => {
      showToast({ type: type || "info", title, message });
    });

    return () => {
      console.log("🧹 Notification socket disconnected");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // ✅ runs once on mount — token from localStorage
};

export default useSocketToast;