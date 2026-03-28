// src/hooks/useRespondToRequest.js
import { useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext"; // ✅

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useRespondToRequest = () => {
  const [responding, setResponding] = useState(false);
  const [referring,  setReferring]  = useState(false);
  const { showToast } = useToast(); // ✅

  // ── Accept or Reject ──────────────────────────────────────
  const respond = async ({ requestId, status, confirmedSlot, menteeName }) => {
    try {
      setResponding(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/connect-requests/${requestId}`,
        { status, confirmedSlot },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (status === "accepted") {
        showToast({
          type: "success",
          title: "Request Accepted! 🎉",
          message: `You accepted ${menteeName}'s request. A calendar invite has been sent.`,
        });
      } else {
        showToast({
          type: "info",
          title: "Request Declined",
          message: `You declined ${menteeName}'s connect request.`,
        });
      }
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to respond to request.";
      showToast({ type: "error", title: "Action failed", message: msg });
      return false;
    } finally {
      setResponding(false);
    }
  };

  // ── Refer ─────────────────────────────────────────────────
  const refer = async ({ requestId, referToMentorId, menteeName, referredMentorName }) => {
    try {
      setReferring(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/connect-requests/${requestId}/refer`,
        { referToMentorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast({
        type: "info",
        title: "Request Referred",
        message: `${menteeName}'s request has been referred to ${referredMentorName}.`,
      });
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to refer request.";
      showToast({ type: "error", title: "Referral failed", message: msg });
      return false;
    } finally {
      setReferring(false);
    }
  };

  return { responding, referring, respond, refer };
};

export default useRespondToRequest;