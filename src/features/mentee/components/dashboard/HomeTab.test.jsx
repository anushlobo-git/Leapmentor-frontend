import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import HomeTab from "./HomeTab";
import {
  selectDashboardUser,
  selectDashboardProfile,
} from "@features/profile/store/dashboardUserSlice";
import {
  useHomeData,
  calculateProfileCompletion,
} from "@features/mentee/hooks/useHomeData";

// Mock React Router DOM navigation hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock Redux selectors configuration state triggers
let mockUser = { name: "John Doe", isFirstLogin: false };
let mockProfile = { skills: ["React"] };

vi.mock("react-redux", () => ({
  useSelector: vi.fn((selectorFn) => {
    if (selectorFn === selectDashboardUser) return mockUser;
    if (selectorFn === selectDashboardProfile) return mockProfile;
    return null;
  }),
}));

vi.mock("@features/profile/store/dashboardUserSlice", () => ({
  selectDashboardUser: vi.fn(),
  selectDashboardProfile: vi.fn(),
}));

// Mock dynamic domain hook operations
vi.mock("@features/mentee/hooks/useHomeData", () => ({
  useHomeData: vi.fn(),
  calculateProfileCompletion: vi.fn(),
}));

// Mock external companion components using exact path aliases
vi.mock("@features/sessions/components/SessionCard", () => ({
  default: ({ request, size }) => (
    <div data-testid="mock-session-card" data-size={size}>
      Session: {request._id}
    </div>
  ),
}));

vi.mock("@components/common/Loader", () => ({
  default: ({ minHeight }) => (
    <div data-testid="mock-loader" style={{ height: minHeight }}>
      Loading Spinner
    </div>
  ),
}));

vi.mock(
  "@features/mentee/components/dashboard/findMentors/MentorProfileModal",
  () => ({
    default: ({ mentor, onClose }) => (
      <div data-testid="mock-mentor-modal">
        <h3>Modal Title: {mentor.name}</h3>
        <button onClick={onClose}>Close Profile Modal</button>
      </div>
    ),
  }),
);

vi.mock("@features/support/components/LeapBuddy", () => ({
  default: () => <div data-testid="mock-leap-buddy">Leap Buddy Assistant</div>,
}));

vi.mock("@features/mentee/components/dashboard/HomeMentorCard", () => ({
  default: ({ mentor, onViewProfile }) => (
    <div data-testid="mock-mentor-card">
      <p>Mentor: {mentor.name}</p>
      <button onClick={() => onViewProfile(mentor)}>View Profile Action</button>
    </div>
  ),
}));

vi.mock("@features/mentee/components/dashboard/LeapPointsPanel", () => ({
  default: ({ balance }) => (
    <div data-testid="mock-points-panel">Points Balance: {balance}</div>
  ),
}));

