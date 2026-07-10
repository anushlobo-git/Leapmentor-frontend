/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/mentee/profile/MenteeEditProfileShell.jsx
import { useNavigate } from "react-router-dom";
import useMenteeEditProfile from "@features/mentee/hooks/useMenteeEditProfile";
import PersonalInfoSection from "@features/mentee/components/onboarding/PersonalInfoSection";
import ProfessionalDetailsSection from "@features/mentee/components/onboarding/ProfessionalDetailsSection";
import InterestedFieldsSection from "@features/mentee/components/onboarding/InterestedFieldsSection";
import MentorshipPrefsSection from "@features/mentee/components/onboarding/MentorshipPrefsSection";
import SocialLinksSection from "@features/mentee/components/onboarding/SocialLinksSection";
import { IMAGES } from "@constants/images";

const MenteeEditProfileShell = () => {
  const navigate = useNavigate();
  const { form, loading, fetchLoading, msg, handleChange, handleSubmit } =
    useMenteeEditProfile();

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-900/30 border-t-blue-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-1 w-full bg-blue-900" />

      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={IMAGES.LOGO}
              alt="LeapMentor logo"
              className="h-8 w-8"
              width={32}
              height={32}
            />
            <span className="text-sm font-bold text-slate-800">Edit Profile</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/mentee")}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-8 pb-2 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Update Your Profile</h1>
        <p className="text-sm text-slate-400 mt-1">
          Make changes to your profile and save when done.
        </p>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <PersonalInfoSection form={form} handleChange={handleChange} />
          <ProfessionalDetailsSection form={form} handleChange={handleChange} />
          <InterestedFieldsSection form={form} handleChange={handleChange} />
          <MentorshipPrefsSection form={form} handleChange={handleChange} />
          <SocialLinksSection form={form} handleChange={handleChange} />

          {msg.text && (
            <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${msg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-600"
              }`}>
              <span>{msg.type === "success" ? "✓" : "⚠"}</span>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-blue-900 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-md shadow-blue-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Saving changes...
              </span>
            ) : (
              "Save Changes →"
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default MenteeEditProfileShell;