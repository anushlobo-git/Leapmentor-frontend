/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { subscribeToPush } from "@features/notifications/models/notifications.api";
import logger from "@lib/monitoring/logger";

vi.mock("@features/notifications/models/notifications.api", () => ({
  subscribeToPush: vi.fn(),
}));

vi.mock("@lib/monitoring/logger", () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockShowToast = vi.fn();
vi.mock("@app/providers/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockUseSelector = vi.fn();
vi.mock("react-redux", () => ({
  useSelector: (selectorFn) => mockUseSelector(selectorFn),
}));

vi.mock("@features/auth/models/authSlice", () => ({
  selectIsAuthenticated: vi.fn(),
}));

// import.meta.env is read at module load time, so stub it and
// import the hook dynamically, after the env var is in place.
let usePushNotification;

beforeAll(async () => {
  vi.stubEnv(
    "VITE_VAPID_PUBLIC_KEY",
    "BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9LHZoCyH6TjXtc4Sqmyf9hyD64lJvW4sN9F87DEBcE_-N6l6C4Q",
  );
  usePushNotification = (await import("./usePushNotification")).default;
});

describe("usePushNotification", () => {
  let mockRegistration;
  let mockSubscription;

  beforeEach(() => {
    vi.clearAllMocks();
    mockShowToast.mockReset();

    mockSubscription = { endpoint: "https://push.example.com/xyz" };
    mockRegistration = {
      pushManager: {
        subscribe: vi.fn().mockResolvedValue(mockSubscription),
      },
    };

    Object.defineProperty(globalThis.navigator, "serviceWorker", {
      value: {
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      configurable: true,
      writable: true,
    });

    globalThis.PushManager = function PushManager() {};
    globalThis.Notification = {
      requestPermission: vi.fn().mockResolvedValue("granted"),
    };

    subscribeToPush.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    delete globalThis.PushManager;
    delete globalThis.Notification;
  });

  describe("push subscription setup", () => {
    it("should do nothing when not authenticated", async () => {
      mockUseSelector.mockReturnValue(false);

      renderHook(() => usePushNotification());

      expect(navigator.serviceWorker.register).not.toHaveBeenCalled();
    });

    it("should do nothing when serviceWorker is not supported", async () => {
      mockUseSelector.mockReturnValue(true);
      delete globalThis.navigator.serviceWorker;

      renderHook(() => usePushNotification());

      expect(subscribeToPush).not.toHaveBeenCalled();
    });

    it("should do nothing when PushManager is not supported", async () => {
      mockUseSelector.mockReturnValue(true);
      delete globalThis.PushManager;

      renderHook(() => usePushNotification());

      expect(subscribeToPush).not.toHaveBeenCalled();
    });

    it("should register service worker and subscribe when authenticated and permission granted", async () => {
      mockUseSelector.mockReturnValue(true);

      renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(subscribeToPush).toHaveBeenCalled();
      });

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js");
      expect(Notification.requestPermission).toHaveBeenCalled();
      expect(mockRegistration.pushManager.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({ userVisibleOnly: true }),
      );
      expect(subscribeToPush).toHaveBeenCalledWith(mockSubscription);
      expect(logger.info).toHaveBeenCalledWith("Push notifications enabled");
    });

    it("should not subscribe when notification permission is denied", async () => {
      mockUseSelector.mockReturnValue(true);
      globalThis.Notification.requestPermission.mockResolvedValue("denied");

      renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(Notification.requestPermission).toHaveBeenCalled();
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(mockRegistration.pushManager.subscribe).not.toHaveBeenCalled();
      expect(subscribeToPush).not.toHaveBeenCalled();
    });

    it("should log a warning when setup fails", async () => {
      mockUseSelector.mockReturnValue(true);
      navigator.serviceWorker.register.mockRejectedValue(
        new Error("register failed"),
      );

      renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(logger.warn).toHaveBeenCalledWith("Push setup failed", {
          error: "register failed",
        });
      });
      expect(subscribeToPush).not.toHaveBeenCalled();
    });
  });

  describe("service worker messages", () => {
    it("should show a toast when a SHOW_TOAST message is received", () => {
      mockUseSelector.mockReturnValue(false);

      renderHook(() => usePushNotification());

      const handler = navigator.serviceWorker.addEventListener.mock.calls.find(
        ([eventName]) => eventName === "message",
      )[1];

      act(() => {
        handler({
          data: {
            type: "SHOW_TOAST",
            payload: { title: "Hi", message: "New request", type: "success" },
          },
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "success",
        title: "Hi",
        message: "New request",
      });
    });

    it("should default toast type to info when not provided", () => {
      mockUseSelector.mockReturnValue(false);

      renderHook(() => usePushNotification());

      const handler = navigator.serviceWorker.addEventListener.mock.calls.find(
        ([eventName]) => eventName === "message",
      )[1];

      act(() => {
        handler({
          data: {
            type: "SHOW_TOAST",
            payload: { title: "Hi", message: "msg" },
          },
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "info",
        title: "Hi",
        message: "msg",
      });
    });

    it("should ignore messages that are not SHOW_TOAST", () => {
      mockUseSelector.mockReturnValue(false);

      renderHook(() => usePushNotification());

      const handler = navigator.serviceWorker.addEventListener.mock.calls.find(
        ([eventName]) => eventName === "message",
      )[1];

      act(() => {
        handler({ data: { type: "OTHER_EVENT" } });
      });

      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it("should remove the message listener on unmount", () => {
      mockUseSelector.mockReturnValue(false);

      const { unmount } = renderHook(() => usePushNotification());
      const handler = navigator.serviceWorker.addEventListener.mock.calls.find(
        ([eventName]) => eventName === "message",
      )[1];

      unmount();

      expect(navigator.serviceWorker.removeEventListener).toHaveBeenCalledWith(
        "message",
        handler,
      );
    });
  });
});
