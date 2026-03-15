// components/mentee/onboarding/MenteeOnboardingShell.jsx
import { useNavigate } from "react-router-dom";
import useMenteeOnboarding from "../../../hooks/useMenteeOnboarding";
import PersonalInfoSection from "./PersonalInfoSection";
import ProfessionalDetailsSection from "./ProfessionalDetailsSection";
import InterestedFieldsSection from "./InterestedFieldsSection";
import MentorshipPrefsSection from "./MentorshipPrefsSection";
import SocialLinksSection from "./SocialLinksSection";

const MenteeOnboardingShell = () => {
  const navigate = useNavigate();
  const { form, loading, msg, handleChange, handleSubmit } = useMenteeOnboarding();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top accent */}
      <div className="h-1 w-full bg-blue-900" />

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              M
            </div>
            <span className="text-sm font-bold text-slate-800">Leapmentor</span>
          </div>
          
        </div>
      </header>

      {/* Page title */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-2 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Mentee Onboarding</h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete your profile and find the perfect mentor to accelerate your career.
        </p>
      </div>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          <PersonalInfoSection form={form} handleChange={handleChange} />
          <ProfessionalDetailsSection form={form} handleChange={handleChange} />
          <InterestedFieldsSection form={form} handleChange={handleChange} />
          <MentorshipPrefsSection form={form} handleChange={handleChange} />
          <SocialLinksSection form={form} handleChange={handleChange} />

          {/* Status message */}
          {msg.text && (
            <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${msg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-600"
              }`}>
              <span>{msg.type === "success" ? "✓" : ":warning:"}</span>
              {msg.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-blue-900 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-md shadow-blue-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Saving profile...
              </span>
            ) : (
              "Complete Profile →"
            )}
          </button>

          <p className="text-center text-xs text-slate-400 pb-8">
            By clicking complete, you agree to our Terms of Service
          </p>
        </form>
      </main>
    </div>
  );
};

export default MenteeOnboardingShell;