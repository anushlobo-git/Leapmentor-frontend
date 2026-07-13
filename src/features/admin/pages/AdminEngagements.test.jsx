/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminEngagements from "@features/admin/pages/AdminEngagements";
import {
  getEngagementStats,
  getEngagements,
} from "@features/admin/api/admin.api";

// ── Dependency Mocks ──────────────────────────────────────────
vi.mock("@features/admin/components/AdminLayout", () => ({
  default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock("@features/admin/components/common/StatCard", () => ({
  default: ({ label, value }) => (
    <div data-testid="stat-card">
      <span>{label}</span>: <span>{value}</span>
    </div>
  ),
}));

vi.mock("@features/admin/components/common/StatusBadge", () => ({
  default: ({ status }) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock("@features/admin/api/admin.api", () => ({
  getEngagementStats: vi.fn(),
  getEngagements: vi.fn(),
}));

// ── Test Mock Fixtures ────────────────────────────────────────
const mockStats = {
  total: 25,
  pending: 5,
  ongoing: 10,
  completed: 8,
  rejected: 2,
};

const mockEngagements = [
  {
    _id: "eng-1",
    mentor: { name: "Alex Mentor", email: "alex@leapmentor.com" },
    mentee: { name: "John Mentee", email: "john@leapmentor.com" },
    status: "ongoing",
    paymentStatus: "paid",
    requestedAt: "2026-07-05T10:00:00.000Z",
    sessionRate: 500,
    sessionCount: 4,
    selectedSlots: [
      {
        date: "2026-07-12",
        startTime: "10:00",
        endTime: "11:00",
        status: "confirmed",
      },
    ],
  },
];

describe("AdminEngagements Feature Dashboard Specification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setupTestContext = (component = <AdminEngagements />) => {
    return render(component);
  };

  it("should render placeholder pulse layout skeletons while initializing network streams", async () => {
    getEngagementStats.mockResolvedValueOnce({ data: mockStats });
    getEngagements.mockReturnValue(new Promise(() => {})); // Never resolves to preserve loading UI

    setupTestContext();

    expect(
      screen.getByText(/Track all mentorship sessions/i),
    ).toBeInTheDocument();
    const tables = screen.getAllByRole("table");
    expect(tables.length).toBeGreaterThan(0);
  });

  it("should paint key performance metric values and populate structural tabular log entries", async () => {
    getEngagementStats.mockResolvedValueOnce({ data: mockStats });
    getEngagements.mockResolvedValueOnce({
      data: {
        engagements: mockEngagements,
        pagination: { total: 1, page: 1, totalPages: 1 },
      },
    });

    setupTestContext();

    // Verify aggregate matrix components loading values
    expect(await screen.findByText("Total")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Ongoing")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // Check row entries mapping
    expect(screen.getByText("Alex Mentor")).toBeInTheDocument();
    expect(screen.getByText("john@leapmentor.com")).toBeInTheDocument();
  });

  it("should execute debounced search iterations following textual filter mutations", async () => {
    getEngagementStats.mockResolvedValueOnce({ data: mockStats });
    getEngagements.mockResolvedValue({
      data: {
        engagements: [],
        pagination: { total: 0, page: 1, totalPages: 1 },
      },
    });

    setupTestContext();

    const searchInput = await screen.findByPlaceholderText(
      /Search mentor or mentee\.\.\./i,
    );
    fireEvent.change(searchInput, { target: { value: "Sophia" } });

    await waitFor(() => {
      expect(getEngagements).toHaveBeenCalled();
    });
    expect(getEngagements).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 }),
    );
  });

  it("should isolate item focus paths and render custom detail blocks following expansion toggle clicks", async () => {
    getEngagementStats.mockResolvedValueOnce({ data: mockStats });
    getEngagements.mockResolvedValueOnce({
      data: {
        engagements: mockEngagements,
        pagination: { total: 1, page: 1, totalPages: 1 },
      },
    });

    setupTestContext();

    const targetRow = await screen.findByText("Alex Mentor");

    // Expand row panel components
    fireEvent.click(targetRow);

    expect(screen.getByText(/Proposed Slots/i)).toBeInTheDocument();
    expect(screen.getByText(/Session Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Rate \/ Session/i)).toBeInTheDocument();
    expect(screen.getByText("₹500")).toBeInTheDocument();

    // Collapse row panel components back down
    fireEvent.click(targetRow);
    expect(screen.queryByText(/Proposed Slots/i)).not.toBeInTheDocument();
  });

  it("should support status and date filtering plus empty state rendering", async () => {
    getEngagementStats.mockResolvedValueOnce({ data: mockStats });
    getEngagements.mockResolvedValueOnce({
      data: {
        engagements: [],
        pagination: { total: 0, page: 1, totalPages: 1 },
      },
    });

    const { container } = setupTestContext();

    expect(
      await screen.findByText(/No engagements found/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /pending/i }));

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: "2026-07-01" } });
    fireEvent.change(dateInputs[1], { target: { value: "2026-07-31" } });

    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
  });

  it("should render pagination controls and request the next page", async () => {
    getEngagementStats.mockResolvedValueOnce({ data: mockStats });
    getEngagements
      .mockResolvedValueOnce({
        data: {
          engagements: mockEngagements,
          pagination: { total: 2, page: 1, totalPages: 2 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          engagements: [],
          pagination: { total: 2, page: 2, totalPages: 2 },
        },
      });

    setupTestContext();

    fireEvent.click(await screen.findByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(getEngagements).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2, limit: 15 }),
      );
    });
  });

  it("should initialize clean toast alerts gracefully when network promises reject", async () => {
    getEngagementStats.mockRejectedValueOnce(new Error("Stats crash"));
    getEngagements.mockRejectedValueOnce(new Error("List crash"));

    setupTestContext();

    expect(
      await screen.findByText("Failed to load engagements."),
    ).toBeInTheDocument();
  });
});
