/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useRespondToRequest.js
import { useState } from "react";
import axiosInstance from "@lib/axiosInstance";
import { useToast } from "@app/providers/ToastContext"; // ✅
/**
 * Custom hook for respond to request.
 * @returns {Object} Hook state and handlers for the caller.
 */


const useRespondToRequest = () => {
  const [responding, setResponding] = useState(false);
  const [referring,  setReferring]  = useState(false);
  const { showToast } = useToast(); // ✅

  // ── Accept or Reject ──────────────────────────────────────
  const respond = async ({ requestId, status, confirmedSlot, menteeName }) => {
    try {
      setResponding(true);
      
      await axiosInstance.patch(`/connect-requests/${requestId}`, { status, confirmedSlot });

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
      await axiosInstance.patch(`/connect-requests/${requestId}/refer`,
        { referToMentorId }
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