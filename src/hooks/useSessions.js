// src/hooks/useSessions.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/**
 * useSessions
 * @param {string}   connectRequestId
 * @param {function} onAllComplete  — called when all slots are marked done by both parties
 */
const useSessions = (connectRequestId, onAllComplete) => {
  const [slots,          setSlots]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);
  const [completedSlots, setCompletedSlots] = useState(0);
  const [totalSlots,     setTotalSlots]     = useState(0);
  const [progress,       setProgress]       = useState(0);

  // ── Fetch all slots ───────────────────────────────────────
  const fetchSlots = useCallback(async () => {
    if (!connectRequestId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${BASE_URL}/api/sessions/${connectRequestId}/slots`,
        { headers: authHeader() }
      );
      setSlots(res.data.slots || []);
      setCompletedSlots(res.data.completedSlots || 0);
      setTotalSlots(res.data.totalSlots || 0);
      setProgress(res.data.progress || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, [connectRequestId]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  // ── Set meeting link for a slot ───────────────────────────
  const setMeetingLink = useCallback(async (slotIndex, meetingLink) => {
    if (!meetingLink?.trim()) return { success: false };
    try {
      setSaving(true);
      setError(null);
      const res = await axios.patch(
        `${BASE_URL}/api/sessions/${connectRequestId}/slots/${slotIndex}/meeting-link`,
        { meetingLink },
        { headers: authHeader() }
      );
      // ✅ Update local state — only this slot changes
      setSlots((prev) =>
        prev.map((s, i) =>
          i === slotIndex ? { ...s, meetingLink: res.data.slot.meetingLink } : s
        )
      );
      return { success: true };
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save meeting link.");
      return { success: false, message: err?.response?.data?.message };
    } finally {
      setSaving(false);
    }
  }, [connectRequestId]);

  // ── Mark a slot complete ──────────────────────────────────
  const markSlotComplete = useCallback(async (slotIndex) => {
    try {
      setSaving(true);
      setError(null);
      const res = await axios.patch(
        `${BASE_URL}/api/sessions/${connectRequestId}/slots/${slotIndex}/mark-complete`,
        {},
        { headers: authHeader() }
      );

      // ✅ Update local slot state
      setSlots((prev) =>
        prev.map((s, i) => i === slotIndex ? { ...s, ...res.data.slot } : s)
      );
      setCompletedSlots(res.data.completedSlots);
      setProgress(res.data.progress);

      // ✅ If ALL slots are done — trigger parent refetch
      if (res.data.allComplete && onAllComplete) {
        onAllComplete();
      }

      return { success: true, ...res.data };
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to mark session complete.");
      return { success: false, message: err?.response?.data?.message };
    } finally {
      setSaving(false);
    }
  }, [connectRequestId, onAllComplete]);

  return {
    slots,
    loading,
    saving,
    error,
    completedSlots,
    totalSlots,
    progress,
    setMeetingLink,
    markSlotComplete,
    refetch: fetchSlots,
  };
};

export default useSessions;