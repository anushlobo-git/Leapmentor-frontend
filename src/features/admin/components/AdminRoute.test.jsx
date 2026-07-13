import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminRoute from "./AdminRoute";
import { useAdminAuth } from "@features/admin/context/AdminAuthContext";

// Mock Navigate to assert correct redirection configurations
vi.mock("react-router-dom", () => ({
  Navigate: vi.fn(({ to, replace }) => (
    <div
      data-testid="navigate"
      data-to={to}
      data-replace={replace ? "true" : "false"}
    />
  )),
}));

// Mock the admin authentication context hook
vi.mock("@features/admin/context/AdminAuthContext", () => ({
  useAdminAuth: vi.fn(),
}));

describe("AdminRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state when the authentication check is in progress", () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    render(
      <AdminRoute>
        <div data-testid="protected-content">Secret Admin Dashboard</div>
      </AdminRoute>,
    );

    expect(screen.getByText("Authenticating...")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("should redirect to the admin login page when the user is not authenticated", () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    render(
      <AdminRoute>
        <div data-testid="protected-content">Secret Admin Dashboard</div>
      </AdminRoute>,
    );

    const navigateElement = screen.getByTestId("navigate");
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute("data-to", "/admin/login");
    expect(navigateElement).toHaveAttribute("data-replace", "true");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should render children components when the user is successfully authenticated", () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    render(
      <AdminRoute>
        <div data-testid="protected-content">Secret Admin Dashboard</div>
      </AdminRoute>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Secret Admin Dashboard")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });
});
