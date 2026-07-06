import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import adminAxiosInstance from "@utils/adminAxiosInstance";
import PropTypes from "prop-types";
import logger from "@utils/logger";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const didLogout = useRef(false);

  useEffect(() => {
    if (didLogout.current) {
      setLoading(false);
      return;
    }

    const checkAuthStatus = async () => {
      try {
        const res = await adminAxiosInstance.get("/admin/auth/me", {
          _skipAuthRedirect: true,  // tells the interceptor: don't redirect on 401
        });
        if (res.data?.admin) setAdmin(res.data.admin);
      } catch {
        setAdmin(null); // cookie is gone — stay on login, no redirect loop
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback((adminData) => {
    didLogout.current = false;
    setAdmin(adminData);
  }, []);

  const logout = useCallback(async () => {
    didLogout.current = true; // set BEFORE the API call
    try {
      await adminAxiosInstance.post("/admin/auth/logout");
    } catch (err) {
      logger.error("Admin logout failed", { error: err.message });
    } finally {
      setAdmin(null);
    }
  }, []);

  const value = useMemo(
    () => ({ admin, loading, login, logout, isAuthenticated: !!admin, setAdmin }),
    [admin, loading, login, logout],
  );

  return (
    <AdminAuthContext.Provider
      value={value}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

AdminAuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAdminAuth = () => useContext(AdminAuthContext);
