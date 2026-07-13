import { render, screen } from "@testing-library/react";
import DashboardLayout from "./DashboardLayout";
import DashboardShell from "@components/layout/DashboardShell";
import DashboardTopbar from "@components/layout/DashboardTopbar";
import DashboardSidebar from "@components/layout/DashboardSidebar";
import useMentorDashboard from "@features/mentor/hooks/useMentorDashboard";

// Mock react's lazy to execute the callback immediately for full coverage
vi.mock("react", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    lazy: (fn) => {
      // Don't immediately invoke to avoid environment teardown errors
      return (props) => (
        <div data-testid="lazy-tab">{JSON.stringify(props)}</div>
      );
    },
  };
});

// Mock the problematic modules that cause teardown errors
vi.mock("@lib/cookies", () => ({
  clearAuthRole: vi.fn(),
  getAuthRole: vi.fn(),
  setAuthRole: vi.fn(),
}));

vi.mock("@features/connects/hooks/useOngoingConnects", () => ({
  default: vi.fn(() => ({ ongoingConnects: [] })),
}));

vi.mock("@features/support/api/support.api", () => ({
  sendSupportMessage: vi.fn(),
  sendAiChatMessage: vi.fn(),
}));

// Mock hooks & configs
vi.mock("@features/mentor/hooks/useMentorDashboard", () => ({
  default: vi.fn(),
}));

vi.mock("@features/mentor/constants/mentorNavItems", () => ({
  MENTOR_NAV_ITEMS: ["Home", "Profile"],
}));

// Mock layout shell elements
vi.mock("@components/layout/DashboardShell", () => ({
  default: vi.fn(({ Topbar, Sidebar, tabs }) => {
    // Render topbar & sidebar to test their properties
    const TopbarComponent = Topbar;
    const SidebarComponent = Sidebar;

    return (
      <div data-testid="dashboard-shell-mock">
        <TopbarComponent dummyProp="topbar-data" />
        <SidebarComponent dummyProp="sidebar-data" />
        <div data-testid="tabs-length">{tabs.length}</div>
        {/* Test the individual TABS getProps triggers */}
        <div data-testid="tab-home-props">
          {JSON.stringify(tabs[0].getProps("set-tab-fn"))}
        </div>
        <div data-testid="tab-connects-props">
          {JSON.stringify(tabs[4].getProps())}
        </div>
        <div data-testid="tab-notifs-props">
          {JSON.stringify(tabs[5].getProps("set-tab-fn"))}
        </div>
      </div>
    );
  }),
}));

vi.mock("@components/layout/DashboardTopbar", () => ({
  default: ({ dummyProp, logoutRedirectPath }) => (
    <div data-testid="topbar-mock">
      {dummyProp} - {logoutRedirectPath}
    </div>
  ),
}));

vi.mock("@components/layout/DashboardSidebar", () => ({
  default: ({ dummyProp, navItems }) => (
    <div data-testid="sidebar-mock">
      {dummyProp} - {JSON.stringify(navItems)}
    </div>
  ),
}));

describe("DashboardLayout component", () => {
  it("renders layout shell and maps tabs configurations properly", () => {
    render(<DashboardLayout />);

    expect(screen.getByTestId("dashboard-shell-mock")).toBeInTheDocument();

    // Topbar check
    expect(screen.getByTestId("topbar-mock")).toHaveTextContent(
      "topbar-data - /login/mentor",
    );

    // Sidebar check
    expect(screen.getByTestId("sidebar-mock")).toHaveTextContent(
      'sidebar-data - ["Home","Profile"]',
    );

    // Tabs configuration validations
    expect(screen.getByTestId("tabs-length")).toHaveTextContent("8");
    expect(screen.getByTestId("tab-home-props")).toHaveTextContent(
      '{"setActiveTab":"set-tab-fn"}',
    );
    expect(screen.getByTestId("tab-connects-props")).toHaveTextContent(
      '{"role":"mentor"}',
    );
    expect(screen.getByTestId("tab-notifs-props")).toHaveTextContent(
      '{"setActiveTab":"set-tab-fn","role":"mentor"}',
    );

    // Confirm loadingConfig config is passed
    expect(DashboardShell).toHaveBeenCalledTimes(1);
    const passedProps = vi.mocked(DashboardShell).mock.calls[0][0];
    expect(passedProps.useDashboardData).toBe(useMentorDashboard);
    expect(passedProps.loadingConfig).toEqual({
      spinnerBorderClass: "border-t-blue-600",
      message: "Loading...",
      textClass: "text-xs text-slate-400",
      textStyle: { fontFamily: "'DM Sans', sans-serif" },
    });
  });
});
