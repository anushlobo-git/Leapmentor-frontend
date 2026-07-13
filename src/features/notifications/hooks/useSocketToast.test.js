/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useSocketToast from "./useSocketToast";
import { io } from "socket.io-client";
import logger from "@lib/logger";

vi.mock("socket.io-client", () => ({
  io: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
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

const createMockSocket = () => {
  const handlers = {};
  return {
    id: "socket-123",
    on: vi.fn((event, cb) => {
      handlers[event] = cb;
    }),
    disconnect: vi.fn(),
    emit: (event, ...args) => handlers[event]?.(...args),
  };
};

describe("useSocketToast", () => {
  let mockSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    mockShowToast.mockReset();
    globalThis.__leapSocket = null;
    mockSocket = createMockSocket();
    io.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    globalThis.__leapSocket = null;
  });

  describe("connection", () => {
    it("should not connect when there is no access token", () => {
      mockUseSelector.mockReturnValue(undefined);

      renderHook(() => useSocketToast());

      expect(io).not.toHaveBeenCalled();
    });

    it("should connect with the access token when available", () => {
      mockUseSelector.mockReturnValue("token-abc");

      renderHook(() => useSocketToast());

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          withCredentials: true,
          auth: { token: "token-abc" },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          transports: ["websocket", "polling"],
        }),
      );
      expect(globalThis.__leapSocket).toBe(mockSocket);
    });

    it("should skip initialization if a connected socket already exists", () => {
      globalThis.__leapSocket = { connected: true };
      mockUseSelector.mockReturnValue("token-abc");

      renderHook(() => useSocketToast());

      expect(io).not.toHaveBeenCalled();
    });

    it("should disconnect and clear the global socket on unmount", () => {
      mockUseSelector.mockReturnValue("token-abc");

      const { unmount } = renderHook(() => useSocketToast());
      unmount();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(globalThis.__leapSocket).toBeNull();
    });

    it("should restore the global socket reference on reconnect", () => {
      mockUseSelector.mockReturnValue("token-abc");

      renderHook(() => useSocketToast());
      globalThis.__leapSocket = null;

      act(() => {
        mockSocket.emit("reconnect", 2);
      });

      expect(logger.info).toHaveBeenCalledWith("Socket reconnected", {
        attempt: 2,
      });
      expect(globalThis.__leapSocket).toBe(mockSocket);
    });

    it("should log a warning on connect_error", () => {
      mockUseSelector.mockReturnValue("token-abc");

      renderHook(() => useSocketToast());

      act(() => {
        mockSocket.emit("connect_error", new Error("boom"));
      });

      expect(logger.warn).toHaveBeenCalledWith("Socket connect error", {
        error: "boom",
      });
    });

    it("should clear the global socket reference on disconnect", () => {
      mockUseSelector.mockReturnValue("token-abc");

      renderHook(() => useSocketToast());

      act(() => {
        mockSocket.emit("disconnect", "transport close");
      });

      expect(globalThis.__leapSocket).toBeNull();
    });
  });

  describe("toast events", () => {
    it("should show a toast and increment badge on new_connect_request", () => {
      mockUseSelector.mockReturnValue("token-abc");
      const incrementBadge = vi.fn();

      renderHook(() => useSocketToast(undefined, incrementBadge));

      act(() => {
        mockSocket.emit("new_connect_request", {
          title: "New request",
          message: "You have a new connection request",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "info",
        title: "New request",
        message: "You have a new connection request",
      });
      expect(incrementBadge).toHaveBeenCalled();
    });

    it("should show a success toast on request_accepted", () => {
      mockUseSelector.mockReturnValue("token-abc");
      const incrementBadge = vi.fn();

      renderHook(() => useSocketToast(undefined, incrementBadge));

      act(() => {
        mockSocket.emit("request_accepted", {
          title: "Accepted",
          message: "Your request was accepted",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "success",
        title: "Accepted",
        message: "Your request was accepted",
      });
      expect(incrementBadge).toHaveBeenCalled();
    });

    it("should show a warning toast on request_declined", () => {
      mockUseSelector.mockReturnValue("token-abc");
      const incrementBadge = vi.fn();

      renderHook(() => useSocketToast(undefined, incrementBadge));

      act(() => {
        mockSocket.emit("request_declined", {
          title: "Declined",
          message: "Your request was declined",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "warning",
        title: "Declined",
        message: "Your request was declined",
      });
      expect(incrementBadge).toHaveBeenCalled();
    });

    it("should show an info toast on request_referred", () => {
      mockUseSelector.mockReturnValue("token-abc");
      const incrementBadge = vi.fn();

      renderHook(() => useSocketToast(undefined, incrementBadge));

      act(() => {
        mockSocket.emit("request_referred", {
          title: "Referred",
          message: "Your request was referred",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "info",
        title: "Referred",
        message: "Your request was referred",
      });
      expect(incrementBadge).toHaveBeenCalled();
    });

    it("should respect an explicit type over the default", () => {
      mockUseSelector.mockReturnValue("token-abc");

      renderHook(() => useSocketToast());

      act(() => {
        mockSocket.emit("request_accepted", {
          title: "Accepted",
          message: "msg",
          type: "custom",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "custom",
        title: "Accepted",
        message: "msg",
      });
    });

    it("should not throw when incrementBadge is not provided", () => {
      mockUseSelector.mockReturnValue("token-abc");

      renderHook(() => useSocketToast());

      expect(() => {
        act(() => {
          mockSocket.emit("new_connect_request", {
            title: "New request",
            message: "msg",
          });
        });
      }).not.toThrow();
    });

    it("should call onRequestChanged when request_status_changed fires", () => {
      mockUseSelector.mockReturnValue("token-abc");
      const onRequestChanged = vi.fn();

      renderHook(() => useSocketToast(onRequestChanged));

      const payload = { requestId: "1", status: "completed" };
      act(() => {
        mockSocket.emit("request_status_changed", payload);
      });

      expect(onRequestChanged).toHaveBeenCalledWith(payload);
    });

    it("should use the latest onRequestChanged callback without reconnecting", () => {
      mockUseSelector.mockReturnValue("token-abc");
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      const { rerender } = renderHook(({ cb }) => useSocketToast(cb), {
        initialProps: { cb: firstCallback },
      });

      rerender({ cb: secondCallback });

      act(() => {
        mockSocket.emit("request_status_changed", { status: "x" });
      });

      expect(io).toHaveBeenCalledTimes(1);
      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledWith({ status: "x" });
    });
  });
});
