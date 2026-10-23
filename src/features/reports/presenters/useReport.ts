/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useReport.js
import { useState, useEffect, useCallback } from "react";
import { getFeedback, submitFeedbackRequest } from "@features/reports/models/reports.api";
import logger from "@lib/monitoring/logger";
import { mapFeedback } from "@features/reports/models/reportMapper";

type Feedback = ReturnType<typeof mapFeedback>;

type ReportApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};
/**
 * Custom hook for report.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useReport = (connectRequestId: string | null | undefined, refreshKey: number = 0) => {
  const [myFeedback, setMyFeedback] = useState<Feedback | null>(null);
  const [theirFeedback, setTheirFeedback] = useState<Feedback | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    if (!connectRequestId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getFeedback(connectRequestId);
      setMyFeedback(res.data.myFeedback ? mapFeedback(res.data.myFeedback) : null);
      setTheirFeedback(res.data.theirFeedback ? mapFeedback(res.data.theirFeedback) : null);
      setSessionStatus(res.data.sessionStatus || null);
    } catch (err: unknown) {
      const error = err as ReportApiError;
      setError(error.response?.data?.message || "Failed to load feedback.");
    } finally {
      setLoading(false);
    }
  }, [connectRequestId]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback, refreshKey]);

  // slotIndex now accepted and sent to backend
  const submitFeedback = useCallback(async (
    rating: number,
    comment: string | undefined,
    slotIndex?: number,
  ) => {
    logger.info("Sending feedback", { connectRequestId, rating,comment , slotIndex });
    if (!connectRequestId) return { success: false };
    try {
      setSubmitting(true);
      setError(null);
      const res = await submitFeedbackRequest({
        connectRequestId,
        rating,
        comment,
        slotIndex
      });
      setMyFeedback(mapFeedback(res.data.feedback));
      return { success: true };
    } catch (err: unknown) {
      const error = err as ReportApiError;
      const msg = error.response?.data?.message || "Failed to submit feedback.";
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
