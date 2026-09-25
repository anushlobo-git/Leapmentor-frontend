/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchMentorsBySkill, getEscrowWallet } from "@features/mentee/models/mentee.api";
import {
  fetchMenteeRequests,
  selectMenteeRequestList,
} from "@features/connects/models/connectRequestsSlice";
import type { AppDispatch } from "@store/index";
import { mapMentorProfile } from "@features/mentor/models/mentorMapper";
import logger from "@lib/monitoring/logger";

// ── Internal hook — fetches recommended mentors + upcoming sessions ──
export const useHomeData = (profile) => {
  const dispatch = useDispatch<AppDispatch>();
  const [mentors, setMentors] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [escrow, setEscrow] = useState(0);

  // Upcoming sessions are derived from the shared connect-requests slice.
  const { items: allRequests, loadedOnce } = useSelector(selectMenteeRequestList);
  const sessions = useMemo(
    () =>
      allRequests
        .filter((r) => r.status === "accepted" || r.status === "ongoing")
        .sort((a, b) => {
          if (a.status === "ongoing" && b.status !== "ongoing") return -1;
          if (a.status !== "ongoing" && b.status === "ongoing") return 1;
          return 0;
        }),
    [allRequests],
  );

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setHomeLoading(true);

        const skillTerm =
          profile?.skills?.[0] || profile?.interestedFields?.[0] || "";

        const mentorRes = await searchMentorsBySkill(skillTerm, 4);
        setMentors((mentorRes.data.mentors || []).map(mapMentorProfile));

        const walletRes = await getEscrowWallet();
        setBalance(walletRes.data.balance ?? 0);
        setEscrow(walletRes.data.escrow ?? 0);
      } catch (err) {
        logger.error("HomeTab data fetch error:", { error: err.message });
      } finally {
        setHomeLoading(false);
      }
    };

    if (profile !== null) {
      dispatch(fetchMenteeRequests());
      fetchAll();
    }
  }, [profile, dispatch]);

  return { mentors, sessions, loading: homeLoading || !loadedOnce, balance, escrow };
};

// ── Display helpers ─────────────────────────────────────────────
export const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-900",
  "bg-violet-100 text-violet-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
];

export const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.codePointAt(0) % AVATAR_COLORS.length];

export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  const fields = [
    profile.profilePicture,
    profile.bio,
    profile.currentRole,
    profile.company,
    profile.industry,
    profile.yearsOfExperience,
    profile.communicationPreferences?.length > 0,
    profile.languages?.length > 0,
    profile.linkedInUrl,
    profile.portfolioUrl,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};
