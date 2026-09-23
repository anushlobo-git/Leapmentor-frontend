/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentee/api/mentee.api.js
import axiosInstance from "@lib/axiosInstance";

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
