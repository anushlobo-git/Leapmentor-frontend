/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer             from "@features/auth/models/authSlice";
import menteeOnboardingReducer from "@features/mentee/models/menteeOnboardingSlice";
import mentorOnboardingReducer from "@features/mentor/models/mentorOnboardingSlice";
import sharedDashboardReducer  from "@features/shared-dashboard/models/sharedDashboardSlice";
import dashboardUserReducer    from "@features/profile/models/dashboardUserSlice";

const store = configureStore({
  reducer: {
    auth:             authReducer,
    menteeOnboarding: menteeOnboardingReducer,
    mentorOnboarding: mentorOnboardingReducer,
    sharedDashboard:  sharedDashboardReducer,
    dashboardUser:    dashboardUserReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
