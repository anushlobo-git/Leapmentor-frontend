// src/hooks/useMenteeDashboard.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "@utils/axiosInstance";
import { isLoggedIn } from "@utils/cookies";

const useMenteeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditPage = location.pathname.includes("/edit-profile");

  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    // ✅ cookie-based auth check instead of localStorage token
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
        if (!userData.roles?.includes("mentee")) {
          navigate("/dashboard/mentor");
          return;
        }

        setUser(userData);

        // 3) Fetch mentee profile
        let profileData = null;
        try {
           const profileRes = await axiosInstance.get("/mentee-profile/me");
           profileData = profileRes.data;
         } catch (profileErr) {
           if (profileErr?.response?.status === 404) {
           if (!isEditPage) {
            setLoading(false); 
             navigate("/onboarding/mentee");
            }
    return;
  }
  throw profileErr;
}

        setProfile(profileData);

        // 4) Onboarding incomplete
        if (!profileData?.isProfileComplete && !isEditPage) {
          setLoading(false);
          navigate("/onboarding/mentee");
          return;
        }

        // 5) All good — show dashboard
        setLoading(false);

      } catch (err) {
        // 401 is handled by interceptor — only handle other errors here
        if (err?.response?.status !== 401) {
          setError("Something went wrong. Please try again.");
          setLoading(false);
        }
      }
    };

    fetchData();
  }, []);

  return { user, profile, loading, error };
};

export default useMenteeDashboard;