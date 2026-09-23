import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const {
  mockNavigate,
  mockDispatch,
  mockSendOtp,
  mockVerifyEmail,
  mockVerifyMagicLink,
  mockClearMessages,
  routerState,
  authState,
} = vi.hoisted(() => {
  const matchByType = (type) => (action) => action?.type === type;

  const mockSendOtp = vi.fn((payload) => ({
    type: "sendOtp/fulfilled",
    payload,
  }));
  mockSendOtp.fulfilled = { match: matchByType("sendOtp/fulfilled") };

  const mockVerifyEmail = vi.fn((payload) => ({
    type: "verifyEmail/fulfilled",
    payload,
  }));
  mockVerifyEmail.fulfilled = { match: matchByType("verifyEmail/fulfilled") };

  const mockVerifyMagicLink = vi.fn((payload) => ({
    type: "verifyMagicLink/fulfilled",
    payload,
  }));
  mockVerifyMagicLink.fulfilled = {
    match: matchByType("verifyMagicLink/fulfilled"),
  };

  return {
    mockNavigate: vi.fn(),
    mockDispatch: vi.fn((action) => Promise.resolve(action)),
    mockSendOtp,
    mockVerifyEmail,
    mockVerifyMagicLink,
    mockClearMessages: vi.fn(() => ({ type: "clearMessages" })),
    routerState: { location: { state: {} }, search: "" },
    authState: { current: { loading: false, sending: false, error: "", successMsg: "" } },
  };
});

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => routerState.location,
  useSearchParams: () => [new URLSearchParams(routerState.search)],
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({ auth: authState.current }),
}));

vi.mock("@features/auth/models/authSlice", () => ({
  sendOtp: mockSendOtp,
  verifyEmail: mockVerifyEmail,
  verifyMagicLink: mockVerifyMagicLink,
  clearMessages: mockClearMessages,
}));

vi.mock("@components/common/FullScreenLoader", () => ({
  default: ({ message }) => <div data-testid="loader">{message}</div>,
}));

vi.mock("@constants/images", () => ({
  IMAGES: { VERIFY_EMAIL: "img.jpg", LOGO: "logo.png" },
}));

import VerifyEmail from "./VerifyEmail";

const fillOtp = async (digits = "123456") => {
  const boxes = screen.getAllByLabelText(/OTP digit/);
  for (let i = 0; i < digits.length; i += 1) {
    fireEvent.change(boxes[i], { target: { value: digits[i] } });
  }
};

