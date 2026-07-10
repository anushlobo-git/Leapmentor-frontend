/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/sessions/api/sessions.api.js
import axiosInstance from "@lib/axiosInstance";

export const getMentorAvailabilityForConnect = (connectRequestId, duration) =>
  axiosInstance.get(`/sessions/${connectRequestId}/mentor-availability?duration=${duration}`);
