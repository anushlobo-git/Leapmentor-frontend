/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/connects/models/connects.api.ts
import axiosInstance from "@lib/http/axiosInstance";

/** A single availability slot the mentee picks when sending a connect request. */
export interface ConnectSlotInput {
  day?: string;
  date?: string;
  startTime: string;
  endTime: string;
}

export const sendConnectRequest = ({
  mentorId,
  message,
  selectedSlots,
  sessionRate,
  sessionCount,
}: {
  mentorId: string;
  message?: string;
  selectedSlots: ConnectSlotInput[];
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
