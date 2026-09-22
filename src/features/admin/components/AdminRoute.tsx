/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/admin/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAdminAuth } from "@features/admin/context/AdminAuthContext";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <div>Authenticating...</div>; // Prevent premature redirect
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return children;
};
export default AdminRoute;
