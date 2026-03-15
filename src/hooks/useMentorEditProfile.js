// src/hooks/useMentorEditProfile.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useMentorEditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    profilePicture: "",
    bio: "",
    currentRole: "",
    industry: "",
    company: "",
    yearsOfExperience: "",
    hourlyRate: "",
    skills: [],
    communicationPreferences: [],
    languages: "",
    linkedInUrl: "",
    portfolioUrl: "",
  });

  // Pre-fill form with existing profile data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/mentor-profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({
          profilePicture: data.profilePicture || "",
          bio: data.bio || "",
          currentRole: data.currentRole || "",
          industry: data.industry || "",
          company: data.company || "",
          yearsOfExperience: data.yearsOfExperience || "",
          hourlyRate: data.hourlyRate || "",
          skills: data.skills || [],
          communicationPreferences: data.communicationPreferences || [],
          languages: Array.isArray(data.languages) ? data.languages.join(", ") : data.languages || "",
          linkedInUrl: data.linkedInUrl || "",
          portfolioUrl: data.portfolioUrl || "",
        });
      } catch (err) {
        setMsg({ type: "error", text: "Failed to load profile data." });
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Same universal onChange as OnboardingFormShell
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Same payload shape as OnboardingFormShell but calls PUT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      setLoading(true);

      const payload = {
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        hourlyRate: Number(form.hourlyRate) || 0,
        languages: typeof form.languages === "string"
          ? form.languages.split(",").map((s) => s.trim()).filter(Boolean)
          : form.languages,
      };

      await axios.put(`${BASE_URL}/api/mentor-profile/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg({ type: "success", text: "Profile updated! Redirecting to dashboard…" });
      setTimeout(() => navigate("/dashboard/mentor"), 1000);
    } catch (err) {
      const apiMsg = err?.response?.data?.message || err?.message || "Something went wrong.";
      setMsg({ type: "error", text: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, fetchLoading, msg, handleChange, handleSubmit };
};

export default useMentorEditProfile;