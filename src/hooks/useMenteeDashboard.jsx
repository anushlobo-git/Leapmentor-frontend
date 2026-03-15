// src/hooks/useMenteeDashboard.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ FIXED: added useLocation
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useMenteeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ FIXED: added
  const isEditPage = location.pathname.includes("/edit-profile"); // ✅ FIXED: added

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1) No token → send to login
    if (!token) {
      navigate("/login");
      return;
    }

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        setLoading(true);

        // 2) Fetch basic user info
        const userRes = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: authHeader,
        });
        const userData = userRes.data;

        // 3) Role guard — if not a mentee, kick out
        if (!userData.roles?.includes("mentee")) {
          navigate("/dashboard/mentor");
          return;
        }

        setUser(userData);

        // 4) Fetch mentee profile
        const profileRes = await axios.get(`${BASE_URL}/api/mentee-profile/me`, {
          headers: authHeader,
        });

        setProfile(profileRes.data);

        // 5) If profile not complete → redirect to onboarding
        if (!profileRes.data?.isProfileComplete && !isEditPage) { // ✅ FIXED: added && !isEditPage
          navigate("/onboarding/mentee");
          return;
        }

      } catch (err) {
        // Profile not found (404) = new mentee, send to onboarding
        if (err?.response?.status === 404 && !isEditPage) { // ✅ FIXED: added && !isEditPage
          navigate("/onboarding/mentee");
          return;
        }

        // Token expired or invalid
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
  }, [navigate, location.pathname]); // ✅ FIXED: added location.pathname

  return { user, profile, loading, error };
};

export default useMenteeDashboard;