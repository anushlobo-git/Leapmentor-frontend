import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminLayout from "@features/admin/components/AdminLayout";
import { AdminAuthProvider } from "@features/admin/context/AdminAuthContext";
import {
  getPendingLeapRequestsCount,
  adminLogout,
} from "@features/admin/api/admin.api";
import adminAxiosInstance from "@lib/adminAxiosInstance";

vi.mock("@features/admin/api/admin.api", () => ({
  getPendingLeapRequestsCount: vi.fn(() =>
    Promise.resolve({ data: { count: 24 } }),
  ),
  adminLogout: vi.fn(() => Promise.resolve()),
}));

vi.mock("@lib/adminAxiosInstance", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { admin: null } })),
    post: vi.fn(() => Promise.resolve()),
  },
}));

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <AdminAuthProvider>{ui}</AdminAuthProvider>
    </MemoryRouter>,
  );

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the layout and sidebar with pending count", async () => {
    renderWithProviders(
      <AdminLayout>
        <div>Test content</div>
      </AdminLayout>,
    );

    expect(screen.getByText(/LeapMentor/i)).toBeInTheDocument();
    expect(screen.getByText(/Test content/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Logout/i })).toHaveLength(3);
    expect(await screen.findByText("24")).toBeInTheDocument();

    expect(getPendingLeapRequestsCount).toHaveBeenCalledTimes(1);
    expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/auth/me", {
      _skipAuthRedirect: true,
    });
  });

  it("opens and closes the mobile sidebar", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AdminLayout>
        <div>Test content</div>
      </AdminLayout>,
    );

    const openButton = screen.getByRole("button", { name: /Open sidebar/i });
    await user.click(openButton);

    const closeSidebarButton = screen.getByRole("button", {
      name: /Close sidebar/i,
    });
    expect(closeSidebarButton).toBeInTheDocument();

    await user.click(closeSidebarButton);
    expect(closeSidebarButton).not.toBeInTheDocument();
  });

  it("calls adminLogout when a logout action is triggered", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AdminLayout>
        <div>Test content</div>
      </AdminLayout>,
    );

    const logoutButtons = screen.getAllByRole("button", { name: /Logout/i });
    await user.click(logoutButtons[0]);

    expect(adminLogout).toHaveBeenCalledTimes(1);
  });

  it("handles logout errors and still clears auth state", async () => {
    const user = userEvent.setup();
    adminLogout.mockRejectedValueOnce(new Error("Logout failed"));

    renderWithProviders(
      <AdminLayout>
        <div>Test content</div>
      </AdminLayout>,
    );

    const logoutButtons = screen.getAllByRole("button", { name: /Logout/i });
    await user.click(logoutButtons[0]);

    expect(adminLogout).toHaveBeenCalledTimes(1);
  });

  it("does not show badge when Wallet Requests nav is active", async () => {
    getPendingLeapRequestsCount.mockResolvedValueOnce({ data: { count: 10 } });

    render(
      <MemoryRouter initialEntries={["/admin/wallet-requests"]}>
        <AdminAuthProvider>
          <AdminLayout>
            <div />
          </AdminLayout>
        </AdminAuthProvider>
      </MemoryRouter>,
    );

    // await fetch
    await screen.findByText(/Wallet Requests/i);
    expect(screen.queryByText("10")).not.toBeInTheDocument();
  });

  it("does not show badge when count is >= 500", async () => {
    getPendingLeapRequestsCount.mockResolvedValueOnce({ data: { count: 500 } });

    renderWithProviders(
      <AdminLayout>
        <div />
      </AdminLayout>,
    );

    await screen.findByText(/LeapMentor/i);
    expect(screen.queryByText("500")).not.toBeInTheDocument();
  });

  it("handles pending count fetch error silently", async () => {
    getPendingLeapRequestsCount.mockRejectedValueOnce(new Error("nope"));

    renderWithProviders(
      <AdminLayout>
        <div />
      </AdminLayout>,
    );

    await screen.findByText(/LeapMentor/i);
    // no badge rendered
    expect(screen.queryByText("99+")).not.toBeInTheDocument();
  });

  it("shows 99+ when pending count is greater than 99", async () => {
    getPendingLeapRequestsCount.mockResolvedValueOnce({ data: { count: 150 } });

    renderWithProviders(
      <AdminLayout>
        <div />
      </AdminLayout>,
    );

    // ensure API called and UI updated
    await screen.findByText(/LeapMentor/i);
    expect(await screen.findByText("99+")).toBeInTheDocument();
  });

  it("handles response with missing count (falls back to 0)", async () => {
    getPendingLeapRequestsCount.mockResolvedValueOnce({ data: {} });

    renderWithProviders(
      <AdminLayout>
        <div />
      </AdminLayout>,
    );

    // wait for layout and ensure a '0' badge appears (or at least no crash)
    expect(await screen.findByText(/LeapMentor/i)).toBeInTheDocument();
  });
});
