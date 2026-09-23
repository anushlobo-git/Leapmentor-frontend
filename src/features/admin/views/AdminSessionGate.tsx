/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/AdminSessionGate.tsx
//
// Replaces the old AdminAuthProvider (Context-based). Admin sessions now
// live in the same Redux auth slice as mentor/mentee ones (see
// authSlice.ts / bootstrapAdminSession). On first mount of any route under
// /admin, this probes the HttpOnly admin cookie once via GET /admin/auth/me
// and blocks rendering until that resolves — exactly like AdminAuthContext
// used to, just backed by Redux instead of a parallel Context provider.
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@store/index";
import { bootstrapAdminSession } from "@features/auth/models/authSlice";

const AdminSessionGate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const role = useSelector((state: RootState) => state.auth.role);
  const adminBootstrapping = useSelector(
    (state: RootState) => state.auth.adminBootstrapping,
  );

  useEffect(() => {
    if (role === "admin") return; // e.g. just logged in this session — no need to re-probe
    dispatch(bootstrapAdminSession());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — runs once on mount

  if (adminBootstrapping) return <div>Authenticating...</div>;

  return <Outlet />;
};

export default AdminSessionGate;
