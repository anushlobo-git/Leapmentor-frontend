/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/mentee/dashboard/DashboardLayout.jsx
import { lazy } from "react";
import useMenteeDashboard from "../../../hooks/useMenteeDashboard";
import DashboardShell from "@components/shared/DashboardShell";
import DashboardSidebar from "@components/shared/DashboardSidebar";
import { MENTEE_NAV_ITEMS } from "@constants/menteeNavItems";
import DashboardTopbar from "@components/shared/DashboardTopbar";

const HomeTab = lazy(() => import("./HomeTab"));
const ProfileTab = lazy(() => import("./ProfileTab"));
const FindMentorsTab = lazy(() => import("./findMentors/FindMentorsTab"));
const RequestHistoryTab = lazy(() => import("./history/RequestHistoryTab"));
const NotificationsTab = lazy(() => import("@components/shared-dashboard/tabs/SharedNotificationsTab"));
const HelpCenter = lazy(() => import("../../common/HelpCenter"));
const ConnectsTab = lazy(() => import("@components/shared/ConnectsTab"));
const Topbar = (props) => <DashboardTopbar {...props} logoutRedirectPath="/" />;

// DashboardShell doesn't know about navItems (it's shared with mentor), so this
// wrapper "pre-fills" navItems before DashboardShell renders <Sidebar ... /> internally.
const MenteeSidebar = (props) => (
  <DashboardSidebar {...props} navItems={MENTEE_NAV_ITEMS} />
);

const TABS = [
  { key: "home", Component: HomeTab },
  { key: "profile", Component: ProfileTab },
  { key: "findMentors", Component: FindMentorsTab },
  { key: "history", Component: RequestHistoryTab },
  { key: "notifications", Component: NotificationsTab, getProps: (setTab) => ({ setActiveTab: setTab,role: "mentee" }) },
  { key: "connects", Component: ConnectsTab, getProps: () => ({ role: "mentee" }) },
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
