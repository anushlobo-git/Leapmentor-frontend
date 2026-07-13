import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminReports from "./AdminReports";

// Mock layout and StatCard to keep output small
vi.mock("@features/admin/components/AdminLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));
vi.mock("@features/admin/components/common/StatCard", () => ({
  default: (p) => <div data-testid="stat-card">{p.label}</div>,
}));

// Mock API functions and control their resolutions
const mockGetReportStats = vi.fn();
const mockGetReports = vi.fn();
const mockUpdateReport = vi.fn();
const mockRefundReport = vi.fn();
const mockDeleteReportSession = vi.fn();

vi.mock("@features/admin/api/admin.api", () => ({
  getReportStats: (...args) => mockGetReportStats(...args),
  getReports: (...args) => mockGetReports(...args),
  updateReport: (...args) => mockUpdateReport(...args),
  refundReport: (...args) => mockRefundReport(...args),
  deleteReportSession: (...args) => mockDeleteReportSession(...args),
}));

describe("AdminReports", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("shows loading skeleton then no reports message when API returns empty", async () => {
    mockGetReportStats.mockResolvedValue({ data: { totalReports: 0 } });
    // Return a promise that resolves after a tick to allow "loading" to show
    mockGetReports.mockImplementation(
      () =>
        new Promise((res) =>
          setTimeout(
            () =>
              res({
                data: {
                  reports: [],
                  pagination: { totalCount: 0, currentPage: 1, totalPages: 1 },
                },
              }),
            0,
          ),
        ),
    );

    render(<AdminReports />);

    // initial loading skeleton: expect a cell with animate-pulse present
    expect(document.querySelector(".animate-pulse")).toBeTruthy();

    await waitFor(() => expect(mockGetReports).toHaveBeenCalled());

    // After resolving, table should show zero total reports (no items)
    expect(screen.getByText(/0\s*total reports/i)).toBeInTheDocument();
  });

  it("renders a report row and opens Handle modal, shows validation error then saves", async () => {
    const report = {
      id: 42,
      mentee: "Alice",
      menteeEmail: "alice@example.com",
      mentor: "Bob",
      mentorEmail: "bob@example.com",
      category: "other",
      date: "2026-01-01",
      status: "open",
      connectRequestId: "sess-1",
      refundProcessed: false,
      totalAmount: 0,
      paymentStatus: "paid",
    };

    mockGetReportStats.mockResolvedValue({
      data: { totalReports: 1, pendingResolution: 1, resolvedToday: 0 },
    });
    mockGetReports.mockResolvedValue({
      data: {
        reports: [report],
        pagination: { totalCount: 1, currentPage: 1, totalPages: 1 },
      },
    });

    mockUpdateReport.mockResolvedValue({
      data: { report: { ...report, status: "resolved" } },
    });

    render(<AdminReports />);

    // wait for reports to load
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

    // Click Handle to open modal
    fireEvent.click(screen.getByRole("button", { name: /Handle/i }));

    // Modal header present
    expect(screen.getByText("Handle Report")).toBeInTheDocument();

    // Click Save without selecting status should show inline error text
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));
    expect(
      await screen.findByText("Please select a status."),
    ).toBeInTheDocument();

    // Select status 'Resolved' button inside the modal (there are multiple "Resolved" buttons on the page)
    const resolvedButtons = screen.getAllByRole("button", {
      name: /Resolved/i,
    });
    fireEvent.click(resolvedButtons[1]);

    // Click Save again to trigger updateReport
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() =>
      expect(mockUpdateReport).toHaveBeenCalledWith(42, expect.any(Object)),
    );

    // After save, modal should close and toast appears
    await waitFor(() =>
      expect(screen.queryByText("Handle Report")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/Report updated/)).toBeInTheDocument();
  });

  it("shows error toast when report stats fetch fails and handles status filter/search", async () => {
    mockGetReportStats.mockRejectedValue(new Error("Stats failed"));
    mockGetReports.mockResolvedValue({
      data: {
        reports: [],
        pagination: { totalCount: 0, currentPage: 1, totalPages: 1 },
      },
    });

    render(<AdminReports />);

    await waitFor(() => expect(mockGetReportStats).toHaveBeenCalled());
    expect(
      await screen.findByText(/Failed to load stats/i),
    ).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search mentee or mentor/i);
    fireEvent.change(searchInput, { target: { value: "Alice" } });

    await waitFor(() => expect(mockGetReports).toHaveBeenCalledTimes(2), {
      timeout: 3000,
    });
    expect(mockGetReports).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: "Alice" }),
    );

    const resolvedButton = screen.getByRole("button", { name: /Resolved/i });
    fireEvent.click(resolvedButton);

    await waitFor(() => expect(mockGetReports).toHaveBeenCalledTimes(3), {
      timeout: 3000,
    });
    expect(mockGetReports).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "resolved" }),
    );
  });

  it("opens refund confirm flow and cancels without processing", async () => {
    const report = {
      id: 43,
      mentee: "Charlie",
      menteeEmail: "charlie@example.com",
      mentor: "Dana",
      mentorEmail: "dana@example.com",
      category: "refund",
      date: "2026-01-02",
      status: "open",
      connectRequestId: "sess-2",
      refundProcessed: false,
      totalAmount: 10,
      paymentStatus: "paid",
    };
    mockGetReportStats.mockResolvedValue({
      data: { totalReports: 1, pendingResolution: 1, resolvedToday: 0 },
    });
    mockGetReports.mockResolvedValue({
      data: {
        reports: [report],
        pagination: { totalCount: 1, currentPage: 1, totalPages: 1 },
      },
    });
    mockRefundReport.mockResolvedValue({});

    render(<AdminReports />);
    await waitFor(() =>
      expect(screen.getByText("Charlie")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /Handle/i }));
    expect(screen.getByText(/Refund Request/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Process Refund/i }));
    expect(screen.getByText(/Process Refund\?/i)).toBeInTheDocument();

    const cancelButtons = screen.getAllByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);
    await waitFor(
      () =>
        expect(screen.queryByText(/Process Refund\?/i)).not.toBeInTheDocument(),
      {
        timeout: 3000,
      },
    );
  });

  it("opens delete confirm flow and processes delete session", async () => {
    const report = {
      id: 44,
      mentee: "Eve",
      menteeEmail: "eve@example.com",
      mentor: "Frank",
      mentorEmail: "frank@example.com",
      category: "other",
      date: "2026-01-03",
      status: "open",
      connectRequestId: "sess-3",
      refundProcessed: false,
      totalAmount: 0,
      paymentStatus: "paid",
    };
    mockGetReportStats.mockResolvedValue({
      data: { totalReports: 1, pendingResolution: 1, resolvedToday: 0 },
    });
    mockGetReports.mockResolvedValue({
      data: {
        reports: [report],
        pagination: { totalCount: 1, currentPage: 1, totalPages: 1 },
      },
    });
    mockDeleteReportSession.mockResolvedValue({});

    render(<AdminReports />);
    await waitFor(() => expect(screen.getByText("Eve")).toBeInTheDocument(), {
      timeout: 3000,
    });

    fireEvent.click(screen.getByRole("button", { name: /Handle/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Delete This Session/i }),
    );
    expect(screen.getByText(/Delete Session\?/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Yes, Delete Session/i }),
    );
    await waitFor(
      () =>
        expect(mockDeleteReportSession).toHaveBeenCalledWith(
          44,
          expect.any(String),
        ),
      {
        timeout: 3000,
      },
    );
    expect(screen.getByText(/Session deleted/)).toBeInTheDocument();
  });

  it("shows handle modal save error when updateReport fails", async () => {
    const report = {
      id: 45,
      mentee: "Gem",
      menteeEmail: "gem@example.com",
      mentor: "Hank",
      mentorEmail: "hank@example.com",
      category: "other",
      date: "2026-01-04",
      status: "open",
      connectRequestId: "sess-4",
      refundProcessed: false,
      totalAmount: 0,
      paymentStatus: "paid",
    };
    mockGetReportStats.mockResolvedValue({
      data: { totalReports: 1, pendingResolution: 1, resolvedToday: 0 },
    });
    mockGetReports.mockResolvedValue({
      data: {
        reports: [report],
        pagination: { totalCount: 1, currentPage: 1, totalPages: 1 },
      },
    });
    mockUpdateReport.mockRejectedValue({
      response: { data: { message: "Update failed" } },
    });

    render(<AdminReports />);
    await waitFor(() => expect(screen.getByText("Gem")).toBeInTheDocument(), {
      timeout: 3000,
    });
    fireEvent.click(screen.getByRole("button", { name: /Handle/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /Resolved/i })[1]);
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(await screen.findByText(/Update failed/i)).toBeInTheDocument();
  });
});
