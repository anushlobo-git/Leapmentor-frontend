/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useMentorEditProfile.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMentorProfile, updateMentorProfile } from "@features/mentor/models/mentor.api";
import { refetchMentorProfile } from "@features/profile/models/dashboardUserSlice";
import type { AppDispatch } from "@store/index";
import { useFormDirty } from "@lib/hooks/useFormDirty";
import logger from "@lib/monitoring/logger";
import { selectIsAuthenticated } from "@features/auth/models/authSlice";
import { getApiErrorMessage, getErrorMessage } from "@lib/http/getApiError";
import type { FormChangeEvent } from "@features/mentor/presenters/useOnboardingFormShellPresenter";

/**
 * Custom hook for mentor edit profile.
 * @returns {Object} Hook state and handlers for the caller.
 */

interface MentorEditProfileForm {
  profilePicture: string;
  bio: string;
  currentRole: string;
  industry: string;
  company: string;
  yearsOfExperience: string | number;
  hourlyRate: string | number;
  skills: string[];
  communicationPreferences: string[];
  languages: string | string[];
  linkedInUrl: string;
  portfolioUrl: string;
}

interface MentorSubmitEvent {
  preventDefault: () => void;
}

const useMentorEditProfile = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<MentorEditProfileForm>({
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

  const isDirty = useFormDirty(form, { ready: !fetchLoading, disabled: saved });

  // Pre-fill form with existing profile data
  useEffect(() => {


    const fetchProfile = async () => {
      try {
        const { data } = await getMentorProfile();
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
      } catch (err: unknown) {
        logger.error("Failed to load mentor profile data", {
          error: getErrorMessage(err),
        });
        setMsg({ type: "error", text: "Failed to load profile data." });
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Same universal onChange as OnboardingFormShell
  const handleChange = (e: FormChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Same payload shape as OnboardingFormShell but calls PUT
  const handleSubmit = async (e: MentorSubmitEvent) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    const isOnlyNumbers = (val: string) => val && /^\d+$/.test(val.trim());
    if (isOnlyNumbers(form.currentRole))
      return setMsg({ type: "error", text: "Current Role cannot be a number." });
    if (isOnlyNumbers(form.company))
      return setMsg({ type: "error", text: "Company name cannot be a number." });
    const isValidUrl = (val: string) => {
      if (!val) return true;
      try { new URL(val); return true; }
      catch { return false; }
    };
    if (!isValidUrl(form.linkedInUrl))
      return setMsg({ type: "error", text: "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)." });
    if (!isValidUrl(form.portfolioUrl))
      return setMsg({ type: "error", text: "Please enter a valid Portfolio URL (e.g. https://yoursite.com)." });


    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

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

      await updateMentorProfile(payload);
      setSaved(true);
      // Keep dashboardUserSlice in sync so Home/Profile tabs show the edit without a reload.
      dispatch(refetchMentorProfile());

      setMsg({ type: "success", text: "Profile updated! Redirecting to dashboard…" });
      setTimeout(() => navigate("/dashboard/mentor"), 1000);
    } catch (err: unknown) {
      const apiMsg = getApiErrorMessage(
        err,
        getErrorMessage(err) ?? "Something went wrong.",
      );
      setMsg({ type: "error", text: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, fetchLoading, msg, isDirty, handleChange, handleSubmit };
};

export default useMentorEditProfile;
