// src/hooks/useMentorSearch.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const BASE_URL    = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const DEBOUNCE_MS = 300;
const LIMIT       = 6;

const useMentorSearch = () => {
  const [skill,       setSkill]       = useState("");
  const [filters,     setFilters]     = useState({
    industry: "", minPrice: "", maxPrice: "", minRating: "",
  });
  const [mentors,     setMentors]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [totalCount,  setTotalCount]  = useState(0);

  const debounceTimer = useRef(null);
  const token         = localStorage.getItem("token");
  const authHeader    = { Authorization: "Bearer " + token };

  const fetchMentors = useCallback(async (
    currentSkill, currentFilters, currentPage, append = false
  ) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError("");

      const params = new URLSearchParams();

      // ── Send the search term as BOTH skill AND name ──────────
      // Backend checks: skill → Atlas Search on skills/role/industry
      //                 name  → regex on User.name
      // Whichever matches returns results — union of both
      if (currentSkill.trim()) {
        params.set("skill", currentSkill.trim());
        params.set("name",  currentSkill.trim());
      }

      if (currentFilters.industry.trim())  params.set("industry",  currentFilters.industry.trim());
      if (currentFilters.minPrice !== "")  params.set("minPrice",  currentFilters.minPrice);
      if (currentFilters.maxPrice !== "")  params.set("maxPrice",  currentFilters.maxPrice);
      if (currentFilters.minRating !== "") params.set("minRating", currentFilters.minRating);

      params.set("page",  currentPage);
      params.set("limit", LIMIT);

      const res = await axios.get(
        `${BASE_URL}/mentors/search?${params.toString()}`,
        { headers: authHeader }
      );

      const newMentors = res.data.mentors;
      const pagination = res.data.pagination;

      setMentors(append ? (prev) => [...prev, ...newMentors] : newMentors);
      setHasMore(pagination.hasMore);
      setTotalCount(pagination.totalCount);
      setHasSearched(true);

    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Search failed."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced search on skill change ──────────────────────
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchMentors(skill, filters, 1, false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [skill]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Immediate search on filter change ─────────────────────
  useEffect(() => {
    if (!hasSearched && !skill.trim()) return;
    setPage(1);
    fetchMentors(skill, filters, 1, false);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () => {
    setFilters({ industry: "", minPrice: "", maxPrice: "", minRating: "" });
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
    skill, filters, mentors, loading, loadingMore,
    error, hasSearched, hasMore, totalCount,
    setSkill, updateFilter, resetFilters, loadMore, searchMentors,
  };
};

export default useMentorSearch;