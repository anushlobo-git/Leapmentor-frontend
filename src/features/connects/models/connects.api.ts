/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/connects/models/connects.api.ts
import axiosInstance from "@lib/http/axiosInstance";

export const sendConnectRequest = ({
  mentorId,
  message,
  selectedSlots,
  sessionRate,
  sessionCount,
}: {
  mentorId: string;
  message?: string;
  selectedSlots: any[];
  sessionRate?: number;
  sessionCount?: number;
}) =>
  axiosInstance.post(`/connect-requests`, {
    mentorId,
    message,
    selectedSlots,
    sessionRate,
    sessionCount,
  });

export const getOngoingConnects = () =>
  axiosInstance.get("/connect-requests/ongoing");
