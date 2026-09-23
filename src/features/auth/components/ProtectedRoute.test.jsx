/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ProtectedRoute from "./ProtectedRoute";
import authReducer from "@features/auth/models/authSlice";

// Renders ProtectedRoute inside a router with a real (but minimal) Redux
// store, so selectIsAuthenticated/selectIsVerified/selectRole all run for
// real rather than being individually mocked — this is what actually
// exercises the role-comparison logic under test.
const renderProtected = (authState, role) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute role={role}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login/mentor" element={<div>Mentor Login Page</div>} />
          <Route path="/login/mentee" element={<div>Mentee Login Page</div>} />
          <Route path="/admin/login" element={<div>Admin Login Page</div>} />
          <Route path="/dashboard/mentor" element={<div>Mentor Dashboard</div>} />
          <Route path="/dashboard/mentee" element={<div>Mentee Dashboard</div>} />
          <Route path="/verify-email" element={<div>Verify Email Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

const baseState = {
  user: null,
  accessToken: null,
  role: null,
  adminBootstrapping: false,
  loading: false,
  sending: false,
  error: null,
  successMsg: null,
  verifiedRole: null,
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to the role-specific login page when not authenticated", () => {
    renderProtected({ ...baseState }, "mentor");
    expect(screen.getByText("Mentor Login Page")).toBeInTheDocument();
  });

  it("redirects to the mentee login page for an unauthenticated mentee route", () => {
    renderProtected({ ...baseState }, "mentee");
    expect(screen.getByText("Mentee Login Page")).toBeInTheDocument();
  });

  it("renders the protected content for a verified user with the matching role", () => {
    renderProtected(
      {
        ...baseState,
        user: { email: "m@test.com", roles: ["mentor"], isVerified: true },
        accessToken: "token",
      },
      "mentor",
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to the user's OWN dashboard (derived from their real roles) when they hit a dashboard that isn't theirs", () => {
    // This replaces the old test that relied on a bare `global.storedRole`
    // hack; the redirect target now comes from the authenticated user's
    // actual `roles` array via getPrimaryRole, never a floating global.
    renderProtected(
      {
        ...baseState,
        user: { email: "m@test.com", roles: ["mentor"], isVerified: true },
        accessToken: "token",
      },
      "mentee",
    );
    expect(screen.getByText("Mentor Dashboard")).toBeInTheDocument();
  });

  it("falls back to '/' when the user has no roles at all yet (mid-onboarding edge case)", () => {
    renderProtected(
      {
        ...baseState,
        user: { email: "m@test.com", roles: [], isVerified: true },
        accessToken: "token",
      },
      "mentor",
    );
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("redirects an unverified user to /verify-email carrying their own primary role", () => {
    renderProtected(
      {
        ...baseState,
        user: { email: "m@test.com", roles: ["mentor"], isVerified: false },
        accessToken: "token",
      },
      "mentor",
    );
    expect(screen.getByText("Verify Email Page")).toBeInTheDocument();
  });

  it("treats admin as a cookie-session role: an authenticated mentee session hitting an admin-guarded route is redirected to /admin/login, not granted access", () => {
    // Authenticated (has accessToken + user), but state.auth.role is not
    // "admin" — this exercises the currentRole !== role branch itself,
    // rather than falling out at the earlier isAuthenticated check.
    renderProtected(
      {
        ...baseState,
        user: { email: "mentee@test.com", roles: ["mentee"], isVerified: true },
        accessToken: "token",
        role: null,
      },
      "admin",
    );
    expect(screen.getByText("Admin Login Page")).toBeInTheDocument();
  });

  it("renders protected content for an authenticated admin session without requiring isVerified", () => {
    renderProtected(
      { ...baseState, user: { name: "Admin" }, role: "admin" },
      "admin",
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});

// ── Multi-role and permission-based access ─────────────────────────────
const renderWithProps = (authState, guardProps, path = "/protected") => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path={path}
            element={
              <ProtectedRoute {...guardProps}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Generic Login Page</div>} />
          <Route path="/login/mentor" element={<div>Mentor Login Page</div>} />
          <Route path="/dashboard/mentor" element={<div>Mentor Dashboard</div>} />
          <Route path="/dashboard/mentee" element={<div>Mentee Dashboard</div>} />
          <Route path="/verify-email" element={<div>Verify Email Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

const verifiedUser = (roles) => ({
  ...baseState,
  user: { email: "u@test.com", roles, isVerified: true },
  accessToken: "token",
});

describe("ProtectedRoute — roles[] and permissions", () => {
  it("admits a user who holds ANY of the listed roles", () => {
    renderWithProps(verifiedUser(["mentee"]), { roles: ["mentor", "mentee"] });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("sends a user with none of the listed roles to their own dashboard", () => {
    renderWithProps(verifiedUser(["mentee"]), { roles: ["mentor"] });
    expect(screen.getByText("Mentee Dashboard")).toBeInTheDocument();
  });

  it("uses the first listed role's login page for anonymous visitors", () => {
    renderWithProps({ ...baseState }, { roles: ["mentor", "mentee"] });
    expect(screen.getByText("Mentor Login Page")).toBeInTheDocument();
  });

  it("admits a user whose roles grant the required permission", () => {
    renderWithProps(verifiedUser(["mentor"]), {
      roles: ["mentor"],
      permissions: ["verification:upload"],
    });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("denies a user whose roles lack the permission, even if the role check passes", () => {
    // Mentee is in the allowed roles, but mentees don't hold earnings:view.
    renderWithProps(verifiedUser(["mentee"]), {
      roles: ["mentor", "mentee"],
      permissions: ["earnings:view"],
    });
    expect(screen.getByText("Mentee Dashboard")).toBeInTheDocument();
  });

  it("supports permission-only routes (no roles) and uses the generic login for anonymous visitors", () => {
    renderWithProps(verifiedUser(["mentor"]), { permissions: ["earnings:view"] });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("sends an anonymous visitor to /login for a permission-only route", () => {
    renderWithProps({ ...baseState }, { permissions: ["earnings:view"] });
    expect(screen.getByText("Generic Login Page")).toBeInTheDocument();
  });

  it("admits any verified user when neither roles nor permissions are given", () => {
    renderWithProps(verifiedUser(["mentee"]), {});
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("still requires email verification when permissions are satisfied", () => {
    renderWithProps(
      { ...verifiedUser(["mentor"]), user: { email: "u@test.com", roles: ["mentor"], isVerified: false } },
      { roles: ["mentor"], permissions: ["verification:upload"] },
    );
    expect(screen.getByText("Verify Email Page")).toBeInTheDocument();
  });

  it("never redirects a route to itself: a dashboard denying its own role falls back to '/'", () => {
    // Mentor lands on /dashboard/mentor, which (mis)requires a mentee-only
    // permission. The fallback dashboard IS this path, so go home instead
    // of looping.
    renderWithProps(
      verifiedUser(["mentor"]),
      { roles: ["mentor"], permissions: ["session:book"] },
      "/dashboard/mentor",
    );
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });
});
