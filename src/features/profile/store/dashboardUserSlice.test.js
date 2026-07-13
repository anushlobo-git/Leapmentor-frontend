/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/slices/__tests__/dashboardUserSlice.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import dashboardUserReducer, {
  refetchMentorProfile,
  setUser,
  setProfile,
  resetDashboardUser,
  selectDashboardUser,
  selectDashboardProfile,
} from "./dashboardUserSlice";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import { mapAuthUser } from "@lib/mappers/userMapper";
import { mapMentorProfile } from "@features/mentor/mappers/mentorMapper";

vi.mock("@lib/axiosInstance", () => ({
  default: { get: vi.fn() },
}));

vi.mock("@lib/logger", () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("@lib/mappers/userMapper", () => ({
  mapAuthUser: vi.fn((raw) => ({ ...raw, mapped: true })),
}));

vi.mock("@features/mentor/mappers/mentorMapper", () => ({
  mapMentorProfile: vi.fn((raw) => ({ ...raw, mapped: true })),
}));

const initialState = { user: null, profile: null };

const buildStore = () =>
  configureStore({ reducer: { dashboardUser: dashboardUserReducer } });

describe("dashboardUserSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("reducer defaults", () => {
    it("returns the initial state for an unknown action", () => {
      expect(dashboardUserReducer(undefined, { type: "@@INIT" })).toEqual(
        initialState,
      );
    });
  });

  describe("setUser", () => {
    it("maps and stores the payload via mapAuthUser", () => {
      const raw = { id: "u1", name: "Ada" };
      const state = dashboardUserReducer(initialState, setUser(raw));

      expect(mapAuthUser).toHaveBeenCalledWith(raw);
      expect(state.user).toEqual({ id: "u1", name: "Ada", mapped: true });
    });

    it("sets user to null when payload is falsy", () => {
      const state = dashboardUserReducer(
        { ...initialState, user: { id: "u1" } },
        setUser(null),
      );
      expect(state.user).toBeNull();
      expect(mapAuthUser).not.toHaveBeenCalled();
    });
  });

  describe("setProfile", () => {
    it("stores the payload as-is (no mapping)", () => {
      const profile = { bio: "hello" };
      const state = dashboardUserReducer(initialState, setProfile(profile));
      expect(state.profile).toEqual(profile);
    });

    it("defaults to null when payload is nullish", () => {
      const state = dashboardUserReducer(
        { ...initialState, profile: { bio: "hi" } },
        setProfile(undefined),
      );
      expect(state.profile).toBeNull();
    });
  });

  describe("resetDashboardUser", () => {
    it("resets state back to the initial state", () => {
      const dirty = { user: { id: "u1" }, profile: { bio: "hi" } };
      const state = dashboardUserReducer(dirty, resetDashboardUser());
      expect(state).toEqual(initialState);
    });
  });

  describe("refetchMentorProfile thunk", () => {
    it("fetches the profile and stores it mapped through mapMentorProfile on success", async () => {
      const payload = { bio: "hi", _id: "p1" };
      axiosInstance.get.mockResolvedValueOnce({ data: payload });

      const store = buildStore();
      await store.dispatch(refetchMentorProfile());

      expect(axiosInstance.get).toHaveBeenCalledWith("/mentor-profile/me");
      expect(mapMentorProfile).toHaveBeenCalledWith(payload);
      expect(store.getState().dashboardUser.profile).toEqual({
        ...payload,
        mapped: true,
      });
    });

    it("logs and rejects with the error message on failure, without touching state", async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error("network down"));

      const store = buildStore();
      const action = await store.dispatch(refetchMentorProfile());

      expect(logger.error).toHaveBeenCalledWith("Profile refetch failed", {
        error: "network down",
      });
      expect(action.type).toBe(refetchMentorProfile.rejected.type);
      expect(action.payload).toBe("network down");
      expect(store.getState().dashboardUser.profile).toBeNull();
    });
  });

  describe("selectors", () => {
    it("selectDashboardUser reads user off the dashboardUser slice", () => {
      const rootState = {
        dashboardUser: { user: { id: "u1" }, profile: null },
      };
      expect(selectDashboardUser(rootState)).toEqual({ id: "u1" });
    });

    it("selectDashboardProfile reads profile off the dashboardUser slice", () => {
      const rootState = {
        dashboardUser: { user: null, profile: { bio: "hi" } },
      };
      expect(selectDashboardProfile(rootState)).toEqual({ bio: "hi" });
    });
  });
});
