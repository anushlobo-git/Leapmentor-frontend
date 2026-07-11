/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/pages/walletRequests.utils.js

export const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const AVATAR_COLORS = [
  { bg: "#fee2e2", text: "#b91c1c" },
  { bg: "#dbeafe", text: "#1e3a8a" },
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#d1fae5", text: "#065f46" },
  { bg: "#fef3c7", text: "#92400e" },
];

export const getAvatarColor = (name = "") => {
  const index = name.codePointAt(0) ?? 0;
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
};

export const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export const getEmptyStateLabel = (currentSearch, currentTab) => {
  if (currentSearch) return `No results for "${currentSearch}"`;
  if (currentTab === "pending") return "No pending requests 🎉";
  return `No ${currentTab} requests yet`;
};
