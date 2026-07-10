/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/api/admin.api.js
//
// Single source of truth for every admin-side HTTP call. Previously these lived
// inline inside page/component bodies (calling adminAxiosInstance directly),
// which made the endpoints hard to find, hard to reuse, and hard to test.
import adminAxiosInstance from "@lib/adminAxiosInstance";

// --- auth ---
export const adminLogin = (email, password) =>
  adminAxiosInstance.post(`/admin/auth/login`, { email, password });

export const adminLogout = () => adminAxiosInstance.post("/admin/auth/logout");

// --- layout / nav badges ---
export const getPendingLeapRequestsCount = () =>
  adminAxiosInstance.get("/admin/leap-requests/pending-count");

// --- support messages ---
export const getSupportMessages = () => adminAxiosInstance.get(`/support/messages`);

export const resolveSupportMessage = (id) =>
  adminAxiosInstance.patch(`/support/messages/${id}/resolve`);

// --- mentor verifications ---
export const getMentorVerifications = () =>
  adminAxiosInstance.get("/admin/mentor-verifications");

export const verifyMentorProfile = (mentorProfileId) =>
  adminAxiosInstance.patch(`/admin/mentor-verifications/${mentorProfileId}/verify`);

// --- reports ---
export const getReportStats = () => adminAxiosInstance.get(`/admin/reports/stats`);

export const getReports = (params) => adminAxiosInstance.get(`/admin/reports`, { params });

export const updateReport = (reportId, { status, adminNote }) =>
  adminAxiosInstance.patch(`/admin/reports/${reportId}`, { status, adminNote });

export const refundReport = (reportId, adminNote) =>
  adminAxiosInstance.post(`/admin/reports/${reportId}/refund`, { adminNote });

export const deleteReportSession = (reportId, adminNote) =>
  adminAxiosInstance.delete(`/admin/reports/${reportId}/session`, { data: { adminNote } });

// --- payments ---
export const getPaymentStats = () => adminAxiosInstance.get(`/admin/payments/stats`);

export const getPaymentChart = () => adminAxiosInstance.get(`/admin/payments/chart`);

export const getPaymentTransactions = (params) =>
  adminAxiosInstance.get(`/admin/payments/transactions`, { params });

// --- engagements ---
export const getEngagementStats = () => adminAxiosInstance.get(`/admin/engagements/stats`);

export const getEngagements = (params) =>
  adminAxiosInstance.get(`/admin/engagements`, { params });

// --- wallet / leap requests ---
export const getLeapRequests = () => adminAxiosInstance.get(`/leap-requests`);

export const approveLeapRequest = (reqId) =>
  adminAxiosInstance.patch(`/leap-requests/${reqId}/approve`, {});

export const rejectLeapRequest = (reqId) =>
  adminAxiosInstance.patch(`/leap-requests/${reqId}/reject`, {});

// --- user management ---
export const getUserStats = () => adminAxiosInstance.get(`/admin/stats`);

export const getUserGrowth = () => adminAxiosInstance.get(`/admin/user-growth`);

export const getMentorIndustryStats = () =>
  adminAxiosInstance.get(`/admin/stats/mentor-industries`);

export const getUsers = (params) => adminAxiosInstance.get(`/admin/users`, { params });

export const deleteUser = (userId) => adminAxiosInstance.delete(`/admin/users/${userId}`);

export const blockUser = (userId) =>
  adminAxiosInstance.patch(`/admin/users/${userId}/block`, {});

export const unblockUser = (userId) =>
  adminAxiosInstance.patch(`/admin/users/${userId}/unblock`, {});

// --- settings ---
export const getCommissionSettings = () =>
  adminAxiosInstance.get(`/admin/settings/commission`);

export const updateCommissionSettings = (commissionRate) =>
  adminAxiosInstance.put(`/admin/settings/commission`, { commissionRate });

export const addAdmin = ({ name, email }) =>
  adminAxiosInstance.post(`/admin/settings/add-admin`, { name, email });
