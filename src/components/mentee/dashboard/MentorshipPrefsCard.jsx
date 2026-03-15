// components/mentee/dashboard/MentorshipPrefsCard.jsx

const COMM_ICONS = {
  "Chat": "💬",
  "Video Call": "🎥",
  "Email": "✉️",
  "Phone Call": "📞",
  "In-Person": "🤝",
};

const MentorshipPrefsCard = ({ profile }) => {
  const commPrefs = profile?.communicationPreferences || [];
  const languages = profile?.languages || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-800">Mentorship Preferences</h3>
      </div>

      <div className="space-y-4">
        {/* Communication Methods */}
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Communication Methods</p>
          {commPrefs.length === 0 ? (
            <p className="text-sm text-slate-400">—</p>
          ) : (
            <div className="space-y-2">
              {commPrefs.map((pref) => (
                <div key={pref} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xs shrink-0">
                    {COMM_ICONS[pref] || "💬"}
                  </div>
                  {pref === "Chat" ? "Instant Messaging / Chat"
                    : pref === "Video Call" ? "Video Conferences"
                    : pref === "Email" ? "Email Correspondence"
                    : pref}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Languages */}
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Languages</p>
          {languages.length === 0 ? (
            <p className="text-sm text-slate-400">—</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-wide"
                >
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorshipPrefsCard;