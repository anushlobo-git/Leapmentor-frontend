/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach ,afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useMentorEditProfile from "./useMentorEditProfile";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";

// Mock dependencies
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock redux
const mockUseSelector = vi.fn();
vi.mock("react-redux", () => ({
  useSelector: (selectorFn) => mockUseSelector(selectorFn),
}));

vi.mock("@features/auth/store/authSlice", () => ({
  selectIsAuthenticated: vi.fn(),
}));

describe("useMentorEditProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should return initial state", () => {
      mockUseSelector.mockReturnValue(true);

      const { result } = renderHook(() => useMentorEditProfile());

      expect(result.current.form).toEqual({
        profilePicture: "",
        bio: "",
        currentRole: "",
        industry: "",
        company: "",
        yearsOfExperience: "",
        hourlyRate: "",
        skills: [],
        communicationPreferences: [],
        languages: "",
        linkedInUrl: "",
        portfolioUrl: "",
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.fetchLoading).toBe(true);
      expect(result.current.msg).toEqual({ type: "", text: "" });
    });
  });

  describe("fetch profile on mount", () => {
    it("should fetch profile data successfully", async () => {
      mockUseSelector.mockReturnValue(true);
      const mockProfileData = {
        profilePicture: "https://example.com/avatar.jpg",
        bio: "Test bio",
        currentRole: "Software Engineer",
        industry: "Tech",
        company: "Google",
        yearsOfExperience: "5",
        hourlyRate: "50",
        skills: ["React", "Node.js"],
        communicationPreferences: ["Chat", "Video"],
        languages: ["English", "Spanish"],
        linkedInUrl: "https://linkedin.com/in/test",
        portfolioUrl: "https://portfolio.com",
      };
      axiosInstance.get.mockResolvedValue({ data: mockProfileData });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      expect(axiosInstance.get).toHaveBeenCalledWith("/mentor-profile/me");
      expect(result.current.form).toEqual({
        profilePicture: "https://example.com/avatar.jpg",
        bio: "Test bio",
        currentRole: "Software Engineer",
        industry: "Tech",
        company: "Google",
        yearsOfExperience: "5",
        hourlyRate: "50",
        skills: ["React", "Node.js"],
        communicationPreferences: ["Chat", "Video"],
        languages: "English, Spanish",
        linkedInUrl: "https://linkedin.com/in/test",
        portfolioUrl: "https://portfolio.com",
      });
    });

    it("should handle missing fields in profile data", async () => {
      mockUseSelector.mockReturnValue(true);
      const mockProfileData = {
        bio: "Test bio",
        currentRole: "Software Engineer",
      };
      axiosInstance.get.mockResolvedValue({ data: mockProfileData });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      expect(result.current.form.bio).toBe("Test bio");
      expect(result.current.form.currentRole).toBe("Software Engineer");
      expect(result.current.form.profilePicture).toBe("");
      expect(result.current.form.industry).toBe("");
    });

    it("should handle array languages as string", async () => {
      mockUseSelector.mockReturnValue(true);
      const mockProfileData = {
        languages: ["English", "Spanish"],
      };
      axiosInstance.get.mockResolvedValue({ data: mockProfileData });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      expect(result.current.form.languages).toBe("English, Spanish");
    });

    it("should handle string languages as is", async () => {
      mockUseSelector.mockReturnValue(true);
      const mockProfileData = {
        languages: "English, Spanish",
      };
      axiosInstance.get.mockResolvedValue({ data: mockProfileData });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      expect(result.current.form.languages).toBe("English, Spanish");
    });

    it("should handle fetch error", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to load mentor profile data",
        { error: "Network error" },
      );
      expect(result.current.msg).toEqual({
        type: "error",
        text: "Failed to load profile data.",
      });
    });
  });

  describe("handleChange", () => {
    it("should update form field", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "currentRole", value: "Software Engineer" },
        });
      });

      expect(result.current.form.currentRole).toBe("Software Engineer");
    });

    it("should update multiple fields", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "bio", value: "New bio" },
        });
        result.current.handleChange({
          target: { name: "company", value: "New company" },
        });
      });

      expect(result.current.form.bio).toBe("New bio");
      expect(result.current.form.company).toBe("New company");
    });
  });

  describe("handleSubmit", () => {
    it("should validate currentRole is not only numbers", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "currentRole", value: "123" },
        });
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Current Role cannot be a number.",
      });
    });

    it("should validate company is not only numbers", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "company", value: "456" },
        });
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Company name cannot be a number.",
      });
    });

    it("should validate LinkedIn URL format", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "linkedInUrl", value: "invalid-url" },
        });
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username).",
      });
    });

    it("should validate portfolio URL format", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "portfolioUrl", value: "not-a-url" },
        });
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Please enter a valid Portfolio URL (e.g. https://yoursite.com).",
      });
    });

    it("should redirect to login if not authenticated", async () => {
      mockUseSelector.mockReturnValue(false);
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should submit profile successfully", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "currentRole", value: "Software Engineer" },
        });
        result.current.handleChange({
          target: { name: "company", value: "Google" },
        });
        result.current.handleChange({
          target: { name: "yearsOfExperience", value: "5" },
        });
        result.current.handleChange({
          target: { name: "hourlyRate", value: "50" },
        });
        result.current.handleChange({
          target: { name: "languages", value: "English, Spanish" },
        });
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(axiosInstance.put).toHaveBeenCalledWith("/mentor-profile/me", {
        ...result.current.form,
        yearsOfExperience: 5,
        hourlyRate: 50,
        languages: ["English", "Spanish"],
      });
      expect(result.current.msg).toEqual({
        type: "success",
        text: "Profile updated! Redirecting to dashboard…",
      });
      expect(result.current.loading).toBe(false);
    });

    it("should handle submit error", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.put.mockRejectedValue({
        response: { data: { message: "Server error" } },
      });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Server error",
      });
      expect(result.current.loading).toBe(false);
    });

    it("should handle submit error with no response message", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.put.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Network error",
      });
    });

    it("should convert yearsOfExperience to number", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "yearsOfExperience", value: "10" },
        });
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/mentor-profile/me",
        expect.objectContaining({
          yearsOfExperience: 10,
        }),
      );
    });

    it("should handle empty yearsOfExperience as 0", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/mentor-profile/me",
        expect.objectContaining({
          yearsOfExperience: 0,
        }),
      );
    });

    it("should convert hourlyRate to number", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "hourlyRate", value: "75" },
        });
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/mentor-profile/me",
        expect.objectContaining({
          hourlyRate: 75,
        }),
      );
    });

    it("should split languages string into array", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "languages", value: "English, Spanish, French" },
        });
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/mentor-profile/me",
        expect.objectContaining({
          languages: ["English", "Spanish", "French"],
        }),
      );
    });

    it("should filter empty language items", async () => {
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      await waitFor(() => {
        expect(result.current.fetchLoading).toBe(false);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "languages", value: "English, , Spanish" },
        });
      });

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
      });

      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/mentor-profile/me",
        expect.objectContaining({
          languages: ["English", "Spanish"],
        }),
      );
    });

    it("should redirect to dashboard after successful submit", async () => {
      vi.useFakeTimers(); // <-- enable only here
      mockUseSelector.mockReturnValue(true);
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorEditProfile());

      // fetchLoading effect resolves via microtask, fine w/o waitFor+fake timers issue
      // but since fake timers are on here, flush microtasks explicitly:
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.fetchLoading).toBe(false);

      const event = { preventDefault: vi.fn() };
      await act(async () => {
        result.current.handleSubmit(event);
        await Promise.resolve(); // let the put() promise resolve
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentor");
    });
  });
});
