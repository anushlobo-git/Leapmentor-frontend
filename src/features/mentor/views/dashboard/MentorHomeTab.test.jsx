import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorHomeTab from "./MentorHomeTab";
import {
  getIncomingRequests,
  getMentorEarnings,
} from "@features/mentor/models/mentor.api";
import axiosInstance from "@lib/http/axiosInstance";
import dashboardUserReducer from "@features/profile/models/dashboardUserSlice";
import { makeTestStore, renderWithStore } from "@test/renderWithStore";
import logger from "@lib/monitoring/logger";

// Mock API layer
vi.mock("@features/mentor/models/mentor.api", () => ({
  getIncomingRequests: vi.fn(),
  getMentorEarnings: vi.fn(),
}));

// Real Redux store (connectRequests + dashboardUser slices); only the network is mocked.
// The profile refetch thunk hits axios — keep it pending so it never overwrites the seeded profile.
vi.mock("@lib/http/axiosInstance", () => ({
  default: { get: vi.fn(() => new Promise(() => {})) },
}));

// Mock React Router
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

// Mock logger
vi.mock("@lib/monitoring/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock sub-components
vi.mock("@features/sessions/views/SessionCard", () => ({
  default: ({ request }) => (
    <div data-testid="session-card">{request.status}</div>
  ),
}));

vi.mock("@components/shared/Loader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock("@features/support/views/LeapBuddy", () => ({
  default: ({ role }) => <div data-testid="leap-buddy">Buddy for {role}</div>,
}));

