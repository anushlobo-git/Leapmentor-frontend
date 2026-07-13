/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/notesTabShared.jsx
//
// Shared pieces between SharedNotesTab.jsx and PrivateNotesTab.jsx: the two
// files render near-identical file lists (loading skeletons, day separators,
// file-type badges) and duplicate the same day-grouping and download logic.
// Extracted here so both files stay in sync without copy-pasting.
import PropTypes from "prop-types";
import logger from "@lib/logger";
import { formatDateSeparator, isSameDay } from "@lib/formatters/dateTime";

// ── Group a list of notes into { note } / { separator } items ──────────
// Inserts a "separator" item before the first note of each new calendar day
// (based on createdAt), same as the original inline logic in both tabs.
export const groupNotesByDay = (notes) => {
  const groupedItems = [];
  notes.forEach((note, index) => {
    const prev = notes[index - 1];
    if (!prev || !isSameDay(prev.createdAt, note.createdAt)) {
      groupedItems.push({
        type: "separator",
        dateStr: note.createdAt,
        key: `sep-${note._id}`,
      });
    }
    groupedItems.push({ type: "note", note, key: note._id });
  });
  return groupedItems;
};

// ── Download a note's remote file, falling back to a new tab on failure ─
// `label` is used only for logging context, e.g. "shared note" / "private
// note", to preserve the original per-tab log messages.
export const downloadNoteFile = async (note, label) => {
  logger.info(`Downloading ${label} file`, {
    fileId: note._id,
    fileUrl: note.fileUrl,
  });
  try {
    const response = await fetch(note.fileUrl);
    const blob = await response.blob();
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = note.fileName || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    globalThis.URL.revokeObjectURL(url);
  } catch (err) {
    const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
    logger.warn(
      `${capitalized} download failed, falling back to browser open`,
      {
        fileId: note._id,
        fileUrl: note.fileUrl,
        error: err?.message,
      },
    );
    globalThis.open(note.fileUrl, "_blank");
  }
};

// ── Day separator row used between grouped file/note items ─────────────
export const NoteDateSeparator = ({ dateStr }) => (
  <div className="col-span-2 flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-slate-200" />
    <span className="text-[11px] font-bold text-slate-500 px-3 py-1 rounded-full bg-white border border-slate-200 whitespace-nowrap shadow-sm">
      {formatDateSeparator(dateStr)}
    </span>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

NoteDateSeparator.propTypes = {
  dateStr: PropTypes.string,
};

// ── File-type icon badge (used by both NoteCard and PrivateFileCard) ───
export const FileTypeBadge = ({ cfg }) => (
  <div
    className={`rounded-xl flex flex-col items-center justify-center shrink-0 border p-2.5 ${cfg.bg} ${cfg.border}`}
    style={{ width: "52px", height: "52px" }}
  >
    <span className="text-xl leading-none">{cfg.icon}</span>
    <span className={`text-[8px] font-black tracking-wider mt-0.5 ${cfg.text}`}>
      {cfg.label}
    </span>
  </div>
);

FileTypeBadge.propTypes = {
  cfg: PropTypes.shape({
    bg: PropTypes.string,
    border: PropTypes.string,
    text: PropTypes.string,
    icon: PropTypes.string,
    label: PropTypes.string,
  }).isRequired,
};

// ── Loading skeleton grid for file lists ────────────────────────────────
// gridClassName lets each tab keep its own column layout (Shared uses a
// responsive 1/2-col grid, Private uses a fixed 2-col grid).
export const NotesLoadingSkeletons = ({ gridClassName }) => (
  <div className={gridClassName}>
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 animate-pulse w-full"
      >
        <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="h-3 bg-slate-100 rounded w-3/5" />
          <div className="h-2.5 bg-slate-100 rounded w-2/5" />
          <div className="h-7 bg-slate-100 rounded-lg w-24 mt-2" />
        </div>
      </div>
    ))}
  </div>
);

NotesLoadingSkeletons.propTypes = {
  gridClassName: PropTypes.string.isRequired,
};
