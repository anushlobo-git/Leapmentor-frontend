/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/notifications/api/notifications.api.js
import axiosInstance from "@lib/axiosInstance";

export const getNotifications = () => axiosInstance.get(`/notifications`);

export const markAllNotificationsRead = () =>
  axiosInstance.patch(`/notifications/mark-all-read`, {});

export const clearAllNotifications = () => axiosInstance.delete(`/notifications/clear-all`);

export const markNotificationRead = (id) =>
  axiosInstance.patch(`/notifications/${id}/read`, {});

export const deleteNotification = (id) => axiosInstance.delete(`/notifications/${id}`);
