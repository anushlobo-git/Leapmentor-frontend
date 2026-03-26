// src/hooks/useReport.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const useReport = (connectRequestId, refreshKey = 0) => {  // 👈 ADDED: refreshKey param
  const [myFeedback, setMyFeedback] = useState(null);
  const [theirFeedback, setTheirFeedback] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch feedback ────────────────────────────────────────
  const fetchFeedback = useCallback(async () => {
    if (!connectRequestId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${BASE_URL}/api/feedback/${connectRequestId}`,
        { headers: authHeader() }
      );
      setMyFeedback(res.data.myFeedback || null);
      setTheirFeedback(res.data.theirFeedback || null);
      setSessionStatus(res.data.sessionStatus || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load feedback.");
    } finally {
      setLoading(false);
    }
  }, [connectRequestId]);

  // 👇 CHANGED: added refreshKey to dependency array so it re-fetches on completion
  useEffect(() => { fetchFeedback(); }, [fetchFeedback, refreshKey]);

  // ── Submit feedback ───────────────────────────────────────
  const submitFeedback = useCallback(async (rating, comment) => {
    if (!connectRequestId) return { success: false };
    try {
      setSubmitting(true);
      setError(null);
      const res = await axios.post(
        `${BASE_URL}/api/feedback`,
        { connectRequestId, rating, comment },
        { headers: authHeader() }
      );
      setMyFeedback(res.data.feedback);
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit feedback.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setSubmitting(false);
    }
  }, [connectRequestId]);

  return {
    myFeedback,
    theirFeedback,
    sessionStatus,
    loading,
    submitting,
    error,
    submitFeedback,
    refetch: fetchFeedback,
  };
};

export default useReport;