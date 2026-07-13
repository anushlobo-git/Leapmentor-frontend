import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import ForgotPassword from "./ForgotPassword";
import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  clearMessages,
} from "@features/auth/store/authSlice";
import { validatePassword } from "@features/auth/utils/forgotPassword.utils";
import {
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
} from "@lib/auth/otpUtils";

// ── Shared Mutable Mock States ───────────────────────────
let mockSelectorState = { loading: false };
const mockNavigate = vi.fn();

// ── Async dispatch queue ──────────────────────────────────
// The component calls dispatch(clearMessages()) several times around every
// real thunk call (on mount, before submit, after success). clearMessages()
// is a plain synchronous action — it must NOT consume a value from the
// queue reserved for the real async thunk calls (forgotPassword,
// verifyResetOtp, resetPassword), or every test after it goes out of sync
// and the component ends up awaiting `undefined`.
let dispatchQueue = [];
const queueDispatchResult = (result) => {
  dispatchQueue.push(result);
};

const mockDispatch = vi.fn((action) => {
  if (action?.type === "auth/clearMessages") {
    // Plain action — real Redux would return it synchronously, not a promise.
    return action;
  }
  // Real async thunk call — pull the next queued result. Default to a
  // generic fulfilled response if a test forgets to queue one, rather than
  // silently returning undefined and crashing the component.
  return Promise.resolve(
    dispatchQueue.shift() ?? { meta: { requestStatus: "fulfilled" } },
  );
});

// ── Mock Framework Hooks & Stores ────────────────────────
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (callback) => callback({ auth: mockSelectorState }),
}));

// ── Mock Core Application Paths & Elements ───────────────
vi.mock("@components/common/FullScreenLoader", () => ({
  default: ({ message }) => <div data-testid="loader">{message}</div>,
}));

vi.mock("@constants/images", () => ({
  IMAGES: { LOGO: "logo.png" },
}));

vi.mock("@features/auth/store/authSlice", () => ({
  forgotPassword: vi.fn(),
  verifyResetOtp: vi.fn(),
  resetPassword: vi.fn(),
  clearMessages: vi.fn(() => ({ type: "auth/clearMessages" })),
}));

// ── Mock Internal Specialized Context Helpers ────────────
vi.mock("@features/auth/utils/forgotPassword.utils", () => ({
  STEPS: { EMAIL: "EMAIL", OTP: "OTP", PASSWORD: "PASSWORD" },
  validatePassword: vi.fn(() => ({
    passed: 4,
    rules: [
      { id: 1, label: "Rule 1", test: (pw) => pw.length > 0 },
      { id: 2, label: "Rule 2", test: (pw) => pw === "strong" },
    ],
  })),
  getStrength: vi.fn(() => ({
    width: "100%",
    color: "#22c55e",
    label: "Strong",
  })),
  getStepDotClass: vi.fn(() => "mock-dot-class"),
}));

vi.mock("@lib/auth/otpUtils", () => ({
  handleOtpChange: vi.fn(),
  handleOtpKeyDown: vi.fn(),
  handleOtpPaste: vi.fn((e, otp, setOtp) => {
    setOtp(["1", "2", "3", "4", "5", "6"]);
  }),
}));

vi.mock("@lib/auth/passwordIconUtils", () => ({
  getPasswordToggleIcon: vi.fn((show) => (show ? "HideIcon" : "ShowIcon")),
}));

