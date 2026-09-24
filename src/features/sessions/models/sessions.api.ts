/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/sessions/api/sessions.api.js
import axiosInstance from "@lib/http/axiosInstance";

export const getMentorAvailabilityForConnect = (connectRequestId, duration) =>
  axiosInstance.get(`/sessions/${connectRequestId}/mentor-availability?duration=${duration}`);

// --- session slots ---
export const getSessionSlots = (connectRequestId: string) =>
  axiosInstance.get(`/sessions/${connectRequestId}/slots`);

export const updateSlotMeetingLink = (
  connectRequestId: string,
  slotIndex: number,
  meetingLink: string,
) =>
  axiosInstance.patch(
    `/sessions/${connectRequestId}/slots/${slotIndex}/meeting-link`,
    { meetingLink },
  );

export const markSlotCompleteRequest = (
  connectRequestId: string,
  slotIndex: number,
) =>
  axiosInstance.patch(
    `/sessions/${connectRequestId}/slots/${slotIndex}/mark-complete`,
    {},
  );

export const addSessionSlot = (
  connectRequestId: string,
  { day, date, startTime, endTime }: { day: string; date: string; startTime: string; endTime: string },
) =>
  axiosInstance.post(`/sessions/${connectRequestId}/add-slot`, {
    day,
    date,
    startTime,
    endTime,
  });

export const cancelSessionSlot = (
  connectRequestId: string,
  slotIndex: number,
  reason: string,
) =>
  axiosInstance.patch(
    `/sessions/${connectRequestId}/slots/${slotIndex}/cancel`,
    { reason },
  );

export const rescheduleSessionSlot = (
  connectRequestId: string,
  slotIndex: number,
  { date, startTime, endTime }: { date: string; startTime: string; endTime: string },
) =>
  axiosInstance.patch(
    `/sessions/${connectRequestId}/slots/${slotIndex}/reschedule`,
    { date, startTime, endTime },
  );

// --- slot locks ---
export const lockSlotRequest = (mentorId: string, date: string, startTime: string, endTime: string) =>
  axiosInstance.post("/slot-locks/lock", { mentorId, date, startTime, endTime });

export const unlockSlotRequest = (mentorId: string, date: string, startTime: string, endTime: string) =>
  axiosInstance.post("/slot-locks/unlock", { mentorId, date, startTime, endTime });

export const unlockAllSlotsRequest = (mentorId: string) =>
  axiosInstance.post("/slot-locks/unlock-all", { mentorId });
