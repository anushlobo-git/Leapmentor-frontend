/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/wallet/MenteeHistoryModal.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getEngagements } from "@features/admin/api/admin.api";
import logger from "@lib/logger";
import WalletStatusBadge from "./WalletStatusBadge";
import {
  getInitials,
  getAvatarColor,
  formatDate,
} from "../../pages/walletRequests.utils";

const MenteeHistoryModal = ({ mentee, onClose }) => {
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchEngagements = async () => {
      try {
        setLoading(true);
        const res = await getEngagements({ search: mentee.name, limit: 50 });
        const all = res.data.engagements || [];
        // Filter to only this mentee's engagements
        const filtered = all.filter(
          (e) =>
            e.mentee?._id === mentee._id || e.mentee?.email === mentee.email,
        );
        setEngagements(filtered);
      } catch (err) {
        logger.error("Failed to fetch engagements", {
          menteeId: mentee._id,
          error: err,
        });
      } finally {
        setLoading(false);
      }
    };
    if (mentee) fetchEngagements();
  }, [mentee]);

  const toggleExpand = (engId) => {
    setExpandedId((prev) => (prev === engId ? null : engId));
  };

  const { bg, text } = getAvatarColor(mentee.name);
  const totalCompleted = engagements.reduce(
    (acc, e) =>
      acc +
      (e.selectedSlots?.filter((s) => s.status === "completed").length || 0),
    0,
  );
  const totalSlots = engagements.reduce(
    (acc, e) => acc + (e.selectedSlots?.length || 0),
    0,
  );

  // ── SonarQube S3358 fix: nested ternary extracted into a plain
  // if/else chain, computed as an independent statement before render ──
  let engagementsContent;
  if (loading) {
    engagementsContent = (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <svg
          className="animate-spin w-6 h-6 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="#dbeafe" strokeWidth="3" />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-xs text-slate-400">Loading engagement history…</p>
      </div>
    );
  } else if (engagements.length === 0) {
    engagementsContent = (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-500">
          No engagements found
        </p>
        <p className="text-xs text-slate-400">
          This mentee has no session history yet.
        </p>
      </div>
    );
  } else {
    engagementsContent = (
      <div className="space-y-3">
        {engagements.map((eng) => {
          const isOpen = expandedId === eng._id;
          const engSlots = eng.selectedSlots || [];
          const completed = engSlots.filter(
            (s) => s.status === "completed",
          ).length;
          return (
            <div
              key={eng._id}
              className="rounded-xl border border-slate-100 overflow-hidden"
            >
              {/* Engagement Row */}
              <button
                type="button"
                onClick={() => toggleExpand(eng._id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mentor avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      ...getAvatarColor(eng.mentor?.name || "M"),
                      background: getAvatarColor(eng.mentor?.name || "M").bg,
                      color: getAvatarColor(eng.mentor?.name || "M").text,
                    }}
                  >
                    {getInitials(eng.mentor?.name || "M")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      Mentor: {eng.mentor?.name || "—"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatDate(eng.requestedAt)} · {engSlots.length} sessions
                      · {completed} completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {/* Expanded Slots */}
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                  {/* Engagement meta */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      {
                        label: "Payment",
                        value: (
                          <WalletStatusBadge
                            status={eng.paymentStatus || "unpaid"}
                          />
                        ),
                      },
                      {
                        label: "Rate/Session",
                        value: eng.sessionRate ? `₹${eng.sessionRate}` : "—",
                      },
                      {
                        label: "Responded",
                        value: formatDate(eng.respondedAt),
                      },
                      {
                        label: "Completed At",
                        value: formatDate(eng.completedAt),
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-100"
                      >
                        <span className="text-[10px] text-slate-400 font-medium">
                          {m.label}:
                        </span>
                        <span className="text-[10px] font-semibold text-slate-700">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Slots Table */}
                  {engSlots.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No slots found.
                    </p>
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-slate-100">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr style={{ background: "#f1f5f9" }}>
                            {["#", "Date", "Time"].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2 text-left font-bold text-slate-400 uppercase tracking-wider text-[9px]"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {engSlots.map((slot, i) => {
                            const slotKey = `${slot.date ?? "slot"}-${slot.startTime ?? "start"}-${slot.endTime ?? "end"}`;
                            return (
                              <tr
                                key={slotKey}
                                className="border-t border-slate-100 bg-white hover:bg-slate-50"
                              >
                                <td className="px-3 py-2 font-bold text-slate-400">
                                  {i + 1}
                                </td>
                                <td className="px-3 py-2 text-slate-700">
                                  {formatDate(slot.date)}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {slot.startTime && slot.endTime
                                    ? `${slot.startTime} – ${slot.endTime}`
                                    : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: bg, color: text }}
            >
              {getInitials(mentee.name)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {mentee.name}
              </h2>
              <p className="text-[11px] text-slate-400">{mentee.email}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close history modal"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="flex gap-3 px-6 py-3 border-b border-slate-100 bg-slate-50">
          {[
            {
              label: "Engagements",
              value: engagements.length,
              color: "#2563eb",
              bg: "#dbeafe",
            },
            {
              label: "Total Sessions",
              value: totalSlots,
              color: "#7c3aed",
              bg: "#ede9fe",
            },
            {
              label: "Completed",
              value: totalCompleted,
              color: "#065f46",
              bg: "#d1fae5",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-xl px-3 py-2 text-center"
              style={{ background: s.bg }}
            >
              <p className="text-lg font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p
                className="text-[10px] font-semibold"
                style={{ color: s.color }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Engagements List */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {engagementsContent}
        </div>
      </div>
    </div>
  );
};

MenteeHistoryModal.propTypes = {
  mentee: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MenteeHistoryModal;
