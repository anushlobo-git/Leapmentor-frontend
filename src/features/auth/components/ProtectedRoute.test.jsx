import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ProtectedRoute from "./ProtectedRoute";
import {
  selectIsAuthenticated,
  selectIsVerified,
  selectRole,
} from "@features/auth/models/authSlice";

// Mock React Router DOM navigation component
vi.mock("react-router-dom", () => ({
  Navigate: vi.fn(({ to, replace, state }) => (
    <div
      data-testid="mock-navigate"
      data-to={to}
      data-replace={replace ? "true" : "false"}
      data-state={state ? JSON.stringify(state) : ""}
    >
      Redirect Context
    </div>
  )),
}));

// Setup control flags for dynamic Redux selectors state switching
let mockIsAuthenticated = true;
let mockIsVerified = true;
let mockRole = null;
let mockUser = { email: "user@leapmentor.app", roles: ["mentor"] };

vi.mock("react-redux", () => ({
  useSelector: vi.fn((selectorFn) => {
    if (selectorFn === selectIsAuthenticated) return mockIsAuthenticated;
    if (selectorFn === selectIsVerified) return mockIsVerified;
    if (selectorFn === selectRole) return mockRole;
    // Execute inline selector (state) => state.auth.user cleanly
    return selectorFn({ auth: { user: mockUser } });
  }),
}));

vi.mock("@features/auth/models/authSlice", () => ({
  selectIsAuthenticated: vi.fn(),
  selectIsVerified: vi.fn(),
  selectRole: vi.fn(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Inject global variable fallback to safeguard against undefined variable ReferenceErrors
    global.storedRole = "admin";

    // Reset defaults
    mockIsAuthenticated = true;
    mockIsVerified = true;
    mockRole = null;
    mockUser = { email: "user@leapmentor.app", roles: ["mentor"] };
  });

  afterEach(() => {
    delete global.storedRole;
  });

  it("should permit rendering of target children components under verified authorized states (Happy Path)", () => {
    render(
      <ProtectedRoute role="mentor">
        <div data-testid="protected-content">Secret Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-navigate")).not.toBeInTheDocument();
  });

  it("should redirect unauthenticated sessions to the mentor-specific login screen path", () => {
    mockIsAuthenticated = false;

    render(
      <ProtectedRoute role="mentor">
        <div>Content</div>
      </ProtectedRoute>,
    );

    const navigationNode = screen.getByTestId("mock-navigate");
    expect(navigationNode).toBeInTheDocument();
    expect(navigationNode.getAttribute("data-to")).toBe("/login/mentor");
    expect(navigationNode.getAttribute("data-replace")).toBe("true");
  });

  it("should redirect unauthenticated sessions to the mentee-specific login screen path", () => {
    mockIsAuthenticated = false;

    render(
      <ProtectedRoute role="mentee">
        <div>Content</div>
      </ProtectedRoute>,
    );

    const navigationNode = screen.getByTestId("mock-navigate");
    expect(navigationNode.getAttribute("data-to")).toBe("/login/mentee");
  });

  it("should redirect unauthenticated sessions to the admin login screen path", () => {
    mockIsAuthenticated = false;

    render(
      <ProtectedRoute role="admin">
        <div>Content</div>
      </ProtectedRoute>,
    );

    const navigationNode = screen.getByTestId("mock-navigate");
    expect(navigationNode.getAttribute("data-to")).toBe("/admin/login");
  });

  it("should render admin children once an authenticated session carries the admin role", () => {
    mockRole = "admin";

    render(
      <ProtectedRoute role="admin">
        <div data-testid="admin-content">Secret Admin Dashboard</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-navigate")).not.toBeInTheDocument();
  });

  it("should redirect an authenticated non-admin session away from admin-only routes", () => {
    // Authenticated as a mentor/mentee session, not an admin one.
    mockRole = null;

    render(
      <ProtectedRoute role="admin">
        <div>Content</div>
      </ProtectedRoute>,
    );

    const navigationNode = screen.getByTestId("mock-navigate");
    expect(navigationNode).toBeInTheDocument();
    expect(navigationNode.getAttribute("data-to")).toBe("/admin/login");
  });

  it("should prevent cross-dashboard access routing when authenticated session lacks explicit role mapping parameters", () => {
    // Authenticated user is a mentor, trying to access a mentee-only path
    mockUser.roles = ["mentor"];
    global.storedRole = "mentor";

    render(
      <ProtectedRoute role="mentee">
        <div>Content</div>
      </ProtectedRoute>,
    );

    const navigationNode = screen.getByTestId("mock-navigate");
    expect(navigationNode).toBeInTheDocument();
    expect(navigationNode.getAttribute("data-to")).toBe("/dashboard/mentor");
  });

  it("should intercept authenticated sessions and redirect to email verification views if account remains unverified", () => {
    mockIsVerified = false;
    mockUser.roles = ["mentor"];
    global.storedRole = "mentor";

    render(
      <ProtectedRoute role="mentor">
        <div>Content</div>
      </ProtectedRoute>,
    );

    const navigationNode = screen.getByTestId("mock-navigate");
    expect(navigationNode).toBeInTheDocument();
    expect(navigationNode.getAttribute("data-to")).toBe("/verify-email");

    const parsedState = JSON.parse(navigationNode.getAttribute("data-state"));
    expect(parsedState).toEqual({
      email: "user@leapmentor.app",
      role: "mentor",
    });
  });

  it("should fall back to prop parameters configuration safely if global storage reference states are completely absent", () => {
    mockIsVerified = false;
    mockUser.roles = ["mentor"];
    global.storedRole = undefined; // Force evaluate fallback || assignment branch

    render(
      <ProtectedRoute role="mentor">
        <div>Content</div>
      </ProtectedRoute>,
    );

    const navigationNode = screen.getByTestId("mock-navigate");
    const parsedState = JSON.parse(navigationNode.getAttribute("data-state"));
    expect(parsedState.role).toBe("mentor");
  });

  it("should never apply the email-verification gate to admin sessions", () => {
    mockRole = "admin";
    mockIsVerified = false;

    render(
      <ProtectedRoute role="admin">
        <div data-testid="admin-content">Secret Admin Dashboard</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-navigate")).not.toBeInTheDocument();
  });
});
