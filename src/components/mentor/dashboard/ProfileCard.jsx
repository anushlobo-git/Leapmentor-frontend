// components/mentor/dashboard/ProfileCard.jsx
import { useNavigate } from "react-router-dom";

const ProfileCard = ({ user, profile, onEditClick }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 overflow-hidden border-2 border-blue-100">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-400 text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase() || "M"}
              </div>
            )}
          </div>
          {/* Camera icon overlay */}
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center shadow-sm">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-800 leading-tight">{user?.name || "—"}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {profile?.currentRole || "—"}
            {profile?.company ? ` & ${profile.company}` : ""}
          </p>

          {profile?.bio && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">BIO</p>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit + Save buttons */}
      <div className="flex items-center gap-2 mt-5">
        <button
          onClick={() => navigate("/dashboard/mentor/edit-profile")} // ✅ FIXED: was onEditClick prop
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-900 hover:bg-blue-50 transition-all duration-150"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;