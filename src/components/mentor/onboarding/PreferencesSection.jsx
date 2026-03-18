// components/mentor/onboarding/PreferencesSection.jsx
import { useState, useRef, useEffect } from "react";

const COMMUNICATION_OPTIONS = [
  { value: "Video Call",  label: "Video Meetings",          icon: "🎥" },
  { value: "Chat",        label: "Instant Messaging (Chat)", icon: "💬" },
  { value: "Email",       label: "Email Correspondence",     icon: "✉️" },
  { value: "Phone Call",  label: "Phone Call",               icon: "📞" },
  { value: "In-Person",   label: "In-Person",                icon: "🤝" },
];

// ✅ 20 professional languages — no free text allowed
const LANGUAGE_OPTIONS = [
  "English", "Hindi", "Spanish", "French", "German",
  "Mandarin", "Arabic", "Portuguese", "Japanese", "Korean",
  "Italian", "Russian", "Dutch", "Turkish", "Swedish",
  "Polish", "Indonesian", "Bengali", "Tamil", "Urdu",
];

const PreferencesSection = ({ form, onChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selected  = form.communicationPreferences || [];
  // ✅ Support both string (old) and array (new) format
  const languages = Array.isArray(form.languages)
    ? form.languages
    : (form.languages ? form.languages.split(",").map((s) => s.trim()).filter(Boolean) : []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleComm = (value) => {
    const updated = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange({ target: { name: "communicationPreferences", value: updated } });
  };

  const toggleLanguage = (lang) => {
    const updated = languages.includes(lang)
      ? languages.filter((l) => l !== lang)
      : [...languages, lang];
    // ✅ Store as array directly
    onChange({ target: { name: "languages", value: updated } });
  };

  const removeLanguage = (lang) => {
    onChange({ target: { name: "languages", value: languages.filter((l) => l !== lang) } });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8edf5] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8edf5] bg-[#f8faff]">
        <div className="w-8 h-8 rounded-xl bg-[#2563eb] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 className="text-sm font-bold text-[#0f172a]">Mentorship Preferences</h2>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-6">

          {/* Communication Channels */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-3">
              Communication Channels
            </label>
            <div className="space-y-2.5">
              {COMMUNICATION_OPTIONS.map(({ value, label, icon }) => {
                const isChecked = selected.includes(value);
                return (
                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleComm(value)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${
                        isChecked
                          ? "bg-[#2563eb] border-[#2563eb]"
                          : "border-[#cbd5e1] bg-white group-hover:border-[#2563eb]"
                      }`}
                    >
                      {isChecked && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span onClick={() => toggleComm(value)} className="text-sm text-[#334155] select-none">
                      {icon} {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Languages — dropdown multi-select */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Languages
            </label>
            <p className="text-xs text-[#94a3b8] mb-2">Select languages you can mentor in</p>

            {/* Selected language tags */}
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
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
            )}

            {/* Dropdown trigger */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full text-sm text-left bg-[#f8faff] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb20] transition-all duration-150 flex items-center justify-between"
              >
                <span className={languages.length === 0 ? "text-[#94a3b8]" : "text-[#0f172a]"}>
                  {languages.length === 0 ? "Select languages..." : `${languages.length} selected`}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const isSelected = languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-[#2563eb] font-semibold"
                            : "text-[#334155] hover:bg-[#f8faff]"
                        }`}
                      >
                        {lang}
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;