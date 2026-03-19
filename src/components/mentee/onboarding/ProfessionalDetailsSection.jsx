// components/mentee/onboarding/ProfessionalDetailsSection.jsx

const EXPERIENCE_OPTIONS = [
  "Student / Aspiring",
  "0-1 Years",
  "1-3 Years",
  "3-5 Years",
  "5-10 Years",
  "10+ Years",
];

const INDUSTRY_OPTIONS = [
  "Technology", "Finance", "Healthcare", "Education", "Design",
  "Marketing", "Legal", "Consulting", "Media", "Engineering", "Other",
];

const inputClass = "w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150";

const ProfessionalDetailsSection = ({ form, handleChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-50 bg-blue-50">
        <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
        </div>
        <h2 className="text-sm font-bold text-slate-800">2. Professional Details</h2>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Current Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Current Role<span className="text-blue-900">*</span></label>
            <input
              name="currentRole"
              value={form.currentRole}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. Junior Product Designer"
            />
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Years of Experience<span className="text-blue-900">*</span></label>
            <select
              name="yearsOfExperience"
              value={form.yearsOfExperience}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Experience</option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Company</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className={inputClass}
              placeholder="Company Name / Organization"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Industry<span className="text-blue-900">*</span></label>
            <select
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">e.g. Fintech, Healthcare</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetailsSection;