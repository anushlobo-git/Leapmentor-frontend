import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseNavigate = vi.fn();
const mockUseDispatch = vi.fn();
const mockLogin = vi.fn();
const mockSetAuthRole = vi.fn();
const mockSetUser = vi.fn();
const mockUseGoogleAuth = vi.fn();
//we are mocking the usedispatch and usenavigate hooks that is the dependency which is needed during the login
vi.mock("react-redux", () => ({
  useDispatch: () => mockUseDispatch,
}));
//useNaviget comes under the react-router-dom package
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockUseNavigate,
}));
vi.mock("@features/auth/models/auth.api", () => ({
  login: (...args) => mockLogin(...args),
}));
vi.mock("@features/auth/models/authSlice", () => ({
  setUser: (...args) => mockSetUser(...args),
}));
vi.mock("@features/auth/presenters/useGoogleAuth", () => ({
  __esModule: true,
  default: (...args) => mockUseGoogleAuth(...args),
}));
vi.mock("@features/auth/views/AuthSSOButtons", () => ({
  __esModule: true,
  default: ({ onLinkedIn }) => (
    <button type="button" onClick={onLinkedIn}>
      LinkedIn
    </button>
  ),
}));
vi.mock("@features/auth/views/AuthUI", () => ({
  __esModule: true,
  AuthBrand: ({ logo }) => <div data-testid="auth-brand">{logo}</div>,
}));
vi.mock("@features/auth/views/AuthIcons", () => ({
  LeapMentorLogo: () => <div data-testid="logo" />,
}));
vi.mock("@components/shared/FullScreenLoader", () => ({
  __esModule: true,
  default: ({ message }) => <div data-testid="loader">{message}</div>,
}));
vi.mock("@lib/http/cookies", () => ({
  setAuthRole: (...args) => mockSetAuthRole(...args),
}));
vi.mock("@lib/monitoring/logger", () => ({
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
  //vi.clearAllMocks() does NOT restore the mock to its initial implementation/value.
  //It only clears the recorded call history.
  beforeEach(() => {
    vi.clearAllMocks();
  });
  //vi.advanceTimersByTime(5000);  by doing this when we are using the setTimeOut in the code
  //we can skip 5 seconds from the real time to skip waiting so if its done then to reset to
  //the actual time we do it
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the login form with placeholder and register link", () => {
    setUp();
    //The i is a regular expression flag meaning case-insensitive.
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    //The i is a regular expression flag meaning case-insensitive. like
    //Login to Dashboard
     //login to dashboard
      //LOGIN TO DASHBOARD
    expect(screen.getByText(/Login to Dashboard/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register here/i }),
    ).toBeInTheDocument();
  });

  it("toggles password visibility when the toggle button is clicked", () => {
    setUp();
    //so all the html elements have a role such as button when u write <button implicitly we have
    //role="button" written for that component so we can search for that in the jsdom.
    //name is the text u give inside the <button>this text </button>
    const toggle = screen.getByRole("button", {
      name: /Show password|Hide password/i,
    });
    // to get the ui with the associated label to that input <label htmlFor="password">Password</label>
    //this is how both are connected
    //<label htmlFor="password">Password</label>   <input   id="password"  type="password" />
    const passwordInput = screen.getByLabelText(/Password/i, {
      selector: "input",
    });
    //<input id="password" type="password"></input> now id and type inside is the attribute so give the key and value
    //and search for it
    expect(passwordInput).toHaveAttribute("type", "password");
    //for simulating the user interaction with the html elements
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
    //there is 2 things that is happening here one is finding the input field and
    //filling the input field with the value we want to test and then we are submitting the form
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
