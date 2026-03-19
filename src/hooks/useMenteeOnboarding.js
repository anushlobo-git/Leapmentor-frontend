// src/hooks/useMenteeOnboarding.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useMenteeOnboarding = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    profilePicture: "",
    bio: "",
    currentRole: "",
    company: "",
    industry: "",
    yearsOfExperience: "",
    interestedFields: [],
    skills: [],
    communicationPreferences: [],
    languages: [],
    linkedInUrl: "",
    portfolioUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    // ✅ Required field validations
    if (!form.currentRole.trim())
      return setMsg({ type: "error", text: "Current Role is required." });
    if (!form.yearsOfExperience)
      return setMsg({ type: "error", text: "Years of Experience is required." });
    if (!form.industry)
      return setMsg({ type: "error", text: "Industry is required." });
    if (!form.interestedFields.length)
      return setMsg({ type: "error", text: "Please add at least one Field of Interest." });
    if (!form.skills.length)
      return setMsg({ type: "error", text: "Please add at least one Skill of Interest." });

    const isOnlyNumbers = (val) => val && /^\d+$/.test(val.trim());
    if (isOnlyNumbers(form.currentRole))
      return setMsg({ type: "error", text: "Current Role cannot be a number." });
    if (isOnlyNumbers(form.company))
      return setMsg({ type: "error", text: "Company name cannot be a number." });

    const isValidUrl = (val) => {
      if (!val) return true;
      try { new URL(val); return true; }
      catch { return false; }
    };
    if (!isValidUrl(form.linkedInUrl))
      return setMsg({ type: "error", text: "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)." });
    if (!isValidUrl(form.portfolioUrl))
      return setMsg({ type: "error", text: "Please enter a valid Portfolio URL (e.g. https://yoursite.com)." });

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      setLoading(true);
      const payload = {
        ...form,
        yearsOfExperience: form.yearsOfExperience, // ✅ keep as string
        interestedFields: form.interestedFields,
        skills: form.skills,
        communicationPreferences: form.communicationPreferences,
        languages: form.languages,
      };

      await axios.post(`${BASE_URL}/api/mentee-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg({ type: "success", text: "Profile created! Redirecting to dashboard..." });
      setTimeout(() => navigate("/dashboard/mentee"), 1000);
    } catch (err) {
      const apiMsg = err?.response?.data?.message || err?.message || "Something went wrong.";
      setMsg({ type: "error", text: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, msg, handleChange, handleSubmit };
};

export default useMenteeOnboarding;