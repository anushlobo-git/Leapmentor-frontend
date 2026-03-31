// src/hooks/useSocketToast.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useToast } from "../context/ToastContext";
import useUnreadCount from "./useUnreadCount"; // ✅ add this import

const BASE_URL = import.meta.env.VITE_API_SOCKET_URL || "http://localhost:5000";

const useSocketToast = (onRequestChanged) => {
  const { showToast } = useToast();
  const { incrementBadge } = useUnreadCount(); // ✅ add this

  const socketRef = useRef(null);

  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  const incrementBadgeRef = useRef(incrementBadge); // ✅ add this
  useEffect(() => {
    incrementBadgeRef.current = incrementBadge;
  }, [incrementBadge]); // ✅ add this

  const onRequestChangedRef = useRef(onRequestChanged);
  useEffect(() => {
    onRequestChangedRef.current = onRequestChanged;
  }, [onRequestChanged]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(BASE_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    window.__leapSocket = socket;

    socket.on("connect", () => {
      console.log("🔔 Notification socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Notification socket error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("🔔 Notification socket disconnected");
    });

    // ── Toast events ────────────────────────────────────────
    socket.on("new_connect_request", ({ title, message, type }) => {
      showToastRef.current({ type: type || "info", title, message });
      incrementBadgeRef.current(); // ✅ bump badge
    });

    socket.on("request_accepted", ({ title, message, type }) => {
      showToastRef.current({ type: type || "success", title, message });
      incrementBadgeRef.current(); // ✅ bump badge
    });

    socket.on("request_declined", ({ title, message, type }) => {
      showToastRef.current({ type: type || "warning", title, message });
      incrementBadgeRef.current(); // ✅ bump badge
    });

    socket.on("request_referred", ({ title, message, type }) => {
      showToastRef.current({ type: type || "info", title, message });
      incrementBadgeRef.current(); // ✅ bump badge
    });

    socket.on("request_status_changed", (data) => {
      if (onRequestChangedRef.current) onRequestChangedRef.current(data);
    });

    return () => {
      console.log("🧹 Notification socket cleanup");
      socket.disconnect();
      socketRef.current = null;
      if (window.__leapSocket === socket) {
        window.__leapSocket = null;
      }
    };
  }, []);
};

export default useSocketToast;
