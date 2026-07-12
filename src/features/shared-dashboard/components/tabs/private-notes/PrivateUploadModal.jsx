/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/private-notes/PrivateUploadModal.jsx
import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { validateDocumentFile } from "@lib/validation/schemas";
import { formatFileSize } from "@features/notes/utils/notesHelpers";

// ── Extracted: was a nested ternary (dropzone visual state) ──
// ── Extracted: was a nested ternary (dropzone visual state) ──
const getDropzoneClass = (isDragOver, hasFile) => {
  const base =
    "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200";
  if (isDragOver) return `${base} border-amber-400 bg-amber-50 cursor-pointer`;
  if (hasFile) return `${base} border-emerald-400 bg-emerald-50 cursor-default`;
  return `${base} border-slate-200 bg-slate-50 cursor-pointer hover:border-amber-300 hover:bg-amber-50/40`;
};

// ── Upload Modal (Private) ────────────────────────────────────
const PrivateUploadModal = ({ onUpload, uploading, onClose }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const validateAndSet = (file) => {
    setFileError("");
    if (!file) return;
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setFileError(validation.error);
      return;
    }
    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  };
  const handleFileInput = (e) => validateAndSet(e.target.files?.[0]);
  const handleUpload = async () => {
    if (!selectedFile) return;
    const result = await onUpload(selectedFile, title);
    if (result?.success) onClose();
  };

  const openFilePicker = () => {
    if (!selectedFile) fileInputRef.current?.click();
  };

  const handleDropzoneKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFilePicker();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Upload Private File
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Only visible to you</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <svg
              width="15"
              height="15"
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
            <p className="text-xs font-semibold text-amber-700">
              This file will be <strong>private</strong> — your partner cannot
              see it.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={openFilePicker}
              onKeyDown={handleDropzoneKeyDown}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              disabled={!!selectedFile}
              className={getDropzoneClass(dragOver, !!selectedFile)}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-700 break-all">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Drop file here or{" "}
                      <span className="text-amber-600">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, Word, PPT, Excel, Images · Max 10MB
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInput}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif,.txt"
              />
            </button>
            {selectedFile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setTitle("");
                  setFileError("");
                }}
                className="text-xs text-slate-400 underline hover:text-slate-600 transition-colors self-center"
              >
                Choose different file
              </button>
            )}
          </div>
          {fileError && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
              <p className="text-xs text-red-600 font-medium">{fileError}</p>
            </div>
          )}
          {selectedFile && (
            <div>
              <label
                htmlFor="privateFileTitle"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2"
              >
                Title (optional)
              </label>
              <input
                id="privateFileTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 2 Notes"
                className="w-full text-sm border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 text-slate-800 font-medium"
              />
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading || !!fileError}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{" "}
                  Uploading...
                </>
              ) : (
                <>
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
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  </svg>
                  Upload Private File
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PrivateUploadModal.propTypes = {
  onUpload: PropTypes.func.isRequired,
  uploading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PrivateUploadModal;
