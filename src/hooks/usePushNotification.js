import { useEffect } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const usePushNotification = () => {
  const { showToast } = useToast();

  // ✅ Register service worker + subscribe to push
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
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

        await axios.post(
          `${BASE_URL}/push/subscribe`,
          { subscription },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Push notifications enabled");
      } catch (err) {
        console.warn("⚠️ Push setup failed:", err.message);
      }
    };

    setup();
  }, []);

  // ✅ Listen for messages from service worker → show in-app toast
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event) => {
  console.log("📩 Message from SW received:", event.data); // ✅ check if message arrives
  if (event.data?.type === "SHOW_TOAST") {
    const { title, message, type } = event.data.payload;
    console.log("🍞 Calling showToast:", { title, message, type }); // ✅ check if toast fires
    showToast({ type: type || "info", title, message });
  }
};
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [showToast]);
};

export default usePushNotification;