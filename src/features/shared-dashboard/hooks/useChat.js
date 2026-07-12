/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useChat.js
import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import useSocketEvent from "@lib/hooks/useSocketEvent";

const TYPING_DEBOUNCE_MS = 2000;
const PAGE_LIMIT = 30;
/**
 * Custom hook for chat.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useChat = (connectRequestId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [page, setPage] = useState(1);

  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const connectRequestIdRef = useRef(connectRequestId);
  useEffect(() => {
    connectRequestIdRef.current = connectRequestId;
  }, [connectRequestId]);

  const mergeMessage = (messagesList, incomingMessage) => {
    if (messagesList.some((message) => message._id === incomingMessage._id)) {
      return messagesList;
    }
    return [...messagesList, incomingMessage];
  };

  const markMessagesAsRead = (messagesList, readAt) =>
    messagesList.map((message) =>
      message.readAt ? message : { ...message, readAt },
    );

  // ── Fetch message history (REST) ──────────────────────────
  const fetchHistory = useCallback(async (roomId, pageNum = 1) => {
    logger.info("Loading chat history", { roomId, page: pageNum });
    const res = await axiosInstance.get(`/messages/${roomId}`, {
      params: { page: pageNum, limit: PAGE_LIMIT },
    });
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
        logger.warn("Failed to load chat messages", {
          roomId: connectRequestId,
          error: err?.message,
        });
        if (!cancelled)
          setError(err?.response?.data?.message || "Failed to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [connectRequestId, fetchHistory]);

  // ── Socket setup ──────────────────────────────────────────
  useSocketEvent(
    () => {
      if (!connectRequestId) return null;

      const handleNewMessage = (message) => {
        logger.info("New chat message received", {
          roomId: connectRequestId,
          messageId: message._id,
        });
        setMessages((prev) => mergeMessage(prev, message));
      };

      const handleTypingStart = () => setIsTyping(true);
      const handleTypingStop = () => setIsTyping(false);
      const handleUserOnline = () => setOtherOnline(true);
      const handleUserOffline = () => setOtherOnline(false);
      const handleMessagesRead = ({ readAt }) => {
        setMessages((prev) => markMessagesAsRead(prev, readAt));
      };
      const handleError = (error) => {
        logger.warn("Chat socket error", { roomId: connectRequestId, error });
        setError(error?.message || error?.toString?.() || "Socket error");
      };

      return {
        onConnect: (socket) => {
          socketRef.current = socket;
          logger.info("Chat socket connected, joining room", {
            roomId: connectRequestId,
          });
          socket.emit("join_room", { connectRequestId });
        },
        events: {
          new_message: handleNewMessage,
          typing_start: handleTypingStart,
          typing_stop: handleTypingStop,
          user_online: handleUserOnline,
          user_offline: handleUserOffline,
          messages_read: handleMessagesRead,
          error: handleError,
        },
        onCleanup: () => {
          clearTimeout(typingTimerRef.current);
          socketRef.current = null;
        },
      };
    },
    [connectRequestId],
    "Chat socket",
  );

  // ✅ Remove these:
  // import { io } from "socket.io-client"  ← remove
  // import SOCKET_URL  ← remove
  // The socket.on("connect") joinRoom call is now handled above

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
