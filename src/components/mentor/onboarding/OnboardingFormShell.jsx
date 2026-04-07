// components/mentor/onboarding/OnboardingFormShell.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submitMentorOnboarding, clearMentorOnboardingMessages } from "../../../store/slices/mentorOnboardingSlice";

import PersonalInfoSection     from "./PersonalInfoSection";
import ProfessionalInfoSection from "./ProfessionalInfoSection";
import SkillsSection           from "./SkillsSection";
import PreferencesSection      from "./PreferencesSection";
import SocialLinksSection      from "./SocialLinksSection";
import OnboardingProgressBar   from "../../../ui/OnboardingProgressBar";
import { MENTOR_ONBOARDING_FIELDS } from "../../../config/onboardingFields";

const OnboardingFormShell = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, successMsg } = useSelector((state) => state.mentorOnboarding);
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    profilePicture:           "",
    bio:                      "",
    currentRole:              "",
    industry:                 "",
    company:                  "",
    yearsOfExperience:        "",
    hourlyRate:               "",
    skills:                   [],
    communicationPreferences: [],
    languages:                "",
    linkedInUrl:              "",
    portfolioUrl:             "",
  });

  // ── Validation errors ──
  const [errors, setErrors] = useState({});

  // local msg — used for validation errors + synced from Redux
  const [msg, setMsg] = useState({ type: "", text: "" });

  // ── Refs for custom section components that can't be targeted by name= ──
  const sectionRefs = {
    skills: useRef(null),
  };

  // sync Redux error/successMsg → local msg
  useEffect(() => {
    if (error)      setMsg({ type: "error",   text: error });
    if (successMsg) {
      setMsg({ type: "success", text: successMsg });
      setTimeout(() => navigate("/verify-documents"), 1000);
    }
  }, [error, successMsg]);

  // ── Validate required fields ──
  const validate = () => {
    const newErrors = {};
    if (!form.currentRole?.trim())  newErrors.currentRole = true;
    if (!form.yearsOfExperience)    newErrors.yearsOfExperience = true;
    if (!form.industry?.trim())     newErrors.industry = true;
    if (!form.skills?.length)       newErrors.skills = true;
    return newErrors;
  };

  // ── Scroll to the first errored field ──
  // Priority: name= attribute → data-field= attribute → React ref
  const scrollToFirstError = (errorKeys) => {
    if (!errorKeys.length) return;
    const firstKey = errorKeys[0];

    const el =
      document.querySelector(`[name="${firstKey}"]`) ||
      document.querySelector(`[data-field="${firstKey}"]`) ||
      sectionRefs[firstKey]?.current;

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ── Universal onChange — clears error for the field being edited ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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

    // ── No token → redirect to login ──
    if (!token) { navigate("/login"); return; }

    const payload = {
      ...form,
      yearsOfExperience: Number(form.yearsOfExperience) || 0,
      hourlyRate:        Number(form.hourlyRate) || 0,
      languages: typeof form.languages === "string"
        ? form.languages.split(",").map((s) => s.trim()).filter(Boolean)
        : form.languages,
    };

    dispatch(submitMentorOnboarding(payload));
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Top accent bar */}
      <div className="h-1 w-full bg-blue-900" />

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white border-b border-[#e8edf5] shadow-sm">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/logo.png"
              alt="Leapmentor logo"
              className="h-8 w-auto"
            />
            <span className="text-sm font-bold text-[#0f172a]">Mentor Onboarding</span>
          </div>
        </div>
      </header>

      <OnboardingProgressBar form={form} fields={MENTOR_ONBOARDING_FIELDS} />

      {/* Page title */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-[#0f172a]">Mentor Onboarding</h1>
        <p className="text-sm text-slate-600 mt-1">
          Complete your profile setup and help mentees find you.
        </p>
      </div>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          <PersonalInfoSection     form={form} onChange={handleChange} errors={errors} />
          <ProfessionalInfoSection form={form} onChange={handleChange} errors={errors} />

          {/* ref forwarded so scrollToFirstError can target this section */}
          <SkillsSection
            ref={sectionRefs.skills}
            form={form}
            onChange={handleChange}
            errors={errors}
          />

          <PreferencesSection form={form} onChange={handleChange} />
          <SocialLinksSection form={form} onChange={handleChange} />

          {/* Status message */}
          {msg.text && (
            <div className={`flex items-center gap-2.5 text-sm rounded-xl px-4 py-3 border ${
              msg.type === "success"
                ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]"
                : "bg-[#fff1f2] border-[#fecdd3] text-[#e11d48]"
            }`}>
              <span>{msg.type === "success" ? "✓" : "⚠"}</span>
              {msg.text}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-blue-900 hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-md shadow-[#2563eb30]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Saving profile…
              </span>
            ) : (
              "Submit Profile →"
            )}
          </button>

          <p className="text-center text-xs text-slate-600 pb-8">
            You can always edit your profile from the dashboard.
          </p>
        </form>
      </main>
    </div>
  );
};

export default OnboardingFormShell;