// src/components/shared-dashboard/tabs/goals/SessionCard.jsx
import { useState } from "react";

const formatSlotDate = (slot) => {
  if (!slot?.date) return "";
  return new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric", year: "numeric",
  });
};

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

// ── Meeting Link Section ──────────────────────────────────────
const MeetingLinkSection = ({ slot, viewerRole, onSetLink, saving }) => {
  const [editing, setEditing] = useState(false);
  const [linkVal, setLinkVal] = useState(slot?.meetingLink || "");
  const [linkErr, setLinkErr] = useState("");

  const isMentor = viewerRole === "mentor";

  const handleSave = async () => {
    if (!linkVal.trim()) { setLinkErr("Link cannot be empty"); return; }
    setLinkErr("");
    const result = await onSetLink(linkVal.trim());
    if (result?.success) setEditing(false);
  };

  return (
    <div className="border-t border-slate-100 pt-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        Meeting Link
      </p>

      {editing ? (
        <div className="flex flex-col gap-2">
          <input
            autoFocus
            value={linkVal}
            onChange={(e) => setLinkVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="https://meet.google.com/..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700
              bg-white outline-none focus:border-blue-300 transition-colors placeholder:text-slate-400"
          />
          {linkErr && <p className="text-xs text-red-500">{linkErr}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setLinkErr(""); setLinkVal(slot?.meetingLink || ""); }}
              className="flex-1 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !linkVal.trim()}
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold
                hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : slot?.meetingLink ? (
        <div className="flex items-center gap-2">
          <a
            href={slot.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100
              rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors truncate"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="truncate">{slot.meetingLink}</span>
          </a>
          {/* Only mentor can edit the meeting link */}
          {isMentor && (
            <button
              onClick={() => { setLinkVal(slot.meetingLink); setEditing(true); }}
              className="shrink-0 px-2.5 py-2 rounded-xl border border-slate-200 bg-white
                text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      ) : isMentor ? (
        // Only mentor can add a meeting link
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed
            border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500
            hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Meeting Link
        </button>
      ) : (
        // Mentee sees a placeholder when no link is set yet
        <p className="text-xs text-slate-400 italic">No meeting link added yet.</p>
      )}
    </div>
  );
};

// ── Session Milestones ────────────────────────────────────────
const SessionMilestones = ({
  milestones,
  goal,
  slotIndex,
  viewerRole,
  onAdd,
  onToggle,
  onDelete,
  saving,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = async () => {
    if (!newTitle.trim() || !goal) return;
    const result = await onAdd(goal._id, { title: newTitle.trim(), slotIndex });
    if (result?.success) {
      setNewTitle("");
      setShowForm(false);
    }
  };

  const completed = milestones.filter((m) => m.isCompleted).length;

  // Both mentor and mentee can add/toggle/delete milestones — but only if a goal exists
  const canEditMilestones = !!goal;

  return (
    <div className="border-t border-slate-100 pt-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Session Milestones
          </p>
          {milestones.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
              {completed}/{milestones.length}
            </span>
          )}
        </div>
        {/* Add button — visible to BOTH roles as long as a goal exists */}
        {!showForm && canEditMilestones && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 border
              border-violet-200 text-[10px] font-bold text-violet-600 hover:bg-violet-100 transition-colors"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="flex gap-2 mb-2.5">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Milestone title..."
            className="flex-1 px-3 py-2 border border-violet-200 rounded-xl text-xs text-slate-800
              bg-white outline-none focus:border-violet-500 transition-colors placeholder:text-slate-400"
          />
          <button
            onClick={() => { setShowForm(false); setNewTitle(""); }}
            className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold
              text-slate-500 hover:bg-slate-50 transition-colors"
          >
            ✕
          </button>
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim() || saving}
            className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold
              hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      )}

      {/* Empty state */}
      {milestones.length === 0 && !showForm && (
        <p className="text-xs text-slate-400 italic">
          {goal
            ? "No milestones for this session yet."
            : viewerRole === "mentor"
              ? "Set a goal first to add milestones."
              : "Waiting for your mentor to set a goal before adding milestones."}
        </p>
      )}

      {/* Milestone rows — toggle & delete available to BOTH roles */}
      <div className="flex flex-col gap-1.5">
        {milestones.map((m) => (
          <div
            key={m._id}
            className={`flex items-center gap-2.5 px-3 py-2.5 border rounded-xl transition-all
              ${m.isCompleted ? "bg-slate-50 border-slate-100 opacity-75" : "bg-white border-slate-200"}`}
          >
            <button
              onClick={() => onToggle(m._id, !m.isCompleted)}
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0
                transition-all cursor-pointer p-0
                ${m.isCompleted
                  ? "bg-violet-600 border-violet-600"
                  : "bg-white border-slate-300 hover:border-violet-400"}`}
            >
              {m.isCompleted && (
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-xs font-medium leading-snug
              ${m.isCompleted ? "line-through text-slate-400" : "text-slate-700"}`}>
              {m.title}
            </span>
            <button
              onClick={() => onDelete(m._id)}
              className="p-1 rounded-md border-none bg-transparent text-slate-300
                hover:text-red-400 transition-colors cursor-pointer shrink-0"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Completion Section ────────────────────────────────────────
const CompletionSection = ({ slot, viewerRole, otherName, slotIndex, onMarkComplete, saving }) => {
  const isMentee = viewerRole === "mentee";
  const iMenteeMarked = slot?.menteeMarked || false;
  const iMentorMarked = slot?.mentorMarked || false;
  const myMark = isMentee ? iMenteeMarked : iMentorMarked;
  const otherMark = isMentee ? iMentorMarked : iMenteeMarked;
  const bothDone = iMenteeMarked && iMentorMarked;

  return (
    <div className="border-t border-slate-100 pt-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
        Completion
      </p>

      <div className="flex flex-col gap-1.5 mb-3">
        {/* My status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold
          ${myMark
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-slate-50 border-slate-200 text-slate-500"}`}>
          <span>{myMark ? "✓" : "○"}</span>
          <span>{myMark ? "You marked this session complete" : "You haven't marked this session complete yet"}</span>
        </div>

        {/* Other person's status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold
          ${otherMark
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-amber-50 border-amber-200 text-amber-700"}`}>
          <span>{otherMark ? "✓" : "○"}</span>
          <span>
            {otherMark
              ? `${otherName} marked this session complete`
              : `Waiting for ${otherName} to confirm`}
          </span>
        </div>
      </div>

      {/* Mark complete button — hidden if already marked by this user or both done */}
      {!myMark && !bothDone && (
        <button
          onClick={() => onMarkComplete(slotIndex)}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold
            hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Marking...
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark Session Complete
            </>
          )}
        </button>
      )}

      {/* Both done badge */}
      {bothDone && (
        <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
          bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Session Completed by Both Parties
        </div>
      )}
    </div>
  );
};

// ── Main SessionCard ──────────────────────────────────────────
const SessionCard = ({
  slot,
  slotIndex,
  goal,
  milestones = [],
  viewerRole,
  otherName,
  saving,
  onSetLink,
  onMarkComplete,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone,
}) => {
  const bothDone = slot?.menteeMarked && slot?.mentorMarked;
  const statusLabel = bothDone
    ? "Completed"
    : (slot?.menteeMarked || slot?.mentorMarked)
      ? "In Progress"
      : "Pending";

  const statusClass = bothDone
    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
    : (slot?.menteeMarked || slot?.mentorMarked)
      ? "bg-amber-50 text-amber-600 border-amber-200"
      : "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <div className={`bg-white border rounded-2xl p-4 flex flex-col gap-3
      ${bothDone ? "border-emerald-200" : "border-slate-200"}`}>

      {/* Session header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Session {slotIndex + 1}
          </p>
          <p className="text-sm font-bold text-slate-800">{formatSlotDate(slot)}</p>
          <p className="text-xs font-semibold text-blue-600 mt-0.5">
            {formatTime(slot?.startTime)} – {formatTime(slot?.endTime)}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Meeting link — mentor can add/edit, mentee can only view */}
      <MeetingLinkSection
        slot={slot}
        viewerRole={viewerRole}
        onSetLink={(link) => onSetLink(slotIndex, link)}
        saving={saving}
      />

      {/* Session milestones — both roles can add/toggle/delete */}
      <SessionMilestones
        milestones={milestones}
        goal={goal}
        slotIndex={slotIndex}
        viewerRole={viewerRole}
        onAdd={onAddMilestone}
        onToggle={onToggleMilestone}
        onDelete={onDeleteMilestone}
        saving={saving}
      />

      {/* Completion — both roles can mark their own side */}
      <CompletionSection
        slot={slot}
        viewerRole={viewerRole}
        otherName={otherName}
        slotIndex={slotIndex}
        onMarkComplete={onMarkComplete}
        saving={saving}
      />
    </div>
  );
};

export default SessionCard;