/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/api/shared-dashboard.api.js
import axiosInstance from "@lib/http/axiosInstance";

export const getConnectDetail = (connectRequestId) =>
  axiosInstance.get(`/connect-requests/${connectRequestId}/detail`);

export const getChatHistory = (roomId: string, pageNum: number, limit: number) =>
  axiosInstance.get(`/messages/${roomId}`, { params: { page: pageNum, limit } });
