/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * Reads a cookie by name from `document.cookie`.
 * `authToken` is HttpOnly, so client code cannot read it; `authRole` is kept readable
 * for routing and UI checks.
 * @param {string} name - Cookie name to read.
 * @returns {string | null} Cookie value if present, otherwise `null`.
 */
export const getCookie = (name) => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

/**
 * Clears a cookie by setting an expired browser cookie at the root path.
 * @param {string} name - Cookie name to clear.
 * @returns {void}
 */
export const clearCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

/**
 * Reads the current persisted role from the non-HttpOnly auth cookie.
 * @returns {"mentor" | "mentee" | "admin" | null} Current role if logged in.
 */
export const getRole = () => getCookie("authRole");


export const hasSessionHint = () => !!getCookie("authRole");


/**
 * Checks whether the role cookie exists.
 * @returns {boolean} `true` when the browser still has an auth role cookie.
 */
export const isLoggedIn =hasSessionHint;

/**
 * Removes the persisted role cookie without touching the HttpOnly token.
 * @returns {void}
 */
export const clearAuthRole = () => clearCookie("authRole");

/**
 * Stores the current role in a readable cookie so the UI can route immediately.
 * @param {string} role - Role name to persist.
 * @returns {void}
 */
export const setAuthRole = (role) => {
  document.cookie = `authRole=${role};path=/;SameSite=Lax`;
};
