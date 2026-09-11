/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/common/FilterTabs.jsx

const defaultBadgeClass = (tabKey: string, activeTab: string) =>
  activeTab === tabKey ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500";

interface FilterTab {
  key: string;
  label: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onChange: (tabKey: string) => void;
  counts?: Record<string, number>;
  getBadgeClass?: (tabKey: string, activeTab: string) => string;
  scrollable?: boolean;
}

/**
 * Horizontal, underline-style filter tab bar with optional count badges.
 * Used for any "status filter" strip (request history, mentor requests, etc.).
 *
 * @param {Array<{key: string, label: string}>} tabs
 * @param {string} activeTab
 * @param {Function} onChange - (tabKey) => void
 * @param {Object} [counts] - map of tabKey -> count, shown as a badge when > 0
 * @param {Function} [getBadgeClass] - (tabKey, activeTab) => className, for custom badge coloring
 * @param {boolean} [scrollable] - if true, tabs shrink to content and scroll horizontally
 *   on small screens instead of stretching to fill the row
 */
const FilterTabs = ({
  tabs,
  activeTab,
  onChange,
  counts = {},
  getBadgeClass = defaultBadgeClass,
  scrollable = false,
}: FilterTabsProps) => (
  <div className="w-full border-b border-slate-100">
    <div
      className={
        scrollable ? "flex overflow-x-auto scrollbar-none" : "flex w-full"
      }
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`${
            scrollable
              ? "flex-shrink-0 sm:flex-1 gap-1.5 text-xs sm:text-sm whitespace-nowrap"
              : "flex-1 gap-2 text-sm"
          } flex items-center justify-center px-3 py-2.5 font-semibold transition-all duration-150 border-b-2 ${
            activeTab === tab.key
              ? "text-blue-900 border-blue-900 bg-blue-50/50"
              : "text-slate-700 border-transparent hover:text-blue-900 hover:bg-slate-50"
          }`}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${getBadgeClass(
                tab.key,
                activeTab,
              )}`}
            >
              {counts[tab.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
);

export default FilterTabs;
