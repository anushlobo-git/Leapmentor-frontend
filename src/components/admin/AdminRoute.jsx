// src/components/admin/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <div>Authenticating...</div>; // Prevent premature redirect
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  
  return children;
};

export default AdminRoute;