/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useMenteeOnboarding.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  submitMenteeOnboarding,
  clearOnboardingMessages,
} from "@features/mentee/models/menteeOnboardingSlice";
import { useFormDirty } from "@lib/hooks/useFormDirty";
import type { RootState, AppDispatch } from "@store/index";
import type { MenteeOnboardingForm } from "@features/mentee/models/mentee.types";
import { toMenteeOnboardingRequest } from "@features/mentee/models/menteeOnboardingRequestMapper";

interface MenteeFormChangeEvent {
  target: { name: string; value: string | string[] };
}

interface MenteeSubmitEvent {
  preventDefault: () => void;
}
/**
 * Custom hook for mentee onboarding.
 * @returns {Object} Hook state and handlers for the caller.
 */

const DEFAULT_FORM: MenteeOnboardingForm = {
  profilePicture: "",
  profilePictureFileName: "",
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
};

const useMenteeOnboarding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, successMsg } = useSelector(
    (state: RootState) => state.menteeOnboarding,
  );

  const [form, setForm] = useState<MenteeOnboardingForm>(() => {
    try {
      const saved = sessionStorage.getItem("menteeOnboardingForm");
      return saved
        ? JSON.parse(saved)
        : { ...DEFAULT_FORM };
    } catch {
      return { ...DEFAULT_FORM };
    }
  });

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [redirecting, setRedirecting] = useState(false);
  const isDirty = useFormDirty(form, { disabled: redirecting });

  useEffect(() => {
    if (error) {
      setMsg({ type: "error", text: error });
    }

    if (successMsg) {
      sessionStorage.removeItem("menteeOnboardingForm");
      dispatch(clearOnboardingMessages());
      setRedirecting(true);
      setTimeout(() => navigate("/dashboard/mentee"), 1500);
    }
  }, [error, successMsg ,dispatch, navigate]);

  //  Clear Redux messages on unmount so stale state never bleeds
  // into a future visit to this page
  useEffect(() => {
    return () => {
      dispatch(clearOnboardingMessages());
    };
  }, [dispatch]);

  useEffect(() => {
    sessionStorage.setItem("menteeOnboardingForm", JSON.stringify(form));
  }, [form]);

  const handleChange = (e: MenteeFormChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: MenteeSubmitEvent) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    dispatch(clearOnboardingMessages());

    // ── Client-side validations ──
    if (!form.currentRole.trim())
      return setMsg({ type: "error", text: "Current Role is required." });
    if (!form.yearsOfExperience)
      return setMsg({
        type: "error",
        text: "Years of Experience is required.",
      });
    if (!form.industry)
      return setMsg({ type: "error", text: "Industry is required." });
    if (!form.interestedFields.length)
      return setMsg({
        type: "error",
        text: "Please add at least one Field of Interest.",
      });
    if (!form.skills.length)
      return setMsg({
        type: "error",
        text: "Please add at least one Skill of Interest.",
      });
    if (!form.bio.trim())
      return setMsg({ type: "error", text: "Bio is required." });

    const isOnlyNumbers = (val: string) => /^\d+$/.test(val.trim());
    if (isOnlyNumbers(form.currentRole))
      return setMsg({
        type: "error",
        text: "Current Role cannot be a number.",
      });
    if (isOnlyNumbers(form.company))
      return setMsg({
        type: "error",
        text: "Company name cannot be a number.",
      });

    const isValidUrl = (val: string) => {
      if (!val) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    };
    if (!isValidUrl(form.linkedInUrl))
      return setMsg({
        type: "error",
        text: "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username).",
      });
    if (!isValidUrl(form.portfolioUrl))
      return setMsg({
        type: "error",
        text: "Please enter a valid Portfolio URL (e.g. https://yoursite.com).",
      });

    dispatch(submitMenteeOnboarding(toMenteeOnboardingRequest(form)));
  };

  return { form, loading, msg, redirecting, isDirty, handleChange, handleSubmit };
};

export default useMenteeOnboarding;
