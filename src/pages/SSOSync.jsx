// src/pages/SSOSync.jsx
// RETIRED — LinkedIn auth now handled entirely in SSOCallback.jsx
// This file can be deleted once App.jsx no longer imports it.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SSOSync = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate("/login", { replace: true }); }, []);
  return null;
};

export default SSOSync;