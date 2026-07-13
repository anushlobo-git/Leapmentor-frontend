/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useUnreadCount from "./useUnreadCount";
import axiosInstance from "@lib/axiosInstance";
import { normalizeApiNotif } from "@features/notifications/mappers/notificationMapper";

vi.mock("@lib/axiosInstance", () => ({
  default: { get: vi.fn() },
}));

vi.mock("@features/notifications/mappers/notificationMapper", () => ({
  normalizeApiNotif: vi.fn((n) => n),
}));

const mockUseSelector = vi.fn();
vi.mock("react-redux", () => ({
  useSelector: (selectorFn) => mockUseSelector(selectorFn),
}));

vi.mock("@features/auth/store/authSlice", () => ({
  selectIsAuthenticated: vi.fn(),
}));

describe("useUnreadCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with an unread count of 0", () => {
    mockUseSelector.mockReturnValue(false);

    const { result } = renderHook(() => useUnreadCount());

    expect(result.current.unreadCount).toBe(0);
  });

  it("should not fetch notifications when not authenticated", async () => {
    mockUseSelector.mockReturnValue(false);

    renderHook(() => useUnreadCount());

    await act(async () => {
      await Promise.resolve();
    });

    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  it("should fetch and count unread notifications when authenticated", async () => {
    mockUseSelector.mockReturnValue(true);
    axiosInstance.get.mockResolvedValue({
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

    expect(axiosInstance.get).toHaveBeenCalledWith("/notifications");
    expect(normalizeApiNotif).toHaveBeenCalledTimes(3);
  });

  it("should default to an empty list when notifications is not an array", async () => {
    mockUseSelector.mockReturnValue(true);
    axiosInstance.get.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalled();
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it("should silently fail and leave count unchanged on fetch error", async () => {
    mockUseSelector.mockReturnValue(true);
    axiosInstance.get.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalled();
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it("should increment the badge count", () => {
    mockUseSelector.mockReturnValue(false);

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
    mockUseSelector.mockReturnValue(false);

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
    mockUseSelector.mockReturnValue(true);
    axiosInstance.get
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
    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
  });

  it("should re-fetch when authentication status changes", async () => {
    mockUseSelector.mockReturnValue(false);
    axiosInstance.get.mockResolvedValue({
      data: { notifications: [{ id: 1, read: false }] },
    });

    const { rerender } = renderHook(() => useUnreadCount());
    expect(axiosInstance.get).not.toHaveBeenCalled();

    mockUseSelector.mockReturnValue(true);
    rerender();

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });
});
