import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import App from "./App";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import { hasSessionHint, clearAuthRole } from "@lib/cookies";
import { setUser, logout } from "@features/auth/store/authSlice";

// ── 1. Mock External Modules & Libraries ──────────────────────────────────
vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock("@features/auth/store/authSlice", () => ({
  setUser: vi.fn((payload) => ({ type: "auth/setUser", payload })),
  logout: vi.fn(() => ({ type: "auth/logout" })),
}));

vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("@lib/logger", () => ({
  default: {
    warn: vi.fn(),
  },
}));

vi.mock("@lib/cookies", () => ({
  hasSessionHint: vi.fn(),
  clearAuthRole: vi.fn(),
}));

// ── 2. Mock Page Components & Route Wrappers ──────────────────────────────
vi.mock("@features/marketing/pages/Home", () => ({
  default: () => <div>Home Component</div>,
}));
vi.mock("@app/pages/NotFound", () => ({
  default: () => <div>NotFound Component</div>,
}));
vi.mock("@features/auth/pages/Register", () => ({
  default: () => <div>Register Component</div>,
}));
vi.mock("@features/auth/pages/LoginMentor", () => ({
  default: () => <div>LoginMentor Component</div>,
}));
vi.mock("@features/auth/pages/LoginMentee", () => ({
  default: () => <div>LoginMentee Component</div>,
}));
vi.mock("@features/auth/pages/VerifyEmail", () => ({
  default: () => <div>VerifyEmail Component</div>,
}));
vi.mock("@features/auth/pages/ForgotPassword", () => ({
  default: () => <div>ForgotPassword Component</div>,
}));
vi.mock("@features/auth/pages/SSOCallback", () => ({
  default: () => <div>SSOCallback Component</div>,
}));
vi.mock("@features/mentor/pages/MentorOnboarding", () => ({
  default: () => <div>MentorOnboarding Component</div>,
}));
vi.mock("@features/mentor/pages/MentorVerification", () => ({
  default: () => <div>MentorVerification Component</div>,
}));
vi.mock("@features/mentee/pages/MenteeOnboarding", () => ({
  default: () => <div>MenteeOnboarding Component</div>,
}));
vi.mock("@features/mentee/components/profile/MenteeEditProfileShell", () => ({
  default: () => <div>MenteeEditProfileShell Component</div>,
}));
vi.mock("@features/mentor/components/profile/MentorEditProfileShell", () => ({
  default: () => <div>MentorEditProfileShell Component</div>,
}));
vi.mock("@features/mentor/pages/MentorDashboard", () => ({
  default: () => <div>MentorDashboard Component</div>,
}));
vi.mock("@features/mentee/pages/MenteeDashboard", () => ({
  default: () => <div>MenteeDashboard Component</div>,
}));
vi.mock("@features/shared-dashboard/pages/SharedDashboardPage", () => ({
  default: () => <div>SharedDashboardPage Component</div>,
}));
vi.mock("@features/admin/pages/AdminLogin", () => ({
  default: () => <div>AdminLogin Component</div>,
}));
vi.mock("@features/admin/pages/AdminUserManagement", () => ({
  default: () => <div>AdminUserManagement Component</div>,
}));
vi.mock("@features/admin/pages/AdminEngagements", () => ({
  default: () => <div>AdminEngagements Component</div>,
}));
vi.mock("@features/admin/pages/AdminReports", () => ({
  default: () => <div>AdminReports Component</div>,
}));
vi.mock("@features/admin/pages/AdminPayments", () => ({
  default: () => <div>AdminPayments Component</div>,
}));
vi.mock("@features/admin/pages/AdminSettings", () => ({
  default: () => <div>AdminSettings Component</div>,
}));
vi.mock("@features/admin/components/AdminSupportMessages", () => ({
  default: () => <div>AdminSupportMessages Component</div>,
}));
vi.mock("@features/admin/components/AdminLayout", () => ({
  default: ({ children }) => <div>AdminLayout Component {children}</div>,
}));
vi.mock("@features/admin/pages/AdminWalletRequests", () => ({
  default: () => <div>AdminWalletRequests Component</div>,
}));
vi.mock("@features/admin/pages/AdminVerifications", () => ({
  default: () => <div>AdminVerifications Component</div>,
}));

