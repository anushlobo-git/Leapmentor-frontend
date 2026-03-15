// components/mentee/dashboard/InterestedFieldsCard.jsx

const TagChip = ({ label, color = "blue" }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-900 border-blue-100",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border ${styles[color]}`}>
      {label}
    </span>
  );
};

const InterestedFieldsCard = ({ profile }) => {
  const fields = profile?.interestedFields || [];
  const skills = profile?.skills || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Interested Fields */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">Interested Fields</h3>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-slate-400">No fields added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fields.map((f) => <TagChip key={f} label={f} color="blue" />)}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mb-4" />

      {/* Top Skills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">Top Skills</h3>
        </div>
        {skills.length === 0 ? (
          <p className="text-sm text-slate-400">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => <TagChip key={s} label={s} color="slate" />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestedFieldsCard;