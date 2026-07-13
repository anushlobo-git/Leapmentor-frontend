import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorHomeTab from "./MentorHomeTab";
import {
  getIncomingRequests,
  getMentorEarnings,
} from "@features/mentor/api/mentor.api";
import { useSelector, useDispatch } from "react-redux";
import logger from "@lib/logger";

// Mock API layer
vi.mock("@features/mentor/api/mentor.api", () => ({
  getIncomingRequests: vi.fn(),
  getMentorEarnings: vi.fn(),
}));

// Mock Redux
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

// Mock React Router
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

// Mock logger
vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

// Mock sub-components
vi.mock("@features/sessions/components/SessionCard", () => ({
  default: ({ request }) => (
    <div data-testid="session-card">{request.status}</div>
  ),
}));

vi.mock("@components/common/Loader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock("@features/support/components/LeapBuddy", () => ({
  default: ({ role }) => <div data-testid="leap-buddy">Buddy for {role}</div>,
}));

describe("MentorHomeTab component", () => {
  const mockDispatch = vi.fn();
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
    useDispatch.mockReturnValue(mockDispatch);
    // Setup default select values
    useSelector.mockImplementation((selector) => {
      if (selector.name === "selectDashboardUser") return mockUser;
      if (selector.name === "selectDashboardProfile") return mockProfile;
      return null;
    });
  });

  it("renders loader states initially and dispatches refetch on mount", async () => {
    getIncomingRequests.mockReturnValue(new Promise(() => {})); // pending
    getMentorEarnings.mockReturnValue(new Promise(() => {})); // pending

    render(<MentorHomeTab setActiveTab={mockSetActiveTab} />);

    expect(screen.getByText("Loading your dashboard...")).toBeInTheDocument();
    expect(screen.getAllByTestId("loader")).toHaveLength(2); // session and earnings loaders
    expect(mockDispatch).toHaveBeenCalled();
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

    useSelector.mockImplementation((selector) => {
      if (selector.name === "selectDashboardUser") return mockUser;
      if (selector.name === "selectDashboardProfile") return incompleteProfile;
      return null;
    });

    getIncomingRequests.mockResolvedValueOnce({ data: { requests: [] } });
    getMentorEarnings.mockResolvedValueOnce({ data: {} });

    render(<MentorHomeTab setActiveTab={mockSetActiveTab} />);

    await act(async () => {
      await Promise.resolve();
    });

    // 6 / 8 = 75%
    const profileBtn = screen.getByRole("button", { name: /75% Profile/i });
    expect(profileBtn).toBeInTheDocument();

    await user.click(profileBtn);
    expect(mockSetActiveTab).toHaveBeenCalledWith("profile");
  });

  it("renders zero profile completion if profile is null", async () => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === "selectDashboardUser") return mockUser;
      if (selector.name === "selectDashboardProfile") return null;
      return null;
    });

    getIncomingRequests.mockResolvedValueOnce({ data: { requests: [] } });
    getMentorEarnings.mockResolvedValueOnce({ data: {} });

    render(<MentorHomeTab setActiveTab={mockSetActiveTab} />);

    await act(async () => {
      await Promise.resolve();
    });

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

    render(<MentorHomeTab setActiveTab={mockSetActiveTab} />);

    await act(async () => {
      await Promise.resolve();
    });

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
    useSelector.mockImplementation((selector) => {
      if (selector.name === "selectDashboardUser") return mockUser;
      if (selector.name === "selectDashboardProfile") return freshProfile;
      return null;
    });

    getIncomingRequests.mockResolvedValueOnce({ data: { requests: [] } });
    getMentorEarnings.mockResolvedValueOnce({ data: {} });

    render(<MentorHomeTab setActiveTab={mockSetActiveTab} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("logs errors on requests and earnings API failure and sets fallback earnings values", async () => {
    getIncomingRequests.mockRejectedValueOnce(
      new Error("Requests fetch failed"),
    );
    getMentorEarnings.mockRejectedValueOnce(new Error("Earnings fetch failed"));

    render(<MentorHomeTab setActiveTab={mockSetActiveTab} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(logger.error).toHaveBeenCalledWith("MentorHomeTab sessions error:", {
      error: "Requests fetch failed",
    });
    expect(logger.error).toHaveBeenCalledWith("MentorHomeTab earnings error:", {
      error: "Earnings fetch failed",
    });

    expect(screen.getByText("No active sessions")).toBeInTheDocument();
    expect(screen.getByText("0.00 LP")).toBeInTheDocument(); // wallet balance fallback 0 LP is unique
  });

  it("handles missing user name or missing user profile key fallback branches", async () => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === "selectDashboardUser") return null;
      if (selector.name === "selectDashboardProfile") return mockProfile;
      return null;
    });

    getIncomingRequests.mockResolvedValueOnce({ data: {} }); // no requests key
    getMentorEarnings.mockResolvedValueOnce({
      data: {
        totalEarnings: 100,
        sessionsThisMonth: null, // trigger ?? 0 fallback
        pendingPayout: 10,
        walletBalance: 90,
      },
    });

    render(<MentorHomeTab setActiveTab={mockSetActiveTab} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Welcome, there! 👋")).toBeInTheDocument();
  });

  it("handles singular session text for active sessions count", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: {
        requests: [{ _id: "r1", status: "ongoing" }],
      },
    });

    getMentorEarnings.mockResolvedValueOnce({ data: {} });

    render(<MentorHomeTab setActiveTab={mockSetActiveTab} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("You have 1 active session.")).toBeInTheDocument();
  });
});
