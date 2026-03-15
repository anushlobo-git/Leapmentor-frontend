// src/hooks/useChat.js
import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const TYPING_DEBOUNCE_MS = 2000;
const PAGE_LIMIT = 30;

const useChat = (connectRequestId) => {
  const [messages,     setMessages]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [hasMore,      setHasMore]      = useState(false);
  const [error,        setError]        = useState(null);
  const [isTyping,     setIsTyping]     = useState(false);
  const [otherOnline,  setOtherOnline]  = useState(false);
  const [page,         setPage]         = useState(1);

  const socketRef       = useRef(null);
  const typingTimerRef  = useRef(null);
  const isTypingRef     = useRef(false); // track without re-render

  // ── Fetch message history (REST) ─────────────────────────
  const fetchHistory = useCallback(async (pageNum = 1) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/messages/${connectRequestId}`,
        {
          params:  { page: pageNum, limit: PAGE_LIMIT },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message || "Failed to load messages");
    }
  }, [connectRequestId]);

  // ── Load more (older messages) ────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await fetchHistory(nextPage);
      // ✅ Prepend older messages to top
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, fetchHistory]);

  // ── Send message ──────────────────────────────────────────
  const sendMessage = useCallback((content) => {
    if (!content?.trim() || !socketRef.current) return;
    socketRef.current.emit("send_message", {
      connectRequestId,
      content: content.trim(),
    });
    // ✅ Stop typing indicator when message sent
    if (isTypingRef.current) {
      socketRef.current.emit("typing_stop", { connectRequestId });
      isTypingRef.current = false;
      clearTimeout(typingTimerRef.current);
    }
  }, [connectRequestId]);

  // ── Typing indicator (debounced) ──────────────────────────
  const handleTyping = useCallback(() => {
    if (!socketRef.current) return;

    // Emit typing_start only once per typing burst
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit("typing_start", { connectRequestId });
    }

    // Reset the stop timer on every keystroke
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socketRef.current?.emit("typing_stop", { connectRequestId });
      }
    }, TYPING_DEBOUNCE_MS);
  }, [connectRequestId]);

  // ── Mark messages as read ─────────────────────────────────
  const markRead = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("mark_read", { connectRequestId });
  }, [connectRequestId]);

  // ── Socket setup ──────────────────────────────────────────
  useEffect(() => {
    if (!connectRequestId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ Initial history fetch
    const initHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchHistory(1);
        setMessages(data.messages);
        setHasMore(data.hasMore);
        setPage(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initHistory();

    // ✅ Create socket with JWT auth
    const socket = io(BASE_URL, {
      auth:          { token },
      reconnection:  true,
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
      transports:    ["websocket", "polling"],
    });

    socketRef.current = socket;

    // ── Socket event listeners ────────────────────────────

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      socket.emit("join_room", { connectRequestId });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      setError("Connection error. Retrying...");
    });

    socket.on("new_message", (message) => {
      setMessages((prev) => {
        // ✅ Prevent duplicates on reconnect
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    socket.on("typing_start", () => setIsTyping(true));
    socket.on("typing_stop",  () => setIsTyping(false));

    socket.on("user_online",  () => setOtherOnline(true));
    socket.on("user_offline", () => setOtherOnline(false));

    // ✅ Update readAt on own sent messages
    socket.on("messages_read", ({ readAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.readAt ? m : { ...m, readAt }
        )
      );
    });

    socket.on("error", ({ message }) => {
      console.error("❌ Socket error:", message);
      setError(message);
    });

    // ✅ On reconnect — fetch messages since last known message
    socket.on("reconnect", () => {
      console.log("🔄 Socket reconnected — fetching missed messages");
      socket.emit("join_room", { connectRequestId });
    });

    // ── Cleanup on unmount ────────────────────────────────
    return () => {
      clearTimeout(typingTimerRef.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [connectRequestId, fetchHistory]);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    isTyping,
    otherOnline,
    sendMessage,
    loadMore,
    handleTyping,
    markRead,
  };
};

export default useChat;