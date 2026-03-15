// src/hooks/useMentorSearch.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const DEBOUNCE_MS = 300;
const LIMIT = 6;

const useMentorSearch = () => {
  // ── Search + Filter state ────────────────────────────────
  const [skill, setSkill]     = useState("");
  const [name, setName]       = useState("");
  const [filters, setFilters] = useState({
    industry: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  // ── Results state ────────────────────────────────────────
  const [mentors, setMentors]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // ── Pagination state ─────────────────────────────────────
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // ── Debounce ref ─────────────────────────────────────────
  const debounceTimer = useRef(null);

  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  // ── Core fetch function ───────────────────────────────────
  const fetchMentors = useCallback(async (currentSkill, currentName, currentFilters, currentPage, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (currentSkill.trim())             params.set("skill",     currentSkill.trim());
      if (currentName.trim())              params.set("name",      currentName.trim());
      if (currentFilters.industry.trim())  params.set("industry",  currentFilters.industry.trim());
      if (currentFilters.minPrice !== "")  params.set("minPrice",  currentFilters.minPrice);
      if (currentFilters.maxPrice !== "")  params.set("maxPrice",  currentFilters.maxPrice);
      if (currentFilters.minRating !== "") params.set("minRating", currentFilters.minRating);
      params.set("page",  currentPage);
      params.set("limit", LIMIT);

      const res = await axios.get(`${BASE_URL}/api/mentors/search?${params.toString()}`, {
        headers: authHeader,
      });

      const { mentors: newMentors, pagination } = res.data;

      setMentors((prev) => append ? [...prev, ...newMentors] : newMentors);
      setHasMore(pagination.hasMore);
      setTotalCount(pagination.totalCount);
      setHasSearched(true);

    } catch (err) {
      const apiMsg = err?.response?.data?.message || err?.message || "Search failed.";
      setError(apiMsg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced search — fires 300ms after user stops typing ─
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchMentors(skill, name, filters, 1, false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer.current);
  }, [skill, name]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter change — immediate search, reset page ──────────
  useEffect(() => {
    if (!hasSearched && !skill.trim() && !name.trim()) return;
    setPage(1);
    fetchMentors(skill, name, filters, 1, false);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update a single filter field ─────────────────────────
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // ── Reset all filters ─────────────────────────────────────
  const resetFilters = () => {
    setFilters({ industry: "", minPrice: "", maxPrice: "", minRating: "" });
    setSkill("");
    setName("");
    setMentors([]);
    setHasSearched(false);
    setPage(1);
    setHasMore(false);
    setTotalCount(0);
  };

  // ── Show More — load next page and append ─────────────────
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMentors(skill, name, filters, nextPage, true);
  };

  // ── Manual search trigger ─────────────────────────────────
  const searchMentors = () => {
    setPage(1);
    fetchMentors(skill, name, filters, 1, false);
  };

  return {
    skill,
    name,
    filters,
    mentors,
    loading,
    loadingMore,
    error,
    hasSearched,
    hasMore,
    totalCount,
    setSkill,
    setName,
    updateFilter,
    resetFilters,
    loadMore,
    searchMentors,
  };
};

export default useMentorSearch;