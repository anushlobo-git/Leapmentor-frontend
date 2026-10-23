/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithStore as renderHook } from "@test/renderWithStore";
import { selectIsAuthenticated } from "@features/auth/models/authSlice";
import useMentorDashboard from "./useMentorDashboard";
import { getCurrentUser, getMentorProfile } from "@features/mentor/models/mentor.api";
import { HTTP_STATUS } from "@lib/http/httpStatus";
import { mapMentorProfile } from "@features/mentor/models/mentorMapper";

// Mock dependencies
vi.mock("@features/mentor/models/mentor.api", () => ({
  getCurrentUser: vi.fn(),
  getMentorProfile: vi.fn(),
}));

vi.mock("@lib/http/httpStatus", () => ({
  HTTP_STATUS: {
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
  },
}));

vi.mock("@features/mentor/models/mentorMapper", () => ({
  mapMentorProfile: vi.fn((data) => data),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { pathname: "/dashboard/mentor" };

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Real store (dashboardUser slice); only auth and the network are mocked.
vi.mock("@features/auth/models/authSlice", () => ({
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
      selectIsAuthenticated.mockReturnValue(false);

      renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("authenticated user", () => {
    beforeEach(() => {
      selectIsAuthenticated.mockReturnValue(true);
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

      getCurrentUser.mockResolvedValueOnce({ data: mockUserData });
      getMentorProfile.mockResolvedValueOnce({ data: mockProfileData });

      const { result } = renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toMatchObject({ _id: "user1", name: "John Doe" }); // mapped by mapAuthUser
      expect(result.current.profile).toEqual(mockProfileData);
      expect(result.current.error).toBe("");
      expect(getCurrentUser).toHaveBeenCalledWith();
      expect(getMentorProfile).toHaveBeenCalledWith();
    });

    it("loads user + profile into dashboardUserSlice with exactly one fetch each", async () => {
      getCurrentUser.mockResolvedValue({ data: { _id: "u1", name: "Jane", roles: ["mentor"] } });
      getMentorProfile.mockResolvedValue({ data: { isProfileComplete: true, bio: "hi" } });

      const { result, store } = renderHook(() => useMentorDashboard());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const slice = store.getState().dashboardUser;
      expect(slice.user).toMatchObject({ name: "Jane" });
      expect(slice.profile).toMatchObject({ bio: "hi" });
      expect(slice).toMatchObject({ status: "succeeded", loadedOnce: true });
      expect(result.current.user).toBe(slice.user); // same object — no local copy
      expect(getCurrentUser).toHaveBeenCalledTimes(1);
      expect(getMentorProfile).toHaveBeenCalledTimes(1);
    });

    it("should redirect to mentee dashboard if user is not mentor", async () => {
      const mockUserData = {
        _id: "user1",
        name: "John Doe",
        roles: ["mentee"],
      };

      getCurrentUser.mockResolvedValueOnce({ data: mockUserData });

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

      getCurrentUser.mockResolvedValueOnce({ data: mockUserData });
      getMentorProfile.mockRejectedValueOnce({ response: { status: HTTP_STATUS.NOT_FOUND } });

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

      getCurrentUser.mockResolvedValueOnce({ data: mockUserData });
      getMentorProfile.mockRejectedValueOnce({ response: { status: HTTP_STATUS.NOT_FOUND } });

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

      getCurrentUser.mockResolvedValueOnce({ data: mockUserData });
      getMentorProfile.mockRejectedValueOnce({ response: { status: HTTP_STATUS.UNAUTHORIZED } });

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

      getCurrentUser.mockResolvedValueOnce({ data: mockUserData });
      getMentorProfile.mockResolvedValueOnce({ data: mockProfileData });

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

      getCurrentUser.mockResolvedValueOnce({ data: mockUserData });
      getMentorProfile.mockResolvedValueOnce({ data: mockProfileData });

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

      getCurrentUser.mockResolvedValueOnce({ data: mockUserData });
      getMentorProfile.mockRejectedValueOnce(new Error("Unexpected error"));

      const { result } = renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Something went wrong. Please try again.");
    });

    it("should redirect to login on 401 error from user fetch", async () => {
      getCurrentUser.mockRejectedValueOnce({
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

      getCurrentUser.mockResolvedValueOnce({ data: mockUserData });
      getMentorProfile.mockResolvedValueOnce({ data: mockProfileData });

      renderHook(() => useMentorDashboard());

      await waitFor(() => {
        expect(mapMentorProfile).toHaveBeenCalledWith(mockProfileData);
      });
    });
  });
});
