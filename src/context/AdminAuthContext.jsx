import { createContext, useContext, useState, useEffect, useRef } from "react";
import adminAxiosInstance from "@utils/adminAxiosInstance";

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

  const login = (adminData) => {
    didLogout.current = false;
    setAdmin(adminData);
  };

  const logout = async () => {
    didLogout.current = true; // set BEFORE the API call
    try {
      await adminAxiosInstance.post("/admin/auth/logout");
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, loading, login, logout, isAuthenticated: !!admin, setAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);