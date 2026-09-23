/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Presenter for the Home page — owns the authenticated-redirect logic.
// The view (views/Home.tsx) only renders JSX using what this hook does;
// it has no return value because it exists purely for its side effect.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@features/auth/models/authSlice";
import { getPrimaryRole } from "@lib/auth/redirectUtils";
import { ROLE_CONFIG } from "@constants/roles";
import type { RootState } from "@store/index";

export const useHomePresenter = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    // authToken is HttpOnly (unreadable), check authRole cookie instead
    if (isAuthenticated) {
      // Was `user?.roles?.[0]` — just took whatever order the array
      // happened to be in, and fell back to the mentee dashboard for ANY
      // non-mentor value (including no roles at all). getPrimaryRole
      // applies the same mentor > mentee tie-break used everywhere else
      // in the app, and ROLE_CONFIG supplies the actual path so this hook
      // has no role names hardcoded into it.
      const primaryRole = getPrimaryRole(user?.roles);
      const destination = primaryRole
        ? ROLE_CONFIG[primaryRole]?.dashboardPath
        : undefined;
      navigate(destination ?? "/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
