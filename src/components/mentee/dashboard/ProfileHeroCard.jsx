// components/mentee/dashboard/ProfileHeroCard.jsx
import { useNavigate } from "react-router-dom";

const ProfileHeroCard = ({ user, profile }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">

        {/* Avatar + Buttons row on mobile */}
        <div className="flex w-full sm:w-auto items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden border-2 border-blue-100">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-400 text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase() || "M"}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center shadow-sm">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          </div>

          {/* Name + email visible on mobile next to avatar */}
          <div className="flex-1 min-w-0 sm:hidden">
            <h2 className="text-lg font-bold text-slate-800 truncate">{user?.name || "—"}</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email || "—"}</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 w-full">
          {/* Name + email — hidden on mobile (shown above), visible on sm+ */}
          <div className="flex items-start justify-between gap-3">
            <div className="hidden sm:block">
              <h2 className="text-xl font-bold text-slate-800">{user?.name || "—"}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{user?.email || "—"}</p>
            </div>

            {/* Buttons — full width on mobile, auto on sm+ */}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:shrink-0">
              <button
                onClick={() => navigate("/dashboard/mentee/edit-profile")}
                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-900 hover:bg-blue-50 transition-all duration-150"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Profile
              </button>
              <button className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-blue-900 text-white hover:bg-blue-700 transition-colors duration-150">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Profile
              </button>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-sm text-slate-600 leading-relaxed mt-3 line-clamp-3">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeroCard;