// src/hooks/useMentorSettings.js
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const BADGES = [
  {
    key: "newcomer",
    label: "Newcomer",
    icon: "👋",
    desc: "Joined LeapMentor",
    condition: () => true,
  },
  {
    key: "ten_sessions",
    label: "10 Sessions",
    icon: "🎯",
    desc: "Completed 10 sessions",
    condition: (profile) => (profile?.totalSessions || 0) >= 10,
  },
  {
    key: "top_rated",
    label: "Top Rated",
    icon: "⭐",
    desc: "Achieved 4.5+ rating",
    condition: (profile) => (profile?.avgRating || 0) >= 4.5,
  },
  {
    key: "expert_guide",
    label: "Expert Guide",
    icon: "🏆",
    desc: "50+ sessions completed",
    condition: (profile) => (profile?.totalSessions || 0) >= 50,
  },
];

const useMentorSettings = (initialProfile) => {
  const [profile, setProfile]   = useState(initialProfile || null);
  const [fetching, setFetching] = useState(!initialProfile);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState({ type: "", text: "" });

  // ── Local editable state ──────────────────────────────────
  const [hourlyRate, setHourlyRate]                 = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile]           = useState(true);

  // ── Fetch mentor profile on mount ────────────────────────
  useEffect(() => {
    if (initialProfile) {
      setHourlyRate(initialProfile.hourlyRate ?? "");
      setEmailNotifications(initialProfile.emailNotifications ?? true);
      setPublicProfile(initialProfile.isProfilePublished ?? true);
      setFetching(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setFetching(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/mentor-profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const p = res.data;
        setProfile(p);
        setHourlyRate(p.hourlyRate ?? "");
        setEmailNotifications(p.emailNotifications ?? true);
        setPublicProfile(p.isProfilePublished ?? true);
      } catch (err) {
        setMsg({ type: "error", text: "Failed to load settings." });
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [initialProfile]);

  // ── Save changes ──────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg({ type: "", text: "" });
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BASE_URL}/api/mentor-profile/me`,
        {
          hourlyRate: Number(hourlyRate) || 0,
          emailNotifications,
          isProfilePublished: publicProfile,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ FIX: backend returns { message, profile } — extract profile correctly
      const updatedProfile = res.data.profile;
      setProfile((prev) => ({ ...prev, ...updatedProfile }));

      setMsg({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);

      // ✅ return updated profile so SettingsTab can propagate it upward
      return updatedProfile;
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to save settings." });
      return null;
    } finally {
      setSaving(false);
    }
  };

  // ── Compute badges ────────────────────────────────────────
  const badges = BADGES.map((badge) => ({
    ...badge,
    unlocked: badge.condition(profile),
  }));

  return {
    profile,
    fetching,
    saving,
    msg,
    hourlyRate,         setHourlyRate,
    emailNotifications, setEmailNotifications,
    publicProfile,      setPublicProfile,
    badges,
    handleSave,
  };
};

export default useMentorSettings;