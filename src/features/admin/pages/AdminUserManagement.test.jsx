import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUserManagement from "./AdminUserManagement";
import {
  getUserStats,
  getUserGrowth,
  getMentorIndustryStats,
  getUsers,
  deleteUser,
  blockUser,
  unblockUser,
} from "@features/admin/api/admin.api";
import logger from "@lib/logger";

// ── 1. Mock External Modules & Sub-charts ─────────────────────────────────
vi.mock("@features/admin/api/admin.api", () => ({
  getUserStats: vi.fn(),
  getUserGrowth: vi.fn(),
  getMentorIndustryStats: vi.fn(),
  getUsers: vi.fn(),
  deleteUser: vi.fn(),
  blockUser: vi.fn(),
  unblockUser: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("@features/admin/components/AdminLayout", () => ({
  default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock("@features/admin/components/common/StatCard", () => ({
  default: ({ label, value, sub }) => (
    <div data-testid="stat-card">
      <span>{label}</span>: <span>{value}</span> <span>{sub}</span>
    </div>
  ),
}));

vi.mock("@features/admin/components/common/UserGrowthChart", () => ({
  default: () => <div data-testid="growth-chart">Growth Chart</div>,
}));

vi.mock("@features/admin/components/common/MentorIndustryChart", () => ({
  default: () => <div data-testid="industry-chart">Industry Chart</div>,
}));

describe("AdminUserManagement", () => {
  const mockStats = {
    totalUsers: 500,
    newUsersThisMonth: 50,
    totalMentors: 200,
    newMentorsThisMonth: 20,
    totalMentees: 300,
    newMenteesThisMonth: 30,
  };

  const mockPagination = {
    total: 2,
    page: 1,
    totalPages: 2,
  };

  const mockUsers = [
    {
      _id: "user-1",
      name: "Alice Stark",
      email: "alice@leapmentor.com",
      roles: ["mentor"],
      isEmailVerified: true,
      createdAt: "2026-01-15T10:00:00.000Z",
      profile: { profilePicture: "https://example.com/alice.jpg" },
    },
    {
      _id: "user-2",
      name: "Bob Wayne",
      email: "bob@leapmentor.com",
      roles: ["mentee"],
      isEmailVerified: false,
      createdAt: "2026-02-20T14:30:00.000Z",
      profile: { profilePicture: null },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    getUserStats.mockResolvedValue({ data: mockStats });
    getUserGrowth.mockResolvedValue({
      data: { data: [{ month: "Jan", count: 100 }] },
    });
    getMentorIndustryStats.mockResolvedValue({
      data: { data: [{ industry: "Tech", count: 40 }] },
    });
    getUsers.mockResolvedValue({
      data: { users: mockUsers, pagination: mockPagination },
    });
  });

  // ── Render States & Branch Metrics ──────────────────────────────────────
  it("should display loading table row skeletons during user fetch tracking operations", async () => {
    getUsers.mockReturnValueOnce(new Promise(() => {}));
    const { container } = render(<AdminUserManagement />);

    await vi.waitFor(() => {
      expect(
        container.getElementsByClassName("animate-pulse").length,
      ).toBeGreaterThan(0);
    });
  });

  it("should render empty user table state text when users dataset array matches 0 items", async () => {
    getUsers.mockResolvedValueOnce({
      data: { users: [], pagination: { ...mockPagination, totalPages: 1 } },
    });
    render(<AdminUserManagement />);

    expect(await screen.findByText("No users found.")).toBeInTheDocument();
  });

  it("should load stats, charts, and table content correctly under happy path success conditions", async () => {
    render(<AdminUserManagement />);

    expect(screen.getByTestId("admin-layout")).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();

    expect(await screen.findByText("Alice Stark")).toBeInTheDocument();
    expect(screen.getByText("Bob Wayne")).toBeInTheDocument();
    expect(screen.getByText("alice@leapmentor.com")).toBeInTheDocument();
    expect(screen.getByText("bob@leapmentor.com")).toBeInTheDocument();

    expect(screen.getByAltText("Alice Stark")).toHaveAttribute(
      "src",
      "https://example.com/alice.jpg",
    );
    expect(screen.getByText("BW")).toBeInTheDocument();
  });

  it("should route fallback error catching paths safely to logger logs when metrics fetch endpoints reject", async () => {
    const errorMsg = "Network timeout exception";
    getUserStats.mockRejectedValueOnce(new Error(errorMsg));
    getUserGrowth.mockRejectedValueOnce(new Error(errorMsg));
    getMentorIndustryStats.mockRejectedValueOnce(new Error(errorMsg));

    render(<AdminUserManagement />);

    await vi.waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching stats",
        expect.any(Object),
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to fetch growth data",
        expect.any(Object),
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to fetch industry data",
        expect.any(Object),
      );
    });
  });

  // ── Interactions, Filters & Debounces ───────────────────────────────────
  it("should debounce user tracking searches when name or email query strings input fields shift values", async () => {
    render(<AdminUserManagement />);
    await screen.findByText("Alice Stark");

    // Enable fake timers strictly AFTER the async findByText settles down to avoid freezing async queue intervals
    vi.useFakeTimers();

    const searchInput = screen.getByPlaceholderText(
      "Search by name or email...",
    );
    fireEvent.change(searchInput, { target: { value: "Clark Kent" } });

    expect(getUsers).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(getUsers).toHaveBeenCalledTimes(2);
    expect(getUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: "Clark Kent" }),
    );

    fireEvent.focus(searchInput);
    expect(searchInput.style.borderColor).toBe("rgb(147, 197, 253)");

    fireEvent.blur(searchInput);
    expect(searchInput.style.borderColor).toBe("rgb(226, 232, 240)");

    vi.useRealTimers();
  });

  it("should filter the user records payload list by role selection targets properly", async () => {
    const user = userEvent.setup();
    render(<AdminUserManagement />);

    const mentorFilterBtn = await screen.findByRole("button", {
      name: "Mentor",
    });
    await user.click(mentorFilterBtn);

    expect(getUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, role: "mentor" }),
    );
  });

  it("should alter listing configurations securely upon clicking Active vs Blocked toggles", async () => {
    const user = userEvent.setup();
    render(<AdminUserManagement />);

    const blockedTabBtn = await screen.findByRole("button", {
      name: "Blocked Users",
    });
    await user.click(blockedTabBtn);

    expect(getUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, deleted: true }),
    );

    const activeTabBtn = screen.getByRole("button", { name: "Active Users" });
    await user.click(activeTabBtn);
    expect(getUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 }),
    );
  });

  it("should handle row hover tracking style configurations smoothly", async () => {
    render(<AdminUserManagement />);
    const aliceRow = (await screen.findByText("Alice Stark")).closest("tr");

    fireEvent.mouseEnter(aliceRow);
    expect(aliceRow.style.background).toBe("rgb(250, 251, 252)");

    fireEvent.mouseLeave(aliceRow);
    expect(aliceRow.style.background).toBe("transparent");
  });

  // ── Actions & Modals Execution Flow Matrix ──────────────────────────────
  it("should support blocking an active profile and rendering temporary success notification banners", async () => {
    const user = userEvent.setup();
    blockUser.mockResolvedValueOnce({});
    render(<AdminUserManagement />);

    const aliceRow = await screen.findByText("Alice Stark");
    const blockBtn = within(aliceRow.closest("tr")).getByRole("button", {
      name: /Block/i,
    });
    await user.click(blockBtn);

    expect(screen.getByText("Block User Account")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Yes, Block" });
    await user.click(confirmBtn);

    expect(blockUser).toHaveBeenCalledWith("user-1");
    expect(
      await screen.findByText("Alice Stark has been blocked."),
    ).toBeInTheDocument();
  });

  it("should safely enable unblocking action workflows from within the blocked user index listing matrix grid", async () => {
    const user = userEvent.setup();
    unblockUser.mockResolvedValueOnce({});

    render(<AdminUserManagement />);
    const blockedTabBtn = await screen.findByRole("button", {
      name: "Blocked Users",
    });
    await user.click(blockedTabBtn);

    const unblockBtn = (
      await screen.findAllByRole("button", { name: /Unblock/i })
    )[0];
    await user.click(unblockBtn);

    expect(screen.getByText("Restore User Account")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Yes, Unblock" });
    await user.click(confirmBtn);

    expect(unblockUser).toHaveBeenCalledWith("user-1");
  });

  it("should process structural deletion requests securely and clear operational modals when complete", async () => {
    const user = userEvent.setup();
    deleteUser.mockResolvedValueOnce({});
    render(<AdminUserManagement />);

    const aliceRow = await screen.findByText("Alice Stark");
    const deleteBtn = within(aliceRow.closest("tr")).getByRole("button", {
      name: /Delete/i,
    });
    await user.click(deleteBtn);

    expect(screen.getByText("Delete User Account")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Yes, Delete" });
    await user.click(confirmBtn);

    expect(deleteUser).toHaveBeenCalledWith("user-1");
    expect(screen.queryByText("Delete User Account")).not.toBeInTheDocument();
  });

  it("should capture and render fallback failure message toast streams when operational actions reject", async () => {
    const user = userEvent.setup();
    const customApiErrorMsg = "Privilege validation failure token mismatch";

    deleteUser.mockSideEffects = true;
    deleteUser.mockRejectedValueOnce({
      response: { data: { message: customApiErrorMsg } },
    });

    render(<AdminUserManagement />);

    const deleteBtn = (
      await screen.findAllByRole("button", { name: /Delete/i })
    )[0];
    await user.click(deleteBtn);

    const confirmBtn = screen.getByRole("button", { name: "Yes, Delete" });
    await user.click(confirmBtn);

    expect(await screen.findByText(customApiErrorMsg)).toBeInTheDocument();

    getUsers.mockRejectedValueOnce(new Error("Generic Failure"));
    const nextBtn = screen.getByRole("button", { name: "Next →" });
    await user.click(nextBtn);

    expect(
      await screen.findByText("Failed to load users."),
    ).toBeInTheDocument();
  });

  it("should terminate action workflow dialog items completely when Cancel toggles are selected", async () => {
    const user = userEvent.setup();
    render(<AdminUserManagement />);

    const deleteBtn = (
      await screen.findAllByRole("button", { name: /Delete/i })
    )[0];
    await user.click(deleteBtn);

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelBtn);

    expect(screen.queryByText("Delete User Account")).not.toBeInTheDocument();
  });

  it("should transition list pages seamlessly when pagination controls are engaged across multi-page boundaries", async () => {
    const user = userEvent.setup();
    render(<AdminUserManagement />);

    // Targeting the scoped bottom container segment avoids row text query cross-contamination
    const paginationText = await screen.findByText(/Page 1 of 2/i);
    expect(paginationText).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: "Next →" });
    await user.click(nextBtn);
    expect(getUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );

    getUsers.mockResolvedValueOnce({
      data: { users: mockUsers, pagination: { ...mockPagination, page: 2 } },
    });

    render(<AdminUserManagement />);
    const prevBtn = await screen.findByRole("button", { name: "← Prev" });
    await user.click(prevBtn);
    expect(getUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 }),
    );
  });

  it("should fallback cleanly to generating an un-profiled character avatar if user name string evaluation mapping resolves undefined or space-empty items", async () => {
    const blankUserProps = {
      _id: "user-blank",
      name: "",
      email: "blank@leapmentor.com",
      roles: ["mentee"],
      isEmailVerified: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      profile: { profilePicture: null },
    };

    getUsers.mockResolvedValueOnce({
      data: {
        users: [blankUserProps],
        pagination: { ...mockPagination, totalPages: 1 },
      },
    });

    render(<AdminUserManagement />);

    expect(await screen.findByText("?")).toBeInTheDocument();
  });
});
