/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/mentor/dashboard/DashboardLayout.jsx
import { lazy } from "react";
import useMentorDashboard from "@features/mentor/hooks/useMentorDashboard";
import DashboardShell from "@components/layout/DashboardShell";
import DashboardSidebar from "@components/layout/DashboardSidebar";
import { MENTOR_NAV_ITEMS } from "@features/mentor/constants/mentorNavItems";
import DashboardTopbar from "@components/layout/DashboardTopbar";

const Topbar = (props) => <DashboardTopbar {...props} logoutRedirectPath="/login/mentor" />;
const MentorHomeTab = lazy(() => import("@features/mentor/components/dashboard/MentorHomeTab"));
const ProfileTab = lazy(() => import("@features/mentor/components/dashboard/ProfileTab"));
const AvailabilityTab = lazy(() => import("@features/mentor/components/dashboard/availability/AvailabilityTab"));
const RequestsTab = lazy(() => import("@features/mentor/components/dashboard/requests/RequestsTab"));
const NotificationsTab = lazy(() => import("@features/shared-dashboard/components/tabs/SharedNotificationsTab"));
const TrackEarningsTab = lazy(() => import("@features/mentor/components/dashboard/earnings/TrackEarningsTab"));
const HelpCenter = lazy(() => import("@features/support/components/HelpCenter"));
const ConnectsTab = lazy(() => import("@features/connects/components/ConnectsTab"));

// DashboardShell doesn't know about navItems (it's shared with mentee), so this
// wrapper "pre-fills" navItems before DashboardShell renders <Sidebar ... /> internally.
const MentorSidebar = (props) => (
  <DashboardSidebar {...props} navItems={MENTOR_NAV_ITEMS} />
);

const TABS = [
  { key: "home", Component: MentorHomeTab, getProps: (setTab) => ({ setActiveTab: setTab }) },
  { key: "profile", Component: ProfileTab },
  { key: "availability", Component: AvailabilityTab },
  { key: "requests", Component: RequestsTab },
  { key: "connects", Component: ConnectsTab, getProps: () => ({ role: "mentor" }) },
  { key: "notifications", Component: NotificationsTab, getProps: (setTab) => ({ setActiveTab: setTab, role: "mentor" }) },
  { key: "earnings", Component: TrackEarningsTab },
  { key: "help", Component: HelpCenter },
];

const LOADING_CONFIG = {
  spinnerBorderClass: "border-t-blue-600",
  message: "Loading...",
  textClass: "text-xs text-slate-400",
  textStyle: { fontFamily: "'DM Sans', sans-serif" },
};

const DashboardLayout = () => (
  <DashboardShell
    useDashboardData={useMentorDashboard}
    Topbar={Topbar}
    Sidebar={MentorSidebar}
    tabs={TABS}
    loadingConfig={LOADING_CONFIG}
  />
);

export default DashboardLayout;
