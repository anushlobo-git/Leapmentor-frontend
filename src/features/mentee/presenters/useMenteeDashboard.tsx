/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useMenteeDashboard.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, getMenteeProfile } from "@features/mentee/models/mentee.api";
import { HTTP_STATUS } from "@lib/http/httpStatus";
import { mapMenteeProfile } from "@features/mentee/models/menteeMapper";
import { selectIsAuthenticated } from "@features/auth/models/authSlice";
import { useSelector } from "react-redux";

/**
 * Custom hook for mentee dashboard.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useMenteeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditPage = location.pathname.includes("/edit-profile");
  const isAuthenticated = useSelector(selectIsAuthenticated);


  const [user, setUser]       = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchData = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const userRes  = await getCurrentUser();
      const userData = userRes.data;

      if (!userData.roles?.includes("mentee")) {
        navigate("/dashboard/mentor");
        return;
      }
      setUser(userData);

      let profileData = null;
      try {
        const profileRes = await getMenteeProfile();
        profileData = profileRes.data;
      } catch (profileErr: any) {
        if (profileErr?.response?.status === HTTP_STATUS.NOT_FOUND) {
          if (!isEditPage) {
            setLoading(false);
            navigate("/onboarding/mentee");
          }
          return;
        }
        throw profileErr;
      }

      const mappedProfile = mapMenteeProfile(profileData);
       setProfile(mappedProfile);

      if (!mappedProfile.isProfileComplete && !isEditPage) {
        setLoading(false);
        navigate("/onboarding/mentee");
        return;
      }

      setLoading(false);

    } catch (err: any) {
      if (err?.response?.status !== HTTP_STATUS.UNAUTHORIZED) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  return { user, profile, loading, error, refetch: fetchData }; // ✅ exposed
};

export default useMenteeDashboard;
