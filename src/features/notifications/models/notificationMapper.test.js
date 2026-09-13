/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { normalizeApiNotif } from "./notificationMapper";

describe("notificationMapper", () => {
  describe("normalizeApiNotif", () => {
    it("should normalize a complete notification object", () => {
      const rawNotif = {
        _id: "notif123",
        type: "upcoming_session",
        read: false,
        createdAt: "2024-01-15T10:30:00Z",
        title: "Session Reminder",
        senderName: "John Doe",
        message: "Your session starts in 1 hour",
        metadata: { sessionId: "sess456" },
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result).toEqual({
        id: "notif123",
        _id: "notif123",
        type: "upcoming_session",
        read: false,
        time: expect.any(String),
        accent: true,
        title: "Session Reminder",
        senderName: "John Doe",
        body: "Your session starts in 1 hour",
        actions: [],
        isApi: true,
        metadata: { sessionId: "sess456" },
      });
    });

    it("should handle missing fields with defaults", () => {
      const rawNotif = {
        _id: "notif123",
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result).toEqual({
        id: "notif123",
        _id: "notif123",
        type: "",
        read: false,
        time: "",
        accent: false,
        title: "",
        senderName: "",
        body: "",
        actions: [],
        isApi: true,
        metadata: {},
      });
    });

    it("should use metadata.senderName as fallback for senderName", () => {
      const rawNotif = {
        _id: "notif123",
        metadata: { senderName: "Jane Doe" },
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.senderName).toBe("Jane Doe");
    });

    it("should prefer senderName over metadata.senderName", () => {
      const rawNotif = {
        _id: "notif123",
        senderName: "John Doe",
        metadata: { senderName: "Jane Doe" },
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.senderName).toBe("John Doe");
    });

    it("should use message as fallback for body", () => {
      const rawNotif = {
        _id: "notif123",
        message: "Test message",
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.body).toBe("Test message");
    });

    it("should use body as fallback for body", () => {
      const rawNotif = {
        _id: "notif123",
        body: "Test body",
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.body).toBe("Test body");
    });

    it("should use content as fallback for body", () => {
      const rawNotif = {
        _id: "notif123",
        content: "Test content",
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.body).toBe("Test content");
    });

    it("should set accent to true for unread upcoming_session", () => {
      const rawNotif = {
        _id: "notif123",
        type: "upcoming_session",
        read: false,
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.accent).toBe(true);
    });

    it("should set accent to false for read upcoming_session", () => {
      const rawNotif = {
        _id: "notif123",
        type: "upcoming_session",
        read: true,
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.accent).toBe(false);
    });

    it("should set accent to false for other notification types", () => {
      const rawNotif = {
        _id: "notif123",
        type: "message",
        read: false,
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.accent).toBe(false);
    });

    it("should format time ago for recent notifications", () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

      const rawNotif = {
        _id: "notif123",
        createdAt: fiveMinutesAgo,
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.time).toBe("5 minutes ago");
    });

    it("should return empty string for missing createdAt", () => {
      const rawNotif = {
        _id: "notif123",
      };

      const result = normalizeApiNotif(rawNotif);

      expect(result.time).toBe("");
    });
  });
});
