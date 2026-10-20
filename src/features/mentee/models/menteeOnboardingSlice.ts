/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/slices/menteeOnboardingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createMenteeProfile } from "@features/mentee/models/mentee.api";
import { getApiErrorMessage, getErrorMessage } from "@lib/http/getApiError";
import { mapMenteeProfile } from "@features/mentee/models/menteeMapper";
import type { MenteeOnboardingRequest } from "./mentee.types";
import { assertMenteeOnboardingResponse } from "./menteeOnboardingResponse.validation";

type MappedMenteeProfile = ReturnType<typeof mapMenteeProfile>;

export interface MenteeOnboardingState {
  loading: boolean;
  error: string | null;
  successMsg: string | null;
  profile: MappedMenteeProfile | null;
}

interface MenteeOnboardingResult {
  message: string;
  profile: MappedMenteeProfile;
}

export const submitMenteeOnboarding = createAsyncThunk<
  MenteeOnboardingResult,
  MenteeOnboardingRequest,
  { rejectValue: string }
>(
  "menteeOnboarding/submit",
  async (payload: MenteeOnboardingRequest, { rejectWithValue }) => {
    try {
      const payloadToSend = {
        ...payload,
        profilePictureFileName: payload?.profilePictureFileName || "",
      };
      const response = await createMenteeProfile(payloadToSend);
      const data = assertMenteeOnboardingResponse(response.data);

      return {
        message: data.message,
        profile: mapMenteeProfile(data.profile),
      } satisfies MenteeOnboardingResult;
    } catch (err: unknown) {
      return rejectWithValue(
        getApiErrorMessage(
          err,
          getErrorMessage(err) ?? "Mentee onboarding could not be completed.",
        ),
      );
    }
  },
);

const initialState: MenteeOnboardingState = {
  loading: false,
  error: null,
  successMsg: null,
  profile: null,
};

const menteeOnboardingSlice = createSlice({
  name: "menteeOnboarding",
  initialState,
  reducers: {
    /**
     * Clears onboarding success and error messages.
     * @param {Object} state - Slice state.
     * @returns {void}
     */
    clearOnboardingMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitMenteeOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMsg = null;
        state.profile = null;
      })
      .addCase(submitMenteeOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = action.payload?.message || "Onboarding complete!";
        state.profile = action.payload?.profile ?? null;
      })
      .addCase(submitMenteeOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Mentee onboarding could not be completed.";
      });
  },
});

export const { clearOnboardingMessages } = menteeOnboardingSlice.actions;
export default menteeOnboardingSlice.reducer;
