import { renderHook, act, waitFor } from "@testing-library/react";
import useMenteeSettings from "./useMenteeSettings";
import {
  getMenteeProfile,
  getCurrentUser,
  getEscrowWallet,
  updateMenteeProfile,
  changePasswordRequest,
} from "@features/mentee/models/mentee.api";
import logger from "@lib/monitoring/logger";
import { describe, it, expect, vi ,beforeEach } from "vitest";

// Mock mentee.api
vi.mock("@features/mentee/models/mentee.api", () => ({
  getMenteeProfile: vi.fn(),
  getCurrentUser: vi.fn(),
  getEscrowWallet: vi.fn(),
  updateMenteeProfile: vi.fn(),
  changePasswordRequest: vi.fn(),
}));

// Mock logger
vi.mock("@lib/monitoring/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

// Mock mappers to test handlers in isolation
vi.mock("@features/profile/models/settingsMapper", () => ({
  mapMenteeSettings: vi.fn((data) => ({
    emailNotifications: data.emailNotifications ?? true,
    marketingPreferences: data.marketingPreferences ?? false,
  })),
  mapWallet: vi.fn((data) => ({
    balance: data.balance ?? 0,
    escrow: data.escrow ?? 0,
  })),
  mapUserPasswordInfo: vi.fn((data) => ({
    passwordChangedAt: data.passwordChangedAt ?? null,
  })),
}));

describe("useMenteeSettings hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMenteeProfile.mockResolvedValue({ data: {} });
    getCurrentUser.mockResolvedValue({ data: {} });
    getEscrowWallet.mockResolvedValue({ data: {} });
    updateMenteeProfile.mockResolvedValue({ data: {} });
    changePasswordRequest.mockResolvedValue({ data: {} });
  });

  it("pre-fills state if initialProfile is provided", () => {
    const initialProfile = {
      emailNotifications: false,
      marketingPreferences: true,
    };

    const { result } = renderHook(() => useMenteeSettings(initialProfile));

    expect(result.current.fetching).toBe(false);
    expect(result.current.emailNotifications).toBe(false);
    expect(result.current.marketingPreferences).toBe(true);
    expect(getMenteeProfile).not.toHaveBeenCalled();
  });

  it("fetches profile details if initialProfile is not provided", async () => {
    getMenteeProfile.mockResolvedValue({
      data: { emailNotifications: false, marketingPreferences: true },
    });

    const { result } = renderHook(() => useMenteeSettings(null));

    expect(result.current.fetching).toBe(true);

    await act(async () => {
      await Promise.resolve(); // flush initial queries
    });

    expect(result.current.fetching).toBe(false);
    expect(result.current.emailNotifications).toBe(false);
    expect(result.current.marketingPreferences).toBe(true);
  });

  it("handles fetch profile api failure gracefully", async () => {
    getMenteeProfile.mockRejectedValue(new Error("Internal failure"));

    const { result } = renderHook(() => useMenteeSettings(null));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.fetching).toBe(false);
    expect(logger.error).toHaveBeenCalled();
    expect(result.current.msg).toEqual({
      type: "error",
      text: "Failed to load settings.",
    });
  });

  it("fetches wallet and password changed information silently", async () => {
    getCurrentUser.mockResolvedValue({
      data: { passwordChangedAt: "2026-07-01T10:00:00Z" },
    });
    getEscrowWallet.mockResolvedValue({ data: { balance: 400, escrow: 50 } });

    const { result } = renderHook(() => useMenteeSettings(null));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.passwordChangedAt).toBe("2026-07-01T10:00:00Z");
    expect(result.current.balance).toBe(400);
    expect(result.current.escrow).toBe(50);
  });

  it("handles user or wallet fetch failure silently", async () => {
    getCurrentUser.mockRejectedValue(new Error("Silent db fail"));
    getEscrowWallet.mockRejectedValue(new Error("Silent db fail"));

    const { result } = renderHook(() => useMenteeSettings(null));

    await act(async () => {
      await Promise.resolve();
    });

    expect(logger.error).toHaveBeenCalled();
    expect(result.current.balance).toBe(0); // fallback
  });

  it("saves email and marketing notification preferences successfully", async () => {
    getMenteeProfile.mockResolvedValue({
      data: { emailNotifications: true, marketingPreferences: false },
    });

    const { result } = renderHook(() => useMenteeSettings(null));

    // Wait for the fetching state to transition true -> false to guarantee mount effect has committed
    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    act(() => {
      result.current.setEmailNotifications(false);
      result.current.setMarketingPreferences(true);
    });

    // Enable fake timers here so the setTimeout inside handleSave is faked
    vi.useFakeTimers();

    act(() => {
      result.current.handleSave();
    });

    expect(result.current.saving).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(updateMenteeProfile).toHaveBeenCalledWith({
      emailNotifications: false,
      marketingPreferences: true,
    });
    expect(result.current.saving).toBe(false);
    expect(result.current.msg).toEqual({
      type: "success",
      text: "Preferences saved successfully!",
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.msg.text).toBe("");
    vi.useRealTimers();
  });

  it("handles save preference errors", async () => {
    updateMenteeProfile.mockRejectedValueOnce(
      new Error("Preference put failure"),
    );
    const { result } = renderHook(() => useMenteeSettings({}));

    act(() => {
      result.current.handleSave();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.msg.text).toBe("Failed to save preferences.");
  });

  it("performs client-side validations on changing password", async () => {
    const { result } = renderHook(() => useMenteeSettings({}));

    // 1. Missing fields
    act(() => {
      result.current.handleChangePassword();
    });
    expect(result.current.pwMsg.text).toBe("All fields are required.");

    // 2. Length check (< 6)
    act(() => {
      result.current.setCurrentPassword("oldpw");
      result.current.setNewPassword("123");
      result.current.setConfirmPassword("123");
    });
    act(() => {
      result.current.handleChangePassword();
    });
    expect(result.current.pwMsg.text).toBe(
      "New password must be at least 6 characters.",
    );

    // 3. Match check
    act(() => {
      result.current.setNewPassword("123456");
      result.current.setConfirmPassword("654321");
    });
    act(() => {
      result.current.handleChangePassword();
    });
    expect(result.current.pwMsg.text).toBe("New passwords do not match.");
  });

  it("sends request and resets form on successful change password", async () => {
    const { result } = renderHook(() => useMenteeSettings({}));

    act(() => {
      result.current.setCurrentPassword("old-secret");
      result.current.setNewPassword("new-secret");
      result.current.setConfirmPassword("new-secret");
    });

    vi.useFakeTimers();

    act(() => {
      result.current.handleChangePassword();
    });

    expect(result.current.changingPw).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(changePasswordRequest).toHaveBeenCalledWith({
      currentPassword: "old-secret",
      newPassword: "new-secret",
    });
    expect(result.current.changingPw).toBe(false);
    expect(result.current.pwMsg.text).toBe("Password changed successfully!");
    expect(result.current.currentPassword).toBe("");
    expect(result.current.newPassword).toBe("");
    expect(result.current.confirmPassword).toBe("");
    expect(result.current.passwordChangedAt).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.pwMsg.text).toBe("");
    vi.useRealTimers();
  });

  it("handles change password API errors", async () => {
    changePasswordRequest.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });
    const { result } = renderHook(() => useMenteeSettings({}));

    act(() => {
      result.current.setCurrentPassword("old");
      result.current.setNewPassword("newpass");
      result.current.setConfirmPassword("newpass");
    });

    act(() => {
      result.current.handleChangePassword();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.pwMsg.text).toBe("Invalid credentials");
  });

  it("handles change password API generic error fallback", async () => {
    changePasswordRequest.mockRejectedValueOnce(
      new Error("Timeout server connection"),
    );
    const { result } = renderHook(() => useMenteeSettings({}));

    act(() => {
      result.current.setCurrentPassword("old");
      result.current.setNewPassword("newpass");
      result.current.setConfirmPassword("newpass");
    });

    act(() => {
      result.current.handleChangePassword();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.pwMsg.text).toBe("Failed to change password.");
  });

  it("handles password age formatting calculations correctly", () => {
    const { result } = renderHook(() => useMenteeSettings({}));
    const formatter = result.current.formatPasswordAge;

    // Never
    expect(formatter(null)).toBe("Never changed");

    // Today
    expect(formatter(new Date().toISOString())).toBe("Changed today");

    // Under 30 days (1 day ago)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatter(yesterday.toISOString())).toBe("Last changed 1 day ago");

    // Under 30 days (5 days ago)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    expect(formatter(fiveDaysAgo.toISOString())).toBe(
      "Last changed 5 days ago",
    );

    // Months (1 month ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    expect(formatter(thirtyDaysAgo.toISOString())).toBe(
      "Last changed 1 month ago",
    );

    // Months (2 months ago)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 62);
    expect(formatter(sixtyDaysAgo.toISOString())).toBe(
      "Last changed 2 months ago",
    );
  });
});
