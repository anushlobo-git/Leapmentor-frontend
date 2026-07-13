import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import SSOCallback from "./SSOCallback";
import { setUser } from "@features/auth/store/authSlice";
import { exchangeLinkedInToken } from "@features/auth/api/auth.api";
import { setAuthRole } from "@lib/cookies";
import logger from "@lib/logger";

// ── Mock Framework Hooks & Stores ────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockDispatch = vi.fn();
vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

// ── Mock Core Services & Custom API Slices ───────────────
vi.mock("@features/auth/store/authSlice", () => ({
  setUser: vi.fn((payload) => ({ type: "auth/setUser", payload })),
}));

vi.mock("@features/auth/api/auth.api", () => ({
  exchangeLinkedInToken: vi.fn(),
}));

vi.mock("@lib/cookies", () => ({
  setAuthRole: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  default: {
    info: vi.fn(),
  },
}));

describe("SSOCallback", () => {
  const originalLocation = globalThis.location;
  const originalSessionStorage = globalThis.sessionStorage;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup clean storage context environments
    let storage = {};
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => {
        storage[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        storage = {};
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.location = originalLocation;
  });

  const setupUrlLocation = (searchString) => {
    vi.stubGlobal("location", {
      search: searchString,
    });
  };

  // ── Validation Errors & Unsupported Providers Branches ──
  it("should display a specialized error state when URL query parameters lack oauth code metrics", () => {
    setupUrlLocation("?provider=linkedin");
    render(<SSOCallback />);

    expect(
      screen.getByText(
        "Invalid callback. Missing code or unsupported provider.",
      ),
    ).toBeInTheDocument();
    expect(logger.info).toHaveBeenCalledWith("SSOCallback mounted", {
      provider: "linkedin",
      hasCode: false,
    });
  });

  it("should reject sign-in attempts if provider parameter is completely unsupported", () => {
    setupUrlLocation("?code=mock_code&provider=github");
    render(<SSOCallback />);

    expect(
      screen.getByText(
        "Invalid callback. Missing code or unsupported provider.",
      ),
    ).toBeInTheDocument();
  });

  it("should trigger navigation parameters to standard login routes when the error retry action button is clicked", () => {
    setupUrlLocation("?provider=invalid");
    render(<SSOCallback />);

    const retryBtn = screen.getByRole("button", { name: /Back to login/i });
    fireEvent.click(retryBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // ── Double Invocations Guard / Anti-Race Condition Branch ──
  it("should immediately return out and block multiple exchange processing paths if auth token code matches storage", () => {
    setupUrlLocation("?code=duplicate_token&provider=linkedin");
    sessionStorage.setItem("linkedin_code_used", "duplicate_token");

    render(<SSOCallback />);
    expect(exchangeLinkedInToken).not.toHaveBeenCalled();
  });

  // ── State Parsing / Base64 Safe Decryption Fallbacks ──────
  it("should bypass and handle corrupt or missing state payloads gracefully without throwing operational runtime exceptions", async () => {
    setupUrlLocation(
      "?code=valid_code&provider=linkedin&state=unsplitable-malformed-string",
    );
    vi.mocked(exchangeLinkedInToken).mockResolvedValueOnce({
      data: {
        user: { roles: ["mentee"] },
        isNewUser: false,
        accessToken: "token_abc",
      },
    });

    await act(async () => {
      render(<SSOCallback />);
    });

    expect(exchangeLinkedInToken).toHaveBeenCalledWith({
      code: "valid_code",
      roles: undefined,
      termsAccepted: false,
    });
  });

  // ── Successful Token Exchange Operations Branches ──────────
  it("should route active user targets to mentee dashboards upon successful token returns matching an existing profile", async () => {
    // Generate valid mock base64 token data representing state metrics payload structures
    const mockStateData = btoa(
      JSON.stringify({ role: "mentee", termsAccepted: "true" }),
    );
    setupUrlLocation(
      `?code=client_code&provider=linkedin&state=${mockStateData}.signature_placeholder`,
    );

    const mockApiResponse = {
      data: {
        user: { name: "Jane Mentee", roles: ["mentee"] },
        isNewUser: false,
        accessToken: "access_secret",
      },
    };
    vi.mocked(exchangeLinkedInToken).mockResolvedValueOnce(mockApiResponse);

    await act(async () => {
      render(<SSOCallback />);
    });

    expect(exchangeLinkedInToken).toHaveBeenCalledWith({
      code: "client_code",
      roles: ["mentee"],
      termsAccepted: true,
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      setUser({
        accessToken: "access_secret",
        user: mockApiResponse.data.user,
      }),
    );
    expect(setAuthRole).toHaveBeenCalledWith("mentee");
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee", {
      replace: true,
    });
    expect(sessionStorage.getItem("linkedin_code_used")).toBeNull();
  });

  it("should correctly identify alternative formats for boolean expressions inside state configurations", async () => {
    // Explicitly confirm execution when termsAccepted is absolute primitive boolean true
    const mockStateData = btoa(
      JSON.stringify({ role: "mentor", termsAccepted: true }),
    );
    setupUrlLocation(
      `?code=client_code&provider=linkedin&state=${mockStateData}.signature_placeholder`,
    );

    vi.mocked(exchangeLinkedInToken).mockResolvedValueOnce({
      data: { user: { roles: ["mentor"] }, isNewUser: true },
    });

    await act(async () => {
      render(<SSOCallback />);
    });

    expect(exchangeLinkedInToken).toHaveBeenCalledWith({
      code: "client_code",
      roles: ["mentor"],
      termsAccepted: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith("/onboarding/mentor", {
      replace: true,
    });
  });

  it("should support default parameter fallbacks when accessToken metadata values are entirely omitted from response structures", async () => {
    setupUrlLocation("?code=fallback_code&provider=linkedin");
    vi.mocked(exchangeLinkedInToken).mockResolvedValueOnce({
      data: { user: { roles: [] }, isNewUser: false }, // empty roles defaults target category back to mentee
    });

    await act(async () => {
      render(<SSOCallback />);
    });

    expect(setUser).toHaveBeenCalledWith({
      accessToken: null,
      user: expect.any(Object),
    });
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee", {
      replace: true,
    });
  });

  // ── Token Exchange Error Mapping Fallback Branches ─────────
  it("should process standard proxy network errors and highlight server side customized messages", async () => {
    setupUrlLocation("?code=error_code&provider=linkedin");
    const mockServerErr = {
      response: {
        data: {
          message:
            "LinkedIn profile integration deactivated by authorization nodes.",
        },
      },
    };
    vi.mocked(exchangeLinkedInToken).mockRejectedValueOnce(mockServerErr);

    await act(async () => {
      render(<SSOCallback />);
    });

    expect(
      screen.getByText(
        "LinkedIn profile integration deactivated by authorization nodes.",
      ),
    ).toBeInTheDocument();
    expect(sessionStorage.getItem("linkedin_code_used")).toBeNull();
  });

  it("should switch downstream error mapping back to runtime trace metrics if specific response arrays are unavailable", async () => {
    setupUrlLocation("?code=error_code&provider=linkedin");
    vi.mocked(exchangeLinkedInToken).mockRejectedValueOnce(
      new Error("Local operational channel timed out."),
    );

    await act(async () => {
      render(<SSOCallback />);
    });

    expect(
      screen.getByText("Local operational channel timed out."),
    ).toBeInTheDocument();
  });

  it("should present absolute final catch-all default messaging formats if error diagnostics return completely clean", async () => {
    setupUrlLocation("?code=error_code&provider=linkedin");
    vi.mocked(exchangeLinkedInToken).mockRejectedValueOnce({});

    await act(async () => {
      render(<SSOCallback />);
    });

    expect(screen.getByText("LinkedIn sign-in failed.")).toBeInTheDocument();
  });
});
