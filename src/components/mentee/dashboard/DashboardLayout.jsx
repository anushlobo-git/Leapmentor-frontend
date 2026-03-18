// src/components/mentee/dashboard/DashboardLayout.jsx
import { useState, useEffect } from "react";
import useMenteeDashboard from "../../../hooks/useMenteeDashboard";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import HomeTab from "./HomeTab";
import ProfileTab from "./ProfileTab";
import FindMentorsTab from "./findMentors/FindMentorsTab";
import RequestHistoryTab from "./history/RequestHistoryTab";
import NotificationsTab from "../notifications/NotificationsTab"; // ✅ your version
import MenteeConnectsTab from "./connects/MenteeConnectsTab";     // ✅ team's version
import MenteeSettingsTab from "./settings/MenteeSettingsTab";     // ✅ team's version
import ComingSoon from "./ComingSoon";

const COMING_SOON_TABS = {
  // ✅ notifications is a real tab (your version) — removed from coming soon
  // ✅ connects is a real tab (team's version) — removed from coming soon
  // ✅ settings is a real tab (team's version) — removed from coming soon
  trackings: { icon: "📈", title: "Trackings", desc: "Track your mentorship progress and goals over time." },
};

const DashboardLayout = () => {
  const { user, profile, loading, error } = useMenteeDashboard();
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => setActiveTab(e.detail);
    window.addEventListener("setDashboardTab", handler);
    return () => window.removeEventListener("setDashboardTab", handler);
  }, []);

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

  const comingSoon = COMING_SOON_TABS[activeTab];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar user={user} onMenuToggle={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSetTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto">
          {activeTab === "home"          && <HomeTab user={user} profile={profile} />}
          {activeTab === "profile"       && <ProfileTab user={user} profile={profile} />}
          {activeTab === "findMentors"   && <FindMentorsTab />}
          {activeTab === "history"       && <RequestHistoryTab />}
          {activeTab === "notifications" && <NotificationsTab />}          {/* ✅ your version */}
          {activeTab === "connects"      && <MenteeConnectsTab />}         {/* ✅ team's version */}
          {activeTab === "settings"      && <MenteeSettingsTab profile={profile} />} {/* ✅ team's version */}
          {comingSoon && <ComingSoon icon={comingSoon.icon} title={comingSoon.title} desc={comingSoon.desc} />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;