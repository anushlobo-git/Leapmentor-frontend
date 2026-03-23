// src/hooks/useMentorDashboard.js

// A custom React hook that handles all the data fetching and navigation logic for the mentor dashboard.
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

        const userRes = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: authHeader,
        });
        const userData = userRes.data;

        if (!userData.roles?.includes("mentor")) {
          navigate("/dashboard/mentee");
          return;
        }

        setUser(userData);

        const profileRes = await axios.get(`${BASE_URL}/api/mentor-profile/me`, {
          headers: authHeader,
        });

        setProfile(profileRes.data);

        if (!profileRes.data?.isProfileComplete && !isEditPage) {
          navigate("/onboarding/mentor");
          return;
        }

      } catch (err) {
        if (err?.response?.status === 404 && !isEditPage) {
          navigate("/onboarding/mentor");
          return;
        }

        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, location.pathname]);

  // ✅ NEW: expose setProfile so SettingsTab can update dashboard-level profile after save
  return { user, profile, setProfile, loading, error };
};

export default useMentorDashboard;