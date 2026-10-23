/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/support/api/support.api.js
import axiosInstance from "@lib/http/axiosInstance";

export const sendSupportMessage = (
  form: { email: string; subject: string; message: string },
  role: string,
) =>
  axiosInstance.post("/support/messages", { ...form, role });

export const sendAiChatMessage = ({
  messages,
  systemPrompt,
}: {
  messages: { role: string; content: string }[];
  systemPrompt: string;
}) =>
  axiosInstance.post("/ai/chat", { messages, systemPrompt });
