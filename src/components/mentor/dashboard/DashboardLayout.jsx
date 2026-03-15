// src/components/mentor/dashboard/DashboardLayout.jsx
import { useState } from "react";
import useMentorDashboard from "../../../hooks/useMentorDashboard";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import MentorHomeTab from "./MentorHomeTab";
import ProfileTab from "./ProfileTab";
import AvailabilityTab from "./availability/AvailabilityTab";
import RequestsTab from "./requests/RequestsTab";
import MentorConnectsTab from "./connects/MentorConnectsTab";
import ComingSoon from "./ComingSoon";
import NotificationsTab from "./notifications/NotificationsTab";
import SettingsTab from "./settings/SettingsTab";

const COMING_SOON_TABS = {
  earnings: { icon: "💰", title: "Track Earnings", desc: "Monitor your mentorship earnings and payment history." },
};

const DashboardLayout = () => {
  const { user, profile, loading, error } = useMentorDashboard();
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          {activeTab === "home"          && <MentorHomeTab user={user} profile={profile} />}
          {activeTab === "profile"       && <ProfileTab user={user} profile={profile} />}
          {activeTab === "availability"  && <AvailabilityTab />}
          {activeTab === "requests"      && <RequestsTab />}
          {activeTab === "connects"      && <MentorConnectsTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "settings"      && <SettingsTab profile={profile} user={user} />}
          {comingSoon && <ComingSoon icon={comingSoon.icon} title={comingSoon.title} desc={comingSoon.desc} />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;