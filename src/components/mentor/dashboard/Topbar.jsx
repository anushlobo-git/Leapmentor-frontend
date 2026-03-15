// components/mentee/dashboard/Topbar.jsx
import { useNavigate } from "react-router-dom";

const Topbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login/mentor");
  };

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2.5">

        {/* Hamburger — hidden on desktop, visible on mobile */}
        <button
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="flex md:hidden items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <span className="text-sm font-bold text-slate-800">Leapmentor</span>
      </div>

      <button
        onClick={handleLogout}
        className="text-xs font-semibold px-4 py-2 rounded-xl bg-blue-900 text-white hover:bg-blue-700 transition-colors duration-150"
      >
        Logout
      </button>
    </header>
  );
};

export default Topbar;