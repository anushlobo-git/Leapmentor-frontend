// src/hooks/useMenteeDashboard.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useMenteeDashboard = () => {
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

        // 1) Fetch user
        const userRes = await axios.get(`${BASE_URL}/users/me`, { headers: authHeader });
        const userData = userRes.data;

        // 2) Role guard
        if (!userData.roles?.includes("mentee")) {
          navigate("/dashboard/mentor");
          return;
        }

        setUser(userData);

        // 3) Fetch mentee profile
        let profileData = null;
        try {
          const profileRes = await axios.get(`${BASE_URL}/mentee-profile/me`, { headers: authHeader });
          profileData = profileRes.data;
        } catch (profileErr) {
          if (profileErr?.response?.status === 404) {
            if (!isEditPage) navigate("/onboarding/mentee");
            setLoading(false);
            return;
          }
          if (profileErr?.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            setLoading(false);
            return;
          }
          throw profileErr;
        }

        setProfile(profileData);

        // 4) Onboarding incomplete
        if (!profileData?.isProfileComplete && !isEditPage) {
          navigate("/onboarding/mentee");
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
  }, []);

  return { user, profile, loading, error };
};

export default useMenteeDashboard;