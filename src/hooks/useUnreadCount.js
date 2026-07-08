/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useUnreadCount.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@utils/axiosInstance";
import { isLoggedIn } from "@utils/cookies";
import { normalizeApiNotif } from "@mappers/notificationMapper";
/**
 * Custom hook for unread count.
 * @returns {Object} Hook state and handlers for the caller.
 */


const useUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      if (!isLoggedIn()) return;
      const res = await axiosInstance.get("/notifications");
      const normalized = Array.isArray(res.data.notifications) ? res.data.notifications.map(normalizeApiNotif) : [];
      const count = normalized.filter((n) => !n.read).length;
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, []);

 useEffect(() => {
   fetchUnreadCount();
 }, [fetchUnreadCount]);

  // ✅ increment badge when socket/push notification arrives
  const incrementBadge = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  const clearBadge = useCallback(() => setUnreadCount(0), []);

  return { unreadCount, clearBadge, refetch: fetchUnreadCount, incrementBadge };
};

export default useUnreadCount;
