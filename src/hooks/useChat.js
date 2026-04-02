// src/hooks/useChat.js
import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_URL    = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL   || "http://localhost:5000";
const TYPING_DEBOUNCE_MS = 2000;
const PAGE_LIMIT = 30;

const useChat = (connectRequestId) => {
  const [messages,    setMessages]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore,     setHasMore]     = useState(false);
  const [error,       setError]       = useState(null);
  const [isTyping,    setIsTyping]    = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [page,        setPage]        = useState(1);

  const socketRef      = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef    = useRef(false);

  const connectRequestIdRef = useRef(connectRequestId);
  useEffect(() => {
    connectRequestIdRef.current = connectRequestId;
  }, [connectRequestId]);

  // ── Fetch message history (REST) ──────────────────────────
  const fetchHistory = useCallback(async (roomId, pageNum = 1) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${API_URL}/messages/${roomId}`,
      {
        params:  { page: pageNum, limit: PAGE_LIMIT },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  }, []); // ✅ stable — no dependencies

  // ── Initial history load ──────────────────────────────────
  useEffect(() => {
    if (!connectRequestId) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHistory(connectRequestId, 1);
        if (cancelled) return;
        setMessages(data.messages);
        setHasMore(data.hasMore);
        setPage(1);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [connectRequestId, fetchHistory]);

  // ── Socket setup ──────────────────────────────────────────
  useEffect(() => {
    if (!connectRequestId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {  // ✅ plain domain, no /api/v1
      auth:                 { token },
      reconnection:         true,
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
      transports:           ["websocket", "polling"],
    });

    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit("join_room", { connectRequestId });
    };

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      joinRoom();
    });

    socket.on("reconnect", () => {
      console.log("🔄 Socket reconnected — rejoining room");
      joinRoom();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      setError("Connection error. Retrying...");
    });

    socket.on("new_message", (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("typing_start", () => setIsTyping(true));
    socket.on("typing_stop",  () => setIsTyping(false));

    socket.on("user_online",  () => setOtherOnline(true));
    socket.on("user_offline", () => setOtherOnline(false));

    socket.on("messages_read", ({ readAt }) => {
      setMessages((prev) =>
        prev.map((m) => (m.readAt ? m : { ...m, readAt }))
      );
    });

    socket.on("error", ({ message }) => {
      console.error("❌ Socket error:", message);
      setError(message);
    });

    return () => {
      console.log("🧹 Cleaning up socket for room:", connectRequestId);
      clearTimeout(typingTimerRef.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [connectRequestId]);

  // ── Load more (older messages) ────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const roomId = connectRequestIdRef.current;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await fetchHistory(roomId, nextPage);
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load older messages");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, fetchHistory]);

  // ── Send message ──────────────────────────────────────────
  const sendMessage = useCallback((content) => {
    if (!content?.trim() || !socketRef.current) return;
    socketRef.current.emit("send_message", {
      connectRequestId: connectRequestIdRef.current,
      content: content.trim(),
    });
    if (isTypingRef.current) {
      socketRef.current.emit("typing_stop", {
        connectRequestId: connectRequestIdRef.current,
      });
      isTypingRef.current = false;
      clearTimeout(typingTimerRef.current);
    }
  }, []);

  // ── Typing indicator ──────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!socketRef.current) return;
    const roomId = connectRequestIdRef.current;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit("typing_start", { connectRequestId: roomId });
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socketRef.current?.emit("typing_stop", { connectRequestId: roomId });
      }
    }, TYPING_DEBOUNCE_MS);
  }, []);

  // ── Mark messages as read ─────────────────────────────────
  const markRead = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("mark_read", {
      connectRequestId: connectRequestIdRef.current,
    });
  }, []);

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