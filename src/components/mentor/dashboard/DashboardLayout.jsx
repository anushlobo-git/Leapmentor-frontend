// src/components/mentor/dashboard/DashboardLayout.jsx
import { useState, useEffect } from "react";
import useMentorDashboard from "../../../hooks/useMentorDashboard";
import useUnreadCount from "../../../hooks/useUnreadCount";
import useSocketToast from "../../../hooks/useSocketToast"; // ✅ added
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import MentorHomeTab from "./MentorHomeTab";
import ProfileTab from "./ProfileTab";
import AvailabilityTab from "./availability/AvailabilityTab";
import RequestsTab from "./requests/RequestsTab";
import MentorConnectsTab from "./connects/MentorConnectsTab";
import NotificationsTab from "./notifications/NotificationsTab";
import SettingsTab from "./settings/SettingsTab";
import TrackEarningsTab from "./earnings/TrackEarningsTab";
import HelpCenter from "../../common/HelpCenter"; // ✅ added

const DashboardLayout = () => {
  const { user, profile, loading, error } = useMentorDashboard();
  const { unreadCount, clearBadge } = useUnreadCount();
  useSocketToast(); // ✅ listens for new_connect_request
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Clear badge when notifications tab is opened
  useEffect(() => {
    if (activeTab === "notifications") clearBadge();
  }, [activeTab, clearBadge]);

  const handleSetTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-900 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

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
          {activeTab === "home"          && <MentorHomeTab user={user} profile={profile} />}
          {activeTab === "profile"       && <ProfileTab user={user} profile={profile} />}
          {activeTab === "availability"  && <AvailabilityTab />}
          {activeTab === "requests"      && <RequestsTab />}
          {activeTab === "connects"      && <MentorConnectsTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "settings"      && <SettingsTab profile={profile} user={user} />}
          {activeTab === "earnings" && <TrackEarningsTab />}
          {activeTab === "help"          && <HelpCenter />} {/* ✅ added */}
          
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;