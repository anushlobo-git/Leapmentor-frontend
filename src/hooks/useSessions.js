// src/hooks/useSessions.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const useSessions = (connectRequestId, onAllComplete) => {
  const [slots,          setSlots]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);
  const [completedSlots, setCompletedSlots] = useState(0);
  const [totalSlots,     setTotalSlots]     = useState(0);
  const [progress,       setProgress]       = useState(0);

  // ✅ Track if allComplete was already fired to avoid duplicate calls
  const allCompleteFiredRef = useRef(false);

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

  // ✅ Poll every 15 seconds to sync both sides in real time
  useEffect(() => {
    if (!connectRequestId) return;
    const interval = setInterval(fetchSlots, 15000);
    return () => clearInterval(interval);
  }, [connectRequestId, fetchSlots]);

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

  const markSlotComplete = useCallback(async (slotIndex) => {
    try {
      setSaving(true);
      setError(null);
      const res = await axios.patch(
        `${BASE_URL}/api/sessions/${connectRequestId}/slots/${slotIndex}/mark-complete`,
        {},
        { headers: authHeader() }
      );

      // ✅ Update local slot state immediately
      setSlots((prev) =>
        prev.map((s, i) => i === slotIndex ? { ...s, ...res.data.slot } : s)
      );
      setCompletedSlots(res.data.completedSlots);
      setProgress(res.data.progress);

      // ✅ Only fire onAllComplete once — don't trigger if already fired
      if (res.data.allComplete && onAllComplete && !allCompleteFiredRef.current) {
        allCompleteFiredRef.current = true;
        // ✅ Delay the parent refetch so we don't reset the active tab immediately
        setTimeout(() => {
          onAllComplete();
        }, 2000);
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