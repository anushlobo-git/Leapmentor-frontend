/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/slices/__tests__/dashboardUserSlice.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import dashboardUserReducer, {
  refetchMentorProfile,
  refetchMenteeProfile,
  loadMenteeDashboard,
  loadMentorDashboard,
  selectDashboardStatus,
  setUser,
  setProfile,
  resetDashboardUser,
  selectDashboardUser,
  selectDashboardProfile,
} from "./dashboardUserSlice";
import { getCurrentUser as getMentorCurrentUser, getMentorProfile } from "@features/mentor/models/mentor.api";
import { getCurrentUser as getMenteeCurrentUser, getMenteeProfile } from "@features/mentee/models/mentee.api";
import logger from "@lib/monitoring/logger";
import { mapAuthUser } from "@lib/mappers/userMapper";
import { mapMentorProfile } from "@features/mentor/models/mentorMapper";

vi.mock("@features/mentor/models/mentor.api", () => ({
  getCurrentUser: vi.fn(),
  getMentorProfile: vi.fn(),
}));

vi.mock("@features/mentee/models/mentee.api", () => ({
  getCurrentUser: vi.fn(),
  getMenteeProfile: vi.fn(),
}));

vi.mock("@features/mentee/models/menteeMapper", () => ({
  mapMenteeProfile: vi.fn((raw) => ({ ...raw, menteeMapped: true })),
}));

vi.mock("@lib/monitoring/logger", () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("@lib/mappers/userMapper", () => ({
  mapAuthUser: vi.fn((raw) => ({ ...raw, mapped: true })),
}));

vi.mock("@features/mentor/models/mentorMapper", () => ({
  mapMentorProfile: vi.fn((raw) => ({ ...raw, mapped: true })),
}));

const initialState = {
  user: null,
  profile: null,
  status: "idle",
  loadedOnce: false,
  error: null,
  loadRequestId: null,
  profileRequestId: null,
};

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
      const dirty = { ...initialState, user: { id: "u1" }, profile: { bio: "hi" }, status: "succeeded", loadedOnce: true };
      const state = dashboardUserReducer(dirty, resetDashboardUser());
      expect(state).toEqual(initialState);
    });
  });

  describe("refetchMentorProfile thunk", () => {
    it("fetches the profile and stores it mapped through mapMentorProfile on success", async () => {
      const payload = { bio: "hi", _id: "p1" };
      getMentorProfile.mockResolvedValueOnce({ data: payload });

      const store = buildStore();
      await store.dispatch(refetchMentorProfile());

      expect(getMentorProfile).toHaveBeenCalledWith();
      expect(mapMentorProfile).toHaveBeenCalledWith(payload);
      expect(store.getState().dashboardUser.profile).toEqual({
        ...payload,
        mapped: true,
      });
    });

    it("logs and rejects with the error message on failure, without touching state", async () => {
      getMentorProfile.mockRejectedValueOnce(new Error("network down"));

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
        dashboardUser: { ...initialState, user: { id: "u1" } },
      };
      expect(selectDashboardUser(rootState)).toEqual({ id: "u1" });
    });

    it("selectDashboardProfile reads profile off the dashboardUser slice", () => {
      const rootState = {
        dashboardUser: { ...initialState, profile: { bio: "hi" } },
      };
      expect(selectDashboardProfile(rootState)).toEqual({ bio: "hi" });
    });
  });

  describe("refetchMenteeProfile thunk", () => {
    it("stores the profile mapped through mapMenteeProfile", async () => {
      getMenteeProfile.mockResolvedValueOnce({ data: { bio: "m" } });
      const store = buildStore();
      await store.dispatch(refetchMenteeProfile());
      expect(getMenteeProfile).toHaveBeenCalledWith();
      expect(store.getState().dashboardUser.profile).toEqual({ bio: "m", menteeMapped: true });
    });
  });

  describe.each([
    ["mentee", loadMenteeDashboard, getMenteeCurrentUser, getMenteeProfile, "menteeMapped"],
    ["mentor", loadMentorDashboard, getMentorCurrentUser, getMentorProfile, "mapped"],
  ])("%s dashboard load thunk", (role, thunk, getUser, getProfile, mappedFlag) => {
    it("fetches user + profile once and stores both (mapped)", async () => {
      getUser.mockResolvedValueOnce({ data: { _id: "u1", roles: [role] } });
      getProfile.mockResolvedValueOnce({ data: { bio: "b", isProfileComplete: true } });
      const store = buildStore();

      const p = store.dispatch(thunk());
      expect(selectDashboardStatus(store.getState())).toBe("loading");
      const action = await p;

      const s = store.getState().dashboardUser;
      expect(action.payload.profile[mappedFlag]).toBe(true);
      expect(s.user).toMatchObject({ mapped: true, _id: "u1" });
      expect(s.profile).toMatchObject({ bio: "b", [mappedFlag]: true });
      expect(s).toMatchObject({ status: "succeeded", loadedOnce: true, error: null });
      expect(getUser).toHaveBeenCalledTimes(1);
      expect(getProfile).toHaveBeenCalledTimes(1);
    });

    it("rejects with stage 'role' (and skips the profile call) for the wrong role", async () => {
      getUser.mockResolvedValueOnce({ data: { roles: ["somebody-else"] } });
      const store = buildStore();
      const action = await store.dispatch(thunk());
      expect(action.payload).toMatchObject({ stage: "role" });
      expect(getProfile).not.toHaveBeenCalled();
      expect(store.getState().dashboardUser.user).toBeNull();
      expect(store.getState().dashboardUser.status).toBe("failed");
    });

    it("rejects with the HTTP status and stage 'profile' when the profile call fails (404 → onboarding)", async () => {
      getUser.mockResolvedValueOnce({ data: { roles: [role] } });
      getProfile.mockRejectedValueOnce({ response: { status: 404 }, message: "nf" });
      const store = buildStore();
      const action = await store.dispatch(thunk());
      expect(action.payload).toEqual({ status: 404, message: "nf", stage: "profile" });
      expect(store.getState().dashboardUser).toMatchObject({ status: "failed", loadedOnce: true, error: "nf" });
    });

    it("rejects with stage 'user' when the user call fails (401)", async () => {
      getUser.mockRejectedValueOnce({ response: { status: 401 }, message: "unauth" });
      const store = buildStore();
      const action = await store.dispatch(thunk());
      expect(action.payload).toMatchObject({ status: 401, stage: "user" });
      expect(getProfile).not.toHaveBeenCalled();
    });

    it("ignores a response that lands after reset (logout)", async () => {
      let resolveUser;
      getUser.mockReturnValueOnce(new Promise((r) => { resolveUser = r; }));
      getProfile.mockResolvedValueOnce({ data: { bio: "old user" } });
      const store = buildStore();
      const pending = store.dispatch(thunk());
      store.dispatch(resetDashboardUser());
      resolveUser({ data: { roles: [role] } });
      await pending;
      expect(store.getState().dashboardUser).toEqual(initialState);
    });
  });

  it("a profile refetch landing after reset is ignored", async () => {
    let resolveProfile;
    getMentorProfile.mockReturnValueOnce(new Promise((r) => { resolveProfile = r; }));
    const store = buildStore();
    const pending = store.dispatch(refetchMentorProfile());
    store.dispatch(resetDashboardUser());
    resolveProfile({ data: { bio: "old user" } });
    await pending;
    expect(store.getState().dashboardUser.profile).toBeNull();
  });
});
