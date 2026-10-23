/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/hooks/useChat.js
import { useState, useEffect, useRef, useCallback } from "react";
import { getChatHistory } from "@features/shared-dashboard/models/shared-dashboard.api";
import logger from "@lib/monitoring/logger";
import useSocketEvent from "@lib/hooks/useSocketEvent";
import type { Socket } from "socket.io-client";

const TYPING_DEBOUNCE_MS = 2000;
const PAGE_LIMIT = 30;

interface ChatMessage {
  _id: string;
  content?: string;
  createdAt?: string | null;
  readAt?: string | null;
  sender?: { _id?: string } | string;
  [key: string]: unknown;
}

interface ChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

type ChatApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};
/**
 * Custom hook for chat.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useChat = (connectRequestId: string | null | undefined) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [page, setPage] = useState(1);

  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const connectRequestIdRef = useRef(connectRequestId);
  useEffect(() => {
    connectRequestIdRef.current = connectRequestId;
  }, [connectRequestId]);

  const mergeMessage = (messagesList: ChatMessage[], incomingMessage: ChatMessage) => {
    if (messagesList.some((message) => message._id === incomingMessage._id)) {
      return messagesList;
    }
    return [...messagesList, incomingMessage];
  };

  const markMessagesAsRead = (
    messagesList: ChatMessage[],
    readAt: string | null | undefined,
  ) => messagesList.map((message: ChatMessage) =>
      message.readAt ? message : { ...message, readAt },
    );

  // ── Fetch message history (REST) ──────────────────────────
  const fetchHistory = useCallback(async (
    roomId: string,
    pageNum: number = 1,
  ): Promise<ChatHistoryResponse> => {
    logger.info("Loading chat history", { roomId, page: pageNum });
    const res = await getChatHistory(roomId, pageNum, PAGE_LIMIT);
    return res.data as ChatHistoryResponse;
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
      } catch (err: unknown) {
        const error = err as ChatApiError | null | undefined;
        logger.warn("Failed to load chat messages", {
          roomId: connectRequestId,
          error: error?.message,
        });
        if (!cancelled)
          setError(error?.response?.data?.message || "Failed to load messages");
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

      const handleNewMessage = (message: ChatMessage) => {
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
      const handleMessagesRead = ({ readAt }: { readAt?: string | null }) => {
        setMessages((prev) => markMessagesAsRead(prev, readAt));
      };
      const handleError = (error: unknown) => {
        const socketError = error as ChatApiError | null | undefined;
        logger.warn("Chat socket error", { roomId: connectRequestId, error });
        setError(socketError?.message || socketError?.toString?.() || "Socket error");
      };

      return {
        onConnect: (socket: Socket) => {
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
          if (typingTimerRef.current !== null) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
          }
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
    if (!roomId) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await fetchHistory(roomId, nextPage);
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err: unknown) {
      const error = err as ChatApiError;
      setError(error.response?.data?.message || "Failed to load older messages");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, fetchHistory]);

  // ── Send message ──────────────────────────────────────────
  const sendMessage = useCallback((content: string) => {
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
      if (typingTimerRef.current !== null) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
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

    if (typingTimerRef.current !== null) {
      clearTimeout(typingTimerRef.current);
    }
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
