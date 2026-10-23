/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
/**
 * AdminHeader.tsx
 * 
Owns:
Top-bar layout
Mobile menu button
System status indicator
Header logout buttons
 */

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  onLogout: () => void | Promise<void>;
}

const AdminHeader = ({ onOpenSidebar, onLogout }: AdminHeaderProps) => (
  <header
    className="flex items-center justify-between px-4 lg:px-8 py-4 shrink-0"
    style={{ background: "#ffffff", borderBottom: "1px solid #e8eaf0" }}
  >
    <div className="flex items-center gap-3">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        aria-label="Open sidebar"
        onClick={onOpenSidebar}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>

    {/* System Online / Logout */}
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
      style={{ background: "#1e3a8a", border: "1px solid #bae6fd" }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      <button
        onClick={onLogout}
        className="hidden sm:inline text-xs text-white"
        style={{ fontWeight: 600 }}
      >
        Logout
      </button>
      <button
        onClick={onLogout}
        className="sm:hidden text-xs text-white"
        style={{ fontWeight: 600 }}
      >
        Logout
      </button>
    </div>
  </header>
);

export default AdminHeader;
