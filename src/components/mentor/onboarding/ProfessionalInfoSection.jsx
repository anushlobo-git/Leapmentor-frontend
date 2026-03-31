// components/mentor/onboarding/ProfessionalInfoSection.jsx

const INDUSTRY_OPTIONS = [
  "Technology", "Finance", "Healthcare", "Education", "Design",
  "Marketing", "Legal", "Consulting", "Media", "Engineering", "Other",
];

const inputClass = "w-full text-sm text-[#0f172a] bg-[#f8faff] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 outline-none placeholder:text-slate-500 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb20] transition-all duration-150";

const ProfessionalInfoSection = ({ form, onChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#e8edf5] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8edf5] bg-[#f8faff]">
        <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
        </div>
        <h2 className="text-sm font-bold text-[#0f172a]">Professional Info</h2>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Current Role */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Current Role <span className="text-blue-900">*</span>
            </label>
            <input
              name="currentRole"
              value={form.currentRole}
              onChange={onChange}
              className={inputClass}
              placeholder="e.g. Senior Product Designer"
              required
            />
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-xs font-semibold text-[#475569] mb-1.5">
              Industry <span className="text-blue-900">*</span>
            </label>
            <select
              id="industry"
              name="industry"
              value={form.industry}
              onChange={onChange}
              className={inputClass}
              required
            >
              <option value="" disabled className="text-slate-500">Select industry</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Company
            </label>
            <input
              name="company"
              value={form.company}
              onChange={onChange}
              className={inputClass}
              placeholder="e.g. Google, Startup Inc."
            />
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Years of Experience <span className="text-blue-900">*</span>
            </label>
            <input
              name="yearsOfExperience"
              type="number"
              min="0"
              max="60"
              value={form.yearsOfExperience}
              onChange={onChange}
              className={inputClass}
              placeholder="e.g. 8"
              required
            />
          </div>

          {/* Hourly Rate */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Hourly Rate (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">$</span>
              <input
                name="hourlyRate"
                type="number"
                min="0"
                value={form.hourlyRate}
                onChange={onChange}
                className={inputClass + " pl-7"}
                placeholder="e.g. 50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInfoSection;