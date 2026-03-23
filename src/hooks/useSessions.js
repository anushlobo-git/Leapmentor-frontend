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

  const allCompleteFiredRef = useRef(false);

  const applySlotUpdate = useCallback((data) => {
    if (data.slots)                        setSlots(data.slots);
    if (data.completedSlots !== undefined) setCompletedSlots(data.completedSlots);
    if (data.totalSlots     !== undefined) setTotalSlots(data.totalSlots);
    if (data.progress       !== undefined) setProgress(data.progress);
  }, []);

  // ✅ silent=true → no loading spinner (used for background polls)
  const fetchSlots = useCallback(async (silent = false) => {
    if (!connectRequestId) return;
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await axios.get(
        `${BASE_URL}/api/sessions/${connectRequestId}/slots`,
        { headers: authHeader() }
      );
      applySlotUpdate(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sessions.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [connectRequestId, applySlotUpdate]);

  // Initial fetch — shows loading skeleton once
  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  // ✅ Listen on the SHARED global socket (window.__leapSocket)
  useEffect(() => {
    if (!connectRequestId) return;

    const handleSlotUpdate = (data) => {
      if (data.connectRequestId !== connectRequestId) return;
      console.log("📅 session_slots_updated — syncing instantly");
      applySlotUpdate(data);

      if (data.allComplete && onAllComplete && !allCompleteFiredRef.current) {
        allCompleteFiredRef.current = true;
        setTimeout(() => { onAllComplete(); }, 2000);
      }
    };

    const waitForSocket = setInterval(() => {
      if (window.__leapSocket?.connected) {
        window.__leapSocket.on("session_slots_updated", handleSlotUpdate);
        clearInterval(waitForSocket);
        console.log("📅 Registered session_slots_updated on shared socket");
      }
    }, 200);

    return () => {
      clearInterval(waitForSocket);
      window.__leapSocket?.off("session_slots_updated", handleSlotUpdate);
    };
  }, [connectRequestId, applySlotUpdate, onAllComplete]);

  // ✅ Silent background poll every 30s — no loading flash
  useEffect(() => {
    if (!connectRequestId) return;
    const interval = setInterval(() => fetchSlots(true), 30000);
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
      setSlots((prev) =>
        prev.map((s, i) => i === slotIndex ? { ...s, ...res.data.slot } : s)
      );
      setCompletedSlots(res.data.completedSlots);
      setProgress(res.data.progress);

      if (res.data.allComplete && onAllComplete && !allCompleteFiredRef.current) {
        allCompleteFiredRef.current = true;
        setTimeout(() => { onAllComplete(); }, 2000);
      }
      return { success: true, ...res.data };
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to mark session complete.");
      return { success: false, message: err?.response?.data?.message };
    } finally {
      setSaving(false);
    }
  }, [connectRequestId, onAllComplete]);

  const addSlot = useCallback(async ({ day, date, startTime, endTime }) => {
    try {
      setSaving(true);
      setError(null);
      const res = await axios.post(
        `${BASE_URL}/api/sessions/${connectRequestId}/add-slot`,
        { day, date, startTime, endTime },
        { headers: authHeader() }
      );
      applySlotUpdate(res.data);
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add session.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setSaving(false);
    }
  }, [connectRequestId, applySlotUpdate]);

  return {
    slots, loading, saving, error,
    completedSlots, totalSlots, progress,
    setMeetingLink, markSlotComplete, addSlot,
    refetch: fetchSlots,
  };
};

export default useSessions;