// src/components/admin/AdminRoute.jsx
// Wraps admin pages — redirects to /admin/login if no token

import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
};

export default AdminRoute;