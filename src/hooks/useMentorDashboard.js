/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useMentorDashboard.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "@utils/axiosInstance";
import { selectIsAuthenticated } from "@store/slices/authSlice";
import { HTTP_STATUS } from "../constants/httpStatus";
import { mapMentorProfile } from "@mappers/mentorMapper";
/**
 * Custom hook for mentor dashboard.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useMentorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditPage = location.pathname.includes("/edit-profile");
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 1) Fetch user
        const userRes = await axiosInstance.get("/users/me");
        const userData = userRes.data;

        // 2) Role guard
        if (!userData.roles?.includes("mentor")) {
          navigate("/dashboard/mentee");
          return;
        }

        setUser(userData);

        // 3) Fetch mentor profile
        let profileData = null;
        try {
          const profileRes = await axiosInstance.get("/mentor-profile/me");
          profileData = profileRes.data;
        } catch (profileErr) {
          if (profileErr?.response?.status === HTTP_STATUS.NOT_FOUND) {
            // New mentor — no profile yet
            if (!isEditPage) {
              setLoading(false);
              navigate("/onboarding/mentor");
            }
            return;
          }
          if (profileErr?.response?.status === HTTP_STATUS.UNAUTHORIZED) {
            navigate("/login");
            return;
          }
          throw profileErr; // re-throw unexpected errors
        }

        const mappedProfile = mapMentorProfile(profileData);
        setProfile(mappedProfile);

        // 4) Onboarding incomplete → redirect
        if (!mappedProfile.isProfileComplete && !isEditPage) {
          setLoading(false);
          navigate("/onboarding/mentor");
          return;
        }

        // 5) All good — show dashboard
        setLoading(false);
      } catch (err) {
        if (err?.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          navigate("/login");
          return;
        }
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditPage, navigate, isAuthenticated]);

  return { user, profile, loading, error };
};

export default useMentorDashboard;
