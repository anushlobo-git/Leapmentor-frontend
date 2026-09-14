/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/auth/api/auth.api.js
import axiosInstance from "@lib/http/axiosInstance";

export const login = (email, password) =>
  axiosInstance.post(`/auth/login`, { email, password });

export const exchangeLinkedInToken = ({ code, roles, termsAccepted }) =>
  axiosInstance.post("/auth/linkedin/token", { code, roles, termsAccepted });

export const logoutRequest = () => axiosInstance.post("/auth/logout");

export const googleAuthRequest = ({ credential, roles, termsAccepted }) =>
  axiosInstance.post(`/auth/google`, { credential, roles, termsAccepted });

export const refreshTokenRequest = () => axiosInstance.post("/auth/refresh");
