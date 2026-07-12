/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/mentee/onboarding/PersonalInfoSection.jsx
import { useRef, useState } from "react";
import { uploadProfilePicture } from "@features/mentee/api/mentee.api";
import PropTypes from "prop-types";
import { validateImageFile } from "@lib/validation/schemas";

const MAX_SKILLS_SHOWN = 3;

const PersonalInfoSection = ({ form, handleChange }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [progress, setProgress] = useState(0);
  const [imgError, setImgError] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      setUploadErr(validation.error);
      return;
    }

    setUploadErr("");
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await uploadProfilePicture(formData, (e) => {
        if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
      });

      handleChange({
        target: {
          name: "profilePicture",
          value: res.data.url,
        },
      });
      handleChange({
        target: {
          name: "profilePictureFileName",
          value: res.data.fileName,
        },
      });
    } catch (err) {
      setUploadErr(
        err?.response?.data?.message ||
          "Failed to upload image. Please try again.",
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getAvatarContent = () => {
    if (uploading) {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      );
    }
    if (form.profilePicture && !imgError) {
      return (
        <img
          src={form.profilePicture}
          alt="Profile"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#93c5fd"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8edf5] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8edf5] bg-[#f8faff]">
        <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="text-sm font-bold text-slate-800">
          Profile Picture & Bio
        </h2>
      </div>

      <div className="px-6 py-5 flex items-start gap-6">
        {/* Photo upload */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50
              flex items-center justify-center hover:border-blue-400 hover:bg-blue-100
              transition-all duration-200 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {getAvatarContent()}
          </button>

          {uploading && (
            <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-950 h-full rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            type="button"
            disabled={uploading}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`text-xs font-semibold text-blue-900 bg-transparent border-0 p-0 cursor-pointer
              ${uploading ? "opacity-50 cursor-not-allowed" : "hover:underline"}`}
          >
            {uploading ? `Uploading (${progress}%)` : "Upload Photo"}
          </button>

          <p className="text-[10px] text-slate-400">PNG, JPG · Max 5MB</p>

          {uploadErr && (
            <p className="text-[10px] text-red-500 text-center max-w-[90px] leading-tight">
              {uploadErr}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Bio */}
        <div className="flex-1">
          <label
            htmlFor="bio-textarea"
            className="block text-xs font-semibold text-[#475569] mb-2"
          >
            Bio
          </label>
          <textarea
            id="bio-textarea"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about your background, career aspirations, and what you're looking for in a mentor..."
            className="w-full text-sm text-[#0f172a] bg-[#f8faff] border border-[#e2e8f0]
              rounded-xl px-3.5 py-2.5 outline-none placeholder:text-[#94a3b8]
              focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb20]
              resize-none transition-all duration-150"
          />
        </div>
      </div>
    </div>
  );
};

PersonalInfoSection.propTypes = {
  form: PropTypes.shape({
    profilePicture: PropTypes.string,
    bio: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default PersonalInfoSection;
