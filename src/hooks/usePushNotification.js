/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect } from "react";
import axiosInstance from "@utils/axiosInstance";
import { useToast } from "../context/ToastContext";
import logger from "@utils/logger";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@store/slices/authSlice";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};
/**
 * Custom hook for push notification.
 * @returns {Object} Hook state and handlers for the caller.
 */

const usePushNotification = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const setup = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        await axiosInstance.post(`/push/subscribe`, { subscription });

        logger.info("Push notifications enabled");
      } catch (err) {
        logger.warn("Push setup failed", { error: err.message });
      }
    };

    setup();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event) => {
      logger.info("Message received from service worker", {
        data: event.data
      });
      if (event.data?.type === "SHOW_TOAST") {
        const { title, message, type } = event.data.payload;
        logger.info("Showing toast from service worker message", { title, message, type });
        showToast({ type: type || "info", title, message });
      }
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, [showToast]);
};

export default usePushNotification;
