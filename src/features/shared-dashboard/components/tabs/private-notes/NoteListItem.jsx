/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/private-notes/NoteListItem.jsx
import PropTypes from "prop-types";
import { formatDateString as formatDate } from "@lib/formatters/dateTime";

// ── Note List Item (sidebar) ──────────────────────────────────
const NoteListItem = ({ note, isActive, onClick }) => {
  const preview = note.content?.trim()?.slice(0, 60) || "";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 ${
        isActive
          ? "border-blue-300 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <p
        className={`text-sm font-bold truncate ${isActive ? "text-blue-800" : "text-slate-700"}`}
      >
        {note.title || "Untitled Note"}
      </p>
      {preview && (
        <p className="text-xs text-slate-400 mt-0.5 truncate">{preview}</p>
      )}
      <p
        className={`text-[10px] mt-1 font-medium ${isActive ? "text-blue-400" : "text-slate-400"}`}
      >
        {formatDate(note.updatedAt)}
      </p>
    </button>
  );
};

NoteListItem.propTypes = {
  note: PropTypes.shape({
    content: PropTypes.string,
    title: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default NoteListItem;
