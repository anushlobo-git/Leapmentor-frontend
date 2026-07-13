import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useChat from "./useChat";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";

// ── Hoist Variable Container Definitions to Prevent Temporal Dead Zone (TDZ) ──
const { globalSocketContext } = vi.hoisted(() => ({
  globalSocketContext: { capturedInitializer: null },
}));

// ── Mock Core Libraries & Core Modules ───────────────────
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@lib/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Intercept hook setup logic to extract internal socket event handlers programmatically
vi.mock("@lib/hooks/useSocketEvent", () => ({
  default: vi.fn((initializer) => {
    globalSocketContext.capturedInitializer = initializer;
  }),
}));

describe("useChat Hook Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    globalSocketContext.capturedInitializer = null;

    // Provide a baseline default fallback mock resolution to prevent leaking unhandled promises
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { messages: [], hasMore: false },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── 1. Initial History Loading Layer Branches ──────────────────────────────
  describe("Initial History Loading", () => {
    it("should short-circuit and remain idle if connectRequestId parameter is missing", async () => {
      const { result } = renderHook(() => useChat(null));

      await act(async () => {});
      expect(result.current.loading).toBe(true);
      expect(axiosInstance.get).not.toHaveBeenCalled();
    });

    it("should populate messages history successfully on an initial valid fetch", async () => {
      const mockData = {
        messages: [
          { _id: "m1", content: "Hello", createdAt: "2026-07-13T10:00:00Z" },
          { _id: "m2", content: "Hi there", createdAt: "2026-07-13T10:01:00Z" },
        ],
        hasMore: true,
      };
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useChat("room_123"));
      expect(result.current.loading).toBe(true);

      await act(async () => {});

      expect(result.current.loading).toBe(false);
      expect(result.current.messages).toEqual(mockData.messages);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("should catch initial fetch errors, update error status, and log standard traces", async () => {
      const customServerError = {
        response: {
          data: { message: "Database cluster synchronization timeout." },
        },
      };
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(customServerError);

      const { result } = renderHook(() => useChat("room_123"));

      await act(async () => {});

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        "Database cluster synchronization timeout.",
      );
      expect(logger.warn).toHaveBeenCalledWith("Failed to load chat messages", {
        roomId: "room_123",
        error: undefined,
      });
    });

    it("should fall back to default failure strings if error payload fields return empty", async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error("Network Drop"),
      );

      const { result } = renderHook(() => useChat("room_123"));

      await act(async () => {});

      expect(result.current.error).toBe("Failed to load messages");
    });

    it("should skip state updates completely if hook unmounts before fetch resolution completes", async () => {
      let resolvePromise;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(axiosInstance.get).mockReturnValueOnce(pendingPromise);

      const { result, unmount } = renderHook(() => useChat("room_123"));

      unmount();

      await act(async () => {
        resolvePromise({ data: { messages: [{ _id: "m1" }], hasMore: false } });
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.messages).toEqual([]);
    });
  });

  // ── 2. Paginated History Expansion Branches ────────────────────────────────
  describe("Paginated Pagination (loadMore)", () => {
    it("should short-circuit loadMore requests if loadingMore equals true or hasMore is false", async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { messages: [], hasMore: false },
      });

      const { result } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      // hasMore evaluates to false here
      await act(async () => {
        await result.current.loadMore();
      });

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it("should prepend older message payloads onto history states cleanly on successful expansions", async () => {
      const initialData = {
        messages: [{ _id: "m2", content: "Recent" }],
        hasMore: true,
      };
      const olderData = {
        messages: [{ _id: "m1", content: "Older" }],
        hasMore: false,
      };

      vi.mocked(axiosInstance.get)
        .mockResolvedValueOnce({ data: initialData })
        .mockResolvedValueOnce({ data: olderData });

      const { result } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.messages).toEqual([
        { _id: "m1", content: "Older" },
        { _id: "m2", content: "Recent" },
      ]);
      expect(result.current.hasMore).toBe(false);
    });

    it("should map exception messages accurately if secondary page requests reject", async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { messages: [], hasMore: true },
      });

      const { result } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error("Gateway Crash"),
      );

      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.error).toBe("Failed to load older messages");
    });
  });

  // ── 3. Messaging Dispatch Workflow Actions ─────────────────────────────────
  describe("Messaging Actions", () => {
    it("should block message transmissions early if content contains only structural whitespace parameters", () => {
      const { result } = renderHook(() => useChat("room_123"));

      const mockSocket = { emit: vi.fn() };
      const setupConfig = globalSocketContext.capturedInitializer();
      setupConfig.onConnect(mockSocket);

      result.current.sendMessage("    ");
      expect(mockSocket.emit).not.toHaveBeenCalledWith(
        "send_message",
        expect.any(Object),
      );
    });

    it("should cleanly submit typed content strings and drop typing counters upon send completions", async () => {
      const { result } = renderHook(() => useChat("room_123"));

      const mockSocket = { emit: vi.fn() };
      const setupConfig = globalSocketContext.capturedInitializer();
      setupConfig.onConnect(mockSocket);

      act(() => {
        result.current.handleTyping();
      });

      act(() => {
        result.current.sendMessage("Final Project Specifications");
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("send_message", {
        connectRequestId: "room_123",
        content: "Final Project Specifications",
      });
      expect(mockSocket.emit).toHaveBeenCalledWith("typing_stop", {
        connectRequestId: "room_123",
      });
    });
  });

  // ── 4. Typing Indicator Management Loops ───────────────────────────────────
  describe("Typing Indicators", () => {
    it("should ignore handleTyping calls if socket instance references evaluate to null", () => {
      const { result } = renderHook(() => useChat("room_123"));

      expect(() => {
        result.current.handleTyping();
      }).not.toThrow();
    });

    it("should issue typing stop descriptors automatically once debounce timeout constraints expire", () => {
      const { result } = renderHook(() => useChat("room_123"));

      const mockSocket = { emit: vi.fn() };
      const setupConfig = globalSocketContext.capturedInitializer();
      setupConfig.onConnect(mockSocket);

      act(() => {
        result.current.handleTyping();
      });
      expect(mockSocket.emit).toHaveBeenCalledWith("typing_start", {
        connectRequestId: "room_123",
      });

      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(mockSocket.emit).not.toHaveBeenCalledWith(
        "typing_stop",
        expect.any(Object),
      );

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(mockSocket.emit).toHaveBeenCalledWith("typing_stop", {
        connectRequestId: "room_123",
      });
    });
  });

  // ── 5. Standard Helper Action Callbacks ────────────────────────────────────
  describe("Read Status Operations", () => {
    it("should trigger mark_read socket actions accurately when requested", () => {
      const { result } = renderHook(() => useChat("room_123"));

      const mockSocket = { emit: vi.fn() };
      const setupConfig = globalSocketContext.capturedInitializer();
      setupConfig.onConnect(mockSocket);

      result.current.markRead();
      expect(mockSocket.emit).toHaveBeenCalledWith("mark_read", {
        connectRequestId: "room_123",
      });
    });

    it("should catch markRead requests silently if downstream references are unassigned", () => {
      const { result } = renderHook(() => useChat("room_123"));
      expect(() => result.current.markRead()).not.toThrow();
    });
  });

  // ── 6. Sockets Real-Time Streaming Events ──────────────────────────────────
  describe("Socket Real-Time Streaming Channels", () => {
    it("should exit socket context generation early if connection id references pass null", () => {
      renderHook(() => useChat(null));
      const setupConfig = globalSocketContext.capturedInitializer();
      expect(setupConfig).toBeNull();
    });

    it("should handle incoming new_message payloads and avoid appending duplicate ids", async () => {
      const { result } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      const setupConfig = globalSocketContext.capturedInitializer();

      act(() => {
        setupConfig.events.new_message({
          _id: "msg_u1",
          content: "Stream Content",
        });
      });
      expect(result.current.messages).toHaveLength(1);

      act(() => {
        setupConfig.events.new_message({
          _id: "msg_u1",
          content: "Stream Content",
        });
      });
      expect(result.current.messages).toHaveLength(1);
    });

    it("should flip status flags cleanly on typing_start and typing_stop channels", async () => {
      const { result } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      const setupConfig = globalSocketContext.capturedInitializer();

      act(() => {
        setupConfig.events.typing_start();
      });
      expect(result.current.isTyping).toBe(true);

      act(() => {
        setupConfig.events.typing_stop();
      });
      expect(result.current.isTyping).toBe(false);
    });

    it("should track session partner presence flags cleanly down user_online and user_offline vectors", async () => {
      const { result } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      const setupConfig = globalSocketContext.capturedInitializer();

      act(() => {
        setupConfig.events.user_online();
      });
      expect(result.current.otherOnline).toBe(true);

      act(() => {
        setupConfig.events.user_offline();
      });
      expect(result.current.otherOnline).toBe(false);
    });

    it("should modify array states mapping read timestamp elements down messages_read events", async () => {
      const legacyHistory = {
        messages: [
          { _id: "m1", content: "A", readAt: "already_populated" },
          { _id: "m2", content: "B", readAt: null },
        ],
        hasMore: false,
      };
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: legacyHistory,
      });

      const { result } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      const setupConfig = globalSocketContext.capturedInitializer();
      act(() => {
        setupConfig.events.messages_read({ readAt: "2026-07-13T16:00:00Z" });
      });

      expect(result.current.messages[0].readAt).toBe("already_populated");
      expect(result.current.messages[1].readAt).toBe("2026-07-13T16:00:00Z");
    });

    it("should process socket internal error notifications, update states, and trace failures", async () => {
      const { result } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      const setupConfig = globalSocketContext.capturedInitializer();

      act(() => {
        setupConfig.events.error({ message: "Decryption layer broken." });
      });

      expect(result.current.error).toBe("Decryption layer broken.");
      expect(logger.warn).toHaveBeenCalledWith("Chat socket error", {
        roomId: "room_123",
        error: { message: "Decryption layer broken." },
      });
    });

    it("should fall back onto generic socket error messaging formats if inner text structures are completely omitted", async () => {
      const { result } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      const setupConfig = globalSocketContext.capturedInitializer();

      act(() => {
        setupConfig.events.error(null);
      });

      expect(result.current.error).toBe("Socket error");
    });

    it("should execute cleanups dropping timer structures and socket pointers when lifecycle tear downs invoke", async () => {
      const { unmount } = renderHook(() => useChat("room_123"));
      await act(async () => {});

      const setupConfig = globalSocketContext.capturedInitializer();
      const mockSocket = { emit: vi.fn() };
      setupConfig.onConnect(mockSocket);

      expect(() => {
        setupConfig.onCleanup();
      }).not.toThrow();
    });
  });
});
