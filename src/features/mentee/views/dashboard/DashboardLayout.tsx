/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/mentee/dashboard/DashboardLayout.jsx
import { lazy } from "react";
import useMenteeDashboard from "@features/mentee/presenters/useMenteeDashboard";
import DashboardShell from "@components/layout/DashboardShell";
import DashboardSidebar from "@components/layout/DashboardSidebar";
import { MENTEE_NAV_ITEMS } from "@features/mentee/models/menteeNavItems";
import DashboardTopbar from "@components/layout/DashboardTopbar";

const HomeTab = lazy(
  () => import("@features/mentee/views/dashboard/HomeTab"),
);
const ProfileTab = lazy(
  () => import("@features/mentee/views/dashboard/ProfileTab"),
);
const FindMentorsTab = lazy(
  () =>
    import("@features/mentee/views/dashboard/findMentors/FindMentorsTab"),
);
const RequestHistoryTab = lazy(
  () =>
    import("@features/mentee/views/dashboard/history/RequestHistoryTab"),
);
const NotificationsTab = lazy(
  () =>
    import("@features/shared-dashboard/views/tabs/SharedNotificationsTab"),
);
const HelpCenter = lazy(
  () => import("@features/support/views/HelpCenter"),
);
const ConnectsTab = lazy(
  () => import("@features/connects/views/ConnectsTab"),
);
const Topbar = (props: any) => <DashboardTopbar {...props} logoutRedirectPath="/" />;

// DashboardShell doesn't know about navItems (it's shared with mentor), so this
// wrapper "pre-fills" navItems before DashboardShell renders <Sidebar ... /> internally.
const MenteeSidebar = (props: any) => (
  <DashboardSidebar {...props} navItems={MENTEE_NAV_ITEMS} />
);

const TABS = [
  { key: "home", Component: HomeTab },
  { key: "profile", Component: ProfileTab },
  { key: "findMentors", Component: FindMentorsTab },
  { key: "history", Component: RequestHistoryTab },
  {
    key: "notifications",
    Component: NotificationsTab,
    getProps: (setTab: (tab: string) => void) => ({ setActiveTab: setTab, role: "mentee" }),
  },
  {
    key: "connects",
    Component: ConnectsTab,
    getProps: () => ({ role: "mentee" }),
  },
  { key: "help", Component: HelpCenter },
];

const LOADING_CONFIG = {
  spinnerBorderClass: "border-t-blue-900",
  message: "Loading your dashboard…",
  textClass: "text-sm text-slate-400 font-medium",
};

const DashboardLayout = () => (
  <DashboardShell
    useDashboardData={useMenteeDashboard}
    Topbar={Topbar}
    Sidebar={MenteeSidebar}
    tabs={TABS}
    listenForTabEvent
    loadingConfig={LOADING_CONFIG}
  />
);

export default DashboardLayout;

// Named exports for testing internal config and helper wrappers
export { MenteeSidebar, TABS, LOADING_CONFIG, Topbar };
