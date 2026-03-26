// src/store/slices/menteeOnboardingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const submitMenteeOnboarding = createAsyncThunk(
  "menteeOnboarding/submit",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.post(`${BASE_URL}/api/mentee-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Something went wrong.");
    }
  }
);

const menteeOnboardingSlice = createSlice({
  name: "menteeOnboarding",
  initialState: {
    loading:    false,
    error:      null,
    successMsg: null,
  },
  reducers: {
    clearOnboardingMessages(state) {
      state.error      = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitMenteeOnboarding.pending, (state) => {
        state.loading    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(submitMenteeOnboarding.fulfilled, (state) => {
        state.loading    = false;
        state.successMsg = "Profile created! Redirecting to dashboard...";
      })
      .addCase(submitMenteeOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { clearOnboardingMessages } = menteeOnboardingSlice.actions;
export default menteeOnboardingSlice.reducer;