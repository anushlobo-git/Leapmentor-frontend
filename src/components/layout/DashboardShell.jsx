/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/shared-dashboard/DashboardShell.jsx
import { useState, useEffect, Suspense } from "react";
import { useDispatch } from "react-redux";
import { setUser, setProfile, resetDashboardUser } from "@features/profile/store/dashboardUserSlice";
import useUnreadCount from "@features/notifications/hooks/useUnreadCount";
import useSocketToast from "@features/notifications/hooks/useSocketToast";
import PropTypes from "prop-types";

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

/**
 * tabs: [{ key, Component, getProps?: (handleSetTab) => props }]
 * loadingConfig: { spinnerBorderClass, message, textClass, textStyle? }
 * listenForTabEvent: mentee-only "setDashboardTab" window event support
 */
const DashboardShell = ({
  useDashboardData,
  Topbar,
  Sidebar,
  tabs,
  listenForTabEvent = false,
  loadingConfig,
}) => {
  const dispatch = useDispatch();
  const { user, profile, loading, error, refetch } = useDashboardData();
  const { unreadCount, clearBadge, incrementBadge } = useUnreadCount();

  const onRequestChanged = refetch ? () => refetch() : undefined;
  useSocketToast(onRequestChanged, incrementBadge);

  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) dispatch(setUser(user));
  }, [user, dispatch]);

  useEffect(() => {
    if (profile) dispatch(setProfile(profile));
  }, [profile, dispatch]);

  useEffect(() => () => dispatch(resetDashboardUser()), [dispatch]);

  useEffect(() => {
    if (!listenForTabEvent) return;
    const handler = (e) => setActiveTab(e.detail);
    globalThis.addEventListener("setDashboardTab", handler);
    return () => globalThis.removeEventListener("setDashboardTab", handler);
  }, [listenForTabEvent]);

  useEffect(() => {
    if (activeTab === "notifications") clearBadge();
  }, [activeTab, clearBadge]);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const tab = params.get("tab");
    const validTabs = tabs.map((t) => t.key);
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    const url = new URL(globalThis.location.href);
    if (tab === "home") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    globalThis.history.replaceState(null, "", url.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className={`w-9 h-9 rounded-full border-4 border-blue-100 ${loadingConfig.spinnerBorderClass} animate-spin`} />
          <p className={loadingConfig.textClass} style={loadingConfig.textStyle}>
            {loadingConfig.message}
          </p>
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
      <Topbar user={user} onMenuToggle={() => setSidebarOpen(true)} onLogoClick={() => handleSetTab("home")} />
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSetTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadCount={unreadCount}
        />
        <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto">
          <Suspense fallback={<TabSkeleton />}>
            {tabs.map(({ key, Component, getProps }) =>
              activeTab === key ? (
                <Component key={key} {...(getProps ? getProps(handleSetTab) : {})} />
              ) : null
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

DashboardShell.propTypes = {
  useDashboardData: PropTypes.func.isRequired,
  Topbar: PropTypes.elementType.isRequired,
  Sidebar: PropTypes.elementType.isRequired,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      Component: PropTypes.elementType.isRequired,
      getProps: PropTypes.func,
    })
  ).isRequired,
  listenForTabEvent: PropTypes.bool,
  loadingConfig: PropTypes.shape({
    spinnerBorderClass: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    textClass: PropTypes.string.isRequired,
    textStyle: PropTypes.object,
  }).isRequired,
};

export default DashboardShell;
