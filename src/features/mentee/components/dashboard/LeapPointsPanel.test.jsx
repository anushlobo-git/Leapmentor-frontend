import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeapPointsPanel from "./LeapPointsPanel";
import {
  getMyLeapRequest,
  createLeapRequest,
} from "@features/mentee/api/mentee.api";
import logger from "@lib/logger";

// ── Mock External Modules ──────────────────────────────────────────────────
vi.mock("@features/mentee/api/mentee.api", () => ({
  getMyLeapRequest: vi.fn(),
  createLeapRequest: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@lib/httpStatus", () => ({
  HTTP_STATUS: {
    CONFLICT: 409,
  },
}));

describe("LeapPointsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    // Default mock response to keep initial check happy
    getMyLeapRequest.mockResolvedValue({ data: { status: "none" } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Loading Branch Coverage ──────────────────────────────────────────────
  it("should render the skeleton pulse layout loading state when loading is true", async () => {
    render(<LeapPointsPanel balance={0} loading={true} />);

    // Await microtasks to clear initial useEffect state checks cleanly
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // ── Balance Threshold Branches Coverage ────────────────────────────────────
  it("should render balance and locked refill button when balance is sufficient (>= 500)", async () => {
    render(<LeapPointsPanel balance={750} loading={false} />);

    expect(screen.getByText("750")).toBeInTheDocument();

    // Use findByRole to wait for the async checkExistingRequest useEffect to finish setting checking to false
    const disabledButton = await screen.findByRole("button", {
      name: /Refill available when balance runs out/i,
    });

    expect(disabledButton).toBeInTheDocument();
    expect(disabledButton).toBeDisabled();
  });

  // ── Existing Request Status Pipeline Coverage ──────────────────────────────
  it("should render request pending view if an active request exists on mount", async () => {
    getMyLeapRequest.mockResolvedValueOnce({ data: { status: "pending" } });

    render(<LeapPointsPanel balance={100} loading={false} />);

    expect(
      await screen.findByText("Request sent — pending admin review"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should handle error gracefully and complete checks if getMyLeapRequest rejects", async () => {
    const mockError = { response: { data: "Bad Request" }, message: "Failed" };
    getMyLeapRequest.mockRejectedValueOnce(mockError);

    render(<LeapPointsPanel balance={100} loading={false} />);

    // Verify fallback execution logs warnings correctly
    await act(async () => {
      await Promise.resolve();
    });

    expect(logger.warn).toHaveBeenCalledWith("Leap request check failed:", {
      error: "Bad Request",
    });

    // Renders primary action button after error check falls back to pristine state
    expect(
      screen.getByRole("button", { name: /Request Leap Points Refill/i }),
    ).toBeInTheDocument();
  });

  it("should use raw message fallback if response data details are absent on error lookup", async () => {
    getMyLeapRequest.mockRejectedValueOnce(new Error("Network Breakoutoutout"));

    render(<LeapPointsPanel balance={100} loading={false} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(logger.warn).toHaveBeenCalledWith("Leap request check failed:", {
      error: "Network Breakoutoutout",
    });
  });

  // ── Refill Submission Actions Coverage ─────────────────────────────────────
  it("should toggle into loading state and display pending review upon successful creation click", async () => {
    const user = userEvent.setup();
    createLeapRequest.mockResolvedValueOnce({ success: true });

    render(<LeapPointsPanel balance={200} loading={false} />);

    const refillBtn = await screen.findByRole("button", {
      name: /Request Leap Points Refill/i,
    });

    await user.click(refillBtn);

    expect(createLeapRequest).toHaveBeenCalledWith("balance_refill");
    expect(
      screen.getByText("Request sent — pending admin review"),
    ).toBeInTheDocument();
  });

  it("should transition into pending layout state if server rejects request with a conflict message", async () => {
    const user = userEvent.setup();
    const mockConflictError = {
      response: { data: { message: "Already have a pending transaction" } },
    };
    createLeapRequest.mockRejectedValueOnce(mockConflictError);

    render(<LeapPointsPanel balance={50} loading={false} />);

    const refillBtn = await screen.findByRole("button", {
      name: /Request Leap Points Refill/i,
    });
    await user.click(refillBtn);

    expect(
      screen.getByText("Request sent — pending admin review"),
    ).toBeInTheDocument();
  });

  it("should switch into pending layout context if error code returns status 409 conflict directly", async () => {
    const user = userEvent.setup();
    const mockStatusError = { response: { status: 409, data: {} } };
    createLeapRequest.mockRejectedValueOnce(mockStatusError);

    render(<LeapPointsPanel balance={50} loading={false} />);

    const refillBtn = await screen.findByRole("button", {
      name: /Request Leap Points Refill/i,
    });
    await user.click(refillBtn);

    expect(
      screen.getByText("Request sent — pending admin review"),
    ).toBeInTheDocument();
  });

  // ── Error Timeout Lifecycles Coverage ──────────────────────────────────────
  it("should deploy error feedback box and reset state loop cleanly on countdown expiration", async () => {
    vi.useFakeTimers();
    const mockGenericError = {
      response: { data: { message: "Internal Failure" } },
    };
    createLeapRequest.mockRejectedValueOnce(mockGenericError);

    render(<LeapPointsPanel balance={10} loading={false} />);

    // Flush initial request hooks
    await act(async () => {
      await Promise.resolve();
    });

    const refillBtn = screen.getByRole("button", {
      name: /Request Leap Points Refill/i,
    });

    await act(async () => {
      fireEvent.click(refillBtn);
    });

    // Flush handling pipelines
    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText("Something went wrong. Try again."),
    ).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalled();

    // Advance forward by 3000ms to cycle visual state wrappers back to standard viewports
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByText("Something went wrong. Try again."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Request Leap Points Refill/i }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("should map error payloads onto message descriptors strings seamlessly during generic exceptions", async () => {
    vi.useFakeTimers();
    createLeapRequest.mockRejectedValueOnce(new Error("Raw Terminal Fault"));

    render(<LeapPointsPanel balance={10} loading={false} />);

    await act(async () => {
      await Promise.resolve();
    });

    const refillBtn = screen.getByRole("button", {
      name: /Request Leap Points Refill/i,
    });

    await act(async () => {
      fireEvent.click(refillBtn);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText("Something went wrong. Try again."),
    ).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalledWith("Leap request error", {
      error: "Raw Terminal Fault",
    });
    vi.useRealTimers();
  });
});
