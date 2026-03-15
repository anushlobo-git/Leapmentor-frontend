// src/hooks/useConnectRequest.js
import { useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useConnectRequest = () => {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

const sendRequest = async ({ mentorId, message, selectedSlots, sessionRate, sessionCount }) => {    setError("");
    setSuccess(false);

    // ✅ Validate at least one slot selected
    if (!selectedSlots || selectedSlots.length === 0) {
      setError("Please select at least one available slot before sending.");
      return false;
    }

    try {
      setSending(true);
      const token = localStorage.getItem("token");
      await axios.post(
  `${BASE_URL}/api/connect-requests`,
  { mentorId, message, selectedSlots, sessionRate, sessionCount },
  { headers: { Authorization: `Bearer ${token}` } }
);
      setSuccess(true);
      return true;
    } catch (err) {
      const apiMsg = err?.response?.data?.message || err?.message || "Failed to send request.";
      setError(apiMsg);
      return false;
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setSending(false);
    setSuccess(false);
    setError("");
  };

  return { sending, success, error, sendRequest, reset };
};

export default useConnectRequest;