/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/mentor/onboarding/PersonalInfoSection.jsx
import { useRef, useState } from "react";
import axiosInstance from "@utils/axiosInstance";
import { validateImageFile } from "@utils/validation/schemas";
import PropTypes from "prop-types";


const PersonalInfoSection = ({ form, onChange }) => {
  const fileInputRef              = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [progress, setProgress]   = useState(0);

  const handlePhotoClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

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


      // ✅ Send as multipart/form-data — NOT Base64
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await axiosInstance.post(
        `/upload/profile-picture`,
        formData,
        {
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
          },
        }
      );

      // ✅ Store Cloudinary URL in form state
      onChange({
        target: {
          name:  "profilePicture",
          value: res.data.url,
        },
      });
      onChange({
        target: { name: "profilePictureFileName",
          value: res.data.fileName }
        });
    } catch (err) {
      setUploadErr(
        err?.response?.data?.message || "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
      setProgress(0);
      // ✅ Reset so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#e8edf5] shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8edf5] bg-[#f8faff]">
        <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h2 className="text-sm font-bold text-[#0f172a]">Profile Picture & Bio</h2>
      </div>

      <div className="px-6 py-5">
        <div className="flex items-start gap-6">

          {/* Photo upload */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={uploading}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#bfdbfe] bg-[#eff6ff]
                flex items-center justify-center hover:border-[#2563eb] hover:bg-[#dbeafe]
                transition-all duration-200 overflow-hidden
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? (
                /* ✅ Spinner while uploading to Cloudinary */
                <div className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
              ) : form.profilePicture && !imgError ? (
                /* ✅ Shows Cloudinary URL — fast CDN delivery */
                <img
                  src={form.profilePicture}
                  alt="Profile"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </button>

            {uploading && (
              <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-950 h-full rounded-full transition-all duration-150" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            )}

            <span
              onClick={handlePhotoClick}
              className={`text-xs font-semibold text-blue-900
                ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:underline"}`}
            >
              {uploading ? `Uploading (${progress}%)` : "Upload Photo"}
            </span>

            <p className="text-[10px] text-slate-400">PNG, JPG · Max 5MB</p>

            {/* ✅ Upload error */}
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
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Professional Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={onChange}
              rows={4}
              placeholder="Share your journey, achievements, and what drives you to mentor others..."
              className="w-full text-sm text-[#0f172a] bg-[#f8faff] border border-[#e2e8f0]
                rounded-xl px-3.5 py-2.5 outline-none placeholder:text-[#94a3b8]
                focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb20]
                resize-none transition-all duration-150"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

PersonalInfoSection.propTypes = {
  form: PropTypes.shape({
    profilePicture: PropTypes.string,
    profilePictureFileName: PropTypes.string,
    bio: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PersonalInfoSection;