describe("HomeTab", () => {
  let dispatchEventSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatchEventSpy = vi.spyOn(globalThis, "dispatchEvent");

    // Re-establish defaults across shared variables
    mockUser = { name: "John Doe", isFirstLogin: false };
    mockProfile = { skills: ["React"] };
    calculateProfileCompletion.mockReturnValue(75);
    useHomeData.mockReturnValue({
      mentors: [{ _id: "m1", name: "Clara Oswald" }],
      sessions: [{ _id: "s1" }, { _id: "s2" }],
      loading: false,
      balance: 150,
    });
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
  });

  it("should render welcome greetings, populated details, and partial profile status indicators (Happy Path)", () => {
    render(<HomeTab />);

    // Asserts non-first login greeting layout variant string match configuration
    expect(screen.getByText("Welcome , John! 👋")).toBeInTheDocument();
    expect(screen.getByText("You have 2 active sessions.")).toBeInTheDocument();

    // Asserts active skill context subtext compilation
    expect(screen.getByText("React")).toBeInTheDocument();

    // Check presentational list component generation matches array data payload length
    expect(screen.getAllByTestId("mock-session-card").length).toBe(2);
    expect(screen.getByTestId("mock-mentor-card")).toBeInTheDocument();
    expect(screen.getByText("Points Balance: 150")).toBeInTheDocument();

    // Verify progress tracking layout displays context calculations
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("should format greetings correctly for first-time login sessions and handle unpopulated usernames", () => {
    mockUser = { name: null, isFirstLogin: true };
    useHomeData.mockReturnValue({
      mentors: [],
      sessions: [],
      loading: false,
      balance: 0,
    });

    render(<HomeTab />);

    // Asserts reliance on 'there' default text parameters and checks alternative welcome spacing branch structure
    expect(screen.getByText("Welcome, there! 👋")).toBeInTheDocument();
    expect(
      screen.getByText("No active sessions yet. Find a mentor to get started!"),
    ).toBeInTheDocument();
  });

  it("should hide the profile completion status button completely when percentage hits absolute limit thresholds", () => {
    calculateProfileCompletion.mockReturnValue(100);
    render(<HomeTab />);

    expect(
      screen.queryByLabelText("Go to profile completion"),
    ).not.toBeInTheDocument();
  });

  it("should omit skill descriptive subtitles if profile skillset listing arrays are left empty", () => {
    mockProfile = { skills: [] };
    render(<HomeTab />);

    expect(screen.queryByText(/Based on your skill:/i)).not.toBeInTheDocument();
  });

  it("should display placeholder loader graphics while background sync processes evaluate to true", () => {
    useHomeData.mockReturnValue({
      mentors: [],
      sessions: [],
      loading: true,
      balance: 0,
    });
    render(<HomeTab />);

    expect(screen.getAllByTestId("mock-loader").length).toBe(2);
    expect(screen.queryByTestId("mock-mentor-card")).not.toBeInTheDocument();
  });

  it("should generate proper structural fallback layouts when recommended mentors lists are empty", () => {
    useHomeData.mockReturnValue({
      mentors: [],
      sessions: [],
      loading: false,
      balance: 10,
    });
    render(<HomeTab />);

    expect(
      screen.getByText("No mentor recommendations yet."),
    ).toBeInTheDocument();

    const browseAllMentorsButton = screen.getByRole("button", {
      name: "Browse all mentors →",
    });
    fireEvent.click(browseAllMentorsButton);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    const eventObject = dispatchEventSpy.mock.calls[0][0];
    expect(eventObject.type).toBe("setDashboardTab");
    expect(eventObject.detail).toBe("findMentors");
  });

  it("should render single format string labels cleanly when session array balance length matches parity boundary rules", () => {
    useHomeData.mockReturnValue({
      mentors: [],
      sessions: [{ _id: "single-session" }],
      loading: false,
      balance: 0,
    });

    render(<HomeTab />);
    // Checks that suffix transforms plural labels cleanly into absolute singular text
    expect(screen.getByText("You have 1 active session.")).toBeInTheDocument();
  });

  it("should spawn modal detail drawers on command and remove them safely upon processing close actions", () => {
    render(<HomeTab />);

    const openProfileButton = screen.getByRole("button", {
      name: "View Profile Action",
    });
    fireEvent.click(openProfileButton);

    expect(screen.getByTestId("mock-mentor-modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Title: Clara Oswald")).toBeInTheDocument();

    const closeModalButton = screen.getByRole("button", {
      name: "Close Profile Modal",
    });
    fireEvent.click(closeModalButton);

    expect(screen.queryByTestId("mock-mentor-modal")).not.toBeInTheDocument();
  });

  it("should fire tab modification context updates when individual header navigation buttons are clicked", () => {
    render(<HomeTab />);

    // Trigger View All click transaction
    const viewAllButton = screen.getByRole("button", { name: "View all" });
    fireEvent.click(viewAllButton);
    expect(dispatchEventSpy.mock.calls[0][0].detail).toBe("findMentors");

    // Trigger Progress Pill click transaction
    const progressPillButton = screen.getByLabelText(
      "Go to profile completion",
    );
    fireEvent.click(progressPillButton);
    expect(dispatchEventSpy.mock.calls[1][0].detail).toBe("profile");
  });
});
