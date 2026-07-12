/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/PrivateNotesTab.jsx
//
// Composes the private-notes sub-components (split out of this file to keep
// it small — see src/features/shared-dashboard/components/tabs/private-notes/):
// PrivateFilesSection (file upload/list) and NotepadSection (notepad editor
// + sidebar), which in turn use PrivateUploadModal, PrivateFileCard,
// NotepadEditor, and NoteListItem.
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  selectConnectId,
  selectConnectStatus,
} from "@features/shared-dashboard/store/sharedDashboardSlice";
import PrivateFilesSection from "@features/shared-dashboard/components/tabs/private-notes/PrivateFilesSection";
import NotepadSection from "@features/shared-dashboard/components/tabs/private-notes/NotepadSection";

// ── Main Private Tab ──────────────────────────────────────────
const PrivateNotesTab = () => {
  const connectId = useSelector(selectConnectId);
  const isCompleted = useSelector(selectConnectStatus) === "completed";
  const [privateSubTab, setPrivateSubTab] = useState("files");

  return (
    <div className="w-full">
      {/* Private banner */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-800">Private Workspace</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Your files and notes here are only visible to you — never shared
            with your mentor or mentee.
          </p>
        </div>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setPrivateSubTab("files")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            privateSubTab === "files"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
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
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Files
        </button>
        <button
          onClick={() => setPrivateSubTab("notepad")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            privateSubTab === "notepad"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Notepad
        </button>
      </div>

      {privateSubTab === "files" && <PrivateFilesSection />}
      {privateSubTab === "notepad" && (
        <NotepadSection connectId={connectId} isCompleted={isCompleted} />
      )}
    </div>
  );
};

export default PrivateNotesTab;
