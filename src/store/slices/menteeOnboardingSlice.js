/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/slices/menteeOnboardingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@utils/axiosInstance";

export const submitMenteeOnboarding = createAsyncThunk(
  "menteeOnboarding/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const payloadToSend = {
        ...payload,
        profilePictureFileName: payload?.profilePictureFileName || "",
      };
      const res = await axiosInstance.post("/mentee-profile", payloadToSend);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message);
    }
  },
);

const menteeOnboardingSlice = createSlice({
  name: "menteeOnboarding",
  initialState: { loading: false, error: null, successMsg: null },
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
      })
      .addCase(submitMenteeOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = action.payload?.message || "Onboarding complete!";
      })
      .addCase(submitMenteeOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOnboardingMessages } = menteeOnboardingSlice.actions;
export default menteeOnboardingSlice.reducer;
