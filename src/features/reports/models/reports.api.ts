/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/reports/models/reports.api.ts
import axiosInstance from "@lib/http/axiosInstance";

export const getFeedback = (connectRequestId: string) =>
  axiosInstance.get(`/feedback/${connectRequestId}`);

export const submitFeedbackRequest = ({
  connectRequestId,
  rating,
  comment,
  slotIndex,
}: {
  connectRequestId: string;
  rating: number;
  comment?: string;
  slotIndex?: number;
}) =>
  axiosInstance.post("/feedback", {
    connectRequestId,
    rating,
    comment,
    slotIndex,
  });

export const submitReportRequest = (formData: FormData) =>
  axiosInstance.post("/reports", formData);
