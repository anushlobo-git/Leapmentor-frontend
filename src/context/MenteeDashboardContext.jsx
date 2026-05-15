import { createContext, useContext } from "react";

export const MenteeDashboardContext = createContext(null);
export const useMenteeContext = () => useContext(MenteeDashboardContext);