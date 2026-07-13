import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mocks: router + redux + slice actions
const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: {} }),
  useSearchParams: () => [new URLSearchParams()],
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (fn) =>
    fn({ auth: { loading: false, sending: false, error: "", successMsg: "" } }),
}));

vi.mock("@features/auth/store/authSlice", () => {
  const sendOtp = (args) => ({ type: "sendOtp/fulfilled", payload: null });
  sendOtp.fulfilled = { match: (a) => a && a.type === "sendOtp/fulfilled" };
  const verifyEmail = (args) => ({
    type: "verifyEmail/fulfilled",
    payload: null,
  });
  verifyEmail.fulfilled = {
    match: (a) => a && a.type === "verifyEmail/fulfilled",
  };
  const verifyMagicLink = (args) => ({
    type: "verifyMagicLink/fulfilled",
    payload: null,
  });
  verifyMagicLink.fulfilled = {
    match: (a) => a && a.type === "verifyMagicLink/fulfilled",
  };
  return {
    sendOtp,
    verifyEmail,
    verifyMagicLink,
    clearMessages: () => ({ type: "clear" }),
  };
});

vi.mock("@components/common/FullScreenLoader", () => ({
  __esModule: true,
  default: ({ message }) => <div data-testid="loader">{message}</div>,
}));

vi.mock("@constants/images", () => ({
  IMAGES: { VERIFY_EMAIL: "img.jpg", LOGO: "logo.png" },
}));

import VerifyEmail from "./VerifyEmail";

describe("VerifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header and instruction when no email provided", () => {
    render(<VerifyEmail />);

    expect(screen.getByText(/Verify your email/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Enter the 6-digit OTP sent to/i),
    ).toBeInTheDocument();
  });

  it("shows error when Resend OTP is clicked with empty email", () => {
    render(<VerifyEmail />);

    const resend = screen.getByRole("button", { name: /Resend OTP/i });
    fireEvent.click(resend);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Please enter your email first\./i,
    );
  });

  it("calls dispatch when Resend OTP clicked with email", async () => {
    // make dispatch return a fulfilled action
    mockDispatch.mockResolvedValue({ type: "sendOtp/fulfilled" });

    render(<VerifyEmail />);
    const input = screen.getByPlaceholderText(/you@example.com/i);
    fireEvent.change(input, { target: { value: "me@example.com" } });

    const resend = screen.getByRole("button", { name: /Resend OTP/i });
    fireEvent.click(resend);

    expect(mockDispatch).toHaveBeenCalled();
  });
});
