// src/components/admin/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import PropTypes from "prop-types";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <div>Authenticating...</div>; // Prevent premature redirect
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return children;
};
AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
export default AdminRoute;
