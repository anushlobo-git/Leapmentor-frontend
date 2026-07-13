/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/shared/payment/EscrowPaymentUI.jsx
//
// Shared building blocks for the escrow-style payment modals
// (EscrowPaymentModal, AdditionalSessionPaymentModal). Both modals were
// near-identical copy-pastes of the backdrop/header/footer chrome and the
// session-details / balance rows — this file is the single source of truth
// for that shared chrome so future changes only need to happen once.
import PropTypes from "prop-types";
import {
  LockIcon,
  CloseIcon,
  SpinnerIcon,
} from "@components/shared/icons/PaymentIcons";
import WalletBalanceDisplay from "@components/shared/WalletBalanceDisplay";

// ── Modal shell: backdrop + header + scrollable body + footer buttons ──
export const EscrowModalShell = ({
  title,
  onClose,
  onPay,
  payDisabled,
  loading,
  totalAmount,
  children,
}) => (
  <>
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm" />
    <div className="fixed inset-0 z-70 flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 text-slate-800">
            <LockIcon size={14} />
            <h2 className="text-sm font-bold">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
          {children}
        </div>

        {/* ── Footer buttons — always visible ───────────── */}
        <div className="px-4 py-3 border-t border-slate-100 space-y-2 shrink-0">
          <button
            type="button"
            onClick={onPay}
            disabled={payDisabled}
            className="w-full py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold
              hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <SpinnerIcon />
                Processing...
              </>
            ) : (
              <>
                <LockIcon size={12} /> Confirm & Pay {totalAmount} Tokens
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 rounded-xl border border-slate-200 text-slate-600
              text-xs font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </>
);

EscrowModalShell.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onPay: PropTypes.func.isRequired,
  payDisabled: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  totalAmount: PropTypes.number.isRequired,
  children: PropTypes.node,
};

// ── Session details card: label/value row list ──
export const SessionDetailRows = ({ rows }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
      Session Details
    </p>
    <div className="space-y-1.5">
      {rows.filter(Boolean).map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs font-semibold text-slate-700">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

SessionDetailRows.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.node.isRequired,
      }),
      PropTypes.oneOf([false, null, undefined]),
    ]),
  ).isRequired,
};

// ── Wallet balance row ──
export const BalanceRow = ({ fetching, walletBalance, insufficient }) => (
  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
    <span className="text-xs font-semibold text-blue-900">Your balance</span>
    <WalletBalanceDisplay
      fetching={fetching}
      walletBalance={walletBalance}
      insufficient={insufficient}
    />
  </div>
);

BalanceRow.propTypes = {
  fetching: PropTypes.bool,
  walletBalance: PropTypes.number,
  insufficient: PropTypes.bool,
};
