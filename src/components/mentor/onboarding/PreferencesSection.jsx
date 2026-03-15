// components/mentor/onboarding/PreferencesSection.jsx

const COMMUNICATION_OPTIONS = [
  { value: "Video Call", label: "Video Meetings", icon: "🎥" },
  { value: "Chat", label: "Instant Messaging (Chat)", icon: "💬" },
  { value: "Email", label: "Email Correspondence", icon: "✉️" },
  { value: "Phone Call", label: "Phone Call", icon: "📞" },
  { value: "In-Person", label: "In-Person", icon: "🤝" },
];

const PreferencesSection = ({ form, onChange }) => {
  const selected = form.communicationPreferences || [];

  const toggleComm = (value) => {
    const updated = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange({ target: { name: "communicationPreferences", value: updated } });
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
                  <label
                    key={value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      onClick={() => toggleComm(value)}
                      className={`w-4.5 h-4.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${
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
                    <span
                      onClick={() => toggleComm(value)}
                      className="text-sm text-[#334155] select-none"
                    >
                      {icon} {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Languages
            </label>
            <p className="text-xs text-[#94a3b8] mb-2">Add languages you can mentor in</p>
            <input
              name="languages"
              value={form.languages}
              onChange={onChange}
              placeholder="e.g. English, Spanish, German"
              className="w-full text-sm text-[#0f172a] bg-[#f8faff] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb20] transition-all duration-150"
            />
            <p className="text-xs text-[#94a3b8] mt-1.5">Separate with commas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;