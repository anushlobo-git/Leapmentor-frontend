// src/components/mentee/dashboard/DashboardLayout.jsx
import { useState, useEffect } from "react";
import useMenteeDashboard from "../../../hooks/useMenteeDashboard";
import useUnreadCount from "../../../hooks/useUnreadCount";
import useSocketToast from "../../../hooks/useSocketToast"; // ✅ added
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import HomeTab from "./HomeTab";
import ProfileTab from "./ProfileTab";
import FindMentorsTab from "./findMentors/FindMentorsTab";
import RequestHistoryTab from "./history/RequestHistoryTab";
import NotificationsTab from "../notifications/NotificationsTab";
import MenteeConnectsTab from "./connects/MenteeConnectsTab";
import MenteeSettingsTab from "./settings/MenteeSettingsTab";
import HelpCenter from "../../common/HelpCenter";




const DashboardLayout = () => {
  const { user, profile, loading, error } = useMenteeDashboard();
  const { unreadCount, clearBadge } = useUnreadCount();
  useSocketToast(); // ✅ listens for request_accepted, request_declined, request_referred
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => setActiveTab(e.detail);
    window.addEventListener("setDashboardTab", handler);
    return () => window.removeEventListener("setDashboardTab", handler);
  }, []);

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
          {activeTab === "home"          && <HomeTab user={user} profile={profile} />}
          {activeTab === "profile"       && <ProfileTab user={user} profile={profile} />}
          {activeTab === "findMentors"   && <FindMentorsTab />}
          {activeTab === "history"       && <RequestHistoryTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "connects"      && <MenteeConnectsTab />}
          {activeTab === "settings"      && <MenteeSettingsTab profile={profile} />}
          {activeTab === "help"          && <HelpCenter />} {/* ✅ added */}
          
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;