import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RequestHistoryTab from "./RequestHistoryTab";
import useRequestHistory from "@features/mentee/hooks/useRequestHistory";
import useSocketEvent from "@lib/hooks/useSocketEvent";

// Mock hooks
vi.mock("@features/mentee/hooks/useRequestHistory", () => ({
  default: vi.fn(),
}));

vi.mock("@lib/hooks/useSocketEvent", () => ({
  default: vi.fn(),
}));

// Mock sub-components
vi.mock("@components/common/Loader", () => ({
  default: ({ message }) => <div data-testid="loader">{message}</div>,
}));

vi.mock("@components/common/ErrorBanner", () => ({
  default: ({ message }) =>
    message ? <div data-testid="error-banner">{message}</div> : null,
}));

vi.mock("@components/common/FilterTabs", () => ({
  default: ({ activeTab, onChange }) => (
    <div data-testid="filter-tabs">
      Active: {activeTab}
      <button onClick={() => onChange("accepted")}>Select Accepted Tab</button>
    </div>
  ),
}));

vi.mock("@features/mentee/components/dashboard/history/HistoryTable", () => ({
  default: ({ requests, onSelect, onDelete }) => (
    <div data-testid="history-table">
      Count: {requests.length}
      {requests.map((r) => (
        <div key={r._id}>
          <button onClick={() => onSelect(r)}>Select {r._id}</button>
          <button onClick={() => onDelete(r._id)}>Delete {r._id}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@features/mentee/components/dashboard/history/DetailDrawer", () => ({
  default: ({ request, onClose, onDelete, onUpdateRequest }) =>
    request ? (
      <div data-testid="detail-drawer">
        Drawer for {request._id}
        <button onClick={onClose}>Close Drawer</button>
        <button onClick={() => onDelete(request._id)}>Delete Drawer</button>
        <button
          onClick={() => onUpdateRequest(request._id, { status: "ongoing" })}
        >
          Update Drawer
        </button>
      </div>
    ) : null,
}));

vi.mock("@lib/logger", () => ({
  default: {
    info: vi.fn(),
  },
}));

describe("RequestHistoryTab", () => {
  const mockHistoryData = {
    filtered: [{ _id: "req1" }, { _id: "req2" }],
    counts: { pending: 1, accepted: 1 },
    loading: false,
    error: null,
    activeTab: "pending",
    setActiveTab: vi.fn(),
    selected: null,
    setSelected: vi.fn(),
    deleteRequest: vi.fn(),
    updateRequest: vi.fn(),
    fetchRequests: vi.fn(),
  };

  const capturedEvents = {};

  beforeEach(() => {
    vi.clearAllMocks();
    useRequestHistory.mockReturnValue(mockHistoryData);
    useSocketEvent.mockImplementation((factory) => {
      const { events } = factory();
      Object.assign(capturedEvents, events);
    });
  });

  it("renders loader when loading is true", () => {
    useRequestHistory.mockReturnValueOnce({
      ...mockHistoryData,
      loading: true,
    });

    render(<RequestHistoryTab />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Loading your history...")).toBeInTheDocument();
  });

  it("renders headers, filter tabs, error banners, and history tables", () => {
    useRequestHistory.mockReturnValueOnce({
      ...mockHistoryData,
      error: "Failed to connect to database",
    });

    render(<RequestHistoryTab />);

    expect(screen.getByText("Request History")).toBeInTheDocument();
    expect(screen.getByTestId("error-banner")).toHaveTextContent(
      "Failed to connect to database",
    );
    expect(screen.getByTestId("filter-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("history-table")).toBeInTheDocument();
  });

  it("handles filter tab onChange callback trigger", async () => {
    const user = userEvent.setup();
    render(<RequestHistoryTab />);

    const selectTabBtn = screen.getByRole("button", {
      name: "Select Accepted Tab",
    });
    await user.click(selectTabBtn);

    expect(mockHistoryData.setActiveTab).toHaveBeenCalledWith("accepted");
    expect(mockHistoryData.setSelected).toHaveBeenCalledWith(null);
  });

  it("manages table selection, deletion, and drawer interaction flows", async () => {
    const user = userEvent.setup();
    // Simulate Alice selected in drawer state
    useRequestHistory.mockReturnValueOnce({
      ...mockHistoryData,
      selected: { _id: "req1" },
    });

    render(<RequestHistoryTab />);

    expect(screen.getByTestId("detail-drawer")).toBeInTheDocument();

    const updateBtn = screen.getByRole("button", { name: "Update Drawer" });
    await user.click(updateBtn);
    expect(mockHistoryData.updateRequest).toHaveBeenCalledWith("req1", {
      status: "ongoing",
    });

    const deleteBtn = screen.getByRole("button", { name: "Delete Drawer" });
    await user.click(deleteBtn);
    expect(mockHistoryData.deleteRequest).toHaveBeenCalledWith("req1");

    const closeBtn = screen.getByRole("button", { name: "Close Drawer" });
    await user.click(closeBtn);
    expect(mockHistoryData.setSelected).toHaveBeenCalledWith(null);
  });

  it("registers socket event handlers and responds to request_status_changed", () => {
    render(<RequestHistoryTab />);

    expect(useSocketEvent).toHaveBeenCalled();
    expect(capturedEvents.request_status_changed).toBeTypeOf("function");

    // Fire the event handler
    capturedEvents.request_status_changed({ id: "req1", status: "accepted" });

    expect(mockHistoryData.fetchRequests).toHaveBeenCalled();
  });
});
