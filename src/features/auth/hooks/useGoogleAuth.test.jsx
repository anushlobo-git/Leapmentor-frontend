import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { useEffect, useRef } from "react";
import axiosInstance from "@lib/axiosInstance";
import { setAuthRole } from "@lib/cookies";
import logger from "@lib/logger";

// Mock External System Modules
vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("@lib/cookies", () => ({
  setAuthRole: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("useGoogleAuth", () => {
  let savedGoogleCallback = null;

  // Dynamic wrapper factory to isolate module-level environment variables per test branch
  const renderTestComponent = async (
    props = {},
    envValue = "test-google-client-id-xyz",
  ) => {
    vi.resetModules();
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", envValue);

    // Dynamically import the hook so it evaluates the freshly stubbed environment variables
    const { default: useGoogleAuthHook } = await import("./useGoogleAuth");

    const TestAuthComponent = ({
      roles = ["mentor"],
      termsAccepted = true,
      onSuccess = vi.fn(),
      onError = vi.fn(),
      onLoadingChange = vi.fn(),
      dispatch = vi.fn(),
      setUser = vi.fn((val) => val),
      useFalsyRef = false,
    }) => {
      const btnRef = useRef(null);
      const termsAcceptedRef = useRef(termsAccepted);

      useEffect(() => {
        termsAcceptedRef.current = termsAccepted;
      }, [termsAccepted]);

      useGoogleAuthHook({
        btnRef: useFalsyRef ? { current: null } : btnRef,
        roles,
        termsAcceptedRef,
        onSuccess,
        onError,
        onLoadingChange,
        dispatch,
        setUser,
      });

      return (
        <div ref={btnRef} data-testid="google-btn-container">
          Initial Inner Content
        </div>
      );
    };

    return render(<TestAuthComponent {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Initialize global object configurations
    globalThis.__googleInitialized = false;
    globalThis.google = {
      accounts: {
        id: {
          initialize: vi.fn(({ callback }) => {
            savedGoogleCallback = callback;
          }),
          renderButton: vi.fn(),
        },
      },
    };

    // Default mock requestIdleCallback
    globalThis.requestIdleCallback = vi.fn((cb) => cb());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
    delete globalThis.google;
    delete globalThis.__googleInitialized;
    delete globalThis.requestIdleCallback;
    cleanup();
  });

  it("should trigger early error loop when VITE_GOOGLE_CLIENT_ID environment variable is completely missing", async () => {
    const mockOnError = vi.fn();

    await renderTestComponent({ onError: mockOnError }, "");

    expect(logger.error).toHaveBeenCalledWith(
      "Missing VITE_GOOGLE_CLIENT_ID in frontend .env",
    );
    expect(mockOnError).toHaveBeenCalledWith(
      "Missing VITE_GOOGLE_CLIENT_ID in frontend .env",
    );
  });

  it("should exit execution path early inside initGoogle if button reference target is missing", async () => {
    await renderTestComponent({ useFalsyRef: true });

    expect(globalThis.google.accounts.id.initialize).not.toHaveBeenCalled();
  });

  it("should bypass initialize invocation if globalThis.__googleInitialized flag has already been set true", async () => {
    globalThis.__googleInitialized = true;

    await renderTestComponent();

    expect(globalThis.google.accounts.id.initialize).not.toHaveBeenCalled();
    expect(globalThis.google.accounts.id.renderButton).toHaveBeenCalled();
  });

  it("should fall back gracefully onto standard setTimeout loops if requestIdleCallback is completely absent", async () => {
    delete globalThis.requestIdleCallback;

    await renderTestComponent();

    // Fast-forward processing window to fire standard timers fallback path
    vi.advanceTimersByTime(200);

    expect(globalThis.google.accounts.id.initialize).toHaveBeenCalled();
    expect(globalThis.google.accounts.id.renderButton).toHaveBeenCalled();
  });

  it("should listen to script element loading lifecycle when globalThis.google object configuration doesn't exist yet", async () => {
    delete globalThis.google;

    // Setup script mock element in layout head layer
    const fakeScript = document.createElement("script");
    fakeScript.src = "https://accounts.google.com/gsi/client";
    vi.spyOn(document, "querySelector").mockReturnValue(fakeScript);

    const addListenerSpy = vi.spyOn(fakeScript, "addEventListener");
    const removeListenerSpy = vi.spyOn(fakeScript, "removeEventListener");

    const { unmount } = await renderTestComponent();

    expect(addListenerSpy).toHaveBeenCalledWith("load", expect.any(Function));

    unmount();
    expect(removeListenerSpy).toHaveBeenCalledWith(
      "load",
      expect.any(Function),
    );
  });

  it("should block request execution and fire validation error inside google callback context if user terms are not accepted", async () => {
    const mockOnError = vi.fn();
    await renderTestComponent({ termsAccepted: false, onError: mockOnError });

    // Invoke captured internal callback function context
    savedGoogleCallback({ credential: "mock-credential-token" });

    expect(mockOnError).toHaveBeenCalledWith(
      "Please accept the terms to continue.",
    );
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("should complete full successful sign-in pipeline workflow, assigning authRole cookie to 'mentor'", async () => {
    const mockOnSuccess = vi.fn();
    const mockOnLoading = vi.fn();
    const mockDispatch = vi.fn();

    axiosInstance.post.mockResolvedValueOnce({
      data: {
        accessToken: "jwt-token-abc",
        user: { roles: ["mentor", "user"] },
      },
    });

    await renderTestComponent({
      onSuccess: mockOnSuccess,
      onLoadingChange: mockOnLoading,
      dispatch: mockDispatch,
      roles: ["mentor"],
    });

    await savedGoogleCallback({ credential: "mock-credential-token" });

    expect(mockOnLoading).toHaveBeenNthCalledWith(1, true);
    expect(logger.info).toHaveBeenCalledWith(
      "Google sign-in callback received",
    );
    expect(axiosInstance.post).toHaveBeenCalledWith("/auth/google", {
      credential: "mock-credential-token",
      roles: ["mentor"],
      termsAccepted: true,
    });

    expect(setAuthRole).toHaveBeenCalledWith("mentor");
    expect(mockDispatch).toHaveBeenCalledWith({
      accessToken: "jwt-token-abc",
      user: { roles: ["mentor", "user"] },
    });
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnLoading).toHaveBeenLastCalledWith(false);
  });

  it("should alternate authRole assignment to 'mentee' when response includes appropriate matching payload credentials", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: {
        accessToken: "jwt-token-def",
        user: { roles: ["mentee"] },
      },
    });

    await renderTestComponent({ roles: ["mentee"] });

    await savedGoogleCallback({ credential: "mock-credential-token" });
    expect(setAuthRole).toHaveBeenCalledWith("mentee");
  });

  it("should bypass setting authRole cookies if user attributes returns an empty list or missing roles completely", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: {
        accessToken: "jwt-token-xyz",
        user: { roles: [] },
      },
    });

    await renderTestComponent({ roles: ["guest"] });

    await savedGoogleCallback({ credential: "mock-credential-token" });
    expect(setAuthRole).not.toHaveBeenCalled();
  });

  it("should parse exception messages securely from response data wrappers when network actions fail", async () => {
    const mockOnError = vi.fn();
    const networkErrorResponse = {
      response: {
        data: {
          message: "Account has been suspended by administration rules.",
        },
      },
    };

    axiosInstance.post.mockRejectedValueOnce(networkErrorResponse);

    await renderTestComponent({ onError: mockOnError });

    await savedGoogleCallback({ credential: "mock-credential-token" });

    expect(logger.warn).toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalledWith(
      "Account has been suspended by administration rules.",
    );
  });

  it("should extract fallback error strings when server structure rejects without defined messages blocks", async () => {
    const mockOnError = vi.fn();
    const alternativeErrorResponse = {
      response: {
        data: { error: "Database operational timeout error exception." },
      },
    };

    axiosInstance.post.mockRejectedValueOnce(alternativeErrorResponse);

    await renderTestComponent({ onError: mockOnError });

    await savedGoogleCallback({ credential: "mock-credential-token" });
    expect(mockOnError).toHaveBeenCalledWith(
      "Database operational timeout error exception.",
    );
  });

  it("should process structural javascript engine runtime exceptions seamlessly during authentication failures", async () => {
    const mockOnError = vi.fn();
    axiosInstance.post.mockRejectedValueOnce(
      new Error("Local device connection termination request failure."),
    );

    await renderTestComponent({ onError: mockOnError });

    await savedGoogleCallback({ credential: "mock-credential-token" });
    expect(mockOnError).toHaveBeenCalledWith(
      "Local device connection termination request failure.",
    );
  });

  it("should fallback cleanly onto default catch blocks string literal when err payload contains no usable details", async () => {
    const mockOnError = vi.fn();
    axiosInstance.post.mockRejectedValueOnce({});

    await renderTestComponent({ onError: mockOnError });

    await savedGoogleCallback({ credential: "mock-credential-token" });
    expect(mockOnError).toHaveBeenCalledWith("Google sign-in failed");
  });
});
