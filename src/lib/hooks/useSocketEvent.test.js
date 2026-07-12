/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useSocketEvent from "./useSocketEvent";

// Mock logger
vi.mock("@lib/logger", () => ({
  default: {
    info: vi.fn(),
  },
}));

import logger from "@lib/logger";

describe("useSocketEvent", () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      connected: false,
      on: vi.fn(),
      off: vi.fn(),
    };
    globalThis.__leapSocket = mockSocket;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete globalThis.__leapSocket;
  });

  it("should not subscribe when setup returns falsy value", () => {
    const { unmount } = renderHook(() => 
      useSocketEvent(() => null, [], "Test")
    );

    expect(mockSocket.on).not.toHaveBeenCalled();
    unmount();
    expect(mockSocket.off).not.toHaveBeenCalled();
  });

  it("should not subscribe when setup returns object without events", () => {
    const { unmount } = renderHook(() => 
      useSocketEvent(() => ({}), [], "Test")
    );

    expect(mockSocket.on).not.toHaveBeenCalled();
    unmount();
    expect(mockSocket.off).not.toHaveBeenCalled();
  });

  it("should poll for socket connection", () => {
    vi.useFakeTimers();
    
    const setup = vi.fn(() => ({
      events: { test: vi.fn() },
    }));

    renderHook(() => useSocketEvent(setup, [], "Test"));

    expect(setup).toHaveBeenCalled();
    
    // Advance timer to trigger poll
    vi.advanceTimersByTime(200);
    
    expect(mockSocket.on).not.toHaveBeenCalled(); // Not connected yet
    
    vi.useRealTimers();
  });

  it("should register listeners when socket connects", () => {
    vi.useFakeTimers();
    
    const handler = vi.fn();
    const setup = vi.fn(() => ({
      events: { test: handler },
    }));

    renderHook(() => useSocketEvent(setup, [], "Test"));

    // Simulate socket connection
    mockSocket.connected = true;
    vi.advanceTimersByTime(200);

    expect(mockSocket.on).toHaveBeenCalledWith("test", handler);
    expect(logger.info).toHaveBeenCalledWith(
      "Test connected, registering listeners",
      { events: ["test"] }
    );

    vi.useRealTimers();
  });

  it("should call onConnect when socket connects", () => {
    vi.useFakeTimers();
    
    const onConnect = vi.fn();
    const setup = vi.fn(() => ({
      events: { test: vi.fn() },
      onConnect,
    }));

    renderHook(() => useSocketEvent(setup, [], "Test"));

    mockSocket.connected = true;
    vi.advanceTimersByTime(200);

    expect(onConnect).toHaveBeenCalledWith(mockSocket);

    vi.useRealTimers();
  });

  it("should register multiple event listeners", () => {
    vi.useFakeTimers();
    
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const setup = vi.fn(() => ({
      events: { event1: handler1, event2: handler2 },
    }));

    renderHook(() => useSocketEvent(setup, [], "Test"));

    mockSocket.connected = true;
    vi.advanceTimersByTime(200);

    expect(mockSocket.on).toHaveBeenCalledWith("event1", handler1);
    expect(mockSocket.on).toHaveBeenCalledWith("event2", handler2);

    vi.useRealTimers();
  });

  it("should clean up listeners on unmount", () => {
    vi.useFakeTimers();
    
    const handler = vi.fn();
    const setup = vi.fn(() => ({
      events: { test: handler },
    }));

    const { unmount } = renderHook(() => useSocketEvent(setup, [], "Test"));

    mockSocket.connected = true;
    vi.advanceTimersByTime(200);

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith("test", handler);

    vi.useRealTimers();
  });

  it("should call onCleanup on unmount", () => {
    vi.useFakeTimers();
    
    const onCleanup = vi.fn();
    const setup = vi.fn(() => ({
      events: { test: vi.fn() },
      onCleanup,
    }));

    const { unmount } = renderHook(() => useSocketEvent(setup, [], "Test"));

    mockSocket.connected = true;
    vi.advanceTimersByTime(200);

    unmount();

    expect(onCleanup).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("should clear polling interval on unmount", () => {
    vi.useFakeTimers();
    
    const setup = vi.fn(() => ({
      events: { test: vi.fn() },
    }));

    const { unmount } = renderHook(() => useSocketEvent(setup, [], "Test"));

    unmount();

    // Should not crash when timer advances after unmount
    vi.advanceTimersByTime(200);

    vi.useRealTimers();
  });

  it("should re-subscribe when dependencies change", () => {
    vi.useFakeTimers();
    
    const handler = vi.fn();
    const setup = vi.fn(() => ({
      events: { test: handler },
    }));

    const { rerender } = renderHook(
      ({ deps }) => useSocketEvent(setup, deps, "Test"),
      { initialProps: { deps: [1] } }
    );

    mockSocket.connected = true;
    vi.advanceTimersByTime(200);

    expect(setup).toHaveBeenCalledTimes(1);
    expect(mockSocket.on).toHaveBeenCalledTimes(1);

    rerender({ deps: [2] });

    expect(setup).toHaveBeenCalledTimes(2);
    expect(mockSocket.off).toHaveBeenCalledWith("test", handler);

    vi.useRealTimers();
  });

  it("should use custom log label", () => {
    vi.useFakeTimers();
    
    const setup = vi.fn(() => ({
      events: { test: vi.fn() },
    }));

    renderHook(() => useSocketEvent(setup, [], "CustomLabel"));

    mockSocket.connected = true;
    vi.advanceTimersByTime(200);

    expect(logger.info).toHaveBeenCalledWith(
      "CustomLabel connected, registering listeners",
      expect.any(Object)
    );

    vi.useRealTimers();
  });

  it("should handle missing socket gracefully", () => {
    vi.useFakeTimers();
    
    delete globalThis.__leapSocket;
    
    const setup = vi.fn(() => ({
      events: { test: vi.fn() },
    }));

    renderHook(() => useSocketEvent(setup, [], "Test"));

    // Should not crash even without socket
    vi.advanceTimersByTime(200);

    vi.useRealTimers();
  });

  it("should handle socket.off when socket is null during cleanup", () => {
    vi.useFakeTimers();
    
    const handler = vi.fn();
    const setup = vi.fn(() => ({
      events: { test: handler },
    }));

    const { unmount } = renderHook(() => useSocketEvent(setup, [], "Test"));

    mockSocket.connected = true;
    vi.advanceTimersByTime(200);

    // Remove socket before unmount
    delete globalThis.__leapSocket;

    unmount();

    // Should not crash
    vi.useRealTimers();
  });
});
