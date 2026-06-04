/**
 * Reads a cookie by name from document.cookie
 * authToken is HttpOnly — JS cannot read it (that's the point)
 * authRole is NOT httpOnly — readable for routing/UI purposes
 */
export const getCookie = (name) => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

export const clearCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

/** "mentor" | "mentee" | "admin" | null */
export const getRole = () => getCookie("authRole");

/** True if authRole cookie exists — meaning the user is logged in */
export const isLoggedIn = () => !!getCookie("authRole");

export const clearAuthRole = () => clearCookie("authRole");

export const setAuthRole = (role) => {
  document.cookie = `authRole=${role};path=/;SameSite=Lax`;
};
