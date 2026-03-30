// src/components/mentor/dashboard/DashboardLayout.jsx
import { useState, useEffect, lazy, Suspense } from "react";
import useMentorDashboard from "../../../hooks/useMentorDashboard";
import useUnreadCount from "../../../hooks/useUnreadCount";
import useSocketToast from "../../../hooks/useSocketToast";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

// LCP FIX: lazy-load every tab so only the active tab's JS is loaded.
// MentorHomeTab is also lazy — its chunk was 120 KiB and is the first thing
// the user sees, but it still loads faster than blocking the entire shell.
const MentorHomeTab = lazy(() => import("./MentorHomeTab"));
const ProfileTab = lazy(() => import("./ProfileTab"));
const AvailabilityTab = lazy(() => import("./availability/AvailabilityTab"));
const RequestsTab = lazy(() => import("./requests/RequestsTab"));
const MentorConnectsTab = lazy(() => import("./connects/MentorConnectsTab"));
const NotificationsTab = lazy(() => import("./notifications/NotificationsTab"));
const SettingsTab = lazy(() => import("./settings/SettingsTab"));
const TrackEarningsTab = lazy(() => import("./earnings/TrackEarningsTab"));
const HelpCenter = lazy(() => import("../../common/HelpCenter"));

// ── Tab skeleton — shown while a lazy tab chunk is loading ───
const TabSkeleton = () => (
  <div className="w-full flex flex-col gap-4 animate-pulse pt-2">
    <div className="h-7 w-48 bg-slate-200 rounded-xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-24" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 h-48" />
      <div className="bg-white rounded-2xl border border-slate-100 p-5 h-48" />
    </div>
  </div>
);

const DashboardLayout = () => {
  const { user, profile, loading, error, refetchProfile } = useMentorDashboard();
  const { unreadCount, clearBadge } = useUnreadCount();
  useSocketToast();

  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "notifications") clearBadge();
  }, [activeTab, clearBadge]);

  const handleSetTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // LCP FIX: removed the `if (loading) return <spinner>` gate that was
  // blocking the entire render — including the <h1> — for 920ms.
  // The shell (Topbar + Sidebar + h1) now renders immediately.
  // Each tab handles its own loading state internally via skeletons.
  // Error state is kept since it means auth/network truly failed.
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
          <span className="text-red-500">⚠</span>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Topbar renders immediately — user prop is optional, shows skeleton name if null */}
      <Topbar user={user} onMenuToggle={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSetTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadCount={unreadCount}
        />
        <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto">
          {/* Suspense wraps all tabs — fallback shows a content skeleton
              while the lazy chunk downloads on first visit to that tab */}
          <Suspense fallback={<TabSkeleton />}>
            {activeTab === "home" && <MentorHomeTab user={user} profile={profile} refetchProfile={refetchProfile} setActiveTab={handleSetTab} />}
            {activeTab === "profile" && <ProfileTab user={user} profile={profile} />}
            {activeTab === "availability" && <AvailabilityTab />}
            {activeTab === "requests" && <RequestsTab />}
            {activeTab === "connects" && <MentorConnectsTab />}
            {activeTab === "notifications" && <NotificationsTab setActiveTab={handleSetTab} />}
            {activeTab === "settings" && <SettingsTab profile={profile} user={user} />}
            {activeTab === "earnings" && <TrackEarningsTab />}
            {activeTab === "help" && <HelpCenter />}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;