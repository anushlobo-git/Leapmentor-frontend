/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SharedDashboardPage from "./SharedDashboardPage";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import {
  setConnect,
  setActiveTab,
  resetSharedDashboard,
  selectConnect,
} from "@features/shared-dashboard/models/sharedDashboardSlice";

vi.mock("react-redux", () => ({ useDispatch: vi.fn(), useSelector: vi.fn() }));
vi.mock("react-router-dom", () => ({
  useLoaderData: vi.fn(),
  useNavigate: vi.fn(),
  useSearchParams: vi.fn(),
}));
vi.mock("@features/shared-dashboard/models/sharedDashboardSlice", () => ({
  setConnect: vi.fn((c) => ({ type: "dashboard/setConnect", payload: c })),
  setActiveTab: vi.fn((t) => ({ type: "dashboard/setActiveTab", payload: t })),
  resetSharedDashboard: vi.fn(() => ({ type: "dashboard/resetSharedDashboard" })),
  selectConnect: vi.fn(),
}));
vi.mock("@features/shared-dashboard/views/SharedDashboardLayout", () => ({
  default: () => <div data-testid="mock-dashboard-layout">Layout</div>,
}));

describe("SharedDashboardPage (loader-driven)", () => {
  let mockDispatch;
  let mockNavigate;
  let params;
  let connectInStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch = vi.fn();
    mockNavigate = vi.fn();
    params = new URLSearchParams();
    connectInStore = { _id: "77" };
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    useSearchParams.mockImplementation(() => [params]);
    useLoaderData.mockReturnValue({ connect: { _id: "77" }, error: null });
    useSelector.mockImplementation((sel) => (sel === selectConnect ? connectInStore : null));
  });

  it("mirrors loader data into Redux and renders the layout", () => {
    render(<SharedDashboardPage />);
    expect(mockDispatch).toHaveBeenCalledWith(setConnect({ _id: "77" }));
    expect(screen.getByTestId("mock-dashboard-layout")).toBeInTheDocument();
  });

  it("shows the spinner for the one frame before the store is populated", () => {
    connectInStore = null;
    render(<SharedDashboardPage />);
    expect(screen.getByText("Loading session…")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-dashboard-layout")).not.toBeInTheDocument();
  });

  it("renders the loader's error inline with a working Go back button", () => {
    useLoaderData.mockReturnValue({ connect: null, error: "Failed to load session." });
    connectInStore = null;
    render(<SharedDashboardPage />);
    expect(screen.getByText("Failed to load session.")).toBeInTheDocument();
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "dashboard/setConnect" }));
    fireEvent.click(screen.getByText("← Go back"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it.each([
    ["goals", "goals"],
    ["MALFORMED", "overview"],
    [null, "overview"],
  ])("tab param %s → active tab %s", (tab, expected) => {
    if (tab) params.set("tab", tab);
    render(<SharedDashboardPage />);
    expect(mockDispatch).toHaveBeenCalledWith(setActiveTab(expected));
  });

  it("resets the slice on unmount", () => {
    const { unmount } = render(<SharedDashboardPage />);
    mockDispatch.mockClear();
    unmount();
    expect(mockDispatch).toHaveBeenCalledWith(resetSharedDashboard());
  });
});
