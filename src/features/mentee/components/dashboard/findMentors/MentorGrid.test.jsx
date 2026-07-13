import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorGrid from "./MentorGrid";

vi.mock("@features/mentee/components/dashboard/findMentors/MentorCard", () => ({
  default: ({ mentor, onViewProfile }) => (
    <div data-testid="mentor-card" onClick={() => onViewProfile(mentor)}>
      {mentor.user?.name || "No name"}
    </div>
  ),
}));

vi.mock("@components/common/Loader", () => ({
  default: ({ size }) => (
    <div data-testid="loader">Loading ({size || "default"})...</div>
  ),
}));

describe("MentorGrid", () => {
  const mockOnLoadMore = vi.fn();
  const mockOnViewProfile = vi.fn();

  const mentorsList = [
    { _id: "m1", user: { name: "Alice" } },
    { _id: "m2", user: { name: "Bob" } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loader when loading is true", () => {
    render(
      <MentorGrid
        mentors={[]}
        loading={true}
        loadingMore={false}
        hasMore={false}
        hasSearched={false}
        totalCount={0}
        onLoadMore={mockOnLoadMore}
        onViewProfile={mockOnViewProfile}
      />,
    );
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders empty state when search has run and mentors list is empty", () => {
    render(
      <MentorGrid
        mentors={[]}
        loading={false}
        loadingMore={false}
        hasMore={false}
        hasSearched={true}
        totalCount={0}
        onLoadMore={mockOnLoadMore}
        onViewProfile={mockOnViewProfile}
      />,
    );
    expect(screen.getByText("No mentors found")).toBeInTheDocument();
  });

  it("renders initial/pre-search state when hasSearched is false", () => {
    render(
      <MentorGrid
        mentors={[]}
        loading={false}
        loadingMore={false}
        hasMore={false}
        hasSearched={false}
        totalCount={0}
        onLoadMore={mockOnLoadMore}
        onViewProfile={mockOnViewProfile}
      />,
    );
    expect(screen.getByText("Find your perfect mentor")).toBeInTheDocument();
  });

  it("renders grid of MentorCards and handles view profile interaction", async () => {
    const user = userEvent.setup();
    render(
      <MentorGrid
        mentors={mentorsList}
        loading={false}
        loadingMore={false}
        hasMore={false}
        hasSearched={true}
        totalCount={2}
        onLoadMore={mockOnLoadMore}
        onViewProfile={mockOnViewProfile}
      />,
    );

    // Use a custom text matcher function for distributed text content
    const countText = screen.getByText((content, node) => {
      const hasText = (n) =>
        n.textContent.replace(/\s+/g, " ").trim() === "Showing 2 of 2 mentors";
      return (
        hasText(node) &&
        Array.from(node.children).every((child) => !hasText(child))
      );
    });
    expect(countText).toBeInTheDocument();

    const cards = screen.getAllByTestId("mentor-card");
    expect(cards).toHaveLength(2);

    await user.click(cards[0]);
    expect(mockOnViewProfile).toHaveBeenCalledWith(mentorsList[0]);
  });

  it("renders show more button and triggers load more when clicked", async () => {
    const user = userEvent.setup();
    render(
      <MentorGrid
        mentors={mentorsList}
        loading={false}
        loadingMore={false}
        hasMore={true}
        hasSearched={true}
        totalCount={10}
        onLoadMore={mockOnLoadMore}
        onViewProfile={mockOnViewProfile}
      />,
    );

    const button = screen.getByRole("button", { name: /Show More/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(mockOnLoadMore).toHaveBeenCalled();
  });

  it("renders loading more state correctly", () => {
    render(
      <MentorGrid
        mentors={mentorsList}
        loading={false}
        loadingMore={true}
        hasMore={true}
        hasSearched={true}
        totalCount={10}
        onLoadMore={mockOnLoadMore}
        onViewProfile={mockOnViewProfile}
      />,
    );

    expect(screen.getByText("Loading (sm)...")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Show More/i }),
    ).not.toBeInTheDocument();
  });
});
