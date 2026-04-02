// src/hooks/useSocketToast.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useToast } from "../context/ToastContext";
import useUnreadCount from "./useUnreadCount";

const BASE_URL = import.meta.env.VITE_API_SOCKET_URL || "http://localhost:5000";

const useSocketToast = (onRequestChanged) => {
  const { showToast } = useToast();
  const { incrementBadge } = useUnreadCount();

  const socketRef = useRef(null);

  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  const incrementBadgeRef = useRef(incrementBadge);
  useEffect(() => {
    incrementBadgeRef.current = incrementBadge;
  }, [incrementBadge]);

  const onRequestChangedRef = useRef(onRequestChanged);
  useEffect(() => {
    onRequestChangedRef.current = onRequestChanged;
  }, [onRequestChanged]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // ✅ no token = no socket (onboarding, login pages)
    {
      /*
    // ✅ prevent duplicate socket if already connected
    if (socketRef.current?.connected) return;*/
    }

    //the above was the past code i changed it and added below lines

    if (window.__leapSocket?.connected) return; // ✅ globally shared
    // ✅ added global socket reference to prevent duplicates across multiple hook instances (e.g. multiple pages open)

    const socket = io(BASE_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5, // ✅ reduced from 10
      reconnectionDelay: 2000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    window.__leapSocket = socket;

    // ✅ removed connect log
    // ✅ removed disconnect log
    // ✅ removed cleanup log

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Socket error:", err.message);
    });
    socket.on("reconnect", () => {
      window.__leapSocket = socket; // ✅ re-expose after reconnect
    });

    socket.on("new_connect_request", ({ title, message, type }) => {
      showToastRef.current({ type: type || "info", title, message });
      incrementBadgeRef.current();
    });

    socket.on("request_accepted", ({ title, message, type }) => {
      showToastRef.current({ type: type || "success", title, message });
      incrementBadgeRef.current();
    });

    socket.on("request_declined", ({ title, message, type }) => {
      showToastRef.current({ type: type || "warning", title, message });
      incrementBadgeRef.current();
    });

    socket.on("request_referred", ({ title, message, type }) => {
      showToastRef.current({ type: type || "info", title, message });
      incrementBadgeRef.current();
    });

    socket.on("request_status_changed", (data) => {
      if (onRequestChangedRef.current) onRequestChangedRef.current(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (window.__leapSocket === socket) {
        window.__leapSocket = null;
      }
    };
  }, []);
};

export default useSocketToast;
