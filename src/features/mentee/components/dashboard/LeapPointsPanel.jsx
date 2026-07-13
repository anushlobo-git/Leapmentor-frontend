/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  getMyLeapRequest,
  createLeapRequest,
} from "@features/mentee/api/mentee.api";
import logger from "@lib/logger";
import { HTTP_STATUS } from "@lib/httpStatus";

// ── Leap Points Panel ─────────────────────────────────────────
const LeapPointsPanel = ({ balance, loading }) => {
  const [requestStatus, setRequestStatus] = useState(null); // null | "pending" | "sent" | "sending" | "error"
  const [checking, setChecking] = useState(true);
  const isBalanceEmpty = !loading && balance < 500;

  // Check if there's already a pending request
  useEffect(() => {
    const checkExistingRequest = async () => {
      try {
        setChecking(true);
        const res = await getMyLeapRequest();

        if (res.data?.status === "pending") {
          setRequestStatus("pending");
        }
      } catch (err) {
        // With your new backend logic, this will rarely trigger unless the server is down
        logger.warn("Leap request check failed:", {
          error: err.response?.data || err.message,
        });
      } finally {
        setChecking(false);
      }
    };
    checkExistingRequest();
  }, []);

  const handleUpgradeRequest = async () => {
    try {
      setRequestStatus("sending");
      await createLeapRequest("balance_refill");
      setRequestStatus("sent");
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (
        msg.toLowerCase().includes("pending") ||
        err.response?.status === HTTP_STATUS.CONFLICT
      ) {
        setRequestStatus("pending");
      } else {
        logger.error("Leap request error", {
          error: err.response?.data || err.message,
        });
        setRequestStatus("error");
        setTimeout(() => setRequestStatus(null), 3000);
      }
    }
  };

  const isAlreadyRequested =
    requestStatus === "pending" || requestStatus === "sent";

  // Extracted so the JSX below only needs a single (non-nested) ternary.
  const errorOrRefillButton =
    requestStatus === "error" ? (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
        <p className="text-[11px] font-semibold text-red-600">
          Something went wrong. Try again.
        </p>
      </div>
    ) : (
      <button
        onClick={handleUpgradeRequest}
        disabled={requestStatus === "sending"}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
          bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white
          transition-all duration-150 shadow-sm hover:shadow-md
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {requestStatus === "sending" ? (
          <>
            <svg
              className="animate-spin w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="40 20"
              />
            </svg>
            Sending request…
          </>
        ) : (
          <>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="17 11 12 6 7 11" />
              <line x1="12" y1="6" x2="12" y2="18" />
            </svg>
            Request Leap Points Refill
          </>
        )}
      </button>
    );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#F59E0B" />
          <circle cx="12" cy="12" r="7.5" fill="#FBBF24" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#92400E"
            fontFamily="serif"
          >
            LP
          </text>
        </svg>
        <p className="text-base font-bold text-slate-800">Leap Points</p>
      </div>

      <p className="text-xs text-blue-900 font-medium -mb-1">Current Balance</p>

      {loading ? (
        <div className="h-9 w-28 bg-slate-200 rounded-lg animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-slate-800 leading-none">
            {balance.toLocaleString()}
          </span>
          <span className="text-base font-bold text-amber-500">LP</span>
        </div>
      )}

      <div className="border-t border-slate-100 mt-1" />

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
        <p className="text-[10px] text-amber-800 leading-relaxed">
          Leap Points are the platform currency used to book and pay for
          mentoring sessions. Each point is equivalent to{" "}
          <span className="font-bold">$1.00</span>. Points never expire and are
          non-refundable once used for booking.
        </p>
      </div>

      {/* ── Upgrade / Refill Button ── */}
      {!loading && !checking && (
        <div className="mt-1">
          {isBalanceEmpty ? (
            <>
              {isAlreadyRequested ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Request sent — pending admin review
                  </p>
                </div>
              ) : (
                errorOrRefillButton
              )}
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                Admin will review your activity and add 500 LP if approved.
              </p>
            </>
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
                bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Refill available when balance runs out
            </button>
          )}
        </div>
      )}
    </div>
  );
};

LeapPointsPanel.propTypes = {
  balance: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default LeapPointsPanel;
