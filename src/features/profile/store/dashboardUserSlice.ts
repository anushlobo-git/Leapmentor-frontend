/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/slices/dashboardUserSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import { mapAuthUser } from "@lib/mappers/userMapper";
import { mapMentorProfile } from "@features/mentor/mappers/mentorMapper";

const initialState = {
  user: null,
  profile: null,
};

/** Single source of truth for mentor profile refetch — used by MentorHomeTab on mount. */
/**
 * Refetches the current mentor profile from the backend.
 * @returns {Promise<any>} Backend response payload.
 */
export const refetchMentorProfile = createAsyncThunk(
  "dashboardUser/refetchMentorProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/mentor-profile/me");
      return res.data;
    } catch (err) {
      logger.error("Profile refetch failed", { error: err.message });
      return rejectWithValue(err.message);
    }
  }
);

const dashboardUserSlice = createSlice({
  name: "dashboardUser",
  initialState,
  reducers: {
    /**
     * Stores the authenticated dashboard user.
     * @param {Object} state - Slice state.
     * @param {{ payload: Object }} action - Auth user payload.
     * @returns {void}
     */
    setUser: (state, action) => {
      state.user = action.payload ? mapAuthUser(action.payload) : null;
    },
    /**
     * Stores the active mentor profile.
     * @param {Object} state - Slice state.
     * @param {{ payload: Object }} action - Mentor profile payload.
     * @returns {void}
     */
    setProfile: (state, action) => {
      state.profile = action.payload ?? null;
    },
    /**
     * Resets dashboard user state back to the initial empty state.
     * @returns {Object} Initial slice state.
     */
    resetDashboardUser: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(refetchMentorProfile.fulfilled, (state, action) => {
      state.profile = mapMentorProfile(action.payload);
    });
  },
});

export const { setUser, setProfile, resetDashboardUser } = dashboardUserSlice.actions;

export const selectDashboardUser = (state) => state.dashboardUser.user;
export const selectDashboardProfile = (state) => state.dashboardUser.profile;

export default dashboardUserSlice.reducer;
