// components/mentee/dashboard/Topbar.jsx
import { useNavigate } from "react-router-dom";

const Topbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login/mentee");
  };

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors mr-1"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
          <img
            src="/images/logo.webp"
            alt="Leapmentor logo"
            className="h-8 w-8"
          />
      
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