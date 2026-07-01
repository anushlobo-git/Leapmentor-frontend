// src/store/slices/sharedDashboardSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connect: null,
  activeTab: "sessions",
};

const sharedDashboardSlice = createSlice({
  name: "sharedDashboard",
  initialState,
  reducers: {
    setConnect: (state, action) => {
      state.connect = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    resetSharedDashboard: () => initialState,
  },
});

export const { setConnect, setActiveTab, resetSharedDashboard } =
  sharedDashboardSlice.actions;

export default sharedDashboardSlice.reducer;
