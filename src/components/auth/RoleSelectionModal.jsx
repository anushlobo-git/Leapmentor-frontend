//not used as per now 
// src/components/auth/RoleSelectionModal.jsx
// Shown when a new user signs in via Google/LinkedIn with no ?role= param.
// They must pick mentor or mentee before the account is created.

const RoleSelectionModal = ({ onSelect, loading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            One quick thing…
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Are you joining as a mentor or a mentee? This helps us personalise your experience.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Mentee */}
          <button
            onClick={() => onSelect("mentee")}
            disabled={loading}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-900 hover:bg-blue-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              {/* Graduation cap icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">I'm a Mentee</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Looking for guidance
              </p>
            </div>
          </button>

          {/* Mentor */}
          <button
            onClick={() => onSelect("mentor")}
            disabled={loading}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-900 hover:bg-blue-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              {/* Star/expert icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">I'm a Mentor</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Ready to guide others
              </p>
            </div>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500">
            <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
            Setting up your account…
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelectionModal;