/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Owns the logged-in dashboard user + role profile. The dashboard hooks
// (useMenteeDashboard / useMentorDashboard) dispatch the load thunks; everything
// else reads via selectDashboardUser / selectDashboardProfile.
import {
  createSlice,
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import logger from "@lib/monitoring/logger";
import { mapAuthUser } from "@lib/mappers/userMapper";
import { mapMentorProfile } from "@features/mentor/models/mentorMapper";
import { mapMenteeProfile } from "@features/mentee/models/menteeMapper";
import {
  getCurrentUser as getMentorCurrentUser,
  getMentorProfile,
} from "@features/mentor/models/mentor.api";
import {
  getCurrentUser as getMenteeCurrentUser,
  getMenteeProfile,
} from "@features/mentee/models/mentee.api";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface DashboardUserState {
  user: unknown;
  profile: unknown;
  status: LoadStatus;
  /** True after the first dashboard load settles (success or failure). */
  loadedOnce: boolean;
  error: string | null;
  /** Latest load / profile-refetch requestIds — stale responses (after reset/logout) are ignored. */
  loadRequestId: string | null;
  profileRequestId: string | null;
}

const initialState: DashboardUserState = {
  user: null,
  profile: null,
  status: "idle",
  loadedOnce: false,
  error: null,
  loadRequestId: null,
  profileRequestId: null,
};

/**
 * Rejection payload for the load thunks. The hook needs the HTTP status and the
 * stage to decide where to navigate (401 → login, profile 404 → onboarding, …).
 */
export interface DashboardLoadError {
  status?: number;
  message: string;
  stage: "user" | "role" | "profile";
}

export interface DashboardLoadResult {
  user: ReturnType<typeof mapAuthUser>;
  profile: any;
}

type Role = "mentee" | "mentor";

const ROLE_API = {
  // Wrapped in arrows so the API modules are only touched when a thunk runs.
  mentee: {
    getUser: () => getMenteeCurrentUser(),
    getProfile: () => getMenteeProfile(),
    mapProfile: (raw: any) => mapMenteeProfile(raw),
  },
  mentor: {
    getUser: () => getMentorCurrentUser(),
    getProfile: () => getMentorProfile(),
    mapProfile: (raw: any) => mapMentorProfile(raw),
  },
} as const;

const buildLoader = (role: Role) =>
  createAsyncThunk<DashboardLoadResult, void, { rejectValue: DashboardLoadError }>(
    `dashboardUser/load${role === "mentee" ? "Mentee" : "Mentor"}Dashboard`,
    async (_, { rejectWithValue }) => {
      const api = ROLE_API[role];

      let userData: any;
      try {
        userData = (await api.getUser()).data;
      } catch (err: any) {
        return rejectWithValue({
          status: err?.response?.status,
          message: err?.message ?? "Failed to load user.",
          stage: "user",
        });
      }

      if (!userData.roles?.includes(role)) {
        return rejectWithValue({ message: `User is not a ${role}.`, stage: "role" });
      }

      try {
        const profileData = (await api.getProfile()).data;
        return { user: mapAuthUser(userData), profile: api.mapProfile(profileData) };
      } catch (err: any) {
        return rejectWithValue({
          status: err?.response?.status,
          message: err?.message ?? "Failed to load profile.",
          stage: "profile",
        });
      }
    },
  );

/** Fetches user + mentee profile in one go and stores both. */
export const loadMenteeDashboard = buildLoader("mentee");
/** Fetches user + mentor profile in one go and stores both. */
export const loadMentorDashboard = buildLoader("mentor");

const buildProfileRefetch = (role: Role) =>
  createAsyncThunk(
    `dashboardUser/refetch${role === "mentee" ? "Mentee" : "Mentor"}Profile`,
    async (_: void, { rejectWithValue }) => {
      try {
        const res = await ROLE_API[role].getProfile();
        return ROLE_API[role].mapProfile(res.data);
      } catch (err: any) {
        logger.error("Profile refetch failed", { error: err.message });
        return rejectWithValue(err.message);
      }
    },
  );

/** Refetches only the profile — call after a successful profile edit so every tab is fresh. */
export const refetchMentorProfile = buildProfileRefetch("mentor");
export const refetchMenteeProfile = buildProfileRefetch("mentee");

const applyLoaderCases = (
  builder: ActionReducerMapBuilder<DashboardUserState>,
  thunk: ReturnType<typeof buildLoader>,
) => {
  builder
    .addCase(thunk.pending, (state, action) => {
      state.status = "loading";
      state.error = null;
      state.loadRequestId = action.meta.requestId;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (state.loadRequestId !== action.meta.requestId) return; // stale (reset or superseded)
      state.status = "succeeded";
      state.loadedOnce = true;
      state.user = action.payload.user;
      state.profile = action.payload.profile;
    })
    .addCase(thunk.rejected, (state, action) => {
      if (state.loadRequestId !== action.meta.requestId) return;
      state.status = "failed";
      state.loadedOnce = true;
      state.error = action.payload?.message ?? action.error.message ?? "Failed to load dashboard.";
    });
};

const applyProfileRefetchCases = (
  builder: ActionReducerMapBuilder<DashboardUserState>,
  thunk: ReturnType<typeof buildProfileRefetch>,
) => {
  builder
    .addCase(thunk.pending, (state, action) => {
      state.profileRequestId = action.meta.requestId;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (state.profileRequestId !== action.meta.requestId) return;
      state.profile = action.payload;
    });
};

const dashboardUserSlice = createSlice({
  name: "dashboardUser",
  initialState,
  reducers: {
    /**
     * Stores the authenticated dashboard user.
     * @param state - Slice state.
     * @param action - Auth user payload.
     */
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload ? mapAuthUser(action.payload) : null;
    },
    /**
     * Stores the active role profile.
     * @param state - Slice state.
     * @param action - Profile payload (already mapped).
     */
    setProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload ?? null;
    },
    /** Resets dashboard user state back to the initial empty state. */
    resetDashboardUser: () => initialState,
  },
  extraReducers: (builder) => {
    applyLoaderCases(builder, loadMenteeDashboard);
    applyLoaderCases(builder, loadMentorDashboard);
    applyProfileRefetchCases(builder, refetchMentorProfile);
    applyProfileRefetchCases(builder, refetchMenteeProfile);
  },
});

export const { setUser, setProfile, resetDashboardUser } = dashboardUserSlice.actions;

type RootLike = { dashboardUser: DashboardUserState };
export const selectDashboardUser = (state: RootLike) => state.dashboardUser.user;
export const selectDashboardProfile = (state: RootLike) => state.dashboardUser.profile;
export const selectDashboardStatus = (state: RootLike) => state.dashboardUser.status;

export default dashboardUserSlice.reducer;
