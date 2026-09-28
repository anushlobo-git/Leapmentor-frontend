/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useMenteeDashboard.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated } from "@features/auth/models/authSlice";
import {
  loadMenteeDashboard,
  selectDashboardUser,
  selectDashboardProfile,
  type DashboardLoadError,
} from "@features/profile/models/dashboardUserSlice";
import { HTTP_STATUS } from "@lib/http/httpStatus";
import type { AppDispatch } from "@store/index";

/**
 * Custom hook for mentee dashboard.
 * The fetch lives in dashboardUserSlice (`loadMenteeDashboard`); user/profile are read
 * from there. Only the redirect/loading decisions stay here, because they depend on
 * the current route.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useMenteeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const isEditPage = location.pathname.includes("/edit-profile");
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const user = useSelector(selectDashboardUser);
  const profile = useSelector(selectDashboardProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    let loaded;
    try {
      loaded = await dispatch(loadMenteeDashboard()).unwrap();
    } catch (e) {
      const err = e as DashboardLoadError;
      if (err?.stage === "role") {
        navigate("/dashboard/mentor");
        return;
      }
      if (err?.stage === "profile" && err.status === HTTP_STATUS.NOT_FOUND) {
        if (!isEditPage) {
          setLoading(false);
          navigate("/onboarding/mentee");
        }
        return;
      }
      if (err?.status !== HTTP_STATUS.UNAUTHORIZED) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
      return;
    }

    if (!loaded.profile.isProfileComplete && !isEditPage) {
      setLoading(false);
      navigate("/onboarding/mentee");
      return;
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // fetchData is recreated each render; the dashboard load is intentionally
    // (re)run only when authentication status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return { user, profile, loading, error, refetch: fetchData }; // ✅ exposed
};

export default useMenteeDashboard;
