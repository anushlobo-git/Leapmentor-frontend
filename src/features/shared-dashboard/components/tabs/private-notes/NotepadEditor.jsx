/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/private-notes/NotepadEditor.jsx
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

// ── Notepad Editor ────────────────────────────────────────────
const NotepadEditor = ({ note, onSave, onDelete, onClose, saving }) => {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [dirty, setDirty] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setDirty(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [note?._id]);

  const handleSave = async () => {
    const result = await onSave(note?._id, title, content);
    if (result?.success) setDirty(false);
  };

  const downloadTxt = () => {
    const blob = new Blob([`${title}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "note"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ── Rewritten: avoids the deprecated document.write() API ──
  const downloadPdf = () => {
    const html = `
      <html><head><title>${title || "Note"}</title>
      <style>body{font-family:Georgia,serif;padding:48px;max-width:680px;margin:auto;color:#1e293b;line-height:1.7;}
      h1{font-size:24px;margin-bottom:28px;border-bottom:2px solid #e2e8f0;padding-bottom:16px;font-weight:700;}
      pre{white-space:pre-wrap;font-family:inherit;font-size:15px;}</style></head>
      <body><h1>${title || "Untitled Note"}</h1><pre>${content}</pre></body></html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const url = globalThis.URL.createObjectURL(blob);
    const win = globalThis.open(url, "_blank");
    if (win) {
      win.addEventListener("load", () => {
        win.print();
        globalThis.URL.revokeObjectURL(url);
      });
    } else {
      globalThis.URL.revokeObjectURL(url);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div
      className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm"
      style={{ height: "100%" }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          placeholder="Note title..."
          className="flex-1 text-base font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-300 min-w-0 mr-4"
        />
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={downloadTxt}
            title="Download as .txt"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all"
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
            .txt
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            title="Download as PDF"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            PDF
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              dirty
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-current/30 border-t-current animate-spin" />{" "}
                Saving
              </>
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save
              </>
            )}
          </button>
          {note?._id && (
            <button
              type="button"
              onClick={() => onDelete(note._id)}
              className="p-2 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
            >
              <svg
                width="14"
                height="14"
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
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Textarea — fills all remaining height */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setDirty(true);
        }}
        placeholder="Start writing your private note here…"
        className="flex-1 w-full px-6 py-5 text-sm text-slate-700 leading-relaxed resize-none outline-none bg-white placeholder:text-slate-300 font-medium overflow-y-auto"
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50/60">
        <span className="text-[11px] text-slate-500 font-medium">
          {wordCount} word{wordCount === 1 ? "" : "s"} · {charCount} char
          {charCount === 1 ? "" : "s"}
        </span>
        {dirty && (
          <span className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Unsaved changes</span>
          </span>
        )}
      </div>
    </div>
  );
};

NotepadEditor.propTypes = {
  note: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
};

export default NotepadEditor;
