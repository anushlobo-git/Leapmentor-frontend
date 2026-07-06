// src/components/mentor/dashboard/DashboardLayout.jsx
import { lazy } from "react";
import useMentorDashboard from "../../../hooks/useMentorDashboard";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import DashboardShell from "@components/shared/DashboardShell";

const MentorHomeTab = lazy(() => import("./MentorHomeTab"));
const ProfileTab = lazy(() => import("./ProfileTab"));
const AvailabilityTab = lazy(() => import("./availability/AvailabilityTab"));
const RequestsTab = lazy(() => import("./requests/RequestsTab"));
const NotificationsTab = lazy(() => import("@components/shared-dashboard/tabs/SharedNotificationsTab"));
const TrackEarningsTab = lazy(() => import("./earnings/TrackEarningsTab"));
const HelpCenter = lazy(() => import("../../common/HelpCenter"));
const ConnectsTab = lazy(() => import("@components/shared/ConnectsTab"));

const TABS = [
  { key: "home", Component: MentorHomeTab, getProps: (setTab) => ({ setActiveTab: setTab }) },
  { key: "profile", Component: ProfileTab },
  { key: "availability", Component: AvailabilityTab },
  { key: "requests", Component: RequestsTab },
  { key: "connects", Component: ConnectsTab, getProps: () => ({ role: "mentor" }) },
  { key: "notifications", Component: NotificationsTab, getProps: (setTab) => ({ setActiveTab: setTab }) },
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
    Sidebar={Sidebar}
    tabs={TABS}
    loadingConfig={LOADING_CONFIG}
  />
);

export default DashboardLayout;
