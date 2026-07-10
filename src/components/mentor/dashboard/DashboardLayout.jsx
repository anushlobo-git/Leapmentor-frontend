/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/mentor/dashboard/DashboardLayout.jsx
import { lazy } from "react";
import useMentorDashboard from "../../../hooks/useMentorDashboard";
import DashboardShell from "@components/shared/DashboardShell";
import DashboardSidebar from "@components/shared/DashboardSidebar";
import { MENTOR_NAV_ITEMS } from "@constants/mentorNavItems";
import DashboardTopbar from "@components/shared/DashboardTopbar";

const Topbar = (props) => <DashboardTopbar {...props} logoutRedirectPath="/login/mentor" />;
const MentorHomeTab = lazy(() => import("./MentorHomeTab"));
const ProfileTab = lazy(() => import("./ProfileTab"));
const AvailabilityTab = lazy(() => import("./availability/AvailabilityTab"));
const RequestsTab = lazy(() => import("./requests/RequestsTab"));
const NotificationsTab = lazy(() => import("@components/shared-dashboard/tabs/SharedNotificationsTab"));
const TrackEarningsTab = lazy(() => import("./earnings/TrackEarningsTab"));
const HelpCenter = lazy(() => import("../../common/HelpCenter"));
const ConnectsTab = lazy(() => import("@components/shared/ConnectsTab"));

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
