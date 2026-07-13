/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/pages/AdminPayments.jsx
import AdminLayout from "@features/admin/components/AdminLayout";
import Toast from "@features/admin/components/payments/Toast";
import PaymentsStatCards from "@features/admin/components/payments/PaymentsStatCards";
import RevenuePanel from "@features/admin/components/payments/RevenuePanel";
import TransactionsTable from "@features/admin/components/payments/TransactionsTable";
import { usePaymentsData } from "@features/admin/hooks/usePaymentsData";
import { FONT } from "@features/admin/constants/payments.constants";

const AdminPayments = () => {
  const {
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
    goToPage,
  } = usePaymentsData();

  return (
    <AdminLayout>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <Toast toast={toast} />

      <div className="space-y-6">
        <div>
          <h1
            className="text-2xl font-700 text-slate-800"
            style={{ fontWeight: 700, fontFamily: FONT }}
          >
            Payment Tracking
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Monitor platform revenue and financial transactions across all
            departments.
          </p>
        </div>

        <PaymentsStatCards stats={stats} />

        <RevenuePanel chartData={chartData} loadingChart={loadingChart} />

        <TransactionsTable
          transactions={transactions}
          loading={loading}
          pagination={pagination}
          search={search}
          typeFilter={typeFilter}
          onSearchChange={handleSearch}
          onTypeFilterChange={handleTypeFilter}
          onPageChange={goToPage}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
