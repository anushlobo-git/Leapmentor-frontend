// src/hooks/useReportComplaint.js
import { useState, useCallback } from "react";
import axios from "axios";

const BASE_URL    = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader  = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const useReportComplaint = (connectRequestId) => {
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  const submitReport = useCallback(async ({ complaintType, description, screenshot }) => {
    if (!connectRequestId) return { success: false };

    try {
      setSubmitting(true);
      setError(null);

      // ── Build multipart form data (screenshot is optional) ──
      const formData = new FormData();
      formData.append("connectRequestId", connectRequestId);
      formData.append("complaintType",    complaintType);
      formData.append("description",      description);
      if (screenshot) formData.append("screenshot", screenshot);

      await axios.post(`${BASE_URL}/reports`, formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit report. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setSubmitting(false);
    }
  }, [connectRequestId]);

  return { submitReport, submitting, error, setError };
};

export default useReportComplaint;