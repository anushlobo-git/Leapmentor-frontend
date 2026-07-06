import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useToast } from "../context/ToastContext";
import { useSelector } from "react-redux";
import { isLoggedIn } from "@utils/cookies";
import logger from "@utils/logger";

const BASE_URL = import.meta.env.VITE_API_SOCKET_URL || "http://localhost:5000";

const useSocketToast = (onRequestChanged, incrementBadge) => {
  // ✅ incrementBadge as param
  const { showToast } = useToast();
  const accessToken = useSelector((state) => state.auth.accessToken); // ✅ from Redux

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
    if (!isLoggedIn()) {
      logger.info("Socket toast not initialized: user not logged in");
      return;
    }
    if (!accessToken) {
      logger.info("Socket toast waiting for access token before connecting");
      return; // ✅ wait for silent refresh
    }
    if (globalThis.__leapSocket?.connected) {
      logger.info("Socket already connected, skipping initialization");
      return;
    }

    logger.info("Initializing socket connection", { url: BASE_URL });
    const socket = io(BASE_URL, {
      withCredentials: true,
      auth: { token: accessToken }, // ✅ real token from Redux
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    globalThis.__leapSocket = socket;

    socket.on("connect", () => {
      logger.info("Socket connected", { socketId: socket.id });
    });

    socket.on("connect_error", (err) => {
      logger.warn("Socket connect error", { error: err.message });
    });

    socket.on("disconnect", (reason) => {
      logger.warn("Socket disconnected", { reason });
      if (globalThis.__leapSocket === socket) {
        globalThis.__leapSocket = null;
      }
    });

    socket.on("reconnect", (attempt) => {
      logger.info("Socket reconnected", { attempt });
      globalThis.__leapSocket = socket;
    });

    socket.on("new_connect_request", ({ title, message, type }) => {
      logger.info("Socket event: new_connect_request", { title, message });
      showToastRef.current({ type: type || "info", title, message });
      incrementBadgeRef.current?.(); // ✅ safe call
    });

    socket.on("request_accepted", ({ title, message, type }) => {
      logger.info("Socket event: request_accepted", { title, message });
      showToastRef.current({ type: type || "success", title, message });
      incrementBadgeRef.current?.(); // ✅
    });

    socket.on("request_declined", ({ title, message, type }) => {
      logger.info("Socket event: request_declined", { title, message });
      showToastRef.current({ type: type || "warning", title, message });
      incrementBadgeRef.current?.(); // ✅
    });

    socket.on("request_referred", ({ title, message, type }) => {
      logger.info("Socket event: request_referred", { title, message });
      showToastRef.current({ type: type || "info", title, message });
      incrementBadgeRef.current?.(); // ✅
    });

    socket.on("request_status_changed", (data) => {
      logger.info("Socket event: request_status_changed", { data });
      if (onRequestChangedRef.current) onRequestChangedRef.current(data);
    });

    return () => {
      logger.info("Disconnecting socket");
      socket.disconnect();
      socketRef.current = null;
      if (globalThis.__leapSocket === socket) {
        globalThis.__leapSocket = null;
      }
    };
  }, [accessToken]); // ✅ re-run when token is ready
};

export default useSocketToast;
