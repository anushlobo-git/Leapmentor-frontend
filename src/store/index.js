/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer             from "./slices/authSlice";
import menteeOnboardingReducer from "./slices/menteeOnboardingSlice";
import mentorOnboardingReducer from "./slices/mentorOnboardingSlice";
import sharedDashboardReducer  from "./slices/sharedDashboardSlice";
import dashboardUserReducer    from "./slices/dashboardUserSlice";

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
