import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ConnectsTab from "./ConnectsTab";
import useOngoingConnects from "@features/connects/hooks/useOngoingConnects";

// Mock React Router DOM navigation hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock custom domain hook using path alias
vi.mock("@features/connects/hooks/useOngoingConnects", () => ({
  default: vi.fn(),
}));

// Mock ConnectsLayout subcomponent to inspect arguments cleanly
vi.mock("@features/connects/components/ConnectsLayout", () => ({
  default: ({
    title,
    subtitle,
    count,
    loading,
    error,
    completedCount,
    emptyState,
    completedChildren,
    children,
  }) => (
    <div data-testid="connects-layout">
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
      <span>Ongoing Count: {count}</span>
      <span>Completed Count: {completedCount}</span>
      {loading && <div>Loading Shield Active</div>}
      {error && <div>Error: {error}</div>}
      {emptyState && (
        <div data-testid="layout-empty-state">
          <p>{emptyState.message}</p>
          <p>{emptyState.subMessage}</p>
          {emptyState.actionLabel && (
            <button onClick={emptyState.onAction}>
              {emptyState.actionLabel}
            </button>
          )}
        </div>
      )}
      <div data-testid="ongoing-container">{children}</div>
      <div data-testid="completed-container">{completedChildren}</div>
    </div>
  ),
}));

// Mock ConnectCard subcomponent to evaluate mapping structures
vi.mock("@features/connects/components/ConnectCard", () => ({
  default: ({ name, tokenLabel, isCompleted, onDashboardClick }) => (
    <div
      data-testid="connect-card"
      className={isCompleted ? "completed" : "ongoing"}
    >
      <h3>{name}</h3>
      <p>{tokenLabel}</p>
      <button onClick={onDashboardClick}>Dashboard Link Action</button>
    </div>
  ),
}));

describe("ConnectsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render mentee role structure layout and map active ongoing sessions completely (Happy Path)", () => {
    useOngoingConnects.mockReturnValue({
      ongoing: [
        {
          _id: "conn-101",
          totalAmount: 300,
          mentor: { name: "Dr. Clara Oswald" },
          mentorProfile: { bio: "Quantum Physics Mentor" },
        },
      ],
      completed: [],
      loading: false,
      error: null,
    });

    render(<ConnectsTab role="mentee" />);

    expect(screen.getByText("Dr. Clara Oswald")).toBeInTheDocument();
    expect(screen.getByText("300 tokens in escrow")).toBeInTheDocument();
    expect(screen.getByText("Ongoing Count: 1")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage your ongoing mentorship sessions and review progress.",
      ),
    ).toBeInTheDocument();
  });

  it("should render mentor role structure layout and process completed connection card mappings safely", () => {
    useOngoingConnects.mockReturnValue({
      ongoing: [],
      completed: [
        {
          _id: "conn-202",
          totalAmount: 450,
          mentee: { name: "Danny Pink" },
          menteeProfile: { level: "Beginner" },
        },
      ],
      loading: false,
      error: null,
    });

    render(<ConnectsTab role="mentor" />);

    expect(screen.getByText("Danny Pink")).toBeInTheDocument();
    expect(screen.getByText("450 tokens received")).toBeInTheDocument();
    expect(screen.getByText("Completed Count: 1")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage your ongoing mentee sessions and track their progress.",
      ),
    ).toBeInTheDocument();
  });

  it("should fall back to default type structural string labels if counterpart name field evaluates to missing/null", () => {
    // 1. Test Mentee fallback role target mappings explicitly
    useOngoingConnects.mockReturnValue({
      ongoing: [
        {
          _id: "conn-303",
          totalAmount: 100,
          mentor: null,
          mentorProfile: null,
        },
      ],
      completed: [],
      loading: false,
      error: null,
    });

    const { rerender } = render(<ConnectsTab role="mentee" />);
    expect(screen.getByText("Mentor")).toBeInTheDocument();

    // 2. Test Mentor fallback role target mappings explicitly
    useOngoingConnects.mockReturnValue({
      ongoing: [
        {
          _id: "conn-304",
          totalAmount: 200,
          mentee: { name: "" },
          menteeProfile: null,
        },
      ],
      completed: [],
      loading: false,
      error: null,
    });

    rerender(<ConnectsTab role="mentor" />);
    expect(screen.getByText("Mentee")).toBeInTheDocument();
  });

  it("should invoke navigation parameters upon dashboard navigation interaction click commands", () => {
    useOngoingConnects.mockReturnValue({
      ongoing: [
        {
          _id: "target-session-999",
          totalAmount: 50,
          mentor: { name: "Jack Harkness" },
        },
      ],
      completed: [],
      loading: false,
      error: null,
    });

    render(<ConnectsTab role="mentee" />);

    const dashboardButton = screen.getByRole("button", {
      name: "Dashboard Link Action",
    });
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      "/shared-dashboard/target-session-999",
    );
  });

  it("should pass loading and error states down to the layout container cleanly", () => {
    useOngoingConnects.mockReturnValue({
      ongoing: [],
      completed: [],
      loading: true,
      error: "Timeout Connection Error Exception",
    });

    render(<ConnectsTab role="mentee" />);

    expect(screen.getByText("Loading Shield Active")).toBeInTheDocument();
    expect(
      screen.getByText("Error: Timeout Connection Error Exception"),
    ).toBeInTheDocument();
  });

  it("should fire global dashboard tab switching events when trigger action buttons inside mentee empty states are clicked", () => {
    useOngoingConnects.mockReturnValue({
      ongoing: [],
      completed: [],
      loading: false,
      error: null,
    });

    const dispatchEventSpy = vi.spyOn(globalThis, "dispatchEvent");

    render(<ConnectsTab role="mentee" />);

    const searchActionButton = screen.getByRole("button", {
      name: "Find Mentors",
    });
    expect(searchActionButton).toBeInTheDocument();

    fireEvent.click(searchActionButton);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    const interceptedEvent = dispatchEventSpy.mock.calls[0][0];
    expect(interceptedEvent.type).toBe("setDashboardTab");
    expect(interceptedEvent.detail).toBe("findMentors");

    dispatchEventSpy.mockRestore();
  });
});
