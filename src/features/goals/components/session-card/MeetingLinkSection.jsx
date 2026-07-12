/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/components/session-card/MeetingLinkSection.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { isValidMeetingLink } from "@features/goals/utils/sessionCardUtils";
import { slotShape } from "@features/goals/utils/sessionCardPropTypes";

const MeetingLinkSection = ({ slot, viewerRole, onSetLink, saving }) => {
  const [editing, setEditing] = useState(false);
  const [linkVal, setLinkVal] = useState(slot?.meetingLink || "");
  const [linkErr, setLinkErr] = useState("");
  const isMentor = viewerRole === "mentor";

  const handleSave = async () => {
    if (!linkVal.trim()) {
      setLinkErr("Link cannot be empty");
      return;
    }
    if (!isValidMeetingLink(linkVal.trim())) {
      setLinkErr("Only HTTPS links from Google Meet, Zoom etc are allowed.");
      return;
    }
    setLinkErr("");
    const result = await onSetLink(linkVal.trim());
    if (result?.success) setEditing(false);
  };

  let content;
  if (editing) {
    content = (
      <div className="flex flex-col gap-2">
        <input
          autoFocus
          value={linkVal}
          onChange={(e) => { setLinkVal(e.target.value); setLinkErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="https://meet.google.com/..."
          className={`w-full px-3 py-2 border rounded-xl text-sm text-slate-700
            bg-white outline-none transition-colors placeholder:text-slate-400
            ${linkErr ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-blue-300"}`}
        />
        {linkErr && (
          <div className="flex items-start gap-1.5 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs text-red-600 leading-relaxed">{linkErr}</p>
          </div>
        )}
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
    );
  } else if (slot?.meetingLink) {
    content = (
      <div className="flex items-center gap-2">
        <a href={slot.meetingLink}
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
    );
  } else if (isMentor) {
    content = (
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
    );
  } else {
    content = <p className="text-xs text-slate-400 italic">No meeting link added yet.</p>;
  }

  return (
    <div className="border-t border-slate-100 pt-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        Meeting Link
      </p>
      {content}
    </div>
  );
};

MeetingLinkSection.propTypes = {
  slot: slotShape.isRequired,
  viewerRole: PropTypes.string.isRequired,
  onSetLink: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
};

export default MeetingLinkSection;
