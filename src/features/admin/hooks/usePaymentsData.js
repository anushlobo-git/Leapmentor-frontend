/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/hooks/usePaymentsData.js
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getPaymentStats,
  getPaymentChart,
  getPaymentTransactions,
} from "@features/admin/api/admin.api";

const SEARCH_DEBOUNCE_MS = 400;
const TOAST_DURATION_MS = 3500;
const PAGE_SIZE = 15;

/**
 * Owns all state + data fetching for the Admin Payments page:
 * stats, chart data, transactions, pagination, search/filter, toast.
 */
export const usePaymentsData = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [toast, setToast] = useState(null);
  const searchTimer = useRef(null);

  const showToast = useCallback((msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getPaymentStats();
      setStats(res.data.data || res.data || {});
    } catch {
      showToast("Failed to load payment stats.");
    }
  }, [showToast]);

  const fetchChart = useCallback(async () => {
    try {
      setLoadingChart(true);
      const res = await getPaymentChart();
      setChartData(res.data.data || []);
    } catch {
      showToast("Failed to load chart.");
    } finally {
      setLoadingChart(false);
    }
  }, [showToast]);

  const fetchTransactions = useCallback(
    async (page = 1, q = search, type = typeFilter) => {
      try {
        setLoading(true);
        const params = { page, limit: PAGE_SIZE };
        if (q) params.search = q;
        if (type) params.type = type;
        const res = await getPaymentTransactions(params);
        setTransactions(res.data.transactions || []);
        setPagination(res.data.pagination);
      } catch {
        showToast("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    },
    [search, typeFilter, showToast],
  );

  useEffect(() => {
    fetchStats();
    fetchChart();
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (val) => {
      setSearch(val);
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(
        () => fetchTransactions(1, val, typeFilter),
        SEARCH_DEBOUNCE_MS,
      );
    },
    [fetchTransactions, typeFilter],
  );

  const handleTypeFilter = useCallback(
    (type) => {
      setTypeFilter(type);
      fetchTransactions(1, search, type);
    },
    [fetchTransactions, search],
  );

  return {
    stats,
    chartData,
    transactions,
    pagination,
    search,
    typeFilter,
    loading,
    loadingChart,
    toast,
    handleSearch,
    handleTypeFilter,
    goToPage: fetchTransactions,
  };
};
