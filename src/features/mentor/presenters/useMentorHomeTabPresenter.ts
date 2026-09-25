/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMentorEarnings } from "@features/mentor/models/mentor.api";
import logger from "@lib/monitoring/logger";
import {
  selectDashboardUser,
  selectDashboardProfile,
  refetchMentorProfile,
} from "@features/profile/models/dashboardUserSlice";
import { MENTOR_BADGES } from "@features/mentor/models/mentorBadges";
import {
  fetchMentorRequests,
  selectMentorRequestList,
} from "@features/connects/models/connectRequestsSlice";
import type { AppDispatch } from "@store/index";

const BADGES = MENTOR_BADGES;

export const getProfileCompletion = (profile: any) => {
  if (!profile) return 0;
  const fields = [
    profile.currentRole,
    profile.bio,
    profile.company,
    profile.industry,
    profile.profilePicture,
    profile.skills?.length > 0,
    profile.linkedInUrl,
    profile.yearsOfExperience > 0,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

export const useMentorHomeTabPresenter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectDashboardUser);
  const profile = useSelector(selectDashboardProfile);
  const firstName = user?.name?.split(" ")[0] || "there";

  // Sessions / pending / completed counts are derived from the shared requests slice.
  const { items: allRequests, loadedOnce, status } = useSelector(selectMentorRequestList);
  const loadingSessions = !loadedOnce;
  const { sessions, pendingCount, actualSessionCount } = useMemo(() => {
    const active = allRequests.filter(
      (r: any) => r.status === "ongoing" || r.status === "accepted",
    );
    const completed = allRequests.filter((r: any) => r.status === "completed");
    return {
      sessions: active,
      pendingCount: allRequests.filter((r: any) => r.status === "pending").length,
      actualSessionCount: status === "succeeded"
        ? completed.length + active.filter((r: any) => r.status === "ongoing").length
        : (null as number | null),
    };
  }, [allRequests, status]);

  const [earnings, setEarnings] = useState<Record<string, number> | null>(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  const completionPct = getProfileCompletion(profile);

  const badgeProfile = {
    ...profile,
    totalSessions: actualSessionCount ?? profile?.totalSessions ?? 0,
  };
  const badges = BADGES.map((b: any) => ({
    ...b,
    unlocked: b.condition(badgeProfile),
  }));
  const unlockedCount = badges.filter((b: any) => b.unlocked).length;

  useEffect(() => {
    dispatch(refetchMentorProfile());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMentorRequests());
  }, [dispatch]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoadingEarnings(true);
        const res = await getMentorEarnings();
        setEarnings({
          totalEarnings: res.data.totalEarnings || 0,
          sessionsThisMonth: res.data.sessionsThisMonth || 0,
          pendingPayout: res.data.pendingPayout || 0,
          walletBalance: res.data.walletBalance || 0,
        });
      } catch (err: any) {
        logger.error("MentorHomeTab earnings error:", { error: err.message });
        setEarnings({
          totalEarnings: 0,
          sessionsThisMonth: 0,
          pendingPayout: 0,
          walletBalance: 0,
        });
      } finally {
        setLoadingEarnings(false);
      }
    };
    fetchEarnings();
  }, []);

  // ── FIX FOR S3358 & S3776: Extracted Welcome Row Subtext layout logic ──
  let sessionStatusText = "No active sessions yet.";
  if (loadingSessions) {
    sessionStatusText = "Loading your dashboard...";
  } else if (sessions.length > 0) {
    sessionStatusText = `You have ${sessions.length} active session${sessions.length > 1 ? "s" : ""}.`;
  }

  const welcomeMessage = `Welcome, ${firstName}! 👋`;

  return {
    navigate,
    user,
    profile,
    sessions,
    loadingSessions,
    pendingCount,
    actualSessionCount,
    earnings,
    loadingEarnings,
    completionPct,
    badges,
    unlockedCount,
    sessionStatusText,
    welcomeMessage,
  };
};
