/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentor/api/mentor.api.js
import axiosInstance from "@lib/http/axiosInstance";

// --- onboarding / verification uploads ---
export const uploadVerificationDocuments = (formData, onUploadProgress) =>
  axiosInstance.post(`/upload/verification-documents`, formData, { onUploadProgress });

export const uploadMentorProfilePicture = (formData, onUploadProgress) =>
  axiosInstance.post(`/upload/profile-picture`, formData, { onUploadProgress });

// --- requests ---
export const getIncomingRequests = () => axiosInstance.get(`/connect-requests/incoming`);

export const respondToRequest = (requestId, body) =>
  axiosInstance.patch(`/connect-requests/${requestId}`, body);

export const getSimilarMentors = (requestId) =>
  axiosInstance.get(`/connect-requests/${requestId}/similar-mentors`);

export const referRequest = (requestId, referToMentorId) =>
  axiosInstance.patch(`/connect-requests/${requestId}/refer`, { referToMentorId });

// --- earnings ---
export const getMentorEarnings = () => axiosInstance.get(`/mentor/earnings`);

export const getMentorEarningsChart = (period: string) =>
  axiosInstance.get(`/mentor/earnings/chart?period=${period}`);

export const getMentorEarningsPayouts = (queryString: string) =>
  axiosInstance.get(`/mentor/earnings/payouts?${queryString}`);

export const withdrawMentorEarnings = () =>
  axiosInstance.post(`/mentor/earnings/withdraw`, {});

// --- availability ---
export const getMyAvailability = () => axiosInstance.get(`/availability/me`);

export const updateMyAvailability = (payload: {
  timezone: string;
  sessionDurations: number[];
  specificDates: any[];
}) => axiosInstance.patch(`/availability/me`, payload);

// --- current user / mentor profile ---
export const getCurrentUser = () => axiosInstance.get("/users/me");

export const getMentorProfile = () => axiosInstance.get("/mentor-profile/me");

export const updateMentorProfile = (payload: any) =>
  axiosInstance.put("/mentor-profile/me", payload);

// --- google calendar integration ---
export const getGoogleCalendarAuthUrl = () => axiosInstance.get("/google-calendar/auth-url");

export const disconnectGoogleCalendar = () => axiosInstance.post("/google-calendar/disconnect");

export const getGoogleCalendarBusySlots = (params) =>
  axiosInstance.get("/google-calendar/busy", { params });

export const getGoogleCalendarEvents = (params) =>
  axiosInstance.get("/google-calendar/events", { params });
