/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useMentorSettings from "./useMentorSettings";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import { mapMentorSettings } from "@features/profile/mappers/settingsMapper";

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

vi.mock("@features/profile/mappers/settingsMapper", () => ({
  mapMentorSettings: vi.fn((data) => ({
    hourlyRate: data?.hourlyRate || "",
    emailNotifications: data?.emailNotifications ?? true,
    isProfilePublished: data?.isProfilePublished ?? true,
  })),
}));

describe("useMentorSettings", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axiosInstance.get.mockResolvedValue({ data: {} });
    axiosInstance.put.mockResolvedValue({ data: {} });
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("with initial profile passed in", () => {
    it("should use initial profile and skip fetch", async () => {
      const initialProfile = {
        _id: "profile1",
        hourlyRate: 50,
        emailNotifications: true,
        isProfilePublished: true,
        totalSessions: 5,
        avgRating: 4.2,
      };

      const { result } = renderHook(() => useMentorSettings(initialProfile));

      expect(result.current.fetching).toBe(false);
      expect(axiosInstance.get).not.toHaveBeenCalled();
      expect(mapMentorSettings).toHaveBeenCalledWith(initialProfile);
      expect(result.current.profile).toEqual(initialProfile);
      expect(result.current.hourlyRate).toBe(50);
      expect(result.current.emailNotifications).toBe(true);
      expect(result.current.publicProfile).toBe(true);
    });

    it("should compute badges based on initial profile", () => {
      const initialProfile = {
        totalSessions: 15,
        avgRating: 4.8,
      };

      const { result } = renderHook(() => useMentorSettings(initialProfile));

      const badges = result.current.badges;
      expect(badges).toHaveLength(4);
      expect(badges[0].unlocked).toBe(true); // newcomer - always unlocked
      expect(badges[1].unlocked).toBe(true); // ten_sessions - 15 >= 10
      expect(badges[2].unlocked).toBe(true); // top_rated - 4.8 >= 4.5
      expect(badges[3].unlocked).toBe(false); // expert_guide - 15 < 50
    });
  });

  describe("without initial profile", () => {
    it("should fetch profile on mount", async () => {
      const mockProfile = {
        _id: "profile1",
        hourlyRate: 75,
        emailNotifications: false,
        isProfilePublished: false,
        totalSessions: 20,
        avgRating: 4.6,
      };
      axiosInstance.get.mockResolvedValue({ data: mockProfile });

      const { result } = renderHook(() => useMentorSettings());

      expect(result.current.fetching).toBe(true);

      await waitFor(() => {
        expect(result.current.fetching).toBe(false);
      });

      expect(axiosInstance.get).toHaveBeenCalledWith("/mentor-profile/me");
      expect(mapMentorSettings).toHaveBeenCalledWith(mockProfile);
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.hourlyRate).toBe(75);
      expect(result.current.emailNotifications).toBe(false);
      expect(result.current.publicProfile).toBe(false);
    });

    it("should handle fetch error", async () => {
      axiosInstance.get.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useMentorSettings());

      await waitFor(() => {
        expect(result.current.fetching).toBe(false);
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to load mentor settings",
        { error: "Network error" },
      );
      expect(result.current.msg).toEqual({
        type: "error",
        text: "Failed to load settings.",
      });
    });

    it("should compute badges after fetch", async () => {
      const mockProfile = {
        totalSessions: 60,
        avgRating: 4.9,
      };
      axiosInstance.get.mockResolvedValue({ data: mockProfile });

      const { result } = renderHook(() => useMentorSettings());

      await waitFor(() => {
        expect(result.current.fetching).toBe(false);
      });

      const badges = result.current.badges;
      expect(badges[0].unlocked).toBe(true); // newcomer
      expect(badges[1].unlocked).toBe(true); // ten_sessions
      expect(badges[2].unlocked).toBe(true); // top_rated
      expect(badges[3].unlocked).toBe(true); // expert_guide - 60 >= 50
    });
  });

  describe("handleSave", () => {
    it("should save settings successfully", async () => {
      const initialProfile = { hourlyRate: 50 };
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(axiosInstance.put).toHaveBeenCalledWith("/mentor-profile/me", {
        hourlyRate: 50,
        emailNotifications: true,
        isProfilePublished: true,
      });
      expect(result.current.msg).toEqual({
        type: "success",
        text: "Settings saved successfully!",
      });
      expect(result.current.saving).toBe(false);
    });

    it("should convert hourlyRate to number", async () => {
      const initialProfile = { hourlyRate: "75" };
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorSettings(initialProfile));

      act(() => {
        result.current.setHourlyRate("100");
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(axiosInstance.put).toHaveBeenCalledWith("/mentor-profile/me", {
        hourlyRate: 100,
        emailNotifications: true,
        isProfilePublished: true,
      });
    });

    it("should handle empty hourlyRate as 0", async () => {
      const initialProfile = { hourlyRate: "" };
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(axiosInstance.put).toHaveBeenCalledWith("/mentor-profile/me", {
        hourlyRate: 0,
        emailNotifications: true,
        isProfilePublished: true,
      });
    });

    it("should handle save error", async () => {
      const initialProfile = { hourlyRate: 50 };
      axiosInstance.put.mockRejectedValue({
        response: { data: { message: "Save failed" } },
      });

      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Save failed",
      });
      expect(result.current.saving).toBe(false);
    });

    it("should clear success message after 3 seconds", async () => {
      vi.useFakeTimers();
      const initialProfile = { hourlyRate: 50 };
      axiosInstance.put.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.msg.type).toBe("success");

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.msg).toEqual({ type: "", text: "" });
      vi.useRealTimers();
    });
  });

  describe("state setters", () => {
    it("should update hourlyRate", async () => {
      const initialProfile = { hourlyRate: 50 };
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      act(() => {
        result.current.setHourlyRate("75");
      });

      expect(result.current.hourlyRate).toBe("75");
    });

    it("should update emailNotifications", async () => {
      const initialProfile = { hourlyRate: 50 };
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      act(() => {
        result.current.setEmailNotifications(false);
      });

      expect(result.current.emailNotifications).toBe(false);
    });

    it("should update publicProfile", async () => {
      const initialProfile = { hourlyRate: 50 };
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      act(() => {
        result.current.setPublicProfile(false);
      });

      expect(result.current.publicProfile).toBe(false);
    });
  });

  describe("badge computation", () => {
    it("should unlock newcomer badge always", async () => {
      const initialProfile = {};
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await waitFor(() => {
        expect(result.current.badges).toBeDefined();
      });

      const newcomerBadge = result.current.badges.find(
        (b) => b.key === "newcomer",
      );
      expect(newcomerBadge.unlocked).toBe(true);
    });

    it("should unlock ten_sessions badge when totalSessions >= 10", async () => {
      const initialProfile = { totalSessions: 10 };
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await waitFor(() => {
        expect(result.current.badges).toBeDefined();
      });

      const badge = result.current.badges.find((b) => b.key === "ten_sessions");
      expect(badge.unlocked).toBe(true);
    });

    it("should not unlock ten_sessions badge when totalSessions < 10", async () => {
      const initialProfile = { totalSessions: 5 };
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await waitFor(() => {
        expect(result.current.badges).toBeDefined();
      });

      const badge = result.current.badges.find((b) => b.key === "ten_sessions");
      expect(badge.unlocked).toBe(false);
    });

    it("should unlock top_rated badge when avgRating >= 4.5", async () => {
      const initialProfile = { avgRating: 4.5 };
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await waitFor(() => {
        expect(result.current.badges).toBeDefined();
      });

      const badge = result.current.badges.find((b) => b.key === "top_rated");
      expect(badge.unlocked).toBe(true);
    });

    it("should not unlock top_rated badge when avgRating < 4.5", async () => {
      const initialProfile = { avgRating: 4.4 };
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await waitFor(() => {
        expect(result.current.badges).toBeDefined();
      });

      const badge = result.current.badges.find((b) => b.key === "top_rated");
      expect(badge.unlocked).toBe(false);
    });

    it("should unlock expert_guide badge when totalSessions >= 50", async () => {
      const initialProfile = { totalSessions: 50 };
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await waitFor(() => {
        expect(result.current.badges).toBeDefined();
      });

      const badge = result.current.badges.find((b) => b.key === "expert_guide");
      expect(badge.unlocked).toBe(true);
    });

    it("should not unlock expert_guide badge when totalSessions < 50", async () => {
      const initialProfile = { totalSessions: 49 };
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await waitFor(() => {
        expect(result.current.badges).toBeDefined();
      });

      const badge = result.current.badges.find((b) => b.key === "expert_guide");
      expect(badge.unlocked).toBe(false);
    });

    it("should handle null/undefined profile in badge conditions", async () => {
      const initialProfile = null;
      const { result } = renderHook(() => useMentorSettings(initialProfile));

      await waitFor(() => {
        expect(result.current.badges).toBeDefined();
      });

      const badges = result.current.badges;
      expect(badges[0].unlocked).toBe(true); // newcomer
      expect(badges[1].unlocked).toBe(false); // ten_sessions
      expect(badges[2].unlocked).toBe(false); // top_rated
      expect(badges[3].unlocked).toBe(false); // expert_guide
    });
  });
});
