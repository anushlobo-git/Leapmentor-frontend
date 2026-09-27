/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useMenteeSettings.js
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMenteeProfile,
  getCurrentUser,
  updateMenteeProfile,
  changePasswordRequest,
} from "@features/mentee/models/mentee.api";
import logger from "@lib/monitoring/logger";
import {
  mapMenteeSettings,
  mapUserPasswordInfo,
} from "@features/profile/models/settingsMapper";
import {
  fetchWallet,
  selectWalletBalance,
  selectWalletEscrow,
} from "@features/mentee/models/walletSlice";
import type { AppDispatch } from "@store/index";

/**
 * Custom hook for mentee settings.
 * @returns {Object} Hook state and handlers for the caller.
 */
const useMenteeSettings = (initialProfile) => {
  const dispatch = useDispatch<AppDispatch>();
  const [fetching, setFetching] = useState(!initialProfile);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  // Wallet lives in walletSlice (shared with Home + the payment modals).
  const balance = useSelector(selectWalletBalance);
  const escrow = useSelector(selectWalletEscrow);

  // ── Preferences state ─────────────────────────────────────
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingPreferences, setMarketingPreferences] = useState(false);

  // ── Change password state ─────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangedAt, setPasswordChangedAt] = useState(null);

  // ── Pre-fill from profile ─────────────────────────────────
  useEffect(() => {
    if (initialProfile) {
      const mapped = mapMenteeSettings(initialProfile);
      setEmailNotifications(mapped.emailNotifications);
      setMarketingPreferences(mapped.marketingPreferences);
      setFetching(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await getMenteeProfile();
        const mapped = mapMenteeSettings(res.data);
        setEmailNotifications(mapped.emailNotifications);
        setMarketingPreferences(mapped.marketingPreferences);
      } catch (err) {
        logger.error("Error fetching mentee profile", { error: err });
        setMsg({ type: "error", text: "Failed to load settings." });
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [initialProfile]);

  // ── Fetch passwordChangedAt from user ─────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        const mapped = mapUserPasswordInfo(res.data);
        setPasswordChangedAt(mapped.passwordChangedAt);
      } catch (err) {
        logger.error("Error fetching user info", { error: err });
        // silent fail — not critical for UI stability
      }
    };
    fetchUser();
  }, []);

  // ── Load wallet into the shared slice ─────────────────────
  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  // ── Save preferences ──────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg({ type: "", text: "" });
      await updateMenteeProfile({
        emailNotifications,
        marketingPreferences,
      });
      setMsg({ type: "success", text: "Preferences saved successfully!" });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      logger.error("Error saving preferences", { error: err });
      setMsg({ type: "error", text: "Failed to save preferences." });
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ───────────────────────────────────────
  const handleChangePassword = async () => {
    setPwMsg({ type: "", text: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPwMsg({ type: "error", text: "All fields are required." });
    }
    if (newPassword.length < 6) {
      return setPwMsg({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
    }
    if (newPassword !== confirmPassword) {
      return setPwMsg({ type: "error", text: "New passwords do not match." });
    }

    try {
      setChangingPw(true);
      await changePasswordRequest({
        currentPassword,
        newPassword,
      });
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordChangedAt(new Date().toISOString());
      setTimeout(() => setPwMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setChangingPw(false);
    }
  };

  // ── Format "last changed X ago" ───────────────────────────
  const formatPasswordAge = (dateStr) => {
    if (!dateStr) return "Never changed";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Changed today";
    if (days < 30) return `Last changed ${days} day${days > 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    return `Last changed ${months} month${months > 1 ? "s" : ""} ago`;
  };

  return {
    fetching,
    saving,
    changingPw,
    msg,
    pwMsg,
    balance,
    escrow,
    emailNotifications,
    setEmailNotifications,
    marketingPreferences,
    setMarketingPreferences,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordChangedAt,
    formatPasswordAge,
    handleSave,
    handleChangePassword,
  };
};

export default useMenteeSettings;
