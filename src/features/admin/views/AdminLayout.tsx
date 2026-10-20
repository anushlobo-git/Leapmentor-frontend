/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * srp split the responsibilities of AdminLayout into separate files:
 * Navigation labels/routes/icons--handled by models/adminNavItems.tsx
 * Wallet-count  ---presenters/usePendingWalletCount.ts
 * sidebar code ---- views/components/AdminSidebar.tsx
 * header code ---- views/components/AdminHeader.tsx
 * logout code ---- presenters/useAdminLogout.ts
 * page layout ---- views/AdminLayout.tsx
 */
/**
 * Previously, AdminLayout was responsible for almost everything:
AdminLayout
  ├── navigation data
  ├── API call for wallet count
  ├── logout API call
  ├── Redux admin user
  ├── sidebar state
  ├── responsive behavior
  ├── navigation rendering
  ├── active-link styling
  ├── badge rendering
  ├── admin identity UI
  ├── header UI
  ├── sidebar UI
  └── page layout
 */


//now this file owns the Owns the page-level layout
//Place the sidebar, header, and page content in the correct layout.
//This is the main responsibility of the component.

import { useState } from "react";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@store/index";
import useAdminLogout from "@features/admin/presenters/useAdminLogout";
import usePendingWalletCount from "@features/admin/presenters/usePendingWalletCount";
import AdminHeader from "@features/admin/views/components/AdminHeader";
import AdminSidebar from "@features/admin/views/components/AdminSidebar";

const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const admin = useSelector((state: RootState) => state.auth.user);

  /**
   * AdminLayout no longer:
- calls getPendingLeapRequestsCount()
- creates the useEffect
- stores the count in local state
- catches the API error

its seperated and the file called src/features/admin/presenters/usePendingWalletCount.ts handles the count
and sends the number back to AdminLayout via the hook return value.
   */
  const pendingWalletCount = usePendingWalletCount();
  /**
   * before the logout API call was handled in AdminLayout,
   *  now it is handled in the file called src/features/admin/presenters/useAdminLogout.ts
   * api call happens all the cookies are cleared and the user is redirected to the login page.
   * returns nothing to AdminLayout, it just handles the logout process.
   */

  const handleLogout = useAdminLogout();


  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f2f7", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <AdminSidebar
        isOpen={sidebarOpen}
        pendingWalletCount={pendingWalletCount}
        admin={admin}
        onClose={closeSidebar}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
