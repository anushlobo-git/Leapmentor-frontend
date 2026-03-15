// src/hooks/useSlotLock.js
import { useCallback, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useSlotLock = (mentorId) => {
  const lockedKeys = useRef(new Set()); // tracks keys this session locked

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // ─────────────────────────────────────────────
  // Lock a slot — called when mentee selects
  // Returns { ok: true } or { ok: false, code, msg }
  // ─────────────────────────────────────────────
  const lockSlot = useCallback(async (date, startTime, endTime) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/slot-locks/lock`,
        { mentorId, date, startTime, endTime },
        { headers: getHeaders() }
      );
      lockedKeys.current.add(`${date}-${startTime}`);
      return { ok: true, expiresAt: res.data.expiresAt };
    } catch (err) {
      const code = err?.response?.data?.code;
      const msg  = err?.response?.data?.message || "Could not lock slot";
      return { ok: false, code, msg };
    }
  }, [mentorId]);

  // ─────────────────────────────────────────────
  // Unlock a slot — called when mentee deselects
  // ─────────────────────────────────────────────
  const unlockSlot = useCallback(async (date, startTime, endTime) => {
    try {
      await axios.post(
        `${BASE_URL}/api/slot-locks/unlock`,
        { mentorId, date, startTime, endTime },
        { headers: getHeaders() }
      );
      lockedKeys.current.delete(`${date}-${startTime}`);
    } catch (err) {
      // Silently fail — lock will expire via TTL anyway
      console.warn("unlock failed silently:", err?.message);
    }
  }, [mentorId]);

  // ─────────────────────────────────────────────
  // Unlock all — called when mentee closes modal
  // ─────────────────────────────────────────────
  const unlockAll = useCallback(async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/slot-locks/unlock-all`,
        { mentorId },
        { headers: getHeaders() }
      );
      lockedKeys.current.clear();
    } catch (err) {
      console.warn("unlock-all failed silently:", err?.message);
    }
  }, [mentorId]);

  return { lockSlot, unlockSlot, unlockAll };
};

export default useSlotLock;