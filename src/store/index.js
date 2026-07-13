/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer             from "@features/auth/store/authSlice";
import menteeOnboardingReducer from "@features/mentee/store/menteeOnboardingSlice";
import mentorOnboardingReducer from "@features/mentor/store/mentorOnboardingSlice";
import sharedDashboardReducer  from "@features/shared-dashboard/store/sharedDashboardSlice";
import dashboardUserReducer    from "@features/profile/store/dashboardUserSlice";

const store = configureStore({
  reducer: {
    auth:             authReducer,
    menteeOnboarding: menteeOnboardingReducer,
    mentorOnboarding: mentorOnboardingReducer,
    sharedDashboard:  sharedDashboardReducer,
    dashboardUser:    dashboardUserReducer,
  },
});

export default store;
