/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/mentor/dashboard/DashboardLayout.jsx
import { lazy } from "react";
import useMentorDashboard from "@features/mentor/presenters/useMentorDashboard";
import DashboardShell from "@components/layout/DashboardShell";
import DashboardSidebar from "@components/layout/DashboardSidebar";
import { MENTOR_NAV_ITEMS } from "@features/mentor/models/mentorNavItems";
import DashboardTopbar from "@components/layout/DashboardTopbar";

const Topbar = (props: any) => <DashboardTopbar {...props} logoutRedirectPath="/login/mentor" />;
const MentorHomeTab = lazy(() => import("@features/mentor/views/dashboard/MentorHomeTab"));
const ProfileTab = lazy(() => import("@features/mentor/views/dashboard/ProfileTab"));
const AvailabilityTab = lazy(() => import("@features/mentor/views/dashboard/availability/AvailabilityTab"));
const RequestsTab = lazy(() => import("@features/mentor/views/dashboard/requests/RequestsTab"));
const NotificationsTab = lazy(() => import("@features/shared-dashboard/views/tabs/SharedNotificationsTab"));
const TrackEarningsTab = lazy(() => import("@features/mentor/views/dashboard/earnings/TrackEarningsTab"));
const HelpCenter = lazy(() => import("@features/support/views/HelpCenter"));
const ConnectsTab = lazy(() => import("@features/connects/views/ConnectsTab"));

// DashboardShell doesn't know about navItems (it's shared with mentee), so this
// wrapper "pre-fills" navItems before DashboardShell renders <Sidebar ... /> internally.
const MentorSidebar = (props: any) => (
  <DashboardSidebar {...props} navItems={MENTOR_NAV_ITEMS} />
);

const TABS = [
  { key: "home", Component: MentorHomeTab, getProps: (setTab: (tab: string) => void) => ({ setActiveTab: setTab }) },
  { key: "profile", Component: ProfileTab },
  { key: "availability", Component: AvailabilityTab },
  { key: "requests", Component: RequestsTab },
  { key: "connects", Component: ConnectsTab, getProps: () => ({ role: "mentor" }) },
  { key: "notifications", Component: NotificationsTab, getProps: (setTab: (tab: string) => void) => ({ setActiveTab: setTab, role: "mentor" }) },
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
