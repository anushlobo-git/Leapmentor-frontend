// src/hooks/useMentorDashboard.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useMentorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditPage = location.pathname.includes("/edit-profile");

  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const refetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/mentor-profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Profile refetch failed:", err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Fetch user
        const userRes = await axios.get(`${BASE_URL}/users/me`, { headers: authHeader });
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
          const profileRes = await axios.get(`${BASE_URL}/mentor-profile/me`, { headers: authHeader });
          profileData = profileRes.data;
        } catch (profileErr) {
          if (profileErr?.response?.status === 404) {
            // New mentor — no profile yet
            if (!isEditPage) {
              navigate("/onboarding/mentor");
            }
            return;
          }
          if (profileErr?.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw profileErr; // re-throw unexpected errors
        }

        setProfile(profileData);

        // 4) Onboarding incomplete → redirect
        if (!profileData?.isProfileComplete && !isEditPage) {
          navigate("/onboarding/mentor");
          return;
        }

        // 5) All good — show dashboard
        setLoading(false);

      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, location.pathname]);

  return { user, profile, loading, error, refetchProfile };
};

export default useMentorDashboard;