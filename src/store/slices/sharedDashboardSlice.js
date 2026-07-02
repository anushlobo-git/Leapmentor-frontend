// src/store/slices/sharedDashboardSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connect: null,
  activeTab: "overview",
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

export const selectConnect = (state) => state.sharedDashboard.connect;
export const selectConnectId = (state) => state.sharedDashboard.connect?._id ?? null;
export const selectActiveTab = (state) => state.sharedDashboard.activeTab;
export const selectViewerRole = (state) =>
  state.sharedDashboard.connect?.viewerRole ?? "mentee";
export const selectConnectStatus = (state) =>
  state.sharedDashboard.connect?.status ?? null;

export default sharedDashboardSlice.reducer;
