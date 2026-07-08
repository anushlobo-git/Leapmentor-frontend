/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "@utils/axiosInstance";
import { mapSlot, mapSessionSlotsResponse } from "@mappers/sessionsMapper";
/**
 * Custom hook for sessions.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useSessions = (connectRequestId, onAllComplete) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSlots, setSavingSlots] = useState(new Set());
  const [error, setError] = useState(null);
  const [completedSlots, setCompletedSlots] = useState(0);
  const [totalSlots, setTotalSlots] = useState(0);
  const [progress, setProgress] = useState(0);
  const [allComplete, setAllComplete] = useState(false); 

  const onAllCompleteRef = useRef(onAllComplete);
  useEffect(() => {
    onAllCompleteRef.current = onAllComplete;
  }, [onAllComplete]);

  const setSavingSlot = (index, val) =>
    setSavingSlots((prev) => {
      const next = new Set(prev);
      val ? next.add(index) : next.delete(index);
      return next;
    });

  //  now also sets allComplete
  const applySlotUpdate = useCallback((data) => {
    const mapped = mapSessionSlotsResponse(data);
    setSlots(mapped.slots);
    setCompletedSlots(mapped.completedSlots);
    setTotalSlots(mapped.totalSlots);
    setProgress(mapped.progress);
    setAllComplete(mapped.allComplete);
  }, []);

  const fetchSlots = useCallback(async (silent = false) => {
    if (!connectRequestId) return;
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await axiosInstance.get(`/sessions/${connectRequestId}/slots`);
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

  //  Poll every 5s — real-time sync without sockets
  useEffect(() => {
    if (!connectRequestId) return;
    const interval = setInterval(() => fetchSlots(true), 5000);
    return () => clearInterval(interval);
  }, [connectRequestId, fetchSlots]);

  //  Keep socket listeners ONLY for goals (chat uses its own)
  // Session sync is now handled by polling above — socket block removed

  const setMeetingLink = useCallback(
    async (slotIndex, meetingLink) => {
      if (!meetingLink?.trim()) return { success: false };
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await axiosInstance.patch(`/sessions/${connectRequestId}/slots/${slotIndex}/meeting-link`, { meetingLink });
        const mappedSlot = mapSlot(res.data.slot);
        setSlots((prev) =>
          prev.map((s, i) =>
            i === slotIndex ? { ...s, meetingLink: mappedSlot.meetingLink } : s,
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

  //  now uses applySlotUpdate so allComplete is set correctly
  const markSlotComplete = useCallback(
    async (slotIndex) => {
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await axiosInstance.patch(
          `/sessions/${connectRequestId}/slots/${slotIndex}/mark-complete`,
          {},
        );
        applySlotUpdate(res.data); //  replaces manual setSlots/setCompletedSlots/setProgress
        return { ...res.data, success: true };
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to mark session complete.");
        return { success: false, message: err?.response?.data?.message };
      } finally {
        setSavingSlot(slotIndex, false);
      }
    },
    [connectRequestId, applySlotUpdate],
  );

  const addSlot = useCallback(
    async ({ day, date, startTime, endTime }) => {
      try {
        setSavingSlot(-1, true);
        setError(null);
        const res = await axiosInstance.post(`/sessions/${connectRequestId}/add-slot`, { day, date, startTime, endTime });
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

  const cancelSlot = useCallback(
    async (slotIndex, reason = "") => {
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await axiosInstance.patch(`/sessions/${connectRequestId}/slots/${slotIndex}/cancel`, { reason });
        applySlotUpdate(res.data);
        return { ...res.data, success: true };
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

  const rescheduleSlot = useCallback(
    async (slotIndex, { date, startTime, endTime }) => {
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await axiosInstance.patch(`/sessions/${connectRequestId}/slots/${slotIndex}/reschedule`, { date, startTime, endTime });
        applySlotUpdate(res.data);
        return { ...res.data, success: true };
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
    allComplete,
    setMeetingLink,
    markSlotComplete,
    addSlot,
    cancelSlot,
    rescheduleSlot,
    refetch: fetchSlots,
  };
};

export default useSessions;
