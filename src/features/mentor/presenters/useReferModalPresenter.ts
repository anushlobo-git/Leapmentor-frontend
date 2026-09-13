/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect } from "react";
import {
  getSimilarMentors,
  referRequest,
} from "@features/mentor/models/mentor.api";

export interface SimilarMentor {
  _id: string;
  user?: { _id: string; name?: string };
  profilePicture?: string;
  currentRole?: string;
  company?: string;
  avgRating?: number;
  skills: string[];
}

export interface ReferModalRequest {
  _id: string;
  mentee?: { name?: string; email?: string };
}

export const getInitials = (name?: string) =>
  name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

export const useReferModalPresenter = (
  request: ReferModalRequest,
  onReferred: (id: string, status: string) => void,
) => {
  const [mentors, setMentors] = useState<SimilarMentor[]>([]);
  const [mySkills, setMySkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [referring, setReferring] = useState(false);
  const [selected, setSelected] = useState<SimilarMentor | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ✅ Fetch similar mentors on mount
  useEffect(() => {
    const fetchSimilarMentors = async () => {
      try {
        setLoading(true);
        const res = await getSimilarMentors(request._id);
        setMentors(res.data.mentors || []);
        setMySkills(res.data.mySkills || []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load similar mentors.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSimilarMentors();
  }, [request._id]);

  // ✅ Submit referral
  const handleRefer = async () => {
    try {
      setReferring(true);
      setError("");
      await referRequest(request._id, selected?.user?._id as string);
      setSuccess(true);
      onReferred(request._id, "referred");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to refer request.");
    } finally {
      setReferring(false);
    }
  };

  return {
    mentors,
    mySkills,
    loading,
    referring,
    selected,
    selectMentor: setSelected,
    error,
    success,
    handleRefer,
  };
};
