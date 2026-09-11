import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardShell from "@components/layout/DashboardShell";
import useMenteeDashboard from "@features/mentee/hooks/useMenteeDashboard";

vi.mock("@components/layout/DashboardShell", () => ({
  default: vi.fn(({ Topbar, Sidebar, tabs }) => {
    const TopbarComponent = Topbar;
    const SidebarComponent = Sidebar;
    const notifications = tabs.find((tab) => tab.key === "notifications");
    const connects = tabs.find((tab) => tab.key === "connects");

    return (
      <div data-testid="dashboard-shell">
        <TopbarComponent dummyProp="topbar-data" />
        <SidebarComponent dummyProp="sidebar-data" />
        <div data-testid="tabs-length">{tabs.length}</div>
        <div data-testid="tab-notifs-props">
          {JSON.stringify(notifications.getProps("set-tab-fn"))}
        </div>
        <div data-testid="tab-connects-props">
          {JSON.stringify(connects.getProps())}
        </div>
      </div>
    );
  }),
}));

vi.mock("@components/layout/DashboardSidebar", () => ({
  default: ({ dummyProp, navItems }) => (
    <div data-testid="sidebar-mock">
      {dummyProp} - {navItems?.length}
    </div>
  ),
}));

vi.mock("@components/layout/DashboardTopbar", () => ({
  default: ({ dummyProp, logoutRedirectPath }) => (
    <div data-testid="topbar-mock">
      {dummyProp} - {logoutRedirectPath}
    </div>
  ),
}));

vi.mock("@features/mentee/hooks/useMenteeDashboard", () => ({
  default: vi.fn(),
}));

vi.mock("@features/mentee/constants/menteeNavItems", () => ({
  MENTEE_NAV_ITEMS: [{}, {}, {}],
}));

import DashboardLayout, {
  MenteeSidebar,
  TABS,
  LOADING_CONFIG,
  Topbar,
} from "./DashboardLayout";

describe("Mentee DashboardLayout", () => {
  it("renders DashboardShell with mentee config, wrappers, and tab props", () => {
    render(<DashboardLayout />);

    expect(screen.getByTestId("dashboard-shell")).toBeInTheDocument();
    expect(screen.getByTestId("topbar-mock")).toHaveTextContent(
      "topbar-data - /",
    );
    expect(screen.getByTestId("sidebar-mock")).toHaveTextContent(
      "sidebar-data - 3",
    );
    expect(screen.getByTestId("tabs-length")).toHaveTextContent("7");
    expect(screen.getByTestId("tab-notifs-props")).toHaveTextContent(
      '{"setActiveTab":"set-tab-fn","role":"mentee"}',
    );
    expect(screen.getByTestId("tab-connects-props")).toHaveTextContent(
      '{"role":"mentee"}',
    );

    const passedProps = vi.mocked(DashboardShell).mock.calls[0][0];
    expect(passedProps.useDashboardData).toBe(useMenteeDashboard);
    expect(passedProps.listenForTabEvent).toBe(true);
    expect(passedProps.loadingConfig).toEqual(LOADING_CONFIG);
    expect(passedProps.loadingConfig).toEqual({
      spinnerBorderClass: "border-t-blue-900",
      message: "Loading your dashboard…",
      textClass: "text-sm text-slate-400 font-medium",
    });
  });

  it("exports TABS, LOADING_CONFIG, and wrapper components", () => {
    expect(TABS.map((tab) => tab.key)).toEqual([
      "home",
      "profile",
      "findMentors",
      "history",
      "notifications",
      "connects",
      "help",
    ]);
    TABS.forEach((tab) => {
      expect(tab.Component).toBeTruthy();
    });
    expect(TABS.find((tab) => tab.key === "home").getProps).toBeUndefined();

    const { container } = render(<MenteeSidebar someprop="x" />);
    expect(container.querySelector("[data-testid='sidebar-mock']")).toHaveTextContent(
      "3",
    );

    const { container: topbarContainer } = render(<Topbar testprop="y" />);
    expect(
      topbarContainer.querySelector("[data-testid='topbar-mock']"),
    ).toHaveTextContent("/");
  });
});
