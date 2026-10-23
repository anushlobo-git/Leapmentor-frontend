/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { Suspense } from "react";
import { DashboardTabSkeleton } from "@components/layout/DashboardStates";
import type { DashboardTab } from "@components/layout/DashboardShell.types";

interface DashboardTabContentProps {
  activeTabConfig?: DashboardTab;
  handleSetTab: (tab: string) => void;
}

/** Renders the selected dashboard tab behind a suspense boundary. */
const DashboardTabContent = ({
  activeTabConfig,
  handleSetTab,
}: DashboardTabContentProps) => (
  <Suspense fallback={<DashboardTabSkeleton />}>
    {activeTabConfig && (
      <activeTabConfig.Component
        key={activeTabConfig.key}
        {...(activeTabConfig.getProps
          ? activeTabConfig.getProps(handleSetTab)
          : {})}
      />
    )}
  </Suspense>
);

export default DashboardTabContent;