describe("MentorHomeTab component", () => {
  let dash = { user: null, profile: null };
  const setDash = (user, profile) => { dash = { user, profile }; };
  const renderTab = () =>
    renderWithStore(
      <MentorHomeTab setActiveTab={mockSetActiveTab} />,
      makeTestStore({ dashboardUser: dashboardUserReducer }, { dashboardUser: dash }),
    );
  const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  const mockSetActiveTab = vi.fn();

  const mockUser = { name: "Jane Smith" };
  const mockProfile = {
    currentRole: "Lead UX Designers",
    bio: "Passionate designer",
    company: "Google",
    industry: "Tech",
    profilePicture: "profile.png",
    skills: ["Figma", "UI Design"],
    linkedInUrl: "https://linkedin.com",
    yearsOfExperience: 8,
    avgRating: 4.8,
    totalSessions: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setDash(mockUser, mockProfile);
  });

  it("renders loader states initially and dispatches refetch on mount", async () => {
    getIncomingRequests.mockReturnValue(new Promise(() => {})); // pending
    getMentorEarnings.mockReturnValue(new Promise(() => {})); // pending

    renderTab();

    expect(screen.getByText("Loading your dashboard...")).toBeInTheDocument();
    expect(screen.getAllByTestId("loader")).toHaveLength(2); // session and earnings loaders
    expect(axiosInstance.get).toHaveBeenCalledWith("/mentor-profile/me");
  });

  it("calculates profile completion and handles navigate to profile tab if clicked", async () => {
    const user = userEvent.setup();
    // 6 out of 8 fields populated (missing company and profilePicture)
    const incompleteProfile = {
      currentRole: "Engineer",
      bio: "Mentoring test",
      company: "",
      industry: "IT",
      profilePicture: "",
      skills: ["React"],
      linkedInUrl: "some-url",
      yearsOfExperience: 3,
    };

    setDash(mockUser, incompleteProfile);

    getIncomingRequests.mockResolvedValueOnce({ data: { requests: [] } });
    getMentorEarnings.mockResolvedValueOnce({ data: {} });

    renderTab();

    await flush();

    // 6 / 8 = 75%
    const profileBtn = screen.getByRole("button", { name: /75% Profile/i });
    expect(profileBtn).toBeInTheDocument();

    await user.click(profileBtn);
    expect(mockSetActiveTab).toHaveBeenCalledWith("profile");
  });

  it("renders zero profile completion if profile is null", async () => {
    setDash(mockUser, null);

    getIncomingRequests.mockResolvedValueOnce({ data: { requests: [] } });
    getMentorEarnings.mockResolvedValueOnce({ data: {} });

    renderTab();

    await flush();

    expect(
      screen.getByRole("button", { name: /0% Profile/i }),
    ).toBeInTheDocument();
  });

  it("handles loading sessions and earnings data successfully and counts stats", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: {
        requests: [
          { _id: "r1", status: "ongoing" },
          { _id: "r2", status: "accepted" },
          { _id: "r3", status: "pending" },
          { _id: "r4", status: "completed" },
        ],
      },
    });

    getMentorEarnings.mockResolvedValueOnce({
      data: {
        totalEarnings: 1200,
        sessionsThisMonth: 3,
        pendingPayout: 150,
        walletBalance: 850,
      },
    });

    renderTab();

    await flush();

    // 2 active session cards
    expect(screen.getAllByTestId("session-card")).toHaveLength(2);
    expect(screen.getByText("You have 2 active sessions.")).toBeInTheDocument();

    // Stats checks
    expect(screen.getByText("3")).toBeInTheDocument(); // total completed (1) + active ongoing (2) sessions = 3
    expect(screen.getByText("4.8")).toBeInTheDocument(); // avgRating 4.8
    expect(screen.getByText("1")).toBeInTheDocument(); // pending count
    expect(screen.getByText("850.00 LP")).toBeInTheDocument(); // wallet balance

    // Earnings check
    expect(screen.getByText("1,200.00")).toBeInTheDocument();
    expect(screen.getByText("150.00")).toBeInTheDocument();
    expect(screen.getByText("850.00")).toBeInTheDocument();
  });

  it("handles avgRating fallback when rating is 0 or less", async () => {
    const freshProfile = { ...mockProfile, avgRating: 0 };
    setDash(mockUser, freshProfile);

    getIncomingRequests.mockResolvedValueOnce({ data: { requests: [] } });
    getMentorEarnings.mockResolvedValueOnce({ data: {} });

    renderTab();

    await flush();

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("logs errors on requests and earnings API failure and sets fallback earnings values", async () => {
    getIncomingRequests.mockRejectedValueOnce(
      new Error("Requests fetch failed"),
    );
    getMentorEarnings.mockRejectedValueOnce(new Error("Earnings fetch failed"));

    renderTab();

    await flush();

    // request failures are now logged once by connectRequestsSlice's thunk
    expect(logger.warn).toHaveBeenCalledWith("Failed to fetch incoming mentor requests", {
      error: "Requests fetch failed",
    });
    expect(logger.error).toHaveBeenCalledWith("MentorHomeTab earnings error:", {
      error: "Earnings fetch failed",
    });

    expect(screen.getByText("No active sessions")).toBeInTheDocument();
    expect(screen.getByText("0.00 LP")).toBeInTheDocument(); // wallet balance fallback 0 LP is unique
  });

  it("handles missing user name or missing user profile key fallback branches", async () => {
    setDash(null, mockProfile);

    getIncomingRequests.mockResolvedValueOnce({ data: {} }); // no requests key
    getMentorEarnings.mockResolvedValueOnce({
      data: {
        totalEarnings: 100,
        sessionsThisMonth: null, // trigger ?? 0 fallback
        pendingPayout: 10,
        walletBalance: 90,
      },
    });

    renderTab();

    await flush();

    expect(screen.getByText("Welcome, there! 👋")).toBeInTheDocument();
  });

  it("handles singular session text for active sessions count", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: {
        requests: [{ _id: "r1", status: "ongoing" }],
      },
    });

    getMentorEarnings.mockResolvedValueOnce({ data: {} });

    renderTab();

    await flush();

    expect(screen.getByText("You have 1 active session.")).toBeInTheDocument();
  });
});
