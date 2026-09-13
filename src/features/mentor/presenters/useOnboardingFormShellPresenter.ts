/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect, useRef } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submitMentorOnboarding, clearMentorOnboardingMessages } from "@features/mentor/models/mentorOnboardingSlice";
import type { AppDispatch, RootState } from "@store/index";

export interface MentorOnboardingForm {
  profilePicture: string;
  profilePictureFileName: string;
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
  [key: string]: any;
}

const DEFAULT_FORM: MentorOnboardingForm = {
  profilePicture: "",
  profilePictureFileName: "",
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
};

export const useOnboardingFormShellPresenter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, successMsg } = useSelector((state: RootState) => state.mentorOnboarding);

  const [form, setForm] = useState<MentorOnboardingForm>(() => {
    try {
      const saved = sessionStorage.getItem("mentorOnboardingForm");
      return saved ? JSON.parse(saved) : { ...DEFAULT_FORM };
    } catch {
      return { ...DEFAULT_FORM };
    }
  });

  // ── Validation errors ──
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // local msg — used for validation errors + synced from Redux
  const [msg, setMsg] = useState<{ type: string; text: string }>({ type: "", text: "" });
  const [redirecting, setRedirecting] = useState(false);

  // ── Refs for custom section components that can't be targeted by name= ──
  const sectionRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    skills: useRef(null),
  };

  // sync Redux error/successMsg → local msg
  useEffect(() => {
    if (error) setMsg({ type: "error", text: String(error) });
    if (successMsg) {
      sessionStorage.removeItem("mentorOnboardingForm");
      dispatch(clearMentorOnboardingMessages());
      setRedirecting(true);
      setTimeout(() => navigate("/verify-documents"), 1500);
    }
  }, [error, successMsg]);

  useEffect(() => {
    return () => { dispatch(clearMentorOnboardingMessages()); };
  }, []);

  useEffect(() => {
    sessionStorage.setItem("mentorOnboardingForm", JSON.stringify(form));
  }, [form]);

  // ── Validate required fields ──
  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.currentRole?.trim()) newErrors.currentRole = true;
    if (!form.yearsOfExperience) newErrors.yearsOfExperience = true;
    if (!form.industry?.trim()) newErrors.industry = true;
    if (!form.skills?.length) newErrors.skills = true;
    return newErrors;
  };

  // ── Scroll to the first errored field ──
  // Priority: name= attribute → data-field= attribute → React ref
  const scrollToFirstError = (errorKeys: string[]) => {
    if (!errorKeys.length) return;
    const firstKey = errorKeys[0];

    const el: Element | HTMLElement | null | undefined =
      document.querySelector(`[name="${firstKey}"]`) ||
      document.querySelector(`[data-field="${firstKey}"]`) ||
      sectionRefs[firstKey]?.current;

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ── Universal onChange — clears error + enforces numeric range limits ──
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    // ── hourlyRate: only block values clearly over the max as you type.
    //    Do NOT enforce min here — enforcing min=1 causes the "reduces by 1"
    //    glitch because the browser normalises an empty/transitional value to
    //    the min before React can update state. Min is checked on submit instead.
    if (name === "hourlyRate" && value !== "") {
      const num = Number(value);
      if (num > 100) return;
    }

    if (errors[name]) {
      setErrors((prev: Record<string, boolean>) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setForm((prev: MentorOnboardingForm) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    dispatch(clearMentorOnboardingMessages());

    // ── Run client-side required-field validation first ──
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstError(Object.keys(newErrors));
      return;
    }
    setErrors({});

    // ── Additional validations ──
    const isOnlyNumbers = (val: string) => val && /^\d+$/.test(val.trim());
    if (isOnlyNumbers(form.currentRole))
      return setMsg({ type: "error", text: "Current Role cannot be a number." });
    if (isOnlyNumbers(form.company))
      return setMsg({ type: "error", text: "Company name cannot be a number." });

    // ── Numeric range safety net (catches pasted values that bypass onChange) ──
    if (form.hourlyRate && (Number(form.hourlyRate) < 1 || Number(form.hourlyRate) > 100))
      return setMsg({ type: "error", text: "Session rate must be between ₹1 and ₹100." });

    const isValidUrl = (val: string) => {
      if (!val) return true;
      try { new URL(val); return true; }
      catch { return false; }
    };
    if (!isValidUrl(form.linkedInUrl))
      return setMsg({ type: "error", text: "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)." });
    if (!isValidUrl(form.portfolioUrl))
      return setMsg({ type: "error", text: "Please enter a valid Portfolio URL (e.g. https://yoursite.com)." });

    const payload = {
      ...form,
      profilePictureFileName: form.profilePictureFileName || "",
      yearsOfExperience: Number(form.yearsOfExperience) || 0,
      hourlyRate: Number(form.hourlyRate) || 0,
      languages: typeof form.languages === "string"
        ? form.languages.split(",").map((s) => s.trim()).filter(Boolean)
        : form.languages,
    };

    dispatch(submitMentorOnboarding(payload));
  };

  return {
    form,
    errors,
    msg,
    redirecting,
    loading,
    sectionRefs,
    handleChange,
    handleSubmit,
  };
};
