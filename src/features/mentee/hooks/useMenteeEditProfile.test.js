import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useMenteeEditProfile from "./useMenteeEditProfile";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock logger
vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useMenteeEditProfile hook", () => {
  const mockProfileData = {
    currentRole: "Designer",
    industry: "Design",
    company: "Figma",
    yearsOfExperience: "1-3 Years",
    bio: "Bio details",
    profilePicture: "https://example.com/avatar.jpg",
    linkedInUrl: "https://linkedin.com/in/test",
    portfolioUrl: "https://test.dev",
    skills: ["UI"],
    interestedFields: ["Product"],
    communicationPreferences: ["Chat"],
    languages: ["English"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    axiosInstance.get.mockResolvedValue({ data: mockProfileData });
    axiosInstance.put.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches profile details and updates form on mount", async () => {
    const { result } = renderHook(() => useMenteeEditProfile());

    expect(result.current.fetchLoading).toBe(true);

    await act(async () => {
      await Promise.resolve(); // flush mount microtasks
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/mentee-profile/me");
    expect(result.current.fetchLoading).toBe(false);
    expect(result.current.form.currentRole).toBe("Designer");
  });

  it("logs error and sets message if fetch profile fails", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("Timeout"));

    const { result } = renderHook(() => useMenteeEditProfile());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.fetchLoading).toBe(false);
    expect(logger.error).toHaveBeenCalled();
    expect(result.current.msg).toEqual({
      type: "error",
      text: "Failed to load profile data.",
    });
  });

  it("updates form keys when handleChange is called", async () => {
    const { result } = renderHook(() => useMenteeEditProfile());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.handleChange({
        target: { name: "company", value: "Adobe" },
      });
    });

    expect(result.current.form.company).toBe("Adobe");
  });

  it("fails validations if required fields are missing during submit", async () => {
    const { result } = renderHook(() => useMenteeEditProfile());

    await act(async () => {
      await Promise.resolve();
    });

    const preventDefault = vi.fn();

    // 1. Current role missing
    act(() => {
      result.current.handleChange({
        target: { name: "currentRole", value: "" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Current Role is required.");

    // 2. Years of experience missing
    act(() => {
      result.current.handleChange({
        target: { name: "currentRole", value: "Developer" },
      });
      result.current.handleChange({
        target: { name: "yearsOfExperience", value: "" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Years of Experience is required.");

    // 3. Industry missing
    act(() => {
      result.current.handleChange({
        target: { name: "yearsOfExperience", value: "3-5 Years" },
      });
      result.current.handleChange({ target: { name: "industry", value: "" } });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Industry is required.");

    // 4. Interested fields empty
    act(() => {
      result.current.handleChange({
        target: { name: "industry", value: "Tech" },
      });
      result.current.handleChange({
        target: { name: "interestedFields", value: [] },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe(
      "Please add at least one Field of Interest.",
    );

    // 5. Skills empty
    act(() => {
      result.current.handleChange({
        target: { name: "interestedFields", value: ["Product"] },
      });
      result.current.handleChange({ target: { name: "skills", value: [] } });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe(
      "Please add at least one Skill of Interest.",
    );
  });

  it("fails validations if numeric inputs are invalid", async () => {
    const { result } = renderHook(() => useMenteeEditProfile());
    await act(async () => {
      await Promise.resolve();
    });

    const preventDefault = vi.fn();

    // 6. Current role is only numbers
    act(() => {
      result.current.handleChange({
        target: { name: "currentRole", value: "123" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Current Role cannot be a number.");

    // 7. Company is only numbers
    act(() => {
      result.current.handleChange({
        target: { name: "currentRole", value: "Developer" },
      });
      result.current.handleChange({
        target: { name: "company", value: "456" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Company name cannot be a number.");
  });

  it("fails validation for invalid URLs", async () => {
    const { result } = renderHook(() => useMenteeEditProfile());
    await act(async () => {
      await Promise.resolve();
    });

    const preventDefault = vi.fn();

    // 8. Invalid LinkedIn URL
    act(() => {
      result.current.handleChange({
        target: { name: "linkedInUrl", value: "not-a-url" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe(
      "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username).",
    );

    // 9. Invalid Portfolio URL
    act(() => {
      result.current.handleChange({
        target: { name: "linkedInUrl", value: "https://linkedin.com/in/test" },
      });
      result.current.handleChange({
        target: { name: "portfolioUrl", value: "not-a-url" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe(
      "Please enter a valid Portfolio URL (e.g. https://yoursite.com).",
    );
  });

  it("submits changes and navigates after timer finishes on success", async () => {
    const { result } = renderHook(() => useMenteeEditProfile());
    await act(async () => {
      await Promise.resolve();
    });

    const preventDefault = vi.fn();
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(axiosInstance.put).toHaveBeenCalledWith(
      "/mentee-profile/me",
      mockProfileData,
    );
    expect(result.current.msg.text).toBe("Profile updated successfully!");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee");
    expect(result.current.loading).toBe(false);
  });

  it("sets error message if submit query fails", async () => {
    axiosInstance.put.mockRejectedValueOnce({
      response: { data: { message: "Internal server error 500" } },
    });

    const { result } = renderHook(() => useMenteeEditProfile());
    await act(async () => {
      await Promise.resolve();
    });

    const preventDefault = vi.fn();
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.msg.text).toBe("Internal server error 500");
    expect(result.current.loading).toBe(false);
  });

  it("handles empty API error responses gracefully on submit failure", async () => {
    axiosInstance.put.mockRejectedValueOnce(new Error("Timeout server"));

    const { result } = renderHook(() => useMenteeEditProfile());
    await act(async () => {
      await Promise.resolve();
    });

    const preventDefault = vi.fn();
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.msg.text).toBe("Update failed.");
  });

  it("handles fallback to empty inputs if profile data fields are missing on mount", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: {} }); // no fields

    const { result } = renderHook(() => useMenteeEditProfile());
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.form.currentRole).toBe("");
    expect(result.current.form.skills).toEqual([]);
  });

  it("submits changes successfully when LinkedIn and Portfolio URLs are empty", async () => {
    const { result } = renderHook(() => useMenteeEditProfile());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.handleChange({
        target: { name: "linkedInUrl", value: "" },
      });
      result.current.handleChange({
        target: { name: "portfolioUrl", value: "" },
      });
    });

    const preventDefault = vi.fn();
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(axiosInstance.put).toHaveBeenCalled();
  });
});
