/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/api/admin.api.js
//
// Single source of truth for every admin-side HTTP call. Previously these lived
// inline inside page/component bodies (calling adminAxiosInstance directly),
// which made the endpoints hard to find, hard to reuse, and hard to test.
import axiosInstance from "@lib/http/axiosInstance";

// This is a request option, not another axios instance. Keeping the domain
// explicit is essential because a few admin operations share unprefixed URLs
// with public/user operations (for example /support/messages).
const adminConfig = { authDomain: "admin" as const };

type AdminId = string | number;
type AdminQueryParams = object;

interface UpdateReportPayload {
  status: string;
  adminNote?: string;
}

interface AddAdminPayload {
  name: string;
  email: string;
}

// --- auth ---
export const adminLogin = (email: string, password: string) =>
  axiosInstance.post(`/admin/auth/login`, { email, password }, adminConfig);

export const adminLogout = () => axiosInstance.post("/admin/auth/logout", null, adminConfig);

// --- layout / nav badges ---
export const getPendingLeapRequestsCount = () =>
  axiosInstance.get("/admin/leap-requests/pending-count", adminConfig);

// --- support messages ---
export const getSupportMessages = () => axiosInstance.get(`/support/messages`, adminConfig);

export const resolveSupportMessage = (id: AdminId) =>
  axiosInstance.patch(`/support/messages/${id}/resolve`, null, adminConfig);

// --- mentor verifications ---
export const getMentorVerifications = () =>
  axiosInstance.get("/admin/mentor-verifications", adminConfig);

export const verifyMentorProfile = (mentorProfileId: AdminId) =>
  axiosInstance.patch(`/admin/mentor-verifications/${mentorProfileId}/verify`, null, adminConfig);

// --- reports ---
export const getReportStats = () => axiosInstance.get(`/admin/reports/stats`, adminConfig);

export const getReports = (params: AdminQueryParams) =>
  axiosInstance.get(`/admin/reports`, { ...adminConfig, params });

export const updateReport = (reportId: AdminId, { status, adminNote }: UpdateReportPayload) =>
  axiosInstance.patch(`/admin/reports/${reportId}`, { status, adminNote }, adminConfig);

export const refundReport = (reportId: AdminId, adminNote: string) =>
  axiosInstance.post(`/admin/reports/${reportId}/refund`, { adminNote }, adminConfig);

export const deleteReportSession = (reportId: AdminId, adminNote: string) =>
  axiosInstance.delete(`/admin/reports/${reportId}/session`, { ...adminConfig, data: { adminNote } });

// --- payments ---
export const getPaymentStats = () => axiosInstance.get(`/admin/payments/stats`, adminConfig);

export const getPaymentChart = () => axiosInstance.get(`/admin/payments/chart`, adminConfig);

export const getPaymentTransactions = (params: AdminQueryParams) =>
  axiosInstance.get(`/admin/payments/transactions`, { ...adminConfig, params });

// --- engagements ---
export const getEngagementStats = () => axiosInstance.get(`/admin/engagements/stats`, adminConfig);

export const getEngagements = (params: AdminQueryParams) =>
  axiosInstance.get(`/admin/engagements`, { ...adminConfig, params });

// --- wallet / leap requests ---
export const getLeapRequests = () => axiosInstance.get(`/leap-requests`, adminConfig);

export const approveLeapRequest = (reqId: AdminId) =>
  axiosInstance.patch(`/leap-requests/${reqId}/approve`, {}, adminConfig);

export const rejectLeapRequest = (reqId: AdminId) =>
  axiosInstance.patch(`/leap-requests/${reqId}/reject`, {}, adminConfig);

// --- user management ---
export const getUserStats = () => axiosInstance.get(`/admin/stats`, adminConfig);

export const getUserGrowth = () => axiosInstance.get(`/admin/user-growth`, adminConfig);

export const getMentorIndustryStats = () =>
  axiosInstance.get(`/admin/stats/mentor-industries`, adminConfig);

export const getUsers = (params: AdminQueryParams) =>
  axiosInstance.get(`/admin/users`, { ...adminConfig, params });

export const blockUser = (userId: AdminId) =>
  axiosInstance.patch(`/admin/users/${userId}/block`, {}, adminConfig);

export const unblockUser = (userId: AdminId) =>
  axiosInstance.patch(`/admin/users/${userId}/unblock`, {}, adminConfig);

// --- settings ---
export const getCommissionSettings = () =>
  axiosInstance.get(`/admin/settings/commission`, adminConfig);

export const updateCommissionSettings = (commissionRate: number) =>
  axiosInstance.put(`/admin/settings/commission`, { commissionRate }, adminConfig);

export const addAdmin = ({ name, email }: AddAdminPayload) =>
  axiosInstance.post(`/admin/settings/add-admin`, { name, email }, adminConfig);
