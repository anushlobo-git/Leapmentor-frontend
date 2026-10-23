/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/slices/mentorOnboardingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@lib/http/axiosInstance";
import { getApiErrorMessage, getErrorMessage } from "@lib/http/getApiError";

interface MentorOnboardingState {
  loading: boolean;
  error: string | null | undefined;
  successMsg: string | null;
}

export const submitMentorOnboarding = createAsyncThunk<
  unknown,
  Record<string, unknown>,
  { rejectValue: string }
>(
  "mentorOnboarding/submit",
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const payloadToSend = {
        ...payload,
        profilePictureFileName: payload?.profilePictureFileName || "",
      };
      const res = await axiosInstance.post("/mentor-profile", payloadToSend);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(
        getApiErrorMessage(
          err,
          getErrorMessage(err) ?? "Something went wrong.",
        ),
      );
    }
  },
);

const initialState: MentorOnboardingState = {
  loading: false,
  error: null,
  successMsg: null,
};

const mentorOnboardingSlice = createSlice({
  name: "mentorOnboarding",
  initialState,
  reducers: {
    /**
     * Clears mentor onboarding success and error messages.
     * @param {Object} state - Slice state.
     * @returns {void}
     */
    clearMentorOnboardingMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitMentorOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(submitMentorOnboarding.fulfilled, (state) => {
        state.loading = false;
        state.successMsg = "Profile saved! Redirecting to dashboard…";
      })
      .addCase(submitMentorOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMentorOnboardingMessages } = mentorOnboardingSlice.actions;
export default mentorOnboardingSlice.reducer;
