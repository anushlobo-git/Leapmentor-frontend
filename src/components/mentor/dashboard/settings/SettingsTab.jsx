// src/components/mentor/dashboard/settings/SettingsTab.jsx
import useMentorSettings from "../../../../hooks/useMentorSettings";

// ── Toggle Switch ─────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? "bg-blue-900" : "bg-slate-200"
    }`}
  >
    <span
      className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// ── Badge Card ────────────────────────────────────────────
const BadgeCard = ({ badge }) => (
  <div className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
    badge.unlocked
      ? "bg-white border-blue-100 shadow-sm"
      : "bg-slate-50 border-slate-100 opacity-60"
  }`}>
    {/* Lock icon for locked badges */}
    {!badge.unlocked && (
      <div className="absolute top-2 right-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
    )}

    {/* Badge icon */}
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
      badge.unlocked ? "bg-blue-50" : "bg-slate-100"
    }`}>
      {badge.icon}
    </div>

    {/* Label */}
    <p className={`text-xs font-bold text-center ${
      badge.unlocked ? "text-slate-700" : "text-slate-400"
    }`}>
      {badge.label}
    </p>

    {/* Status */}
    <span className={`text-[10px] font-semibold uppercase tracking-wide ${
      badge.unlocked ? "text-blue-500" : "text-slate-400"
    }`}>
      {badge.unlocked ? "Unlocked" : "Locked"}
    </span>
  </div>
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

// ── Main SettingsTab ──────────────────────────────────────
const SettingsTab = ({ profile, user }) => {
  const {
    fetching,
    saving,
    msg,
    hourlyRate,         setHourlyRate,
    emailNotifications, setEmailNotifications,
    publicProfile,      setPublicProfile,
    badges,
    handleSave,
  } = useMentorSettings(profile);

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
          Manage your account preferences, sessions, and security.
        </p>
      </div>

      {/* ── Message banner ── */}
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

      {/* ── Gamification Badges ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <SectionHeader icon="🏅" title="Gamification Badges" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <BadgeCard key={badge.key} badge={badge} />
          ))}
        </div>
      </div>

      {/* ── Account Settings ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <SectionHeader icon="👤" title="Account Settings" />

        <div className="space-y-4">
          {/* Hourly Rate */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Hourly Rate per Session ($)
            </label>
            <input
              type="number"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="e.g. 75"
              className="w-full max-w-xs border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-slate-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">
              Your average session rate helps you rank in search filters.
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
          title="Public Profile Visibility"
          desc="Make your profile discoverable to all mentees on Leapmentor."
          checked={publicProfile}
          onChange={setPublicProfile}
        />
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-8">
        
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all duration-150 flex items-center gap-2 shadow-sm shadow-blue-200"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving...
            </>
          ) : (
            "Save All Changes"
          )}
        </button>
      </div>

    </div>
  );
};

export default SettingsTab;