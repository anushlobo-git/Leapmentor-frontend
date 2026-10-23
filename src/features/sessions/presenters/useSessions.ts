/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
//src/features/sessions/hooks/useSessions.js
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getSessionSlots,
  updateSlotMeetingLink,
  markSlotCompleteRequest,
  addSessionSlot,
  cancelSessionSlot,
  rescheduleSessionSlot,
} from "@features/sessions/models/sessions.api";
import { mapSlot, mapSessionSlotsResponse } from "@features/sessions/models/sessionsMapper";

type SessionSlot = ReturnType<typeof mapSlot>;
type SessionSlotsResponse = Parameters<typeof mapSessionSlotsResponse>[0];
type SessionApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};
/**
 * Custom hook for sessions.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useSessions = (
  connectRequestId: string | null | undefined,
  onAllComplete?: () => void | Promise<void>,
) => {
  const [slots, setSlots] = useState<SessionSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlots, setSavingSlots] = useState<Set<number>>(new Set<number>());
  const [error, setError] = useState<string | null>(null);
  const [completedSlots, setCompletedSlots] = useState(0);
  const [totalSlots, setTotalSlots] = useState(0);
  const [progress, setProgress] = useState(0);
  const [allComplete, setAllComplete] = useState(false);

  const onAllCompleteRef = useRef(onAllComplete);
  useEffect(() => {
    onAllCompleteRef.current = onAllComplete;
  }, [onAllComplete]);

  const setSavingSlot = (index: number, val: boolean) =>
    setSavingSlots((prev) => {
      const next = new Set(prev);
      if (val) {
        next.add(index);
      } else {
        next.delete(index);
      }
      return next;
    });

  //  now also sets allComplete
  const applySlotUpdate = useCallback((data: SessionSlotsResponse) => {
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
      const res = await getSessionSlots(connectRequestId);
      applySlotUpdate(res.data);
    } catch (err: unknown) {
      const error = err as SessionApiError;
      setError(error.response?.data?.message || "Failed to load sessions.");
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
    async (slotIndex: number, meetingLink: string) => {
      if (!meetingLink?.trim()) return { success: false };
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await updateSlotMeetingLink(connectRequestId!, slotIndex, meetingLink);
        const mappedSlot = mapSlot(res.data.slot);
        setSlots((prev) =>
          prev.map((s, i) =>
            i === slotIndex ? { ...s, meetingLink: mappedSlot.meetingLink } : s,
          ),
        );
        return { success: true };
      } catch (err: unknown) {
        const error = err as SessionApiError;
        const message = error.response?.data?.message;
        setError(message || "Failed to save meeting link.");
        return { success: false, message };
      } finally {
        setSavingSlot(slotIndex, false);
      }
    },
    [connectRequestId],
  );

  //  now uses applySlotUpdate so allComplete is set correctly
  const markSlotComplete = useCallback(
    async (slotIndex: number) => {
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await markSlotCompleteRequest(connectRequestId!, slotIndex);
        applySlotUpdate(res.data); //  replaces manual setSlots/setCompletedSlots/setProgress
        return { ...res.data, success: true };
      } catch (err: unknown) {
        const error = err as SessionApiError;
        const message = error.response?.data?.message;
        setError(message || "Failed to mark session complete.");
        return { success: false, message };
      } finally {
        setSavingSlot(slotIndex, false);
      }
    },
    [connectRequestId, applySlotUpdate],
  );

  const addSlot = useCallback(
    async ({ day, date, startTime, endTime }: {
      day: string;
      date: string;
      startTime: string;
      endTime: string;
    }) => {
      try {
        setSavingSlot(-1, true);
        setError(null);
        const res = await addSessionSlot(connectRequestId!, { day, date, startTime, endTime });
        applySlotUpdate(res.data);
        return { success: true, slotId: res.data.slotId ?? null };
      } catch (err: unknown) {
        const error = err as SessionApiError;
        const msg = error.response?.data?.message || "Failed to add session.";
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setSavingSlot(-1, false);
      }
    },
    [connectRequestId, applySlotUpdate],
  );

  const cancelSlot = useCallback(
    async (slotIndex: number, reason: string = "") => {
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await cancelSessionSlot(connectRequestId!, slotIndex, reason);
        applySlotUpdate(res.data);
        return { ...res.data, success: true };
      } catch (err: unknown) {
        const error = err as SessionApiError;
        const msg = error.response?.data?.message || "Failed to cancel slot.";
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setSavingSlot(slotIndex, false);
      }
    },
    [connectRequestId, applySlotUpdate],
  );

  const rescheduleSlot = useCallback(
    async (slotIndex: number, { date, startTime, endTime }: {
      date: string;
      startTime: string;
      endTime: string;
    }) => {
      try {
        setSavingSlot(slotIndex, true);
        setError(null);
        const res = await rescheduleSessionSlot(connectRequestId!, slotIndex, { date, startTime, endTime });
        applySlotUpdate(res.data);
        return { ...res.data, success: true };
      } catch (err: unknown) {
        const error = err as SessionApiError;
        const msg = error.response?.data?.message || "Failed to reschedule slot.";
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
