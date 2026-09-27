/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useMentorDashboard.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated } from "@features/auth/models/authSlice";
import {
  loadMentorDashboard,
  selectDashboardUser,
  selectDashboardProfile,
  type DashboardLoadError,
} from "@features/profile/models/dashboardUserSlice";
import { HTTP_STATUS } from "@lib/http/httpStatus";
import type { AppDispatch } from "@store/index";
/**
 * Custom hook for mentor dashboard.
 * The fetch lives in dashboardUserSlice (`loadMentorDashboard`); user/profile are read
 * from there. Only the redirect/loading decisions stay here, because they depend on
 * the current route.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useMentorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const isEditPage = location.pathname.includes("/edit-profile");
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const user = useSelector(selectDashboardUser);
  const profile = useSelector(selectDashboardProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      let loaded;
      try {
        loaded = await dispatch(loadMentorDashboard()).unwrap();
      } catch (e) {
        const err = e as DashboardLoadError;
        // Role guard
        if (err?.stage === "role") {
          navigate("/dashboard/mentee");
          return;
        }
        // New mentor — no profile yet
        if (err?.stage === "profile" && err.status === HTTP_STATUS.NOT_FOUND) {
          if (!isEditPage) {
            setLoading(false);
            navigate("/onboarding/mentor");
          }
          return;
        }
        if (err?.status === HTTP_STATUS.UNAUTHORIZED) {
          navigate("/login");
          return;
        }
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Onboarding incomplete → redirect
      if (!loaded.profile.isProfileComplete && !isEditPage) {
        setLoading(false);
        navigate("/onboarding/mentor");
        return;
      }

      // All good — show dashboard
      setLoading(false);
    };

    fetchData();
  }, [isEditPage, navigate, isAuthenticated, dispatch]);

  return { user, profile, loading, error };
};

export default useMentorDashboard;
