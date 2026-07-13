import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseNavigate = vi.fn();
const mockUseDispatch = vi.fn();
const mockLogin = vi.fn();
const mockSetAuthRole = vi.fn();
const mockSetUser = vi.fn();
const mockUseGoogleAuth = vi.fn();

vi.mock("react-redux", () => ({
  useDispatch: () => mockUseDispatch,
}));
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockUseNavigate,
}));
vi.mock("@features/auth/api/auth.api", () => ({
  login: (...args) => mockLogin(...args),
}));
vi.mock("@features/auth/store/authSlice", () => ({
  setUser: (...args) => mockSetUser(...args),
}));
vi.mock("@features/auth/hooks/useGoogleAuth", () => ({
  __esModule: true,
  default: (...args) => mockUseGoogleAuth(...args),
}));
vi.mock("@features/auth/components/AuthSSOButtons", () => ({
  __esModule: true,
  default: ({ onLinkedIn }) => (
    <button type="button" onClick={onLinkedIn}>
      LinkedIn
    </button>
  ),
}));
vi.mock("@features/auth/components/AuthUI", () => ({
  __esModule: true,
  AuthBrand: ({ logo }) => <div data-testid="auth-brand">{logo}</div>,
}));
vi.mock("@features/auth/components/AuthIcons", () => ({
  LeapMentorLogo: () => <div data-testid="logo" />,
}));
vi.mock("@components/common/FullScreenLoader", () => ({
  __esModule: true,
  default: ({ message }) => <div data-testid="loader">{message}</div>,
}));
vi.mock("@lib/cookies", () => ({
  setAuthRole: (...args) => mockSetAuthRole(...args),
}));
vi.mock("@lib/logger", () => ({
  __esModule: true,
  default: { info: vi.fn() },
}));
vi.mock("@lib/auth/passwordIconUtils", () => ({
  getPasswordToggleIcon: vi.fn(() => <span data-testid="toggle-icon" />),
}));

import LoginForm from "./LoginForm";

const setUp = () =>
  render(<LoginForm placeholder="you@example.com" registerPath="/register" />);

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the login form with placeholder and register link", () => {
    setUp();

    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Login to Dashboard/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register here/i }),
    ).toBeInTheDocument();
  });

  it("toggles password visibility when the toggle button is clicked", () => {
    setUp();

    const toggle = screen.getByRole("button", {
      name: /Show password|Hide password/i,
    });
    const passwordInput = screen.getByLabelText(/Password/i, {
      selector: "input",
    });
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggle);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(toggle);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows validation errors when fields are empty and submit is clicked", async () => {
    setUp();

    const submit = screen.getByRole("button", { name: /Login to Dashboard/i });
    fireEvent.submit(submit.closest("form"));

    const alerts = await screen.findAllByRole("alert");
    const texts = alerts.map((n) => n.textContent);
    expect(
      texts.some((t) => /Enter a valid email address/i.test(t)),
    ).toBeTruthy();
    expect(texts.some((t) => /Password is required/i.test(t))).toBeTruthy();
  });

  it("calls login and handles successful auth flow", async () => {
    mockLogin.mockResolvedValue({
      data: { user: { roles: ["mentor"] }, accessToken: "abc" },
    });

    setUp();

    fireEvent.input(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "mentor@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/Password/i, { selector: "input" }), {
      target: { value: "Password1!" },
    });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Login to Dashboard/i }),
      ).toBeEnabled(),
    );
    const submitBtn = screen.getByRole("button", {
      name: /Login to Dashboard/i,
    });
    fireEvent.submit(submitBtn.closest("form"));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith(
        "mentor@example.com",
        "Password1!",
      ),
    );
    expect(mockSetAuthRole).toHaveBeenCalledWith("mentor");
    await waitFor(
      () => expect(mockUseNavigate).toHaveBeenCalledWith("/dashboard/mentor"),
      { timeout: 2000 },
    );
  });

  it("shows an error message when login fails with invalid credentials", async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    setUp();
    fireEvent.input(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/Password/i, { selector: "input" }), {
      target: { value: "Password1!" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /Login to Dashboard/i,
    });
    fireEvent.submit(submitBtn.closest("form"));

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });

  it("redirects to verify email when login fails with unverified email", async () => {
    mockLogin.mockRejectedValue({
      response: {
        status: 403,
        data: {
          message: "Email not verified",
          isEmailVerified: false,
          email: "user@example.com",
        },
      },
    });
    setUp();
    fireEvent.input(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/Password/i, { selector: "input" }), {
      target: { value: "Password1!" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /Login to Dashboard/i,
    });
    fireEvent.submit(submitBtn.closest("form"));

    expect(
      await screen.findByText(/Please verify your email first/i),
    ).toBeInTheDocument();
    await waitFor(
      () =>
        expect(mockUseNavigate).toHaveBeenCalledWith(
          "/verify-email?email=user%40example.com",
        ),
      { timeout: 2000 },
    );
  });

  it("redirects to register when Register here button is clicked", () => {
    setUp();
    fireEvent.click(screen.getByRole("button", { name: /Register here/i }));
    expect(mockUseNavigate).toHaveBeenCalledWith("/register");
  });

  it("invokes the LinkedIn callback when the SSO button is clicked", () => {
    setUp();
    fireEvent.click(screen.getByRole("button", { name: /LinkedIn/i }));
    expect(mockUseNavigate).not.toHaveBeenCalled();
  });
});
