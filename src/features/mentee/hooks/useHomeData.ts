/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect } from "react";
import {
  searchMentorsBySkill,
  getMyConnectRequests,
  getEscrowWallet,
} from "@features/mentee/api/mentee.api";
import { mapMentorProfile } from "@features/mentor/mappers/mentorMapper";
import logger from "@lib/logger";

// ── Internal hook — fetches recommended mentors + upcoming sessions ──
export const useHomeData = (profile) => {
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [escrow, setEscrow] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const skillTerm =
          profile?.skills?.[0] || profile?.interestedFields?.[0] || "";

        const mentorRes = await searchMentorsBySkill(skillTerm, 4);
        setMentors((mentorRes.data.mentors || []).map(mapMentorProfile));

        const sessionRes = await getMyConnectRequests();
        const allRequests = sessionRes.data.requests || [];
        const upcoming = allRequests
          .filter((r) => r.status === "accepted" || r.status === "ongoing")
          .sort((a, b) => {
            if (a.status === "ongoing" && b.status !== "ongoing") return -1;
            if (a.status !== "ongoing" && b.status === "ongoing") return 1;
            return 0;
          });
        setSessions(upcoming);

        const walletRes = await getEscrowWallet();
        setBalance(walletRes.data.balance ?? 0);
        setEscrow(walletRes.data.escrow ?? 0);
      } catch (err) {
        logger.error("HomeTab data fetch error:", { error: err.message });
      } finally {
        setLoading(false);
      }
    };

    if (profile !== null) fetchAll();
  }, [profile]);

  return { mentors, sessions, loading, balance, escrow };
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
