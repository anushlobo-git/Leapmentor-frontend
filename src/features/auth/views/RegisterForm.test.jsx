import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const {
  mockNavigate,
  mockDispatch,
  mockRegisterUser,
  mockClearMessages,
  mockSetUser,
  mockLogger,
  googleAuthState,
} = vi.hoisted(() => {
  const mockRegisterUser = vi.fn((payload) => ({
    type: "auth/registerUser",
    payload,
  }));
  mockRegisterUser.fulfilled = {
    match: (result) => result?.type === "auth/registerUser/fulfilled",
  };

  return {
    mockNavigate: vi.fn(),
    mockDispatch: vi.fn(),
    mockRegisterUser,
    mockClearMessages: vi.fn(() => ({ type: "auth/clearMessages" })),
    mockSetUser: vi.fn((user) => ({ type: "auth/setUser", payload: user })),
    mockLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
    googleAuthState: { options: undefined, auth: { loading: false, error: "" } },
  };
});

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({ auth: googleAuthState.auth }),
}));

vi.mock("@features/auth/models/authSlice", () => ({
  registerUser: mockRegisterUser,
  clearMessages: mockClearMessages,
  setUser: mockSetUser,
}));

vi.mock("@features/auth/presenters/useGoogleAuth", () => ({
  default: (options) => {
    googleAuthState.options = options;
  },
}));

vi.mock("@features/auth/views/AuthSSOButtons", () => ({
  default: ({ onLinkedIn, loading, disabled }) => (
    <button
      type="button"
      data-testid="linkedin-sso"
      data-loading={String(loading)}
      data-disabled={String(disabled)}
      onClick={onLinkedIn}
    >
      LinkedIn
    </button>
  ),
}));

vi.mock("@components/common/FullScreenLoader", () => ({
  default: ({ message }) => <div data-testid="fullscreen-loader">{message}</div>,
}));

vi.mock("@components/ui/TermsAndConditionsModal", () => ({
  default: ({ isOpen, onClose, onAccept, role }) =>
    isOpen ? (
      <div data-testid="terms-modal">
        <span>modal-role:{role}</span>
        <button type="button" onClick={onClose}>
          Close terms
        </button>
        <button type="button" onClick={onAccept}>
          Accept terms
        </button>
      </div>
    ) : null,
}));

vi.mock("@lib/logger", () => ({
  default: mockLogger,
}));

import RegisterForm from "./RegisterForm";

const VALID = {
  name: "John Doe",
  email: "john@company.com",
  password: "Password1!",
  confirm: "Password1!",
};

const getPasswordInput = () =>
  screen.getByLabelText(/^Password$/, { selector: "input" });

const getConfirmInput = () =>
  screen.getByLabelText(/Confirm Password/, { selector: "input" });