describe("VerifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routerState.location = { state: {} };
    routerState.search = "";
    authState.current = {
      loading: false,
      sending: false,
      error: "",
      successMsg: "",
    };
    mockDispatch.mockImplementation((action) => Promise.resolve(action));
    mockSendOtp.mockImplementation((payload) => ({
      type: "sendOtp/fulfilled",
      payload,
    }));
    mockVerifyEmail.mockImplementation((payload) => ({
      type: "verifyEmail/fulfilled",
      payload,
    }));
    mockVerifyMagicLink.mockImplementation((payload) => ({
      type: "verifyMagicLink/fulfilled",
      payload,
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders header and email fallback when no email is provided", () => {
    render(<VerifyEmail />);

    expect(screen.getByRole("heading", { name: /Verify your email/i })).toBeInTheDocument();
    expect(screen.getByText("your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByAltText("LeapMentor logo")).toHaveAttribute("src", "logo.png");
    expect(
      screen.getByAltText("A mentor and mentee in a professional setting"),
    ).toHaveAttribute("src", "img.jpg");
  });

  it("hides the hero image when it fails to load", () => {
    render(<VerifyEmail />);
    const hero = screen.getByAltText(
      "A mentor and mentee in a professional setting",
    );
    fireEvent.error(hero);
    expect(hero).toHaveStyle({ display: "none" });
  });

  it("shows a redux error and ignores successMsg for the error banner", () => {
    authState.current = {
      loading: false,
      sending: false,
      error: "Session expired",
      successMsg: "ignored",
    };
    render(<VerifyEmail />);
    expect(screen.getByRole("alert")).toHaveTextContent("Session expired");
  });

  it("shows Verifying... and Sending... labels from auth state", () => {
    authState.current = {
      loading: true,
      sending: true,
      error: "",
      successMsg: "",
    };
    render(<VerifyEmail />);
    expect(screen.getByText("Verifying...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verifying/i })).toBeDisabled();
    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sending/i })).toBeDisabled();
  });

  it("navigates back to login", async () => {
    const user = userEvent.setup();
    render(<VerifyEmail />);
    await user.click(screen.getByRole("button", { name: /Back to Login/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows an error when Resend OTP is clicked with an empty email", async () => {
    render(<VerifyEmail />);
    fireEvent.click(screen.getByRole("button", { name: /Resend OTP/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      /Please enter your email first\./i,
    );
    expect(mockSendOtp).not.toHaveBeenCalled();
  });

  it("sends OTP and shows a success alert", async () => {
    render(<VerifyEmail />);
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "me@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Resend OTP/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "OTP sent to your email.",
    );
    expect(mockSendOtp).toHaveBeenCalledWith({ email: "me@example.com" });
    expect(mockClearMessages).toHaveBeenCalled();
  });

  it("shows send-OTP failure from payload or the fallback message", async () => {
    mockSendOtp.mockImplementation(() => ({
      type: "sendOtp/rejected",
      payload: "Rate limited",
    }));
    render(<VerifyEmail />);
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "me@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Resend OTP/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Rate limited");

    mockSendOtp.mockImplementation(() => ({ type: "sendOtp/rejected" }));
    fireEvent.click(screen.getByRole("button", { name: /Resend OTP/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to send OTP.",
    );
  });

  it("auto-sends OTP when location state includes an email", async () => {
    routerState.location = { state: { email: "auto@example.com" } };
    render(<VerifyEmail />);

    await waitFor(() =>
      expect(mockSendOtp).toHaveBeenCalledWith({ email: "auto@example.com" }),
    );
    expect(screen.queryByPlaceholderText(/you@example.com/i)).not.toBeInTheDocument();
    expect(screen.getByText("auto@example.com")).toBeInTheDocument();
  });

  it("rejects verify when email or OTP is incomplete", async () => {
    render(<VerifyEmail />);
    fireEvent.submit(screen.getByRole("button", { name: /Verify Email/i }).closest("form"));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Email and full 6-digit OTP are required.",
    );

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "me@example.com" },
    });
    fireEvent.change(screen.getByLabelText("OTP digit 1 of 6"), {
      target: { value: "1" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Verify Email/i }).closest("form"));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Email and full 6-digit OTP are required.",
    );
  });

  it("ignores non-digit OTP input, focuses on backspace, and accepts paste", () => {
    render(<VerifyEmail />);
    const boxes = screen.getAllByLabelText(/OTP digit/);

    fireEvent.change(boxes[0], { target: { value: "a" } });
    expect(boxes[0]).toHaveValue("");

    fireEvent.change(boxes[0], { target: { value: "1" } });
    expect(boxes[0]).toHaveValue("1");

    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
    fireEvent.keyDown(boxes[1], { key: "Backspace" });
    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();

    fireEvent.paste(boxes[0].parentElement, {
      clipboardData: { getData: () => "987654" },
    });
    expect(boxes.map((box) => box.value).join("")).toBe("987654");
  });

  it("verifies OTP and redirects to login", async () => {
    render(<VerifyEmail />);
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "me@example.com" },
    });
    await fillOtp("123456");
    fireEvent.submit(screen.getByRole("button", { name: /Verify Email/i }).closest("form"));

    await waitFor(() =>
      expect(mockVerifyEmail).toHaveBeenCalledWith({
        email: "me@example.com",
        otp: "123456",
      }),
    );
    expect(await screen.findByTestId("loader")).toHaveTextContent(
      "Email verified! Redirecting...",
    );
    await waitFor(
      () => expect(mockNavigate).toHaveBeenCalledWith("/login"),
      { timeout: 2000 },
    );
  });

  it("shows verify failure from payload or the fallback message", async () => {
    mockVerifyEmail.mockImplementation(() => ({
      type: "verifyEmail/rejected",
      payload: "Wrong OTP",
    }));
    render(<VerifyEmail />);
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "me@example.com" },
    });
    await fillOtp("123456");
    fireEvent.submit(screen.getByRole("button", { name: /Verify Email/i }).closest("form"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong OTP");

    mockVerifyEmail.mockImplementation(() => ({ type: "verifyEmail/rejected" }));
    fireEvent.submit(screen.getByRole("button", { name: /Verify Email/i }).closest("form"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "OTP verification failed.",
    );
  });

  it("auto-verifies a magic link and redirects", async () => {
    routerState.search = "token=abc&email=magic%40example.com";
    render(<VerifyEmail />);

    expect(
      screen.getByText("Verifying your magic link, please wait..."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Verify Email/i })).not.toBeInTheDocument();

    await waitFor(() =>
      expect(mockVerifyMagicLink).toHaveBeenCalledWith({
        token: "abc",
        email: "magic@example.com",
      }),
    );
    expect(await screen.findByTestId("loader")).toBeInTheDocument();
    await waitFor(
      () => expect(mockNavigate).toHaveBeenCalledWith("/login"),
      { timeout: 2500 },
    );
  });

  it("shows magic-link failure from payload or the fallback message", async () => {
    routerState.search = "token=bad&email=magic%40example.com";
    mockVerifyMagicLink.mockImplementation(() => ({
      type: "verifyMagicLink/rejected",
      payload: "Link expired",
    }));
    render(<VerifyEmail />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Link expired");
    expect(screen.getByRole("button", { name: /Verify Email/i })).toBeInTheDocument();
  });

  it("uses the fallback magic-link error when payload is missing", async () => {
    routerState.search = "token=bad&email=magic%40example.com";
    mockVerifyMagicLink.mockImplementation(() => ({
      type: "verifyMagicLink/rejected",
    }));
    render(<VerifyEmail />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Magic link verification failed.",
    );
  });

  it("hides the email field when the email is present in search params", () => {
    routerState.search = "email=only%40example.com";
    render(<VerifyEmail />);
    expect(screen.queryByPlaceholderText(/you@example.com/i)).not.toBeInTheDocument();
    expect(screen.getByText("your email")).toBeInTheDocument();
  });

  it("falls back to otp-box ids when crypto.randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {});
    render(<VerifyEmail />);
    expect(screen.getByLabelText("OTP digit 1 of 6")).toBeInTheDocument();
  });
});
