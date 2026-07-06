// src/components/mentee/dashboard/DashboardLayout.jsx
import { lazy } from "react";
import useMenteeDashboard from "../../../hooks/useMenteeDashboard";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import DashboardShell from "@components/shared/DashboardShell";

const HomeTab = lazy(() => import("./HomeTab"));
const ProfileTab = lazy(() => import("./ProfileTab"));
const FindMentorsTab = lazy(() => import("./findMentors/FindMentorsTab"));
const RequestHistoryTab = lazy(() => import("./history/RequestHistoryTab"));
const NotificationsTab = lazy(() => import("@components/shared-dashboard/tabs/SharedNotificationsTab"));
const HelpCenter = lazy(() => import("../../common/HelpCenter"));
const ConnectsTab = lazy(() => import("@components/shared/ConnectsTab"));


const TABS = [
  { key: "home", Component: HomeTab },
  { key: "profile", Component: ProfileTab },
  { key: "findMentors", Component: FindMentorsTab },
  { key: "history", Component: RequestHistoryTab },
  { key: "notifications", Component: NotificationsTab, getProps: (setTab) => ({ setActiveTab: setTab }) },
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
    Sidebar={Sidebar}
    tabs={TABS}
    listenForTabEvent
    loadingConfig={LOADING_CONFIG}
  />
);

export default DashboardLayout;
