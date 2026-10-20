/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * AdminSidebar.tsx
 * SRP: This file defines the admin sidebar component, which provides navigation and user information for the admin panel.
Owns:
Sidebar layout
Mobile backdrop
Navigation rendering
Admin information
Sidebar logout button
 */



import { NavLink } from "react-router-dom";
import type { RootState } from "@store/index";
import { ADMIN_NAV_ITEMS } from "@features/admin/models/adminNavItems";
import { IMAGES } from "@constants/images";

type AdminUser = RootState["auth"]["user"];

interface AdminSidebarProps {
  isOpen: boolean;
  pendingWalletCount: number;
  admin: AdminUser;
  onClose: () => void;
  onLogout: () => void | Promise<void>;
}
/**
 * How this implements OCP
 *
The sidebar does not need separate rendering code for every menu item:

Render User Management
Render Reports
Render Payments
Render Settings
Render Audit Logs
Instead, it has one reusable rule:
For every configured link:
  render its route, icon, and label
  apply the same navigation behavior
When we add Audit Logs to ADMIN_NAV_ITEMS, this existing loop displays it automatically.
That makes the sidebar’s navigation renderer closed to modification for ordinary new links, while its configuration makes it open to extension.
 */

const AdminSidebar = ({
  isOpen,
  pendingWalletCount,
  admin,
  onClose,
  onLogout,
}: AdminSidebarProps) => (
  <>
    {/* Mobile backdrop */}
    {isOpen && (
      <button
        type="button"
        aria-label="Close sidebar"
        className="fixed inset-0 z-30 lg:hidden"
        style={{
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />
    )}

    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-56 shrink-0 h-full
        transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      style={{ background: "#ffffff", borderRight: "1px solid #e8eaf0" }}
    >
      {/* Logo row */}
      <div
        className="flex items-center justify-between px-3 py-3 border-b shrink-0"
        style={{ borderColor: "#e8eaf0" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <img src={IMAGES.LOGO} alt="LeapMentor logo" width={32} height={32} />
          </div>
          <div>
            <p
              className="text-sm text-slate-800 leading-none"
              style={{ fontWeight: 700 }}
            >
              LeapMentor
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "#2563eb", fontWeight: 600 }}
            >
              Admin
            </p>
          </div>
        </div>

        {/* Close — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <svg
            width="16"
            height="16"
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



      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {ADMIN_NAV_ITEMS.map((section) => (
          <div key={section.group}>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 px-3 mb-2">
              {section.group}
            </p>
            <div className="space-y-1">
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`shrink-0 transition-colors duration-150 ${isActive ? "text-white" : "text-slate-400"}`}
                      >
                        {link.icon}
                      </span>
                      <span
                        className={`flex-1 truncate ${isActive ? "text-white" : "text-slate-700"}`}
                      >
                        {link.label}
                      </span>

                      {link.badge && pendingWalletCount < 500 && !isActive && (
                        <span
                          className="shrink-0 flex items-center justify-center rounded-full text-[9px] font-extrabold px-1"
                          style={{
                            background: "#f59e0b",
                            color: "#fff",
                            minWidth: 18,
                            height: 18,
                          }}
                        >
                          {pendingWalletCount > 99 ? "99+" : pendingWalletCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin info + logout */}
      <div
        className="px-4 py-4 border-t shrink-0"
        style={{ borderColor: "#e8eaf0" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs text-white shrink-0"
            style={{ background: "#2563eb", fontWeight: 700 }}
          >
            {admin?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs text-slate-700 truncate"
              style={{ fontWeight: 600 }}
            >
              {admin?.name || "Admin"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {admin?.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  </>
);

export default AdminSidebar;
