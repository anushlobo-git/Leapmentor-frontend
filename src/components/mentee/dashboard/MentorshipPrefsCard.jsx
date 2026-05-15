// components/mentee/dashboard/MentorshipPrefsCard.jsx
import { useMenteeContext } from "../../../context/MenteeDashboardContext";
const COMM_ICONS = {
  "Chat": "💬",
  "Video Call": "🎥",
  "Email": "✉️",
  "Phone Call": "📞",
  "In-Person": "🤝",
};

const MentorshipPrefsCard = () => {
  // context pulling from prop drilling
  const { profile } = useMenteeContext();
  const commPrefs = profile?.communicationPreferences || [];
  const languages = profile?.languages || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-m font-bold text-slate-800 mb-4">Mentorship Preferences</h3>

      <div className="space-y-4">

        {/* Communication Methods */}
        <div>
          <p className="text-xs font-semibold text-slate-800 uppercase tracking-wide mb-2">
            Communication Methods
          </p>
          {commPrefs.length === 0 ? (
            <p className="text-sm text-slate-700">—</p>
          ) : (
            <div className="space-y-0">
              {commPrefs.map((pref) => (
                <div key={pref} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="text-sm text-slate-600">
                    {pref === "Chat" ? "Instant Messaging / Chat"
                      : pref === "Video Call" ? "Video Conferences"
                      : pref === "Email" ? "Email Correspondence"
                      : pref}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Languages */}
        <div>
          <p className="text-xs font-semibold text-slate-800 uppercase tracking-wide mb-2">
            Languages
          </p>
          {languages.length === 0 ? (
            <p className="text-sm text-slate-400">—</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wide"
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