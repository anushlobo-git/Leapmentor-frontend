/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentee/api/mentee.api.js
import axiosInstance from "@lib/http/axiosInstance";

// --- onboarding ---
export const uploadProfilePicture = (formData, onUploadProgress) =>
  axiosInstance.post(`/upload/profile-picture`, formData, { onUploadProgress });

// --- request history / invoices ---
export const downloadInvoice = (requestId) =>
  axiosInstance.get(`/invoices/${requestId}`, { responseType: "blob" });

// --- home tab ---
export const searchMentorsBySkill = (skillTerm, limit = 4) =>
  axiosInstance.get(`/mentors/search`, { params: { skill: skillTerm, limit } });

export const getMyConnectRequests = () => axiosInstance.get(`/connect-requests/my-requests`);

export const getEscrowWallet = () => axiosInstance.get(`/escrow/wallet`);

export const getMyLeapRequest = () => axiosInstance.get(`/leap-requests/my-request`);

export const createLeapRequest = (reason) => axiosInstance.post(`/leap-requests`, { reason });

// --- find mentors / availability ---
export const getMentorAvailability = (mentorUserId, duration) =>
  axiosInstance.get(`/availability/${mentorUserId}/slots?duration=${duration}`);

export const searchMentorsRequest = (queryString: string) =>
  axiosInstance.get(`/mentors/search?${queryString}`);

// --- current user / mentee profile ---
export const getCurrentUser = () => axiosInstance.get("/users/me");

export const getMenteeProfile = () => axiosInstance.get("/mentee-profile/me");

export const updateMenteeProfile = (payload: any) =>
  axiosInstance.put("/mentee-profile/me", payload);

export const changePasswordRequest = ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) =>
  axiosInstance.put("/auth/change-password", { currentPassword, newPassword });

// --- request history ---
export const deleteConnectRequest = (id: string) =>
  axiosInstance.delete(`/connect-requests/${id}`);
