import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardShell from "./DashboardShell";

// ── Mock External Modules & Hooks ──────────────────────────────────────────
const mockDispatch = vi.fn();
vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock("@features/profile/store/dashboardUserSlice", () => ({
  setUser: vi.fn((user) => ({ type: "SET_USER", payload: user })),
  setProfile: vi.fn((profile) => ({ type: "SET_PROFILE", payload: profile })),
  resetDashboardUser: vi.fn(() => ({ type: "RESET_DASHBOARD_USER" })),
}));

const mockClearBadge = vi.fn();
const mockIncrementBadge = vi.fn();
vi.mock("@features/notifications/hooks/useUnreadCount", () => ({
  default: () => ({
    unreadCount: 5,
    clearBadge: mockClearBadge,
    incrementBadge: mockIncrementBadge,
  }),
}));

vi.mock("@features/notifications/hooks/useSocketToast", () => ({
  default: vi.fn((onRequestChanged, incrementBadge) => {
    if (onRequestChanged) onRequestChanged();
  }),
}));

// ── Mock Subcomponents for Layout Verification ─────────────────────────────
const DummyTopbar = ({ user, onMenuToggle, onLogoClick }) => (
  <div data-testid="topbar">
    <span>User: {user?.name || "None"}</span>
    <button onClick={onMenuToggle}>Open Menu</button>
    <button onClick={onLogoClick}>Go Home</button>
  </div>
);

const DummySidebar = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  unreadCount,
}) => (
  <div data-testid="sidebar">
    <span>Active: {activeTab}</span>
    <span>Open: {isOpen ? "Yes" : "No"}</span>
    <span>Unread: {unreadCount}</span>
    <button onClick={() => setActiveTab("profile")}>Go Profile</button>
    <button onClick={() => setActiveTab("notifications")}>
      Go Notifications
    </button>
    <button onClick={onClose}>Close Sidebar</button>
  </div>
);

const HomeTab = () => <div data-testid="tab-home">Home Content</div>;
const ProfileTab = ({ customProp }) => (
  <div data-testid="tab-profile">Profile Content: {customProp}</div>
);
const NotificationsTab = () => (
  <div data-testid="tab-notifications">Notifications Content</div>
);

