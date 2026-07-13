import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryTable from "./HistoryTable";

vi.mock("@features/mentee/components/dashboard/history/StatusBadge", () => ({
  default: ({ status }) => <div data-testid="status-badge">{status}</div>,
}));

describe("HistoryTable", () => {
  const requests = [
    {
      _id: "req1",
      mentor: { name: "Alice" },
      mentorProfile: { currentRole: "Software Engineer" },
      status: "pending",
      requestedAt: "2026-07-20T10:00:00Z",
    },
    {
      _id: "req2",
      mentor: { name: "Bob" },
      mentorProfile: { currentRole: "Product Manager" },
      status: "accepted",
      requestedAt: "2026-07-21T10:00:00Z",
    },
  ];

  const mockOnSelect = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when requests list is empty", () => {
    render(
      <HistoryTable
        requests={[]}
        selected={null}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("No requests found")).toBeInTheDocument();
  });

  it("renders table headers and row items correctly", () => {
    render(
      <HistoryTable
        requests={requests}
        selected={null}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("Mentor")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getAllByTestId("status-badge")).toHaveLength(2);
  });

  it("applies selected background style when a row is active", () => {
    const { container } = render(
      <HistoryTable
        requests={requests}
        selected={requests[0]}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />,
    );

    // The selected row should have the bg-blue-50/30 or border-blue-200 class
    const selectedRow = container.querySelector(".bg-blue-50\\/30");
    expect(selectedRow).toBeInTheDocument();
    expect(selectedRow).toHaveTextContent("Alice");
  });

  it("triggers onSelect callback when clicking View/Close buttons", async () => {
    const user = userEvent.setup();
    render(
      <HistoryTable
        requests={requests}
        selected={requests[0]} // Alice is selected, Bob is not
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />,
    );

    // Alice should show "Close"
    const closeBtn = screen.getByRole("button", { name: "Close" });
    await user.click(closeBtn);
    expect(mockOnSelect).toHaveBeenCalledWith(null);

    // Bob should show "View"
    const viewBtn = screen.getByRole("button", { name: "View" });
    await user.click(viewBtn);
    expect(mockOnSelect).toHaveBeenCalledWith(requests[1]);
  });

  it("triggers onDelete callback when clicking the trash delete icon button", async () => {
    const user = userEvent.setup();
    render(
      <HistoryTable
        requests={requests}
        selected={null}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />,
    );

    const deleteBtns = screen.getAllByTitle("Delete request");
    await user.click(deleteBtns[0]);

    expect(mockOnDelete).toHaveBeenCalledWith("req1");
  });
});