describe("ForgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectorState.loading = false;
    dispatchQueue = [];

    // Standard Redux Toolkit action thunk matching configuration
    forgotPassword.fulfilled = {
      match: (action) => action?.meta?.requestStatus === "fulfilled",
    };
    verifyResetOtp.fulfilled = {
      match: (action) => action?.meta?.requestStatus === "fulfilled",
    };
    resetPassword.fulfilled = {
      match: (action) => action?.meta?.requestStatus === "fulfilled",
    };

    if (!global.crypto.randomUUID) {
      global.crypto.randomUUID = () => `mock-uuid-${Math.random()}`;
    }

    // Explicitly reset validatePassword's return value every test. It's
    // read both by the strength-preview UI on every render AND by the
    // submit handler, so a plain mockReturnValueOnce set in one test can
    // get consumed by the preview render before the submit call ever sees
    // it, and a plain mockReturnValue (no "Once") would otherwise leak
    // into every test that runs afterward.
    vi.mocked(validatePassword).mockReturnValue({
      passed: 4,
      rules: [
        { id: 1, label: "Rule 1", test: (pw) => pw.length > 0 },
        { id: 2, label: "Rule 2", test: (pw) => pw === "strong" },
      ],
    });
  });

  const advanceToOtpStep = async () => {
    queueDispatchResult({ meta: { requestStatus: "fulfilled" } });
    render(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));
    });
  };

  const advanceToPasswordStep = async () => {
    queueDispatchResult({ meta: { requestStatus: "fulfilled" } }); // Step 1
    queueDispatchResult({ meta: { requestStatus: "fulfilled" } }); // Step 2

    render(<ForgotPassword />);

    // Transition Step 1 -> Step 2
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));
    });

    // Use Paste action helper to cleanly auto-fill valid 6-digit OTP layout array metrics
    const firstOtpInput = screen.getAllByRole("textbox")[0];
    fireEvent(firstOtpInput, new Event("paste", { bubbles: true }));

    // Transition Step 2 -> Step 3
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));
    });
  };

  it("should clear previous state messages on mounting lifecycle hooks", () => {
    render(<ForgotPassword />);
    expect(mockDispatch).toHaveBeenCalledWith(clearMessages());
  });

  it("should navigate back to standard login routes when the redirect trigger button is clicked", async () => {
    render(<ForgotPassword />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Back to Login/i }));
    });
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should render disabled states inside buttons during active background loading states", () => {
    mockSelectorState.loading = true;
    render(<ForgotPassword />);
    expect(screen.getByRole("button", { name: /Sending.../i })).toBeDisabled();
  });

  it("should transition user interface context to OTP step on successful email validation workflows", async () => {
    await advanceToOtpStep();
    expect(
      screen.getByRole("heading", { name: "Enter OTP" }),
    ).toBeInTheDocument();
  });

  it("should capture and display errors inside standard component alert banners if submission rejects", async () => {
    queueDispatchResult({
      meta: { requestStatus: "rejected" },
      payload: "Email not found",
    });

    render(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));
    });

    expect(screen.getByText("Email not found")).toBeInTheDocument();
  });

  it("should fall back to standard system messages if payload returns empty on rejected operations", async () => {
    queueDispatchResult({
      meta: { requestStatus: "rejected" },
      payload: null,
    });

    render(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));
    });

    expect(screen.getByText("Failed to send OTP.")).toBeInTheDocument();
  });

  it("should raise interface validation errors if OTP validation is triggered below six digits length", async () => {
    await advanceToOtpStep();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));
    });

    expect(
      screen.getByText("Please enter the full 6-digit OTP."),
    ).toBeInTheDocument();
  });

  it("should trigger input event hooks and delegation helpers on standard input changes", async () => {
    await advanceToOtpStep();
    const firstBox = screen.getAllByRole("textbox")[0];

    fireEvent.change(firstBox, { target: { value: "1" } });
    fireEvent.keyDown(firstBox, { key: "Backspace" });

    expect(handleOtpChange).toHaveBeenCalled();
    expect(handleOtpKeyDown).toHaveBeenCalled();
  });

  it("should process copy paste interactions correctly across unified otp blocks", async () => {
    await advanceToOtpStep();
    const firstOtpInput = screen.getAllByRole("textbox")[0];

    fireEvent(firstOtpInput, new Event("paste", { bubbles: true }));
    expect(handleOtpPaste).toHaveBeenCalled();
  });

  it("should support resending operations and reset state metrics on user interaction parameters", async () => {
    await advanceToOtpStep();

    queueDispatchResult({ meta: { requestStatus: "fulfilled" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Resend OTP/i }));
    });

    expect(forgotPassword).toHaveBeenCalledTimes(2);
  });

  it("should advance state structures cleanly to password selection on successful otp matching", async () => {
    await advanceToPasswordStep();
    expect(
      screen.getByRole("heading", { name: "Set New Password" }),
    ).toBeInTheDocument();
  });

  it("should show inline warnings if server returns validation exceptions for matching otp tokens", async () => {
    queueDispatchResult({ meta: { requestStatus: "fulfilled" } }); // Step 1 success
    queueDispatchResult({
      meta: { requestStatus: "rejected" },
      payload: "Invalid code",
    }); // Step 2 failure

    render(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));
    });

    // Populate OTP state using copy-paste mock action boundary trigger
    const firstOtpInput = screen.getAllByRole("textbox")[0];
    fireEvent(firstOtpInput, new Event("paste", { bubbles: true }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));
    });

    expect(screen.getByText("Invalid code")).toBeInTheDocument();
  });

  it("should display standard safety meters and validation guidelines when password fields run active blur hooks", async () => {
    await advanceToPasswordStep();
    const pwInput = screen.getByPlaceholderText("Min. 8 characters");

    fireEvent.change(pwInput, { target: { value: "abc" } });
    fireEvent.blur(pwInput);

    expect(screen.getByText("Strong")).toBeInTheDocument();
    expect(screen.getByText("Rule 1")).toBeInTheDocument();
  });

  it("should block form actions if local rules determine password parameters fail minimum security checks", async () => {
    // Safe to use mockReturnValue (not Once) here — beforeEach resets it
    // back to the strong-password default before the next test runs.
    vi.mocked(validatePassword).mockReturnValue({ passed: 2, rules: [] });

    await advanceToPasswordStep();
    const pwInput = screen.getByPlaceholderText("Min. 8 characters");
    fireEvent.change(pwInput, { target: { value: "weak" } });
    // Confirm Password is also `required` — must be non-empty or the
    // native form validation blocks submission before onSubmit ever runs.
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "weak" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));
    });

    expect(
      screen.getByText("Please choose a stronger password."),
    ).toBeInTheDocument();
  });

  it("should show mismatch exceptions if password verification string properties fail validation equality", async () => {
    await advanceToPasswordStep();

    fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
      target: { value: "Pass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "Diff123!" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));
    });

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("should toggle input type parameters to plain visibility layouts when eye icons run click triggers", async () => {
    await advanceToPasswordStep();

    const pwInput = screen.getByPlaceholderText("Min. 8 characters");
    const confirmInput = screen.getByPlaceholderText("Re-enter your password");
    const toggleBtns = screen.getAllByRole("button", { name: /ShowIcon/i });

    fireEvent.click(toggleBtns[0]);
    expect(pwInput).toHaveAttribute("type", "text");

    fireEvent.click(toggleBtns[1]);
    expect(confirmInput).toHaveAttribute("type", "text");
  });

  it("should show full screen intercept dashboards and handle timeout routing actions upon successful state resolutions", async () => {
    vi.useFakeTimers();

    await advanceToPasswordStep();

    // Queued *after* advanceToPasswordStep, so it's next in line for the
    // upcoming resetPassword dispatch call — matches actual call order.
    queueDispatchResult({ meta: { requestStatus: "fulfilled" } });

    fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
      target: { value: "SecurePass1!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "SecurePass1!" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));
    });

    expect(screen.getByTestId("loader")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    vi.useRealTimers();
  });

  it("should show localized system alerts inside metrics banners if password processing operations return backend exceptions", async () => {
    await advanceToPasswordStep();

    // Queued *after* advanceToPasswordStep, so it lands on the resetPassword
    // dispatch call, not on one of the earlier step calls.
    queueDispatchResult({
      meta: { requestStatus: "rejected" },
      payload: "Token Expired",
    });

    fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
      target: { value: "SecurePass1!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "SecurePass1!" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));
    });

    expect(screen.getByText("Token Expired")).toBeInTheDocument();
  });
});
