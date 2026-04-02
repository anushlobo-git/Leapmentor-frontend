// src/hooks/useSessions.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const useSessions = (connectRequestId, onAllComplete) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSlots, setSavingSlots] = useState(new Set());
  const [error, setError] = useState(null);
  const [completedSlots, setCompletedSlots] = useState(0);
  const [totalSlots, setTotalSlots] = useState(0);
  const [progress, setProgress] = useState(0);

  const allCompleteFiredRef = useRef(false);
  const onAllCompleteRef = useRef(onAllComplete);

  useEffect(() => {
    onAllCompleteRef.current = onAllComplete;
  }, [onAllComplete]);

  // ── Per-slot saving state helper ──────────────────────────────
  const setSavingSlot = (index, val) =>
    setSavingSlots((prev) => {
      const next = new Set(prev);
      val ? next.add(index) : next.delete(index);
      return next;
    });

  const applySlotUpdate = useCallback((data) => {
    if (data.slots) setSlots(data.slots);
    if (data.completedSlots !== undefined) setCompletedSlots(data.completedSlots);
    if (data.totalSlots !== undefined) setTotalSlots(data.totalSlots);
    if (data.progress !== undefined) setProgress(data.progress);
  }, []);

  const fetchSlots = useCallback(async (silent = false) => {
    if (!connectRequestId) return;
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await axios.get(
        `${BASE_URL}/sessions/${connectRequestId}/slots`,
        { headers: authHeader() },
      );
      applySlotUpdate(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sessions.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [connectRequestId, applySlotUpdate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // ✅ Listen on the SHARED global socket (window.__leapSocket)
  useEffect(() => {
    if (!connectRequestId) return;

    const handleSlotUpdate = (data) => {
      if (data.connectRequestId !== connectRequestId) return;
      console.log("📅 session_slots_updated — syncing instantly");
      applySlotUpdate(data);

      if (data.allComplete && !allCompleteFiredRef.current) {
        allCompleteFiredRef.current = true;
        setTimeout(() => {
          onAllCompleteRef.current?.();
        }, 2000);
      }
    };

    const handleSlotCancelled = (data) => {
      if (data.connectRequestId !== connectRequestId) return;
      console.log("🚫 slot_cancelled received", data);
    };

    const handleSlotRescheduled = (data) => {
      if (data.connectRequestId !== connectRequestId) return;
      console.log("🔄 slot_rescheduled received", data);
    };

    const waitForSocket = setInterval(() => {
      if (window.__leapSocket?.connected) {
        window.__leapSocket.on("session_slots_updated", handleSlotUpdate);
        window.__leapSocket.on("slot_cancelled", handleSlotCancelled);
        window.__leapSocket.on("slot_rescheduled", handleSlotRescheduled);
        clearInterval(waitForSocket);
        console.log("📅 Registered session socket listeners on shared socket");
      }
    }, 200);

    return () => {
      clearInterval(waitForSocket);
      window.__leapSocket?.off("session_slots_updated", handleSlotUpdate);
      window.__leapSocket?.off("slot_cancelled", handleSlotCancelled);
      window.__leapSocket?.off("slot_rescheduled", handleSlotRescheduled);
    };
  }, [connectRequestId, applySlotUpdate]);

  // ── setMeetingLink ────────────────────────────────────────────
  const setMeetingLink = useCallback(
    async (slotIndex, meetingLink) => {
      if (!meetingLink?.trim()) return { success: false };
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await axios.patch(
          `${BASE_URL}/sessions/${connectRequestId}/slots/${slotIndex}/meeting-link`,
          { meetingLink },
          { headers: authHeader() },
        );
        setSlots((prev) =>
          prev.map((s, i) =>
            i === slotIndex
              ? { ...s, meetingLink: res.data.slot.meetingLink }
              : s,
          ),
        );
        return { success: true };
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to save meeting link.");
        return { success: false, message: err?.response?.data?.message };
      } finally {
        setSavingSlot(slotIndex, false);
      }
    },
    [connectRequestId],
  );

  // ── markSlotComplete ──────────────────────────────────────────
  const markSlotComplete = useCallback(
    async (slotIndex) => {
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await axios.patch(
          `${BASE_URL}/sessions/${connectRequestId}/slots/${slotIndex}/mark-complete`,
          {},
          { headers: authHeader() },
        );
        setSlots((prev) =>
          prev.map((s, i) => (i === slotIndex ? { ...s, ...res.data.slot } : s)),
        );
        setCompletedSlots(res.data.completedSlots);
        setProgress(res.data.progress);

        if (res.data.allComplete) {
          allCompleteFiredRef.current = true;
          setTimeout(() => {
            onAllCompleteRef.current?.();
          }, 2000);
        }

        return { success: true, ...res.data };
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to mark session complete.");
        return { success: false, message: err?.response?.data?.message };
      } finally {
        setSavingSlot(slotIndex, false);
      }
    },
    [connectRequestId],
  );

  // ── addSlot ───────────────────────────────────────────────────
  const addSlot = useCallback(
    async ({ day, date, startTime, endTime }) => {
      try {
        setSavingSlot(-1, true); // -1 = global/non-slot-specific action
        setError(null);
        const res = await axios.post(
          `${BASE_URL}/sessions/${connectRequestId}/add-slot`,
          { day, date, startTime, endTime },
          { headers: authHeader() },
        );
        applySlotUpdate(res.data);
        return { success: true, slotId: res.data.slotId ?? null };
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to add session.";
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setSavingSlot(-1, false);
      }
    },
    [connectRequestId, applySlotUpdate],
  );

  // ── cancelSlot ────────────────────────────────────────────────
  const cancelSlot = useCallback(
    async (slotIndex, reason = "") => {
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await axios.patch(
          `${BASE_URL}/sessions/${connectRequestId}/slots/${slotIndex}/cancel`,
          { reason },
          { headers: authHeader() },
        );
        applySlotUpdate(res.data);
        return { success: true, ...res.data };
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to cancel slot.";
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setSavingSlot(slotIndex, false);
      }
    },
    [connectRequestId, applySlotUpdate],
  );

  // ── rescheduleSlot ────────────────────────────────────────────
  const rescheduleSlot = useCallback(
    async (slotIndex, { date, startTime, endTime }) => {
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await axios.patch(
          `${BASE_URL}/sessions/${connectRequestId}/slots/${slotIndex}/reschedule`,
          { date, startTime, endTime },
          { headers: authHeader() },
        );
        applySlotUpdate(res.data);
        return { success: true, ...res.data };
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to reschedule slot.";
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setSavingSlot(slotIndex, false);
      }
    },
    [connectRequestId, applySlotUpdate],
  );

  return {
    slots,
    loading,
    savingSlots,
    error,
    completedSlots,
    totalSlots,
    progress,
    setMeetingLink,
    markSlotComplete,
    addSlot,
    cancelSlot,
    rescheduleSlot,
    refetch: fetchSlots,
  };
};

export default useSessions;