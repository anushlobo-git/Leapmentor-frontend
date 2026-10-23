/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchMentorsBySkill } from "@features/mentee/models/mentee.api";
import {
  fetchWallet,
  selectWalletBalance,
  selectWalletEscrow,
} from "@features/mentee/models/walletSlice";
import {
  fetchMenteeRequests,
  selectMenteeRequestList,
  type ConnectRequest,
} from "@features/connects/models/connectRequestsSlice";
import type { AppDispatch } from "@store/index";
import {
  mapMentorProfile,
  type RawMentorSearchResponse,
} from "@features/mentor/models/mentorMapper";
import logger from "@lib/monitoring/logger";

// The mentee profile fields this file reads. Every field is optional because
// the profile can be null/partial while it is still loading or being filled in.
export interface HomeProfile {
  skills?: string[];
  interestedFields?: string[];
  profilePicture?: string | null;
  bio?: string;
  currentRole?: string;
  company?: string;
  industry?: string;
  yearsOfExperience?: number | string | null;
  communicationPreferences?: string[];
  languages?: string[];
  linkedInUrl?: string | null;
  portfolioUrl?: string | null;
}

// One recommended-mentor card, exactly as mapMentorProfile shapes it.
type MentorCard = ReturnType<typeof mapMentorProfile>;

// What useHomeData hands back to the screen.
interface HomeData {
  mentors: MentorCard[];
  sessions: ConnectRequest[];
  loading: boolean;
  balance: ReturnType<typeof selectWalletBalance>;
  escrow: ReturnType<typeof selectWalletEscrow>;
}

// ── Internal hook — fetches recommended mentors; sessions + wallet come from shared slices ──
export const useHomeData = (profile: HomeProfile | null): HomeData => {
  const dispatch = useDispatch<AppDispatch>();
  const [mentors, setMentors] = useState<MentorCard[]>([]);
  const [homeLoading, setHomeLoading] = useState(true);

  // Wallet lives in walletSlice (shared with Settings + the payment modals).
  const balance = useSelector(selectWalletBalance);
  const escrow = useSelector(selectWalletEscrow);

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

        //thunk is the middleware that handles this dispatch function so what happens is
        //fist the fetchWallet() gives back the function instead of the action object that is
        //where the thunk comes as the middleware what happens is then first the thunk calls the
        //fetchWallet.pending which is the action creator function that creates the object
        //for the case reducer called wallet/fetchWallet/pending and then the corresponding reducers
        //run and then the payload async creator function that u had return in the createAsyncThunk
        //starts to run now if the payload is success and it returns the object then the fulfilled
        //is called and then if there is the error then  the rejected reducer is called
        const walletRequest = dispatch(fetchWallet());

        const skillTerm =
          profile?.skills?.[0] || profile?.interestedFields?.[0] || "";

        const mentorRes = await searchMentorsBySkill(skillTerm, 4);
        const rawMentors =
          (mentorRes.data as RawMentorSearchResponse).mentors || [];
        setMentors(rawMentors.map(mapMentorProfile));

        await walletRequest;
      } catch (err) {
        logger.error("HomeTab data fetch error:", { error: (err as Error).message });
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
export const getInitials = (name: string = ""): string =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const AVATAR_COLORS: string[] = [
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-900",
  "bg-violet-100 text-violet-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
];

export const getAvatarColor = (name: string = ""): string =>
  AVATAR_COLORS[(name.codePointAt(0) as number) % AVATAR_COLORS.length];

export const calculateProfileCompletion = (
  profile: HomeProfile | null | undefined,
): number => {
  if (!profile) return 0;
  const fields = [
    profile.profilePicture,
    profile.bio,
    profile.currentRole,
    profile.company,
    profile.industry,
    profile.yearsOfExperience,
    (profile.communicationPreferences?.length ?? 0) > 0,
    (profile.languages?.length ?? 0) > 0,
    profile.linkedInUrl,
    profile.portfolioUrl,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};
