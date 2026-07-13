import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FindMentorsTab from "./FindMentorsTab";
import useMentorSearch from "@features/mentee/hooks/useMentorSearch";
import { getPlatformCommissionRate } from "@features/connects/api/escrow.api";

// Mock custom hook
vi.mock("@features/mentee/hooks/useMentorSearch", () => ({
  default: vi.fn(),
}));

// Mock API calls
vi.mock("@features/connects/api/escrow.api", () => ({
  getPlatformCommissionRate: vi.fn(),
}));

// Mock sub-components
vi.mock("@features/mentee/components/dashboard/findMentors/SearchBar", () => ({
  default: ({ skill, setSkill }) => (
    <div data-testid="search-bar">
      SearchBar: {skill}
      <button onClick={() => setSkill("React")}>Set Skill</button>
    </div>
  ),
}));

vi.mock(
  "@features/mentee/components/dashboard/findMentors/FilterPanel",
  () => ({
    default: () => <div data-testid="filter-panel">FilterPanel</div>,
  }),
);

vi.mock("@features/mentee/components/dashboard/findMentors/MentorGrid", () => ({
  default: ({ mentors, onViewProfile }) => (
    <div data-testid="mentor-grid">
      MentorGrid: {mentors.length} mentors
      {mentors.map((m) => (
        <button key={m._id} onClick={() => onViewProfile(m)}>
          View {m.user.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock(
  "@features/mentee/components/dashboard/findMentors/MentorProfileModal",
  () => ({
    default: ({ mentor, onClose }) => (
      <div data-testid="mentor-profile-modal">
        Profile of {mentor.user.name}
        <button onClick={onClose}>Close Profile</button>
      </div>
    ),
  }),
);

describe("FindMentorsTab", () => {
  const mockMentorSearchState = {
    skill: "",
    filters: {},
    mentors: [{ _id: "m1", user: { name: "Alice" } }],
    loading: false,
    loadingMore: false,
    error: null,
    hasSearched: true,
    hasMore: false,
    totalCount: 1,
    setSkill: vi.fn(),
    updateFilter: vi.fn(),
    resetFilters: vi.fn(),
    loadMore: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useMentorSearch.mockReturnValue(mockMentorSearchState);
    getPlatformCommissionRate.mockResolvedValue({ commissionRate: 10 });
  });

  it("renders header, commission rate, and sub-components", async () => {
    render(<FindMentorsTab />);

    expect(screen.getByText("Find Mentors")).toBeInTheDocument();
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("filter-panel")).toBeInTheDocument();
    expect(screen.getByTestId("mentor-grid")).toBeInTheDocument();

    // Check platform commission rate renders after resolve
    expect(await screen.findByText("10")).toBeInTheDocument();
  });

  it("handles platform commission rate fetch error gracefully", async () => {
    getPlatformCommissionRate.mockRejectedValueOnce(new Error("API Error"));
    render(<FindMentorsTab />);

    await waitFor(() => {
      // Shimmer loading card should be gone, but no value should display
      expect(screen.queryByText("10")).not.toBeInTheDocument();
    });
  });

  it("displays error message if present in useMentorSearch state", () => {
    useMentorSearch.mockReturnValueOnce({
      ...mockMentorSearchState,
      error: "Something went wrong searching",
    });

    render(<FindMentorsTab />);
    expect(
      screen.getByText(/Something went wrong searching/i),
    ).toBeInTheDocument();
  });

  it("opens and closes the MentorProfileModal on onViewProfile triggers", async () => {
    const user = userEvent.setup();
    render(<FindMentorsTab />);

    // Click profile view button inside MentorGrid mock
    const viewBtn = screen.getByRole("button", { name: "View Alice" });
    await user.click(viewBtn);

    const modal = screen.getByTestId("mentor-profile-modal");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Profile of Alice")).toBeInTheDocument();

    // Close the profile modal
    const closeBtn = screen.getByRole("button", { name: "Close Profile" });
    await user.click(closeBtn);

    expect(
      screen.queryByTestId("mentor-profile-modal"),
    ).not.toBeInTheDocument();
  });

  it("calls setSkill on SearchBar skill changes", async () => {
    const user = userEvent.setup();
    render(<FindMentorsTab />);

    const setSkillBtn = screen.getByRole("button", { name: "Set Skill" });
    await user.click(setSkillBtn);

    expect(mockMentorSearchState.setSkill).toHaveBeenCalledWith("React");
  });
});
