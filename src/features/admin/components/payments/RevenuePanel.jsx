/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/RevenuePanel.jsx
import PropTypes from "prop-types";
import RevenueChart from "@features/admin/components/payments/RevenueChart";
import { FONT, MONO } from "@features/admin/constants/payments.constants";

const RevenuePanel = ({ chartData, loadingChart }) => (
  <div
    className="rounded-2xl p-6"
    style={{ background: "#ffffff", border: "1px solid #e8eaf0" }}
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3
          className="text-sm font-700 text-slate-800"
          style={{ fontWeight: 700, fontFamily: FONT }}
        >
          Revenue Overview
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">Growth trajectory </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-600" />
        <span className="text-xs text-slate-500" style={{ fontFamily: MONO }}>
          Net Revenue
        </span>
        <span
          className="text-xs font-600 px-2.5 py-1 rounded-lg ml-1"
          style={{ background: "#f1f5f9", color: "#475569", fontWeight: 600 }}
        >
          Last 6 Months
        </span>
      </div>
    </div>
    <RevenueChart data={chartData} loading={loadingChart} />
  </div>
);

RevenuePanel.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.number,
      label: PropTypes.string,
    }),
  ).isRequired,
  loadingChart: PropTypes.bool.isRequired,
};

export default RevenuePanel;
