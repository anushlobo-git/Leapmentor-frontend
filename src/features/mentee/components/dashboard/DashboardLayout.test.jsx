import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock DashboardShell to expose props via data attributes
vi.mock("@components/layout/DashboardShell", () => ({
  __esModule: true,
  default: (props) => (
    <div
      data-testid="dashboard-shell"
      data-tabs={props.tabs?.length}
      data-listen={props.listenForTabEvent ? "yes" : "no"}
    />
  ),
}));

vi.mock("@components/layout/DashboardSidebar", () => ({
  __esModule: true,
  default: (p) => <div data-navitems={p.navItems?.length || 0} />,
}));
vi.mock("@components/layout/DashboardTopbar", () => ({
  __esModule: true,
  default: (p) => <div data-logout={p.logoutRedirectPath} />,
}));
vi.mock("@features/mentee/hooks/useMenteeDashboard", () => ({
  __esModule: true,
  default: () => ({}),
}));
vi.mock("@features/mentee/constants/menteeNavItems", () => ({
  MENTEE_NAV_ITEMS: [{}, {}, {}],
}));

import DashboardLayout from "./DashboardLayout";
import { MenteeSidebar, TABS, Topbar } from "./DashboardLayout";

describe("DashboardLayout", () => {
  it("renders DashboardShell with expected props", () => {
    render(<DashboardLayout />);

    const shell = screen.getByTestId("dashboard-shell");
    expect(shell).toBeInTheDocument();
    expect(shell.getAttribute("data-listen")).toBe("yes");
    // tabs length in the real file is 7; ensure the prop exists
    expect(shell.getAttribute("data-tabs")).toBeTruthy();
  });

  it("exports TABS and MenteeSidebar behaves with nav items", () => {
    // verify TABS length and getProps behavior
    expect(TABS.length).toBeGreaterThanOrEqual(7);
    const notifications = TABS.find((t) => t.key === "notifications");
    expect(typeof notifications.getProps).toBe("function");
    const gp = notifications.getProps(() => {});
    expect(gp).toHaveProperty("setActiveTab");
    expect(gp.role).toBe("mentee");

    const connects = TABS.find((t) => t.key === "connects");
    expect(typeof connects.getProps).toBe("function");
    const cp = connects.getProps();
    expect(cp).toEqual({ role: "mentee" });

    // render MenteeSidebar and ensure navItems passed through
    const { container } = render(<MenteeSidebar someprop="x" />);
    expect(container.querySelector("[data-navitems]")).toHaveAttribute(
      "data-navitems",
      "3",
    );

    // Topbar wrapper should pass logoutRedirectPath through to DashboardTopbar
    const { container: c2 } = render(<Topbar testprop="y" />);
    expect(c2.querySelector("[data-logout]")).toHaveAttribute(
      "data-logout",
      "/",
    );
  });
});
