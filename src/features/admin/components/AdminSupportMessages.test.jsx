/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminSupportMessages from "@features/admin/components/AdminSupportMessages";
import {
  getSupportMessages,
  resolveSupportMessage,
} from "@features/admin/api/admin.api";

// ── Mock Test Fixtures / Builders ─────────────────────────────
const mockMessagesData = [
  {
    _id: "msg-open",
    role: "mentor",
    subject: "Login issue",
    email: "mentor@example.com",
    createdAt: "2026-07-01T12:00:00.000Z",
    status: "open",
    message: "I cannot log in to the dashboard.",
  },
  {
    _id: "msg-resolved",
    role: "mentee",
    subject: "Payment query",
    email: "mentee@example.com",
    createdAt: "2026-07-02T12:00:00.000Z",
    status: "resolved",
    message: "My wallet top-up did not reflect.",
  },
];

vi.mock("@features/admin/api/admin.api", () => ({
  getSupportMessages: vi.fn(),
  resolveSupportMessage: vi.fn(),
}));

describe("AdminSupportMessages Component Specification", () => {
  let originalAlert;

  beforeEach(() => {
    vi.clearAllMocks();
    originalAlert = globalThis.alert;
    globalThis.alert = vi.fn();
  });

  afterEach(() => {
    globalThis.alert = originalAlert;
  });

  const setupTestContext = (component = <AdminSupportMessages />) => {
    return {
      user: userEvent.setup(),
      ...render(component),
    };
  };

  it("should display a loading state and surface a retry button upon network failure", async () => {
    getSupportMessages
      .mockRejectedValueOnce(new Error("Network failure"))
      .mockResolvedValueOnce({ data: { data: [] } });

    const { user } = setupTestContext();

    expect(screen.getByText(/Loading messages.../i)).toBeInTheDocument();
    expect(await screen.findByText(/Network failure/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /Retry/i });
    await user.click(retryBtn);

    expect(await screen.findByText(/No messages yet./i)).toBeInTheDocument();
    expect(getSupportMessages).toHaveBeenCalledTimes(2);
  });

  it("should render an empty state UI and cycle view models across status filters", async () => {
    getSupportMessages.mockResolvedValueOnce({ data: { data: [] } });

    const { user } = setupTestContext();

    expect(screen.getByText(/Loading messages.../i)).toBeInTheDocument();
    expect(await screen.findByText(/No messages yet./i)).toBeInTheDocument();

    const openFilterBtn = screen.getByRole("button", { name: /^Open$/i });
    await user.click(openFilterBtn);
    expect(screen.getByText(/No open messages yet./i)).toBeInTheDocument();

    const resolvedFilterBtn = screen.getByRole("button", {
      name: /^Resolved$/i,
    });
    await user.click(resolvedFilterBtn);
    expect(screen.getByText(/No resolved messages yet./i)).toBeInTheDocument();
  });

  it("should load message logs, expand item descriptions, and transition open states to resolved status", async () => {
    getSupportMessages.mockResolvedValueOnce({
      data: { data: mockMessagesData },
    });
    resolveSupportMessage.mockResolvedValueOnce({});

    const { user } = setupTestContext();

    expect(await screen.findByText(/Login issue/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment query/i)).toBeInTheDocument();

    // Locates the interactive accessible button row container node
    const openCard = screen.getByRole("button", { name: /Login issue/i });
    await user.click(openCard);

    expect(
      await screen.findByText(/I cannot log in to the dashboard\./i),
    ).toBeInTheDocument();

    const messagePanel = within(openCard.parentElement);
    const resolveButton = messagePanel.getByRole("button", {
      name: /Mark as Resolved/i,
    });
    await user.click(resolveButton);

    await waitFor(() => {
      expect(resolveSupportMessage).toHaveBeenCalledWith("msg-open");
    });

    expect(await messagePanel.findByText(/^Resolved$/i)).toBeInTheDocument();
  });

  it("should trigger a fallback alert message notification if data mutation fails", async () => {
    getSupportMessages.mockResolvedValueOnce({
      data: { data: [mockMessagesData[0]] },
    });
    resolveSupportMessage.mockRejectedValueOnce(new Error("Update failed"));

    const { user } = setupTestContext();

    await screen.findByText(/Login issue/i);

    const openCard = screen.getByRole("button", { name: /Login issue/i });
    await user.click(openCard);

    const resolveButton = await screen.findByRole("button", {
      name: /Mark as Resolved/i,
    });
    await user.click(resolveButton);

    await waitFor(() => {
      expect(resolveSupportMessage).toHaveBeenCalledWith("msg-open");
    });
    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith("Failed to update status");
    });
  });
});
