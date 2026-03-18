// src/hooks/useUnreadCount.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const count = (res.data.notifications || []).filter((n) => !n.read).length;
      setUnreadCount(count);
    } catch {
      // silently fail — badge is non-critical
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // ✅ Poll every 30 seconds to keep badge fresh
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ✅ Call this when user opens notifications tab to clear the badge
  const clearBadge = useCallback(() => setUnreadCount(0), []);

  return { unreadCount, clearBadge, refetch: fetchUnreadCount };
};

export default useUnreadCount;