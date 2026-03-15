// components/mentor/onboarding/PersonalInfoSection.jsx
import { useRef } from "react";

const PersonalInfoSection = ({ form, onChange }) => {
  const fileInputRef = useRef(null);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ target: { name: "profilePicture", value: reader.result } });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8edf5] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8edf5] bg-[#f8faff]">
        <div className="w-8 h-8 rounded-xl bg-[#2563eb] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
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
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#bfdbfe] bg-[#eff6ff] flex items-center justify-center hover:border-[#2563eb] hover:bg-[#dbeafe] transition-all duration-200 overflow-hidden"
            >
              {form.profilePicture ? (
                <img src={form.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </button>
            <span className="text-xs font-semibold text-[#2563eb] cursor-pointer hover:underline" onClick={handlePhotoClick}>
              Upload Photo
            </span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
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
              className="w-full text-sm text-[#0f172a] bg-[#f8faff] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb20] resize-none transition-all duration-150"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;