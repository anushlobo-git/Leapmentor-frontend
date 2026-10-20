/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * useAdminLogout.ts
Owns:
Logout API call
Logout error logging
Redux session cleanup
Redirect to admin login
 */
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminLogout } from "@features/admin/models/admin.api";
import { setAdminSession } from "@features/auth/models/authSlice";
import type { AppDispatch } from "@store/index";
import logger from "@lib/monitoring/logger";

/** Owns the admin logout request, local cleanup, and redirect. */
const useAdminLogout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return useCallback(async (): Promise<void> => {
    try {
      await adminLogout();
    } catch (error: unknown) {
      logger.error("Admin logout failed, but clearing local session.", {
        error: error instanceof Error ? error.message : error,
      });
    } finally {
      dispatch(setAdminSession(null));
      navigate("/admin/login");
    }
  }, [dispatch, navigate]);
};

export default useAdminLogout;