const fillValidFields = async (user) => {
  await user.type(screen.getByPlaceholderText("John Doe"), VALID.name);
  await user.type(
    screen.getByPlaceholderText("name@company.com"),
    VALID.email,
  );
  await user.type(getPasswordInput(), VALID.password);
  await user.type(getConfirmInput(), VALID.confirm);
};

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    googleAuthState.auth = { loading: false, error: "" };
    googleAuthState.options = undefined;
    mockRegisterUser.fulfilled.match = (result) =>
      result?.type === "auth/registerUser/fulfilled";
    mockDispatch.mockImplementation((action) => {
      if (action?.type === "auth/registerUser") {
        return Promise.resolve({
          type: "auth/registerUser/fulfilled",
          payload: { isNewUser: true },
        });
      }
      return action;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders mentee copy by default", () => {
    render(<RegisterForm role="mentee" />);

    expect(screen.getByText("Register as Mentee")).toBeInTheDocument();
    expect(
      screen.getByText("Create your mentee account to start growing."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeDisabled();
    expect(googleAuthState.options.roles).toEqual(["mentee"]);
    expect(googleAuthState.options.setUser).toBe(mockSetUser);
  });

  it("renders mentor copy when role is mentor", () => {
    render(<RegisterForm role="mentor" />);

    expect(screen.getByText("Register as Mentor")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create your mentor account to start making an impact.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a redux error in the banner and clears messages on unmount", () => {
    googleAuthState.auth = { loading: false, error: "Email already taken" };
    const { unmount } = render(<RegisterForm role="mentee" />);

    expect(screen.getByText("Email already taken")).toBeInTheDocument();
    unmount();
    expect(mockClearMessages).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({ type: "auth/clearMessages" });
  });

  it("toggles password and confirm-password visibility", async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="mentee" />);

    const passwordToggles = screen.getAllByRole("button", {
      name: "Show password",
    });
    expect(getPasswordInput()).toHaveAttribute("type", "password");
    expect(getConfirmInput()).toHaveAttribute("type", "password");

    await user.click(passwordToggles[0]);
    expect(getPasswordInput()).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(getPasswordInput()).toHaveAttribute("type", "password");

    await user.click(passwordToggles[1]);
    expect(getConfirmInput()).toHaveAttribute("type", "text");
  });

  it("shows password strength as Weak, Fair, Good, and Strong", async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="mentee" />);
    const password = getPasswordInput();

    await user.type(password, "abcdefgh");
    fireEvent.blur(password);
    expect(await screen.findByText("Weak")).toBeInTheDocument();
    expect(screen.getAllByText("○").length).toBeGreaterThan(0);

    await user.clear(password);
    await user.type(password, "Abcdefgh");
    fireEvent.blur(password);
    expect(await screen.findByText("Fair")).toBeInTheDocument();

    await user.clear(password);
    await user.type(password, "Abcdefgh1");
    fireEvent.blur(password);
    expect(await screen.findByText("Good")).toBeInTheDocument();

    await user.clear(password);
    await user.type(password, "Abcdefgh1!");
    fireEvent.blur(password);
    expect(await screen.findByText("Strong")).toBeInTheDocument();
    expect(screen.getAllByText("✓").length).toBeGreaterThan(0);
  });

  it("shows field validation errors on submit", async () => {
    render(<RegisterForm role="mentee" />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Create Account" }).closest("form"),
    );

    expect(await screen.findByText("Name is too short")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("shows password schema and confirm-password mismatch errors", async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="mentee" />);

    await user.type(screen.getByPlaceholderText("John Doe"), VALID.name);
    await user.type(
      screen.getByPlaceholderText("name@company.com"),
      VALID.email,
    );
    await user.type(getPasswordInput(), "short");
    fireEvent.blur(getPasswordInput());
    await user.type(getConfirmInput(), "different");

    fireEvent.submit(
      screen.getByRole("button", { name: "Create Account" }).closest("form"),
    );

    expect(await screen.findByText("At least 8 characters")).toBeInTheDocument();
    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("blocks submit until terms are accepted, then clears that error when checked", async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="mentee" />);
    await fillValidFields(user);

    fireEvent.submit(
      screen.getByRole("button", { name: "Create Account" }).closest("form"),
    );

    expect(
      await screen.findByText("Please accept the terms to continue."),
    ).toBeInTheDocument();
    expect(mockRegisterUser).not.toHaveBeenCalled();

    await user.click(screen.getByRole("checkbox"));
    await waitFor(() =>
      expect(
        screen.queryByText("Please accept the terms to continue."),
      ).not.toBeInTheDocument(),
    );
  });

  it("opens and closes the terms modal from both links, and accept checks terms", async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="mentor" />);

    await user.click(screen.getByRole("button", { name: "Terms" }));
    expect(screen.getByTestId("terms-modal")).toHaveTextContent(
      "modal-role:mentor",
    );

    await user.click(screen.getByRole("button", { name: "Close terms" }));
    expect(screen.queryByTestId("terms-modal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Privacy Policy" }));
    await user.click(screen.getByRole("button", { name: "Accept terms" }));

    expect(screen.queryByTestId("terms-modal")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("submits a new user and redirects to verify-email", async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="mentee" />);
    await fillValidFields(user);
    await user.click(screen.getByRole("checkbox"));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Create Account" }),
      ).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() =>
      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: VALID.name,
        email: VALID.email,
        password: VALID.password,
        roles: ["mentee"],
        termsAccepted: true,
      }),
    );

    expect(
      await screen.findByTestId("fullscreen-loader"),
    ).toHaveTextContent("Setting up your account…");

    await waitFor(
      () =>
        expect(mockNavigate).toHaveBeenCalledWith("/verify-email", {
          state: { email: VALID.email, role: "mentee" },
        }),
      { timeout: 2000 },
    );
  });

  it("shows an already-registered error when isNewUser is false", async () => {
    mockDispatch.mockImplementation((action) => {
      if (action?.type === "auth/registerUser") {
        return Promise.resolve({
          type: "auth/registerUser/fulfilled",
          payload: { isNewUser: false },
        });
      }
      return action;
    });

    const user = userEvent.setup();
    render(<RegisterForm role="mentee" />);
    await fillValidFields(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText(
        "This email is already registered. Please login instead.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("fullscreen-loader")).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not show the new-user flow when registerUser is rejected", async () => {
    mockDispatch.mockImplementation((action) => {
      if (action?.type === "auth/registerUser") {
        return Promise.resolve({
          type: "auth/registerUser/rejected",
          payload: "Registration failed.",
        });
      }
      return action;
    });

    const user = userEvent.setup();
    render(<RegisterForm role="mentee" />);
    await fillValidFields(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => expect(mockRegisterUser).toHaveBeenCalled());
    expect(screen.queryByTestId("fullscreen-loader")).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows creating-account label while loading or submitting", async () => {
    googleAuthState.auth = { loading: true, error: "" };
    render(<RegisterForm role="mentee" />);
    expect(screen.getByText("Creating account…")).toBeInTheDocument();
    expect(screen.getByTestId("linkedin-sso")).toHaveAttribute(
      "data-loading",
      "true",
    );
  });

  it("blocks LinkedIn when terms are not accepted", async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="mentee" />);
    await user.click(screen.getByTestId("linkedin-sso"));

    expect(
      screen.getByText(
        "Please accept the terms before continuing with LinkedIn.",
      ),
    ).toBeInTheDocument();
    expect(mockLogger.info).not.toHaveBeenCalled();
  });

  it("blocks LinkedIn when role is missing after terms are accepted", async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="" />);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByTestId("linkedin-sso"));

    expect(
      screen.getByText("Something went wrong — please refresh and try again."),
    ).toBeInTheDocument();
    expect(mockLogger.info).toHaveBeenCalledWith(
      "LinkedIn SSO blocked — role missing",
      { role: "" },
    );
  });

  it("redirects to LinkedIn SSO when terms and role are present", async () => {
    const user = userEvent.setup();
    const originalLocation = globalThis.location;
    const locationStub = { href: "http://localhost/" };
    vi.stubGlobal("location", locationStub);

    render(<RegisterForm role="mentor" />);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByTestId("linkedin-sso"));

    expect(locationStub.href).toContain(
      "/auth/linkedin?role=mentor&termsAccepted=true",
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Redirecting to LinkedIn SSO (register)",
      expect.objectContaining({ url: expect.stringContaining("role=mentor") }),
    );

    vi.stubGlobal("location", originalLocation);
  });

  it("handles Google signup success for new and existing users, and Google errors", async () => {
    render(<RegisterForm role="mentor" />);

    await act(async () => {
      googleAuthState.options.onError("Google signup failed");
    });
    expect(screen.getByText("Google signup failed")).toBeInTheDocument();

    await act(async () => {
      googleAuthState.options.onSuccess({ isNewUser: true });
    });
    await waitFor(
      () =>
        expect(mockNavigate).toHaveBeenCalledWith("/onboarding/mentor"),
      { timeout: 2000 },
    );

    mockNavigate.mockClear();
    await act(async () => {
      googleAuthState.options.onSuccess({ isNewUser: false });
    });
    await waitFor(
      () =>
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentor"),
      { timeout: 2000 },
    );

    mockNavigate.mockClear();
    await act(async () => {
      googleAuthState.options.onSuccess({});
    });
    await waitFor(
      () =>
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentor"),
      { timeout: 2000 },
    );
  });

  it("navigates to login from the footer link", async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="mentee" />);
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
