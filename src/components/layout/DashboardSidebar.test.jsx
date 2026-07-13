import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardSidebar from "./DashboardSidebar";

describe("DashboardSidebar", () => {
  const mockNavItems = [
    { key: "home", label: "Home", icon: <span data-testid="icon-home" /> },
    {
      key: "notifications",
      label: "Notifications",
      icon: <span data-testid="icon-notifications" />,
    },
  ];

  let mockSetActiveTab;
  let mockOnClose;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetActiveTab = vi.fn();
    mockOnClose = vi.fn();
    document.body.style.overflow = "";
  });

  it("should render navigation links and support elements for both desktop and mobile views", () => {
    render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
      />,
    );

    const homeButtons = screen.getAllByRole("button", {
      name: /Home/i,
      hidden: true,
    });
    const notificationsButtons = screen.getAllByRole("button", {
      name: /Notifications/i,
      hidden: true,
    });
    const helpButtons = screen.getAllByRole("button", {
      name: /Help Center/i,
      hidden: true,
    });

    expect(homeButtons).toHaveLength(2);
    expect(notificationsButtons).toHaveLength(2);
    expect(helpButtons).toHaveLength(2);
  });

  it("should hide the notification badge when unreadCount is 0", () => {
    render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
        unreadCount={0}
      />,
    );

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("should hide the notification badge when unreadCount is undefined or null", () => {
    const { container } = render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
      />,
    );

    expect(container.querySelector(".sidebar-badge")).not.toBeInTheDocument();
  });

  it("should display the numerical count value when unreadCount is between 1 and 99", () => {
    render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
        unreadCount={12}
      />,
    );

    const badges = screen.getAllByText("12");
    expect(badges).toHaveLength(2);
  });

  it("should display the text 99+ when unreadCount is greater than 99", () => {
    render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
        unreadCount={150}
      />,
    );

    const badges = screen.getAllByText("99+");
    expect(badges).toHaveLength(2);
  });

  it("should update active tab status and trigger close callback when a regular navigation item is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    const notificationsButtons = screen.getAllByRole("button", {
      name: /Notifications/i,
      hidden: true,
    });
    await user.click(notificationsButtons[1]);

    expect(mockSetActiveTab).toHaveBeenCalledWith("notifications");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should update active tab status and trigger close callback when the help center link is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    const helpButtons = screen.getAllByRole("button", {
      name: /Help Center/i,
      hidden: true,
    });
    await user.click(helpButtons[1]);

    expect(mockSetActiveTab).toHaveBeenCalledWith("help");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should enforce hidden overflow styling on document body while the mobile sidebar is active", () => {
    const { rerender } = render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
      />,
    );

    expect(document.body.style.overflow).toBe("");
  });

  it("should fully restore standard document overflow styling behaviors when component unmounts", () => {
    const { unmount } = render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("should invoke the close event handler when interacting with mobile backdrop overlay or drawer close layouts", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DashboardSidebar
        navItems={mockNavItems}
        activeTab="home"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    // Using querySelector here directly eliminates environment-specific aria-label resolution bugs on empty element containers
    const backdrop = container.querySelector(".dashboard-sidebar-backdrop");
    expect(backdrop).toBeInTheDocument();
    await user.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const allButtons = screen.getAllByRole("button", { hidden: true });
    const drawerXButton = allButtons.find(
      (btn) =>
        btn.className !== "dashboard-sidebar-backdrop" &&
        !btn.className.includes("sidebar-nav-btn"),
    );

    if (drawerXButton) {
      await user.click(drawerXButton);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    }
  });
});
