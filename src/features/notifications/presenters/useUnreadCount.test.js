/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import {
  renderHookWithStore as renderHook,
  makeTestStore,
} from "@test/renderWithStore";
import { selectIsAuthenticated } from "@features/auth/models/authSlice";
import useUnreadCount from "./useUnreadCount";
import { getNotifications } from "@features/notifications/models/notifications.api";
import { normalizeApiNotif } from "@features/notifications/models/notificationMapper";

vi.mock("@features/notifications/models/notifications.api", () => ({
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn().mockResolvedValue({}),
  markAllNotificationsRead: vi.fn(),
  clearAllNotifications: vi.fn(),
  deleteNotification: vi.fn(),
}));

vi.mock("@features/notifications/models/notificationMapper", () => ({
  normalizeApiNotif: vi.fn((n) => n),
}));

vi.mock("@features/auth/models/authSlice", () => ({
  selectIsAuthenticated: vi.fn(),
}));

describe("useUnreadCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with an unread count of 0", () => {
    selectIsAuthenticated.mockReturnValue(false);

    const { result } = renderHook(() => useUnreadCount());

    expect(result.current.unreadCount).toBe(0);
  });

  it("should not fetch notifications when not authenticated", async () => {
    selectIsAuthenticated.mockReturnValue(false);

    renderHook(() => useUnreadCount());

    await act(async () => {
      await Promise.resolve();
    });

    expect(getNotifications).not.toHaveBeenCalled();
  });

  it("should fetch and count unread notifications when authenticated", async () => {
    selectIsAuthenticated.mockReturnValue(true);
    getNotifications.mockResolvedValue({
      data: {
        notifications: [
          { id: 1, read: false },
          { id: 2, read: true },
          { id: 3, read: false },
        ],
      },
    });

    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });

    expect(getNotifications).toHaveBeenCalledWith();
    expect(normalizeApiNotif).toHaveBeenCalledTimes(3);
  });

  it("should default to an empty list when notifications is not an array", async () => {
    selectIsAuthenticated.mockReturnValue(true);
    getNotifications.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it("should silently fail and leave count unchanged on fetch error", async () => {
    selectIsAuthenticated.mockReturnValue(true);
    getNotifications.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalled();
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it("should increment the badge count", () => {
    selectIsAuthenticated.mockReturnValue(false);

    const { result } = renderHook(() => useUnreadCount());

    act(() => {
      result.current.incrementBadge();
    });
    expect(result.current.unreadCount).toBe(1);

    act(() => {
      result.current.incrementBadge();
    });
    expect(result.current.unreadCount).toBe(2);
  });

  it("should clear the badge count", () => {
    selectIsAuthenticated.mockReturnValue(false);

    const { result } = renderHook(() => useUnreadCount());

    act(() => {
      result.current.incrementBadge();
      result.current.incrementBadge();
    });
    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.clearBadge();
    });
    expect(result.current.unreadCount).toBe(0);
  });

  it("should expose a refetch function that re-fetches unread count", async () => {
    selectIsAuthenticated.mockReturnValue(true);
    getNotifications
      .mockResolvedValueOnce({
        data: { notifications: [{ id: 1, read: false }] },
      })
      .mockResolvedValueOnce({
        data: {
          notifications: [
            { id: 1, read: false },
            { id: 2, read: false },
          ],
        },
      });

    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.unreadCount).toBe(2);
    expect(getNotifications).toHaveBeenCalledTimes(2);
  });

  it("should re-fetch when authentication status changes", async () => {
    // Real store now, so drive auth through state instead of a mocked return value.
    selectIsAuthenticated.mockImplementation((state) => state.flag);
    getNotifications.mockResolvedValue({
      data: { notifications: [{ id: 1, read: false }] },
    });
    const flag = (state = false, action) =>
      action.type === "setAuth" ? action.payload : state;
    const store = makeTestStore({ flag });

    renderHook(() => useUnreadCount(), store);
    expect(getNotifications).not.toHaveBeenCalled();

    act(() => {
      store.dispatch({ type: "setAuth", payload: true });
    });

    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalledTimes(1);
    });
  });
});

describe("useUnreadCount — shared slice", () => {
  it("keeps the badge in sync when the list is marked read elsewhere", async () => {
    const { markNotificationAsRead } =
      await import("@features/notifications/models/notificationsSlice");
    const { markNotificationRead } =
      await import("@features/notifications/models/notifications.api");
    selectIsAuthenticated.mockReturnValue(true);
    getNotifications.mockResolvedValue({
      data: {
        notifications: [
          { id: 1, read: false },
          { id: 2, read: false },
        ],
      },
    });
    const { result, store } = renderHook(() => useUnreadCount());
    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    // what the notifications tab does when a card is clicked
    await act(async () => {
      await store.dispatch(markNotificationAsRead(1));
    });

    expect(markNotificationRead).toHaveBeenCalledWith(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it("badge stays 0 when the tab's own fetch lands after clearBadge (regression)", async () => {
    const { fetchNotifications } =
      await import("@features/notifications/models/notificationsSlice");
    selectIsAuthenticated.mockReturnValue(true);
    getNotifications.mockResolvedValue({
      data: {
        notifications: [
          { id: 1, read: false },
          { id: 2, read: false },
        ],
      },
    });
    const { result, store } = renderHook(() => useUnreadCount());
    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    act(() => {
      result.current.clearBadge();
    }); // shell: activeTab === "notifications"
    await act(async () => {
      await store.dispatch(fetchNotifications());
    }); // SharedNotificationsTab mount

    expect(result.current.unreadCount).toBe(0);
  });
});
