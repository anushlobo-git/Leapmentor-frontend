/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Same return shape as before (DashboardShell is unchanged), but the count now
// lives in notificationsSlice so the notifications tab and the header badge
// can't drift apart.
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated } from "@features/auth/models/authSlice";
import {
  fetchNotifications,
  incrementUnread,
  clearBadge as clearBadgeAction,
  selectUnreadCount,
} from "@features/notifications/models/notificationsSlice";
import type { AppDispatch } from "@store/index";

const useUnreadCount = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const unreadCount = useSelector(selectUnreadCount);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) return;
    await dispatch(fetchNotifications()); // failure is stored in the slice; badge stays as-is
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const incrementBadge = useCallback(() => {
    dispatch(incrementUnread());
  }, [dispatch]);

  const clearBadge = useCallback(() => {
    dispatch(clearBadgeAction());
  }, [dispatch]);

  return { unreadCount, clearBadge, refetch, incrementBadge };
};

export default useUnreadCount;
