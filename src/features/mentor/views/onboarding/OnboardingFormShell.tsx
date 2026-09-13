/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/mentor/onboarding/OnboardingFormShell.jsx
import FullScreenLoader from "@components/common/FullScreenLoader";
import PersonalInfoSection from "@features/mentor/views/onboarding/PersonalInfoSection";
import ProfessionalInfoSection from "@features/mentor/views/onboarding/ProfessionalInfoSection";
import SkillsSection from "@features/mentor/views/onboarding/SkillsSection";
import PreferencesSection from "@features/mentor/views/onboarding/PreferencesSection";
import SocialLinksSection from "@features/mentor/views/onboarding/SocialLinksSection";
import OnboardingProgressBar from "@components/ui/OnboardingProgressBar";
import { MENTOR_ONBOARDING_FIELDS } from "@config/onboardingFields";
import { IMAGES } from "@constants/images";
import { useOnboardingFormShellPresenter } from "@features/mentor/presenters/useOnboardingFormShellPresenter";

const OnboardingFormShell = () => {
  const {
    form,
    errors,
    msg,
    redirecting,
    loading,
    sectionRefs,
    handleChange,
    handleSubmit,
  } = useOnboardingFormShellPresenter();

  return (
    <div className="min-h-screen bg-[#f0f4ff]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {redirecting && <FullScreenLoader message="Setting up your profile..." />}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Top accent bar */}
      <div className="h-1 w-full bg-blue-900" />

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white border-b border-[#e8edf5] shadow-sm">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={IMAGES.LOGO_PNG}
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

          <PersonalInfoSection form={form} onChange={handleChange} errors={errors} />
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
            <div className={`flex items-center gap-2.5 text-sm rounded-xl px-4 py-3 border ${msg.type === "success"
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
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />{" "}
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
