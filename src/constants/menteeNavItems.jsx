/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/constants/menteeNavItems.jsx
// Nav items shown in the mentee dashboard sidebar.
import { Home, User, Search, Bell, History, Users } from "lucide-react";

export const MENTEE_NAV_ITEMS = [
  { key: "home",          label: "Home",          icon: <Home size={16} /> },
  { key: "profile",       label: "Profile",       icon: <User size={16} /> },
  { key: "findMentors",   label: "Find Mentors",  icon: <Search size={16} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { key: "history",       label: "History",       icon: <History size={16} /> },
  { key: "connects",      label: "Connects",      icon: <Users size={16} /> },
];
