/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { sendSupportMessage, sendAiChatMessage } from "./support.api";

vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("support.api", () => {
  describe("sendSupportMessage", () => {
    it("should call axiosInstance.post with correct endpoint and data", async () => {
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      const form = { name: "Test User", email: "test@example.com", message: "Help" };
      const role = "mentor";

      await sendSupportMessage(form, role);

      expect(axiosInstance.post).toHaveBeenCalledWith("/support/messages", {
        ...form,
        role,
      });
    });

    it("should merge form data with role parameter", async () => {
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      const form = { name: "Test User", email: "test@example.com" };
      const role = "mentee";

      await sendSupportMessage(form, role);

      expect(axiosInstance.post).toHaveBeenCalledWith("/support/messages", {
        name: "Test User",
        email: "test@example.com",
        role: "mentee",
      });
    });
  });

  describe("sendAiChatMessage", () => {
    it("should call axiosInstance.post with correct endpoint and data", async () => {
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      const payload = {
        messages: [{ role: "user", content: "Hello" }],
        systemPrompt: "You are a helpful assistant",
      };

      await sendAiChatMessage(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith("/ai/chat", payload);
    });

    it("should pass messages and systemPrompt correctly", async () => {
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      const payload = {
        messages: [{ role: "user", content: "Test" }],
        systemPrompt: "Test prompt",
      };

      await sendAiChatMessage(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith("/ai/chat", {
        messages: [{ role: "user", content: "Test" }],
        systemPrompt: "Test prompt",
      });
    });
  });
});