vi.mock("@features/admin/components/AdminRoute", () => ({
  default: ({ children }) => <div>AdminRoute Wrapper {children}</div>,
}));
vi.mock("@features/auth/components/ProtectedRoute", () => ({
  default: ({ children }) => <div>ProtectedRoute Wrapper {children}</div>,
}));
vi.mock("@features/admin/context/AdminAuthContext", () => ({
  AdminAuthProvider: ({ children }) => (
    <div>AdminAuthProvider Component {children}</div>
  ),
}));

// ── 3. Test Suites ────────────────────────────────────────────────────────
describe("App", () => {
  const mockDispatch = vi.fn();
  const originalLocation = globalThis.window.location;
  let interceptedHref = "";
  let currentPath = "/";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    interceptedHref = "";
    currentPath = "/";

    delete globalThis.window.location;
    globalThis.window.location = {
      get href() {
        return `http://localhost${currentPath}`;
      },
      set href(value) {
        interceptedHref = value;
        currentPath = value.startsWith("/") ? value : new URL(value).pathname;
      },
      get origin() {
        return "http://localhost";
      },
      get pathname() {
        return currentPath;
      },
      get search() {
        return "";
      },
      get hash() {
        return "";
      },
      assign: vi.fn((val) => {
        interceptedHref = val;
      }),
      replace: vi.fn((val) => {
        interceptedHref = val;
      }),
      reload: vi.fn(),
    };
  });

  afterAll(() => {
    globalThis.window.location = originalLocation;
  });

  // ── Session Rehydration Logic Branches ──────────────────────────────────
  it("should render target page immediately when no session hint cookie is present", async () => {
    vi.mocked(hasSessionHint).mockReturnValue(false);
    vi.mocked(useSelector).mockReturnValue(null);

    currentPath = "/";
    render(<App />);

    expect(await screen.findByText("Home Component")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should render target page immediately when access token is already available in Redux", async () => {
    vi.mocked(hasSessionHint).mockReturnValue(true);
    vi.mocked(useSelector).mockReturnValue("valid-redux-token");

    currentPath = "/login";
    render(<App />);

    expect(
      await screen.findByText("LoginMentee Component"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should block UI with loader and successfully refresh token if session hint exists without an access token", async () => {
    vi.mocked(hasSessionHint).mockReturnValue(true);
    vi.mocked(useSelector).mockReturnValue(null);

    axiosInstance.post.mockResolvedValueOnce({
      data: {
        user: { id: "user-123", email: "user@leapmentor.com" },
        accessToken: "newly-refreshed-token",
      },
    });

    currentPath = "/";
    render(<App />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    expect(await screen.findByText("Home Component")).toBeInTheDocument();
    expect(axiosInstance.post).toHaveBeenCalledWith("/auth/refresh");
    expect(mockDispatch).toHaveBeenCalledWith(
      setUser({
        user: { id: "user-123", email: "user@leapmentor.com" },
        accessToken: "newly-refreshed-token",
      }),
    );
  });

  it("should catch errors on failed refresh, trigger clean-up log, and handle location redirect", async () => {
    vi.mocked(hasSessionHint).mockReturnValue(true);
    vi.mocked(useSelector).mockReturnValue(null);

    axiosInstance.post.mockRejectedValueOnce(
      new Error("Refresh token expired"),
    );

    currentPath = "/dashboard/mentor";
    render(<App />);

    // Wait for the rehydration state to complete and release the fallback UI
    expect(
      await screen.findByText("MentorDashboard Component"),
    ).toBeInTheDocument();

    expect(interceptedHref).toBe("/login");
    expect(mockDispatch).toHaveBeenCalledWith(logout());
    expect(clearAuthRole).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      "Silent refresh failed — redirecting to login",
    );
  });

  // ── Router Declarations & Component Matching Matrix ─────────────────────
  const navigationMatrix = [
    { path: "/", targetText: "Home Component" },
    { path: "/register", targetText: "Register Component" },
    { path: "/login", targetText: "LoginMentee Component" },
    { path: "/login/mentor", targetText: "LoginMentor Component" },
    { path: "/login/mentee", targetText: "LoginMentee Component" },
    { path: "/verify-email", targetText: "VerifyEmail Component" },
    { path: "/forgot-password", targetText: "ForgotPassword Component" },
    { path: "/sso-callback", targetText: "SSOCallback Component" },
    {
      path: "/onboarding/mentor",
      targetText: "MentorOnboarding Component",
      wrappers: ["ProtectedRoute Wrapper"],
    },
    {
      path: "/verify-documents",
      targetText: "MentorVerification Component",
      wrappers: ["ProtectedRoute Wrapper"],
    },
    {
      path: "/onboarding/mentee",
      targetText: "MenteeOnboarding Component",
      wrappers: ["ProtectedRoute Wrapper"],
    },
    {
      path: "/dashboard/mentee/edit-profile",
      targetText: "MenteeEditProfileShell Component",
      wrappers: ["ProtectedRoute Wrapper"],
    },
    {
      path: "/dashboard/mentor/edit-profile",
      targetText: "MentorEditProfileShell Component",
      wrappers: ["ProtectedRoute Wrapper"],
    },
    {
      path: "/dashboard/mentor",
      targetText: "MentorDashboard Component",
      wrappers: ["ProtectedRoute Wrapper"],
    },
    {
      path: "/dashboard/mentee",
      targetText: "MenteeDashboard Component",
      wrappers: ["ProtectedRoute Wrapper"],
    },
    {
      path: "/shared-dashboard/req-999",
      targetText: "SharedDashboardPage Component",
    },
    {
      path: "/admin/login",
      targetText: "AdminLogin Component",
      wrappers: ["AdminAuthProvider Component"],
    },
    {
      path: "/admin/users",
      targetText: "AdminUserManagement Component",
      wrappers: ["AdminAuthProvider Component", "AdminRoute Wrapper"],
    },
    {
      path: "/admin/engagements",
      targetText: "AdminEngagements Component",
      wrappers: ["AdminAuthProvider Component", "AdminRoute Wrapper"],
    },
    {
      path: "/admin/reports",
      targetText: "AdminReports Component",
      wrappers: ["AdminAuthProvider Component", "AdminRoute Wrapper"],
    },
    {
      path: "/admin/payments",
      targetText: "AdminPayments Component",
      wrappers: ["AdminAuthProvider Component", "AdminRoute Wrapper"],
    },
    {
      path: "/admin/settings",
      targetText: "AdminSettings Component",
      wrappers: ["AdminAuthProvider Component", "AdminRoute Wrapper"],
    },
    {
      path: "/admin/wallet-requests",
      targetText: "AdminWalletRequests Component",
      wrappers: ["AdminAuthProvider Component", "AdminRoute Wrapper"],
    },
    {
      path: "/admin/support",
      targetText: "AdminSupportMessages Component",
      wrappers: [
        "AdminAuthProvider Component",
        "AdminRoute Wrapper",
        "AdminLayout Component",
      ],
    },
    {
      path: "/admin/verifications",
      targetText: "AdminVerifications Component",
      wrappers: [
        "AdminAuthProvider Component",
        "AdminRoute Wrapper",
        "AdminLayout Component",
      ],
    },
    { path: "/unknown-route-fallback-test", targetText: "NotFound Component" },
  ];

  it.each(navigationMatrix)(
    "should properly resolve route match mapping for path '$path'",
    async ({ path, targetText, wrappers }) => {
      vi.mocked(hasSessionHint).mockReturnValue(false);
      vi.mocked(useSelector).mockReturnValue("active-token");

      currentPath = path;
      render(<App />);

      expect(
        await screen.findByText(new RegExp(targetText, "i")),
      ).toBeInTheDocument();

      if (wrappers) {
        wrappers.forEach((wrapper) => {
          expect(
            screen.getByText(new RegExp(wrapper, "i")),
          ).toBeInTheDocument();
        });
      }
    },
  );
});
