/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SharedDashboardPage from "./SharedDashboardPage";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getConnectDetail } from "@features/shared-dashboard/api/shared-dashboard.api";
import {
  setConnect,
  setActiveTab,
  resetSharedDashboard,
} from "@features/shared-dashboard/store/sharedDashboardSlice";
import { selectIsAuthenticated } from "@features/auth/store/authSlice";

// ── Mocks for every module SharedDashboardPage.jsx imports ──────────────────
vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@features/shared-dashboard/api/shared-dashboard.api", () => ({
  getConnectDetail: vi.fn(),
}));

vi.mock("@features/shared-dashboard/store/sharedDashboardSlice", () => ({
  setConnect: vi.fn((c) => ({ type: "dashboard/setConnect", payload: c })),
  setActiveTab: vi.fn((t) => ({ type: "dashboard/setActiveTab", payload: t })),
  resetSharedDashboard: vi.fn(() => ({
    type: "dashboard/resetSharedDashboard",
  })),
}));

vi.mock("@features/auth/store/authSlice", () => ({
  selectIsAuthenticated: vi.fn(),
}));

vi.mock("@lib/httpStatus", () => ({
  HTTP_STATUS: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
  },
}));

vi.mock("@features/shared-dashboard/components/SharedDashboardLayout", () => ({
  default: () => (
    <div data-testid="mock-dashboard-layout">Dashboard Main View Layout</div>
  ),
}));

describe("SharedDashboardPage", () => {
  let mockDispatch;
  let mockNavigate;
  let mockSearchParams;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDispatch = vi.fn().mockResolvedValue({ type: "mock/action" });
    useDispatch.mockReturnValue(mockDispatch);

    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    useParams.mockReturnValue({ connectRequestId: "conn-req-77" });

    mockSearchParams = new URLSearchParams();
    useSearchParams.mockReturnValue([mockSearchParams]);

    // Default: authenticated
    useSelector.mockImplementation((selectorFn) => {
      if (selectorFn === selectIsAuthenticated) return true;
      return null;
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────
  it("shows the loading spinner while the request is in flight", () => {
    getConnectDetail.mockReturnValue(new Promise(() => {})); // never resolves
    render(<SharedDashboardPage />);

    expect(screen.getByText("Loading session…")).toBeInTheDocument();
    expect(
      screen.queryByTestId("mock-dashboard-layout"),
    ).not.toBeInTheDocument();
  });

  // ── Unauthenticated guard ───────────────────────────────────────────────
  it("redirects to /login immediately when the user is not authenticated", async () => {
    useSelector.mockImplementation((selectorFn) => {
      if (selectorFn === selectIsAuthenticated) return false;
      return null;
    });

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
    expect(getConnectDetail).not.toHaveBeenCalled();
  });

  // ── Tab query-param sync ────────────────────────────────────────────────
  it("dispatches the tab from the URL when it is a valid tab", async () => {
    mockSearchParams.set("tab", "goals");
    getConnectDetail.mockResolvedValueOnce({
      data: { connect: { _id: "77" } },
    });

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setActiveTab("goals"));
      expect(screen.getByTestId("mock-dashboard-layout")).toBeInTheDocument();
    });
  });

  it("falls back to 'overview' when the URL tab param is invalid", async () => {
    mockSearchParams.set("tab", "MALFORMED_UNSUPPORTED_TAB");
    getConnectDetail.mockResolvedValueOnce({
      data: { connect: { _id: "77" } },
    });

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setActiveTab("overview"));
      expect(screen.getByTestId("mock-dashboard-layout")).toBeInTheDocument();
    });
  });

  it("falls back to 'overview' when there is no tab param at all", async () => {
    getConnectDetail.mockResolvedValueOnce({
      data: { connect: { _id: "77" } },
    });

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setActiveTab("overview"));
    });
  });

  // ── Successful fetch ────────────────────────────────────────────────────
  it("fetches connect details and dispatches setConnect on success", async () => {
    const mockPayload = {
      _id: "conn-req-77",
      status: "ongoing",
      title: "Active Track",
    };
    getConnectDetail.mockResolvedValueOnce({ data: { connect: mockPayload } });

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(getConnectDetail).toHaveBeenCalledWith("conn-req-77");
      expect(mockDispatch).toHaveBeenCalledWith(setConnect(mockPayload));
      expect(screen.getByTestId("mock-dashboard-layout")).toBeInTheDocument();
    });
  });

  // ── Error branches ──────────────────────────────────────────────────────
  it("navigates to /login on a 401 response", async () => {
    getConnectDetail.mockRejectedValueOnce({ response: { status: 401 } });

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("navigates back (-1) on a 403 response", async () => {
    getConnectDetail.mockRejectedValueOnce({ response: { status: 403 } });

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  it("shows the server-provided message for a generic error", async () => {
    getConnectDetail.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { message: "Database connection timeouts detected" },
      },
    });

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Database connection timeouts detected"),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("mock-dashboard-layout"),
    ).not.toBeInTheDocument();
  });

  it("shows a default message when the error has no response payload", async () => {
    getConnectDetail.mockRejectedValueOnce({ response: {} });

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load session.")).toBeInTheDocument();
    });

    const backBtn = screen.getByRole("button", { name: /Go back/i });
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("shows a default message when the error has no response object at all", async () => {
    getConnectDetail.mockRejectedValueOnce(new Error("network down"));

    render(<SharedDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load session.")).toBeInTheDocument();
    });
  });

  // ── Unmount cleanup ─────────────────────────────────────────────────────
  it("dispatches resetSharedDashboard on unmount", () => {
    getConnectDetail.mockResolvedValueOnce({
      data: { connect: { _id: "77" } },
    });
    const { unmount } = render(<SharedDashboardPage />);

    unmount();
    expect(mockDispatch).toHaveBeenCalledWith(resetSharedDashboard());
  });
});
