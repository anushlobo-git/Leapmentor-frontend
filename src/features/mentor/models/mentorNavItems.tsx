/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/constants/mentorNavItems.jsx
// Nav items shown in the mentor dashboard sidebar.
import { Home, User, Calendar, Bell, MessageSquare, Users, DollarSign } from "lucide-react";

export const MENTOR_NAV_ITEMS = [
  { key: "home",          label: "Home",           icon: <Home size={16} /> },
  { key: "profile",       label: "Profile",        icon: <User size={16} /> },
  { key: "availability",  label: "Availability",   icon: <Calendar size={16} /> },
  { key: "notifications", label: "Notifications",  icon: <Bell size={16} /> },
  { key: "requests",      label: "Requests",       icon: <MessageSquare size={16} /> },
  { key: "connects",      label: "Connects",       icon: <Users size={16} /> },
  { key: "earnings",      label: "Track Earnings", icon: <DollarSign size={16} /> },
];
