/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/support/api/support.api.js
import axiosInstance from "@lib/axiosInstance";

export const sendSupportMessage = (form, role) =>
  axiosInstance.post("/support/messages", { ...form, role });

export const sendAiChatMessage = ({ messages, systemPrompt }) =>
  axiosInstance.post("/ai/chat", { messages, systemPrompt });
