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
import type { RootState } from "@store/index";

export const useHomePresenter = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    // authToken is HttpOnly (unreadable), check authRole cookie instead
    if (isAuthenticated) {
      const role = user?.roles?.[0];
      navigate(role === "mentor" ? "/dashboard/mentor" : "/dashboard/mentee", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
