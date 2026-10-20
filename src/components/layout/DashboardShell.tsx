/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * SRP
 * before all the logic was in one file now seperated into different files for better maintainability and readability
 * useDashboardCleanup.ts         	Clears shared Redux data when the dashboard unmounts
   useDashboardNavigation.ts	      Controls active tabs, sidebar state, URL sync, and tab events
   useDashboardRealtime.ts	        Coordinates socket updates and notification badges
   DashboardStates.tsx            	Renders loading, error, and skeleton states
   DashboardTabContent.tsx	        Renders the selected lazy-loaded tab
 */


//LSP--Liskov Substitution Principle
// src/components/layout/DashboardShell.tsx
// DashboardShell does not create its own top bar or sidebar. It receives them:

// <DashboardShell  Top bar={Topbar}  Sidebar={Sidebar} ... />
// Inside the shell, it expects every supplied top bar to support:
// <Top bar
//   user={user}
//   onMenuToggle={openSidebar}
//   onLogoClick={() => handleSetTab("home")}
// />
// It expects every supplied sidebar to support:
// <Sidebar
//   activeTab={activeTab}
//   setActiveTab={handleSetTab}
//   isOpen={sidebarOpen}
//   onClose={closeSidebar}
//   unreadCount={unreadCount}
// />

// Therefore, a mentee topbar or mentor topbar should be replaceable without breaking DashboardShell.
// Example: mentee and mentor sidebars
// The mentee dashboard supplies:
// const MenteeSidebar = (props) => (
//   <DashboardSidebar
//     {...props}
//     navItems={MENTEE_NAV_ITEMS}
//   />
// );
// The mentor dashboard supplies:
// const MentorSidebar = (props) => (
//   <DashboardSidebar
//     {...props}
//     navItems={MENTOR_NAV_ITEMS}
//   />
// );
// Both wrappers can be used by DashboardShell because both preserve the sidebar contract:
// activeTab
// setActiveTab
// isOpen
// onClose
// unreadCount
// The shell does not need to know whether it received the mentee sidebar or mentor sidebar.
//3rd principles of solid that is
//Objects or implementations should be replaceable with another implementation without breaking the behavior expected by the caller.
//


/**
 * ISP--Interface Segregation Principle
 *
 * This shows that the shell uses each component through its own focused contract.
The shell does not need to know the internal implementation of the topbar or sidebar.
It only provides the data that belongs to that component.


 */
import useDashboardCleanup from "@components/layout/useDashboardCleanup";
import useDashboardNavigation from "@components/layout/useDashboardNavigation";
import useDashboardRealtime from "@components/layout/useDashboardRealtime";
import DashboardTabContent from "@components/layout/DashboardTabContent";
import {
  DashboardErrorState,
  DashboardLoadingState,
} from "@components/layout/DashboardStates";
import type { DashboardShellProps } from "@components/layout/DashboardShell.types";

export type { DashboardTab } from "@components/layout/DashboardShell.types";

/**
 * Shared dashboard composition layer.
 *
 * Data loading, lifecycle cleanup, realtime notifications, navigation, and
 * fallback states are delegated to focused hooks/components. This component
 * only coordinates them into the common dashboard structure.
 */

//it receives the props and it doest not have mentor specific or mentee specific logic
// so it extends the behaviour according to the props passed for example there is one tab
//less in mentee dashboard but still here no mentee specific logic is written again the
//component receives the tabs and the component displays the tabs according to the props passed
//this is the OCP principle of SOLID which states that the component should be open for extension but closed for modification
const DashboardShell = ({
  useDashboardData,
  Topbar,
  Sidebar,
  tabs,
  listenForTabEvent = false,
  loadingConfig,
}: DashboardShellProps) => {
  const { user, loading, error, refetch } = useDashboardData();
  const { unreadCount, clearBadge } = useDashboardRealtime(refetch);
  const {
    activeTab,
    sidebarOpen,
    openSidebar,
    closeSidebar,
    handleSetTab,
  } = useDashboardNavigation({ tabs, listenForTabEvent, clearBadge });

  useDashboardCleanup();

  if (loading) {
    return <DashboardLoadingState {...loadingConfig} />;
  }

  if (error) {
    return <DashboardErrorState error={error} />;
  }

  const activeTabConfig = tabs.find(({ key }) => key === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar
        user={user}
        onMenuToggle={openSidebar}
        onLogoClick={() => handleSetTab("home")}
      />
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSetTab}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          unreadCount={unreadCount}
        />
        <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto">
          <DashboardTabContent
            activeTabConfig={activeTabConfig}
            handleSetTab={handleSetTab}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;

//another example dashboardTopbar

//“I implemented Liskov Substitution for the dashboard data providers.
//  DashboardShell requires a DashboardDataProvider contract containing
// user, profile, loading, error, and a required refetch function.
// Both useMenteeDashboard and useMentorDashboard implement that contract.
// Therefore, the shell can substitute one dashboard hook for the other without changing its internal logic.”
