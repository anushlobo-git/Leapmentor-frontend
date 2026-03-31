// src/hooks/useSocketToast.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useToast } from "../context/ToastContext";

const BASE_URL = import.meta.env.VITE_API_SOCKET_URL || "http://localhost:5000";

const useSocketToast = (onRequestChanged) => {
  const { showToast } = useToast();
  const socketRef = useRef(null);

  // ✅ FIX: Store showToast in a ref so the socket useEffect doesn't
  // re-run every time showToast gets a new reference from context.
  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);

  // ✅ FIX: Store onRequestChanged in a ref so the socket useEffect doesn't
  // re-run every time the parent passes a new inline function reference.
  const onRequestChangedRef = useRef(onRequestChanged);
  useEffect(() => { onRequestChangedRef.current = onRequestChanged; }, [onRequestChanged]);

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
      showToastRef.current({ type: type || "info", title, message });
    });

    socket.on("request_accepted", ({ title, message, type }) => {
      showToastRef.current({ type: type || "success", title, message });
    });

    socket.on("request_declined", ({ title, message, type }) => {
      showToastRef.current({ type: type || "warning", title, message });
    });

    socket.on("request_referred", ({ title, message, type }) => {
      showToastRef.current({ type: type || "info", title, message });
    });

    // ✅ Triggers UI refetch on both dashboards when request status changes
    socket.on("request_status_changed", (data) => {
      if (onRequestChangedRef.current) onRequestChangedRef.current(data);
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
  }, []); // ✅ Empty array — socket is created once, refs handle the rest
};

export default useSocketToast;