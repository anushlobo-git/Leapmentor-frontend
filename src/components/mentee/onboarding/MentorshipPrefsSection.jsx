// components/mentee/onboarding/MentorshipPrefsSection.jsx
import { useState } from "react";

const COMM_OPTIONS = [
  { value: "Chat", label: "Chat", icon: "💬" },
  { value: "Video Call", label: "Video Call", icon: "🎥" },
  { value: "Email", label: "Email", icon: "✉️" },
  { value: "Phone Call", label: "Phone Call", icon: "📞" },
  { value: "In-Person", label: "In-Person", icon: "🤝" },
];

const MentorshipPrefsSection = ({ form, handleChange }) => {
  const [langInput, setLangInput] = useState("");
  const selected = form.communicationPreferences || [];
  const languages = form.languages || [];

  const toggleComm = (value) => {
    const updated = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    handleChange({ target: { name: "communicationPreferences", value: updated } });
  };

  const addLanguage = () => {
    const trimmed = langInput.trim();
    if (!trimmed || languages.includes(trimmed)) { setLangInput(""); return; }
    handleChange({ target: { name: "languages", value: [...languages, trimmed] } });
    setLangInput("");
  };

  const removeLanguage = (lang) => {
    handleChange({ target: { name: "languages", value: languages.filter((l) => l !== lang) } });
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-50 bg-blue-50">
        <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 className="text-sm font-bold text-slate-800">4. Mentorship Preferences</h2>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-6">
          {/* Communication */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-3">
              Preferred Communication
            </label>
            <div className="space-y-2.5">
              {COMM_OPTIONS.map(({ value, label, icon }) => {
                const isChecked = selected.includes(value);
                return (
                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleComm(value)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${
                        isChecked
                          ? "bg-blue-900 border-blue-900"
                          : "border-slate-300 bg-white group-hover:border-blue-400"
                      }`}
                    >
                      {isChecked && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span onClick={() => toggleComm(value)} className="text-sm text-slate-600 select-none">
                      {icon} {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">
              Languages Known
            </label>
            {/* Language tags */}
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="text-blue-400 hover:text-blue-700 leading-none ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLanguage(); } }}
              onBlur={addLanguage}
              placeholder="Add language..."
              className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipPrefsSection;