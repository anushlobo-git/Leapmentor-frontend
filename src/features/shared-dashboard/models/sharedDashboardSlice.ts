/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/slices/sharedDashboardSlice.js
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SharedDashboardConnect {
  _id?: string;
  status?: string;
  viewerRole?: "mentor" | "mentee";
  mentor?: { name?: string };
  mentee?: { name?: string };
  mentorProfile?: {
    profilePicture?: string;
    currentRole?: string;
    company?: string;
    skills?: string[];
    hourlyRate?: number;
  };
  menteeProfile?: {
    profilePicture?: string;
    currentRole?: string;
    company?: string;
    skills?: string[];
  };
  confirmedSlot?: {
    date?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
  };
  totalAmount?: number | null;
  paidAt?: string | null;
}

export interface SharedDashboardState {
  connect: SharedDashboardConnect | null;
  activeTab: string;
}

const initialState: SharedDashboardState = {
  connect: null,
  activeTab: "overview",
};

const sharedDashboardSlice = createSlice({
  name: "sharedDashboard",
  initialState,
  reducers: {
    setConnect: (state, action: PayloadAction<SharedDashboardConnect | null>) => {
      state.connect = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    resetSharedDashboard: () => initialState,
  },
});

export const { setConnect, setActiveTab, resetSharedDashboard } =
  sharedDashboardSlice.actions;

type RootLike = { sharedDashboard: SharedDashboardState };

export const selectConnect = (state: RootLike) => state.sharedDashboard.connect;
export const selectConnectId = (state: RootLike) => state.sharedDashboard.connect?._id ?? null;
export const selectActiveTab = (state: RootLike) => state.sharedDashboard.activeTab;
export const selectViewerRole = (state: RootLike) =>
  state.sharedDashboard.connect?.viewerRole ?? "mentee";
export const selectConnectStatus = (state: RootLike) =>
  state.sharedDashboard.connect?.status ?? null;

export default sharedDashboardSlice.reducer;
