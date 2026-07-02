// src/hooks/useMentorDashboard.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "@utils/axiosInstance";
import { isLoggedIn } from "@utils/cookies";

const useMentorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditPage = location.pathname.includes("/edit-profile");

  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
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
          if (profileErr?.response?.status === 404) {
            // New mentor — no profile yet
            if (!isEditPage) {
              setLoading(false);
              navigate("/onboarding/mentor");
            }
            return;
          }
          if (profileErr?.response?.status === 401) {
            navigate("/login");
            return;
          }
          throw profileErr; // re-throw unexpected errors
        }

        setProfile(profileData);

        // 4) Onboarding incomplete → redirect
        if (!profileData?.isProfileComplete && !isEditPage) {
          setLoading(false);
          navigate("/onboarding/mentor");
          return;
        }

        // 5) All good — show dashboard
        setLoading(false);
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditPage, navigate]);

  return { user, profile, loading, error };
};

export default useMentorDashboard;
