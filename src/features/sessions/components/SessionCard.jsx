/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import PropTypes from "prop-types";
import { formatSlotDate, formatSlotTime } from "@features/sessions/utils/sessionFormat";

const StatusPill = ({ isOngoing }) => (
  <span
    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0
    ${
      isOngoing
        ? "bg-blue-100 text-blue-900 border border-blue-200"
        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
    }`}
  >
    {isOngoing ? "Ongoing" : "Accepted"}
  </span>
);

StatusPill.propTypes = {
  isOngoing: PropTypes.bool.isRequired,
};

const SessionCard = ({
  request,
  index,
  navigate,
  personKey,
  size,
  accentPalette,
}) => {
  const slot = request.confirmedSlot || request.selectedSlots?.[0];
  const dateObj = slot?.date ? new Date(slot.date + "T00:00:00") : null;
  const dateNum = dateObj ? dateObj.getDate().toString() : "—";
  const dateMonth = dateObj
    ? dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : "—";
  const fullDate = formatSlotDate(slot);
  const timeStr = formatSlotTime(slot);
  const personName =
    request[personKey]?.name || (personKey === "mentor" ? "Mentor" : "Mentee");
  const isOngoing = request.status === "ongoing";
  const accent = accentPalette[index % accentPalette.length];

  const isCompact = size === "compact";
  const badgeSize = isCompact ? "w-9 h-11" : "w-11 h-14";
  const cardPad = isCompact ? "px-3 py-2.5" : "px-4 py-3.5";

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 ${cardPad} flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div
        style={{ backgroundColor: accent }}
        className={`${badgeSize} rounded-xl flex flex-col items-center justify-center text-white shrink-0`}
      >
        <span
          className={`${isCompact ? "text-[8px]" : "text-[11px]"} font-bold tracking-widest`}
        >
          {dateMonth}
        </span>
        <span
          className={`${isCompact ? "text-base" : "text-xl"} font-bold leading-none`}
        >
          {dateNum}
        </span>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-semibold text-slate-800 truncate">
            {personName}
          </p>
          <StatusPill isOngoing={isOngoing} />
        </div>
        <p className="text-[10px] text-blue-900 truncate mt-0.5">
          {timeStr || "Time TBD"}
          {fullDate ? ` · ${fullDate}` : ""}
        </p>
      </div>

      <div className="shrink-0">
        {isOngoing ? (
          <button
            onClick={() => navigate(`/shared-dashboard/${request._id}`)}
            className={`text-xs bg-blue-900 hover:bg-blue-700 text-white ${isCompact ? "w-35 px-4 py-2 rounded-full" : "px-3 py-1.5 rounded-lg"} font-semibold transition-colors whitespace-nowrap`}
          >
            {isCompact ? "Open Dashboard →" : "Open Dashboard"}
          </button>
        ) : (
          !isCompact && (
            <span className="text-xs text-blue-900 border border-slate-200 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">
              Awaiting Payment
            </span>
          )
        )}
      </div>
    </div>
  );
};

SessionCard.propTypes = {
  request: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  navigate: PropTypes.func.isRequired,
  personKey: PropTypes.oneOf(["mentor", "mentee"]).isRequired,
  size: PropTypes.oneOf(["default", "compact"]),
  accentPalette: PropTypes.array.isRequired,
};

SessionCard.defaultProps = { size: "default" };

export default SessionCard;
