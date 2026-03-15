// src/components/mentee/dashboard/settings/MenteeSettingsTab.jsx
import { useState } from "react";
import useMenteeSettings from "../../../../hooks/useMenteeSettings";

// ── Toggle ────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? "bg-blue-600" : "bg-slate-200"
    }`}
  >
    <span className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
      checked ? "translate-x-6" : "translate-x-1"
    }`} />
  </button>
);

// ── Section Header ────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-base">{icon}</span>
    <h2 className="text-base font-bold text-slate-800">{title}</h2>
  </div>
);

// ── Preference Row ────────────────────────────────────────
const PreferenceRow = ({ title, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <div className="flex-1 pr-4">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

// ── Password Input ────────────────────────────────────────
const PasswordInput = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          className="w-full max-w-sm border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-800 bg-slate-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main MenteeSettingsTab ────────────────────────────────
const MenteeSettingsTab = ({ profile }) => { // eslint-disable-line no-unused-vars
  const {
    fetching,
    saving,
    changingPw,
    msg,
    pwMsg,
    balance,
    escrow,
    emailNotifications,   setEmailNotifications,
    marketingPreferences, setMarketingPreferences,
    currentPassword,      setCurrentPassword,
    newPassword,          setNewPassword,
    confirmPassword,      setConfirmPassword,
    passwordChangedAt,
    formatPasswordAge,
    handleSave,
    handleChangePassword,
  } = useMenteeSettings(profile);

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // ── Loading skeleton ──────────────────────────────────
  if (fetching) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <div className="h-7 w-32 bg-slate-100 rounded-lg animate-pulse mb-1" />
          <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="h-5 w-40 bg-slate-100 rounded animate-pulse mb-4" />
            <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage your personal preferences, security, and billing points.
        </p>
      </div>

      {/* ── Preferences message banner ── */}
      {msg.text && (
        <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${
          msg.type === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-600 border-red-200"
        }`}>
          <span>{msg.type === "success" ? "✓" : "⚠"}</span>
          {msg.text}
        </div>
      )}

      {/* ── Leap Points ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <SectionHeader icon="🪙" title="Leap Points" />
        <div className="flex items-start gap-6">
          {/* Balance */}
            <div className="shrink-0">
             <p className="text-xs font-semibold text-slate-400 mb-1">Current Balance</p>
             <p className="text-4xl font-extrabold text-slate-800 tracking-tight">
              {balance.toLocaleString()}
              <span className="text-lg font-bold text-blue-500 ml-1">LP</span>
              </p>
               {escrow > 0 && (
              <p className="text-xs text-amber-500 mt-1">
              {escrow} LP locked in escrow
              </p>
              )}
            </div>
          {/* Description */}
          <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700 leading-relaxed">
              Leap Points are the platform currency used to book and pay for mentoring sessions.
              Each point is equivalent to <span className="font-bold">$1.00</span>.
              Points never expire and are non-refundable once used for booking.
            </p>
          </div>
        </div>
      </div>

      {/* ── Preferences ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <SectionHeader icon="⚙️" title="Preferences" />
        <PreferenceRow
          title="Email Notifications"
          desc="Receive session reminders and message alerts via email."
          checked={emailNotifications}
          onChange={setEmailNotifications}
        />
        <PreferenceRow
          title="Marketing Preferences"
          desc="Stay updated with Leapmentor news and special offers."
          checked={marketingPreferences}
          onChange={setMarketingPreferences}
        />
        {/* Save button */}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm shadow-blue-200"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving...
              </>
            ) : "Save Preferences"}
          </button>
        </div>
      </div>

      {/* ── Account Security ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <SectionHeader icon="🔐" title="Account Security" />

        {/* Change Password Row */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            {/* Lock icon */}
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Change Password</p>
              <p className="text-xs text-slate-400">{formatPasswordAge(passwordChangedAt)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordForm((p) => !p)}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            {showPasswordForm ? "Cancel" : "Update"}
          </button>
        </div>

        {/* Password Form — shown when Update clicked */}
        {showPasswordForm && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">

            {/* Password message banner */}
            {pwMsg.text && (
              <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${
                pwMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}>
                <span>{pwMsg.type === "success" ? "✓" : "⚠"}</span>
                {pwMsg.text}
              </div>
            )}

            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter current password"
            />
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Min. 6 characters"
            />
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter new password"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changingPw}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {changingPw ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Updating...
                  </>
                ) : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <p className="text-xs text-slate-400">© 2024 Leapmentor Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Privacy Policy</span>
          <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Terms of Service</span>
        </div>
      </div>

    </div>
  );
};

export default MenteeSettingsTab;