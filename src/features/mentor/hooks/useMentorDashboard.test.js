/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useMentorDashboard from "./useMentorDashboard";
import axiosInstance from "@lib/axiosInstance";
import { HTTP_STATUS } from "@lib/httpStatus";
import { mapMentorProfile } from "@features/mentor/mappers/mentorMapper";

// Mock dependencies
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@lib/httpStatus", () => ({
  HTTP_STATUS: {
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
  },
}));

vi.mock("@features/mentor/mappers/mentorMapper", () => ({
  mapMentorProfile: vi.fn((data) => data),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { pathname: "/dashboard/mentor" };

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock redux
const mockUseSelector = vi.fn();
vi.mock("react-redux", () => ({
  useSelector: (selectorFn) => mockUseSelector(selectorFn),
}));

vi.mock("@features/auth/store/authSlice", () => ({
  selectIsAuthenticated: vi.fn(),
}));

describe("useMentorDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockLocation.pathname = "/dashboard/mentor";
  });

  describe("unauthenticated user", () => {
    it("should redirect to login if not authenticated", async () => {
      mockUseSelector.mockReturnValue(false);

      renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("authenticated user", () => {
    beforeEach(() => {
      mockUseSelector.mockReturnValue(true);
    });

    it("should fetch user and profile data successfully", async () => {
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentor"],
      };
      const mockProfileData = {
        _id: "profile1",
        isProfileComplete: true,
        bio: "Test bio",
      };

      axiosInstance.get
        .mockResolvedValueOnce({ data: mockUserData })
        .mockResolvedValueOnce({ data: mockProfileData });

      const { result } = renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUserData);
      expect(result.current.profile).toEqual(mockProfileData);
      expect(result.current.error).toBe("");
      expect(axiosInstance.get).toHaveBeenCalledWith("/users/me");
      expect(axiosInstance.get).toHaveBeenCalledWith("/mentor-profile/me");
    });

    it("should redirect to mentee dashboard if user is not mentor", async () => {
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentee"],
      };

      axiosInstance.get.mockResolvedValueOnce({ data: mockUserData });

      renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee");
      });
    });

    it("should redirect to onboarding if profile not found and not on edit page", async () => {
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentor"],
      };

      axiosInstance.get
        .mockResolvedValueOnce({ data: mockUserData })
        .mockRejectedValueOnce({ response: { status: HTTP_STATUS.NOT_FOUND } });

      const { result } = renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/onboarding/mentor");
    });

    it("should not redirect to onboarding if on edit page and profile not found", async () => {
      mockLocation.pathname = "/dashboard/mentor/edit-profile";
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentor"],
      };

      axiosInstance.get
        .mockResolvedValueOnce({ data: mockUserData })
        .mockRejectedValueOnce({ response: { status: HTTP_STATUS.NOT_FOUND } });

      renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalledWith("/onboarding/mentor");
      });
    });

    it("should redirect to login on 401 error from profile fetch", async () => {
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentor"],
      };

      axiosInstance.get
        .mockResolvedValueOnce({ data: mockUserData })
        .mockRejectedValueOnce({ response: { status: HTTP_STATUS.UNAUTHORIZED } });

      renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("should redirect to onboarding if profile incomplete and not on edit page", async () => {
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentor"],
      };
      const mockProfileData = {
        _id: "profile1",
        isProfileComplete: false,
      };

      mapMentorProfile.mockReturnValue(mockProfileData);

      axiosInstance.get
        .mockResolvedValueOnce({ data: mockUserData })
        .mockResolvedValueOnce({ data: mockProfileData });

      const { result } = renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/onboarding/mentor");
    });

    it("should not redirect to onboarding if profile incomplete but on edit page", async () => {
      mockLocation.pathname = "/dashboard/mentor/edit-profile";
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentor"],
      };
      const mockProfileData = {
        _id: "profile1",
        isProfileComplete: false,
      };

      mapMentorProfile.mockReturnValue(mockProfileData);

      axiosInstance.get
        .mockResolvedValueOnce({ data: mockUserData })
        .mockResolvedValueOnce({ data: mockProfileData });

      renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalledWith("/onboarding/mentor");
      });
    });

    it("should set error message on unexpected error", async () => {
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentor"],
      };

      axiosInstance.get
        .mockResolvedValueOnce({ data: mockUserData })
        .mockRejectedValueOnce(new Error("Unexpected error"));

      const { result } = renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Something went wrong. Please try again.");
    });

    it("should redirect to login on 401 error from user fetch", async () => {
      axiosInstance.get.mockRejectedValueOnce({
        response: { status: HTTP_STATUS.UNAUTHORIZED },
      });

      renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("should call mapMentorProfile with profile data", async () => {
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentor"],
      };
      const mockProfileData = {
        _id: "profile1",
        isProfileComplete: true,
      };

      axiosInstance.get
        .mockResolvedValueOnce({ data: mockUserData })
        .mockResolvedValueOnce({ data: mockProfileData });

      renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(mapMentorProfile).toHaveBeenCalledWith(mockProfileData);
      });
    });
  });
});
