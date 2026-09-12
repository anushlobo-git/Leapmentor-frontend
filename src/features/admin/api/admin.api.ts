/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/api/admin.api.js
//
// Single source of truth for every admin-side HTTP call. Previously these lived
// inline inside page/component bodies (calling adminAxiosInstance directly),
// which made the endpoints hard to find, hard to reuse, and hard to test.
import axiosInstance from "@lib/axiosInstance";

// This is a request option, not another axios instance. Keeping the domain
// explicit is essential because a few admin operations share unprefixed URLs
// with public/user operations (for example /support/messages).
const adminConfig = { authDomain: "admin" as const };

// --- auth ---
export const adminLogin = (email, password) =>
  axiosInstance.post(`/admin/auth/login`, { email, password }, adminConfig);

export const adminLogout = () => axiosInstance.post("/admin/auth/logout", null, adminConfig);

// --- layout / nav badges ---
export const getPendingLeapRequestsCount = () =>
  axiosInstance.get("/admin/leap-requests/pending-count", adminConfig);

// --- support messages ---
export const getSupportMessages = () => axiosInstance.get(`/support/messages`, adminConfig);

export const resolveSupportMessage = (id) =>
  axiosInstance.patch(`/support/messages/${id}/resolve`, null, adminConfig);

// --- mentor verifications ---
export const getMentorVerifications = () =>
  axiosInstance.get("/admin/mentor-verifications", adminConfig);

export const verifyMentorProfile = (mentorProfileId) =>
  axiosInstance.patch(`/admin/mentor-verifications/${mentorProfileId}/verify`, null, adminConfig);

// --- reports ---
export const getReportStats = () => axiosInstance.get(`/admin/reports/stats`, adminConfig);

export const getReports = (params) => axiosInstance.get(`/admin/reports`, { ...adminConfig, params });

export const updateReport = (reportId, { status, adminNote }) =>
  axiosInstance.patch(`/admin/reports/${reportId}`, { status, adminNote }, adminConfig);

export const refundReport = (reportId, adminNote) =>
  axiosInstance.post(`/admin/reports/${reportId}/refund`, { adminNote }, adminConfig);

export const deleteReportSession = (reportId, adminNote) =>
  axiosInstance.delete(`/admin/reports/${reportId}/session`, { ...adminConfig, data: { adminNote } });

// --- payments ---
export const getPaymentStats = () => axiosInstance.get(`/admin/payments/stats`, adminConfig);

export const getPaymentChart = () => axiosInstance.get(`/admin/payments/chart`, adminConfig);

export const getPaymentTransactions = (params) =>
  axiosInstance.get(`/admin/payments/transactions`, { ...adminConfig, params });

// --- engagements ---
export const getEngagementStats = () => axiosInstance.get(`/admin/engagements/stats`, adminConfig);

export const getEngagements = (params) =>
  axiosInstance.get(`/admin/engagements`, { ...adminConfig, params });

// --- wallet / leap requests ---
export const getLeapRequests = () => axiosInstance.get(`/leap-requests`, adminConfig);

export const approveLeapRequest = (reqId) =>
  axiosInstance.patch(`/leap-requests/${reqId}/approve`, {}, adminConfig);

export const rejectLeapRequest = (reqId) =>
  axiosInstance.patch(`/leap-requests/${reqId}/reject`, {}, adminConfig);

// --- user management ---
export const getUserStats = () => axiosInstance.get(`/admin/stats`, adminConfig);

export const getUserGrowth = () => axiosInstance.get(`/admin/user-growth`, adminConfig);

export const getMentorIndustryStats = () =>
  axiosInstance.get(`/admin/stats/mentor-industries`, adminConfig);

export const getUsers = (params) => axiosInstance.get(`/admin/users`, { ...adminConfig, params });

export const deleteUser = (userId) => axiosInstance.delete(`/admin/users/${userId}`, adminConfig);

export const blockUser = (userId) =>
  axiosInstance.patch(`/admin/users/${userId}/block`, {}, adminConfig);

export const unblockUser = (userId) =>
  axiosInstance.patch(`/admin/users/${userId}/unblock`, {}, adminConfig);

// --- settings ---
export const getCommissionSettings = () =>
  axiosInstance.get(`/admin/settings/commission`, adminConfig);

export const updateCommissionSettings = (commissionRate) =>
  axiosInstance.put(`/admin/settings/commission`, { commissionRate }, adminConfig);

export const addAdmin = ({ name, email }) =>
  axiosInstance.post(`/admin/settings/add-admin`, { name, email }, adminConfig);
