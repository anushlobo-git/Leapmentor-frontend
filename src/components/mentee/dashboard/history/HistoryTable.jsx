// src/components/mentee/dashboard/history/HistoryTable.jsx
import StatusBadge from "./StatusBadge";
import { formatDate, getInitials } from "./constants";

const DeleteIcon = ({ onClick, title }) => (
  <button type="button" onClick={onClick} title={title}
    className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  </button>
);

const ViewButton = ({ onClick, isSelected }) => (
  <button type="button" onClick={onClick}
    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
    {isSelected ? "Close" : "View"}
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
    </svg>
  </button>
);

const COLUMNS = ["Mentor Name", "Skill / Role", "Date Sent", "Status", "Actions"];

const HistoryTable = ({ requests, selected, onSelect, onDelete }) => {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-700">No requests found</p>
        <p className="text-xs text-slate-400 mt-1">Try a different filter or send a new request.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
        {COLUMNS.map((col) => (
          <p key={col} className="text-xs font-bold text-slate-400 uppercase tracking-wide">{col}</p>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {requests.map((request) => {
          const mentor     = request.mentor;
          const role       = request.mentorProfile?.currentRole || "—";
          const mentorName = mentor?.name || "—";
          const initials   = getInitials(mentorName);
          const status     = request.status;
          const isSelected = selected?._id === request._id;

          return (
            <div key={request._id}
              className={`grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center transition-colors ${
                isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/60"
              }`}>

              {/* Mentor */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{mentorName}</p>
                  <p className="text-xs text-slate-400 truncate">{mentor?.email}</p>
                </div>
              </div>

              {/* Role */}
              <p className="text-sm text-slate-600 truncate">{role}</p>

              {/* Date */}
              <p className="text-sm text-slate-500">{formatDate(request.requestedAt)}</p>

              {/* Status */}
              <StatusBadge status={status} />

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* View — pending, accepted, referred, rejected */}
                <ViewButton
                  onClick={() => onSelect(isSelected ? null : request)}
                  isSelected={isSelected}
                />

                {/* Delete icon — all statuses except ongoing */}
                <DeleteIcon
                  onClick={() => onDelete(request._id)}
                  title="Delete request"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTable;