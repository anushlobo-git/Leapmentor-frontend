// src/store/slices/dashboardUserSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@utils/axiosInstance";

const initialState = {
  user: null,
  profile: null,
};

/** Single source of truth for mentor profile refetch — used by MentorHomeTab on mount. */
export const refetchMentorProfile = createAsyncThunk(
  "dashboardUser/refetchMentorProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/mentor-profile/me");
      return res.data;
    } catch (err) {
      console.error("Profile refetch failed:", err.message);
      return rejectWithValue(err.message);
    }
  }
);

const dashboardUserSlice = createSlice({
  name: "dashboardUser",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    resetDashboardUser: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(refetchMentorProfile.fulfilled, (state, action) => {
      state.profile = action.payload;
    });
  },
});

export const { setUser, setProfile, resetDashboardUser } = dashboardUserSlice.actions;

export const selectDashboardUser = (state) => state.dashboardUser.user;
export const selectDashboardProfile = (state) => state.dashboardUser.profile;

export default dashboardUserSlice.reducer;
