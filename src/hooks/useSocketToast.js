// src/hooks/useSocketToast.js
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

    const socket = io(BASE_URL, {
      auth:                 { token },
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    2000,
      transports:           ["websocket", "polling"],
    });

    socketRef.current = socket;

    // ✅ Expose on window so useSessions and other hooks can attach listeners
    // without creating competing sockets that overwrite userSockets map
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
      showToast({ type: type || "info", title, message });
    });

    socket.on("request_accepted", ({ title, message, type }) => {
      showToast({ type: type || "success", title, message });
    });

    socket.on("request_declined", ({ title, message, type }) => {
      showToast({ type: type || "warning", title, message });
    });

    socket.on("request_referred", ({ title, message, type }) => {
      showToast({ type: type || "info", title, message });
    });

    // ✅ session_slots_updated is handled by useSessions via window.__leapSocket
    // No toast needed here — just real-time state sync

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