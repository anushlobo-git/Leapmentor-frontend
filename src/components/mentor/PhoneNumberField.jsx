// components/mentor/verification/PhoneNumberField.jsx

const PhoneNumberField = ({ value, onChange, error }) => {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-50 bg-blue-50">
        <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.42 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Contact Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">Used for verification purposes only</p>
        </div>
      </div>

      <div className="px-6 py-5">
        <label className="block text-xs font-semibold text-slate-500 mb-2">
          Phone Number <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={value}
          onChange={onChange}
          placeholder="+91 98765 43210"
          className={`w-full text-sm bg-white border rounded-xl px-3.5 py-2.5 outline-none transition-all duration-150
            ${error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : "border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-slate-400"
            }`}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1.5">
          Include country code (e.g. +91 for India)
        </p>
      </div>
    </div>
  );
};

export default PhoneNumberField;