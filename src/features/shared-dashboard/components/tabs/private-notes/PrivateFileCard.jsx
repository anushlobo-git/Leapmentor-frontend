/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/private-notes/PrivateFileCard.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { formatDateString as formatDate } from "@lib/formatters/dateTime";
import {
  formatFileSize,
  FILE_TYPE_CONFIG,
} from "@features/notes/utils/notesHelpers";
import {
  downloadNoteFile,
  FileTypeBadge,
} from "@features/shared-dashboard/components/tabs/notesTabShared";

// ── Private File Card ─────────────────────────────────────────
const PrivateFileCard = ({ note, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const cfg = FILE_TYPE_CONFIG[note.fileType] || FILE_TYPE_CONFIG.other;

  const handleDelete = async () => {
    if (!globalThis.confirm("Delete this file?")) return;
    setDeleting(true);
    await onDelete(note._id);
    setDeleting(false);
  };

  const handleDownload = async () => downloadNoteFile(note, "private note");

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 hover:border-amber-200 hover:shadow-md transition-all duration-200">
      <FileTypeBadge cfg={cfg} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">
              {note.title || note.fileName}
            </p>
            {note.title && note.title !== note.fileName && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {note.fileName}
              </p>
            )}
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1">
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Private
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          {formatFileSize(note.fileSize)} · {formatDate(note.createdAt)}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-500 text-xs font-semibold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

PrivateFileCard.propTypes = {
  note: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    fileType: PropTypes.string,
    title: PropTypes.string,
    fileName: PropTypes.string.isRequired,
    fileUrl: PropTypes.string.isRequired,
    fileSize: PropTypes.number,
    createdAt: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default PrivateFileCard;
