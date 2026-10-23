/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useMentorSearch.js
import { useState, useEffect, useCallback, useRef } from "react";
import { searchMentorsRequest } from "@features/mentee/models/mentee.api";
import { mapMentorSearchResponse } from "@features/mentor/models/mentorMapper";
import { getApiErrorMessage, getErrorMessage } from "@lib/http/getApiError";

const DEBOUNCE_MS = 300;
const LIMIT = 6;

// ── EXPERIENCE CONFIGURATION MAP ──────────────────────────────
// FIX FOR S3776: Replaced branching statements with a clean, low-complexity lookup engine
const EXPERIENCE_MAPPINGS = {
  "0-2": { min: "0", max: "2" },
  "3-5": { min: "3", max: "5" },
  "6-10": { min: "6", max: "10" },
  "10+": { min: "10", max: null },
  "under-1":{ min: null , max: "1" },
};

type SearchFilters = {
  industry: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  experience: string;
};

type ExperienceKey = keyof typeof EXPERIENCE_MAPPINGS;
type MentorSearchResult = ReturnType<typeof mapMentorSearchResponse>["mentors"][number];

// ── SEARCH QUERY BUILDER HELPER ───────────────────────────────
// Extracts string building branches into an independent, low-complexity worker
const buildSearchQueryParams = (
  currentSkill: string,
  currentFilters: SearchFilters,
  currentPage: number,
) => {
  const params = new URLSearchParams();
  const trimmedSkill = currentSkill.trim();

  if (trimmedSkill) {
    params.set("skill", trimmedSkill);
    params.set("name", trimmedSkill);
  }

  const trimmedIndustry = currentFilters.industry.trim();
  if (trimmedIndustry) {
    params.set("industry", trimmedIndustry);
  }

  if (currentFilters.minPrice !== "") {
    params.set("minPrice", currentFilters.minPrice);
  }
  if (currentFilters.maxPrice !== "") {
    params.set("maxPrice", currentFilters.maxPrice);
  }
  if (currentFilters.minRating !== "") {
    params.set("minRating", currentFilters.minRating);
  }

  const expConfig =
    EXPERIENCE_MAPPINGS[currentFilters.experience as ExperienceKey];
  if (expConfig) {
    if (expConfig.min !== null) params.set("minExperience", expConfig.min);
    if (expConfig.max !== null) params.set("maxExperience", expConfig.max);
  }

  params.set("page", String(currentPage));
  params.set("limit", String(LIMIT));

  return params.toString();
};

/**
 * Custom hook for mentor search.
 * @returns {Object} Hook state and handlers for the caller.
 */
const useMentorSearch = () => {
  const [skill, setSkill] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    industry: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    experience: "",
  });
  const [mentors, setMentors] = useState<MentorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMentors = useCallback(
    async (
      currentSkill: string,
      currentFilters: SearchFilters,
      currentPage: number,
      append = false,
    ) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError("");

        const queryString = buildSearchQueryParams(
          currentSkill,
          currentFilters,
          currentPage,
        );
        const res = await searchMentorsRequest(queryString);

        const { mentors: newMentors, pagination } = mapMentorSearchResponse(
          res.data,
        );

        setMentors(append ? (prev) => [...prev, ...newMentors] : newMentors);
        setHasMore(pagination.hasMore);
        setTotalCount(pagination.totalCount);
        setHasSearched(true);
      } catch (err: unknown) {
        setError(
          getApiErrorMessage(err, getErrorMessage(err) || "Search failed."),
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // ── Single unified effect for both skill typing + filter changes ──
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchMentors(skill, filters, 1, false);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [skill, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wrapped setSkill — clears stale error on new search input
  const handleSetSkill = (value: string) => {
    setError("");
    setSkill(value);
  };

  // updateFilter — clears stale error on any filter change
  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setError("");
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setError("");
    setFilters({
      industry: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      experience: "",
    });
    setSkill("");
    setMentors([]);
    setHasSearched(false);
    setPage(1);
    setHasMore(false);
    setTotalCount(0);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMentors(skill, filters, nextPage, true);
  };

  const searchMentors = () => {
    setPage(1);
    fetchMentors(skill, filters, 1, false);
  };

  return {
    skill,
    filters,
    mentors,
    loading,
    loadingMore,
    error,
    hasSearched,
    hasMore,
    totalCount,
    setSkill: handleSetSkill,
    updateFilter,
    resetFilters,
    loadMore,
    searchMentors,
  };
};

export default useMentorSearch;
