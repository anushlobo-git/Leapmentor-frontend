/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useCallback, useEffect, useState } from "react";
import type { DashboardTab } from "@components/layout/DashboardShell.types";

interface UseDashboardNavigationOptions {
  tabs: DashboardTab[];
  listenForTabEvent: boolean;
  clearBadge: () => void;
}

/** Owns dashboard tab selection, URL synchronization, and sidebar state. */
const useDashboardNavigation = ({
  tabs,
  listenForTabEvent,
  clearBadge,
}: UseDashboardNavigationOptions) => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSetTab = useCallback((tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);

    const url = new URL(globalThis.location.href);
    if (tab === "home") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    globalThis.history.replaceState(null, "", url.toString());
  }, []);

  useEffect(() => {
    if (!listenForTabEvent) return;

    const handleTabEvent = (event: Event) => {
      const tab = (event as CustomEvent<string>).detail;
      setActiveTab(tab);
    };

    globalThis.addEventListener("setDashboardTab", handleTabEvent);
    return () => globalThis.removeEventListener("setDashboardTab", handleTabEvent);
  }, [listenForTabEvent]);

  useEffect(() => {
    if (activeTab === "notifications") clearBadge();
  }, [activeTab, clearBadge]);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const tab = params.get("tab");
    const validTabs = tabs.map(({ key }) => key);

    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [tabs]);

  return {
    activeTab,
    sidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),
    handleSetTab,
  };
};

export default useDashboardNavigation;
