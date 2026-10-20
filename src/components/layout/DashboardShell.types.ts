/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * DI - dependency injection
 * The shared dashboard architecture:
 */


/**
 * DI - dependency injection
 * The shared dashboard architecture:

src/components/layout/DashboardShell.tsx
src/components/layout/DashboardShell.types.ts
src/features/mentor/views/dashboard/DashboardLayout.tsx
src/features/mentee/views/dashboard/DashboardLayout.tsx

Your shared DashboardShell does not directly import:

useMentorDashboard
useMenteeDashboard
MentorSidebar
MenteeSidebar
Mentor tabs
Mentee tabs

Instead, it receives them from the outside.
 */


/**
 * This is the high-level component.
 *
Its responsibility is to manage common dashboard behavior:

- loading state
- error state
- active tab
- sidebar state
- navigation
- cleanup
- topbar placement
- sidebar placement
- selected-tab rendering


const DashboardShell = ({
  useDashboardData,
  Topbar,
  Sidebar,
  tabs,
  listenForTabEvent = false,
  loadingConfig,
}: DashboardShellProps) => {

The important part is that DashboardShell receives dependencies through props:

useDashboardData
Topbar
Sidebar
tabs
loadingConfig

It does not decide which role-specific implementation to use.

The abstraction: DashboardShell.types.ts

File:
src/components/layout/DashboardShell.types.ts


export interface DashboardData {
  user: unknown;
  profile: unknown;
  loading: boolean;
  error: string | null;
  refetch?: () => void;
}

export interface DashboardShellProps {
  useDashboardData: () => DashboardData;
  Topbar: ComponentType<Record<string, unknown>>;
  Sidebar: ComponentType<Record<string, unknown>>;
  tabs: DashboardTab[];
  listenForTabEvent?: boolean;
  loadingConfig: LoadingConfig;
}
These types describe what DashboardShell needs without saying:

Use the mentor dashboard hook

Use the mentee sidebar

Use the mentor topbar

Instead, the shell says:

Give me anything that follows this required shape.

That is the abstraction.
 */
import type { ComponentType, CSSProperties } from "react";
import type { DashboardDataProvider } from "@features/shared-dashboard/models/dashboard.types";

/** Contract required by any topbar supplied to DashboardShell. */
export interface DashboardTopbarSlotProps {
  user: unknown;
  onMenuToggle: () => void;
  onLogoClick: () => void;
}
/**
 * ISP
 * topbar and sidebar have separate interfaces.
 *
 * The topbar does not receive sidebar-specific properties such as:
- activeTab
- setActiveTab
- isOpen
- unreadCount

The sidebar does not receive topbar-specific properties such as:
- onMenuToggle
- onLogoClick

 */

/** Contract required by any sidebar supplied to DashboardShell. */
export interface DashboardSidebarSlotProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
}

export interface DashboardTab {
  key: string;
  Component: ComponentType<Record<string, unknown>>;
  getProps?: (handleSetTab: (tab: string) => void) => Record<string, unknown>;
}

export interface LoadingConfig {
  spinnerBorderClass: string;
  message: string;
  textClass: string;
  textStyle?: CSSProperties;
}

export interface DashboardShellProps {
  useDashboardData: DashboardDataProvider;
  Topbar: ComponentType<DashboardTopbarSlotProps>;
  Sidebar: ComponentType<DashboardSidebarSlotProps>;
  tabs: DashboardTab[];
  listenForTabEvent?: boolean;
  loadingConfig: LoadingConfig;
}
