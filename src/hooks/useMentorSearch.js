// src/hooks/useMentorSearch.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const DEBOUNCE_MS = 300;
const LIMIT = 6;
const useMentorSearch = () => {
const [skill, setSkill] = useState("");
const [filters, setFilters] = useState({
industry: "",
minPrice: "",
maxPrice: "",
minRating: "",
});
const [mentors, setMentors] = useState([]);
const [loading, setLoading] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);
const [error, setError] = useState("");
const [hasSearched, setHasSearched] = useState(false);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(false);
const [totalCount, setTotalCount] = useState(0);
const debounceTimer = useRef(null);
const token = localStorage.getItem("token");
const authHeader = { Authorization: "Bearer " + token };
const fetchMentors = useCallback(async (
currentSkill, currentFilters, currentPage, append
) => {
if (append === undefined) append = false;
try {
if (append) {
setLoadingMore(true);
} else {
setLoading(true);
}
setError("");
const params = new URLSearchParams();
if (currentSkill.trim()) params.set("skill", currentSkill.trim());
if (currentFilters.industry.trim()) params.set("industry", currentFilters.industry.trim());
if (currentFilters.minPrice !== "") params.set("minPrice", currentFilters.minPrice);
if (currentFilters.maxPrice !== "") params.set("maxPrice", currentFilters.maxPrice);
if (currentFilters.minRating !== "") params.set("minRating", currentFilters.minRating);
params.set("page", currentPage);
params.set("limit", LIMIT);
const url = BASE_URL + "/api/mentors/search?" + params.toString();
const res = await axios.get(url, { headers: authHeader });
const newMentors = res.data.mentors;
const pagination = res.data.pagination;
if (append) {
setMentors(function(prev) { return prev.concat(newMentors); });
} else {
setMentors(newMentors);
}
setHasMore(pagination.hasMore);
setTotalCount(pagination.totalCount);
setHasSearched(true);
} catch (err) {
const apiMsg = err.response && err.response.data && err.response.data.message
? err.response.data.message
: err.message || "Search failed.";
setError(apiMsg);
} finally {
setLoading(false);
setLoadingMore(false);
}
}, []); // eslint-disable-line react-hooks/exhaustive-deps
useEffect(function() {
if (debounceTimer.current) clearTimeout(debounceTimer.current);
debounceTimer.current = setTimeout(function() {
setPage(1);
fetchMentors(skill, filters, 1, false);
}, DEBOUNCE_MS);
return function() { clearTimeout(debounceTimer.current); };
}, [skill]); // eslint-disable-line react-hooks/exhaustive-deps
useEffect(function() {
if (!hasSearched && !skill.trim()) return;
setPage(1);
fetchMentors(skill, filters, 1, false);
}, [filters]); // eslint-disable-line react-hooks/exhaustive-deps
const updateFilter = function(key, value) {
setFilters(function(prev) {
const next = Object.assign({}, prev);
next[key] = value;
return next;
});
};
const resetFilters = function() {
setFilters({ industry: "", minPrice: "", maxPrice: "", minRating: "" });
setSkill("");
setMentors([]);
setHasSearched(false);
setPage(1);
setHasMore(false);
setTotalCount(0);
};
const loadMore = function() {
const nextPage = page + 1;
setPage(nextPage);
fetchMentors(skill, filters, nextPage, true);
};
const searchMentors = function() {
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
setSkill,
updateFilter,
resetFilters,
loadMore,
searchMentors,
};
};
export default useMentorSearch;