describe("DashboardShell", () => {
  let mockUseDashboardData;
  const mockLoadingConfig = {
    spinnerBorderClass: "border-blue-500",
    message: "Loading your portal...",
    textClass: "text-blue-600",
    textStyle: { fontWeight: "bold" },
  };

  const mockTabs = [
    { key: "home", Component: HomeTab },
    {
      key: "profile",
      Component: ProfileTab,
      getProps: (handleSetTab) => ({ customProp: "Verified" }),
    },
    { key: "notifications", Component: NotificationsTab },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(globalThis.history, "replaceState").mockImplementation(() => {});

    mockUseDashboardData = vi.fn(() => ({
      user: { name: "Alex" },
      profile: { bio: "Developer" },
      loading: false,
      error: null,
      refetch: vi.fn(),
    }));
  });

  // ── Loading Branch Coverage ──────────────────────────────────────────────
  it("should render the application loading configuration screen when loading is true", () => {
    mockUseDashboardData.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      error: null,
      refetch: null,
    });

    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    const messageElement = screen.getByText("Loading your portal...");
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveClass("text-blue-600");
    expect(messageElement).toHaveStyle({ fontWeight: "bold" });
  });

  // ── Error Branch Coverage ───────────────────────────────────────────────
  it("should render the application error notification banner when an error is present", () => {
    mockUseDashboardData.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      error: "Failed to load dashboard context details",
      refetch: null,
    });

    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    expect(
      screen.getByText("Failed to load dashboard context details"),
    ).toBeInTheDocument();
  });

  // ── Happy Path Layout Rendering ──────────────────────────────────────────
  it("should render the layout structural shell elements along with the initial fallback home tab component", () => {
    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    expect(screen.getByTestId("topbar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("tab-home")).toBeInTheDocument();
    expect(screen.getByText("User: Alex")).toBeInTheDocument();
    expect(screen.getByText("Unread: 5")).toBeInTheDocument();
  });

  // ── Redux Sync Effects & Lifecycle Unmounting Coverage ────────────────────
  it("should dispatch store sync modifications when data loads and clear state values on lifecycle component unmount", () => {
    const { unmount } = render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_USER",
      payload: { name: "Alex" },
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_PROFILE",
      payload: { bio: "Developer" },
    });

    unmount();
    expect(mockDispatch).toHaveBeenCalledWith({ type: "RESET_DASHBOARD_USER" });
  });

  // ── Context Refetch Conditional Triggers Coverage ─────────────────────────
  it("should fall back gracefully without calling refetch handlers if the function payload structure is missing", () => {
    mockUseDashboardData.mockReturnValue({
      user: { name: "Alex" },
      profile: null,
      loading: false,
      error: null,
      refetch: undefined,
    });

    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    expect(screen.getByTestId("tab-home")).toBeInTheDocument();
  });

  // ── Initial URL Tab Parameter Routing Branches ────────────────────────────
  it("should set initial active path state if the current page url parameter contains a matched valid tab registration token", () => {
    // Directly mock URLSearchParams to intercept context lookup reliably
    vi.spyOn(URLSearchParams.prototype, "get").mockImplementation((key) => {
      if (key === "tab") return "profile";
      return null;
    });

    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    expect(screen.getByTestId("tab-profile")).toBeInTheDocument();
    expect(screen.getByText("Profile Content: Verified")).toBeInTheDocument();
  });

  it("should default tracking back to home tab layout views if the query string navigation parameters fail lookup validation", () => {
    vi.spyOn(URLSearchParams.prototype, "get").mockImplementation((key) => {
      if (key === "tab") return "unknownInvalidTabToken";
      return null;
    });

    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    expect(screen.getByTestId("tab-home")).toBeInTheDocument();
  });

  // ── Layout User Controls & Menu Interoperability ─────────────────────────
  it("should handle sidebar drawer state open and close modifications driven by header layouts seamlessly", async () => {
    const user = userEvent.setup();
    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    expect(screen.getByText("Open: No")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open Menu" }));
    expect(screen.getByText("Open: Yes")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close Sidebar" }));
    expect(screen.getByText("Open: No")).toBeInTheDocument();
  });

  it("should clean standard search params and route to home on user logo activation interaction selections", async () => {
    const user = userEvent.setup();
    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Go Profile" }));
    expect(screen.getByTestId("tab-profile")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go Home" }));
    expect(screen.getByTestId("tab-home")).toBeInTheDocument();
    expect(globalThis.history.replaceState).toHaveBeenCalled();
  });

  // ── Custom Event Broker Event Loop Listener Pipeline Coverage ─────────────
  it("should listen for external micro-frontend app event state triggers and map incoming tab assignments accordingly when allowed", () => {
    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        listenForTabEvent={true}
        loadingConfig={mockLoadingConfig}
      />,
    );

    act(() => {
      const event = new CustomEvent("setDashboardTab", { detail: "profile" });
      globalThis.dispatchEvent(event);
    });

    expect(screen.getByTestId("tab-profile")).toBeInTheDocument();
  });

  it("should ignore processing foreign context routing event instructions if the structural config flag is deactivated", () => {
    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        listenForTabEvent={false}
        loadingConfig={mockLoadingConfig}
      />,
    );

    act(() => {
      const event = new CustomEvent("setDashboardTab", { detail: "profile" });
      globalThis.dispatchEvent(event);
    });

    expect(screen.getByTestId("tab-home")).toBeInTheDocument();
  });

  // ── Dynamic Badging Cleanup State Interactions Coverage ──────────────────
  it("should trigger clear notification badge processing callbacks immediately upon routing focus onto the notification panel list tab", async () => {
    const user = userEvent.setup();
    render(
      <DashboardShell
        useDashboardData={mockUseDashboardData}
        Topbar={DummyTopbar}
        Sidebar={DummySidebar}
        tabs={mockTabs}
        loadingConfig={mockLoadingConfig}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Go Notifications" }));
    expect(screen.getByTestId("tab-notifications")).toBeInTheDocument();
    expect(mockClearBadge).toHaveBeenCalledTimes(1);
  });
});
