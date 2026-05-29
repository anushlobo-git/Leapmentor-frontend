// src/context/DashboardContext.js
import { createContext, useContext } from "react";

export const DashboardContext = createContext({
  user: null,
  profile: null,
  setActiveTab: () => {},
  refetchProfile: () => {},
});

export const useDashboardContext = () => useContext(DashboardContext);