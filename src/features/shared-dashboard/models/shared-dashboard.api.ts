/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/api/shared-dashboard.api.js
import axiosInstance from "@lib/axiosInstance";

export const getConnectDetail = (connectRequestId) =>
  axiosInstance.get(`/connect-requests/${connectRequestId}/detail`);
