/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
//src/features/mentee/components/dashboard/history/DetailDrawer.jsx
import { useState } from "react";
import {
  STATUS_STYLES,
  STATUS_LABELS,
  formatDate,
  getInitials,
} from "@features/mentee/components/dashboard/history/constants";
import StatusBadge from "@features/mentee/components/dashboard/history/StatusBadge";
import EscrowPaymentModal from "@features/mentee/components/dashboard/history/EscrowPaymentModal";
import {
  PendingContent,
  AcceptedContent,
  CompletedContent,
  RejectedContent,
} from "@features/mentee/components/dashboard/history/RequestStatusViews";
import {
  OngoingContent,
  ReferredContent,
} from "@features/mentee/components/dashboard/history/OngoingReferredContent";
import PropTypes from "prop-types";

// ── Main Drawer ─────────────────────────────────────────────
const DetailDrawer = ({ request, onClose, onDelete, onUpdateRequest }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!request) return null;

  const { mentor, status, requestedAt, respondedAt } = request;
  const initials = getInitials(mentor?.name);

  const handlePaymentSuccess = (patch) => {
    onUpdateRequest(request._id, patch);
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/10 border-0 p-0 m-0 cursor-default"
        onClick={onClose}
        aria-label="Close request details"
      />
      <div className="fixed right-0 top-14 bottom-0 w-80 z-50 bg-white border-l border-slate-100 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Request Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748B"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Mentor info */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800 text-sm truncate">
              {mentor?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{mentor?.email}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Status banner */}
        <div
          className={`mx-5 mt-4 rounded-xl px-3 py-2.5 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {status === "pending" && (
            <PendingContent
              request={request}
              onDelete={() => {
                onDelete(request._id);
                onClose();
              }}
            />
          )}
          {status === "accepted" && (
            <AcceptedContent
              request={request}
              onClose={onClose}
              onPayClick={() => setShowPaymentModal(true)}
            />
          )}
          {status === "ongoing" && (
            <OngoingContent request={request} onClose={onClose} />
          )}
          {status === "completed" && (
            <CompletedContent request={request} onClose={onClose} />
          )}
          {status === "referred" && (
            <ReferredContent
              request={request}
              onDelete={() => {
                onDelete(request._id);
                onClose();
              }}
            />
          )}
          {status === "rejected" && (
            <RejectedContent request={request} onClose={onClose} />
          )}
        </div>

        {/* Footer dates */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            Sent {formatDate(requestedAt)}
          </span>
          {respondedAt && (
            <span className="text-[10px] text-slate-400">
              Responded {formatDate(respondedAt)}
            </span>
          )}
        </div>
      </div>

      {/* ✅ Escrow Payment Modal */}
      {showPaymentModal && (
        <EscrowPaymentModal
          request={request}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

DetailDrawer.propTypes = {
  request: PropTypes.shape({
    _id: PropTypes.string,
    mentor: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    status: PropTypes.string,
    requestedAt: PropTypes.string,
    respondedAt: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdateRequest: PropTypes.func.isRequired,
};

export default DetailDrawer;
