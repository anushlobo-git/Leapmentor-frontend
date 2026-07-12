/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/components/SessionCard.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import {
  formatSlotDate,
  formatTime,
  getSessionStatus,
  getCardBorderClass,
  isMoreThan12HrsAway,
} from "@features/goals/utils/sessionCardUtils";
import { slotShape } from "@features/goals/utils/sessionCardPropTypes";
import CancelModal from "./session-card/CancelModal";
import RescheduleModal from "./session-card/RescheduleModal";
import MeetingLinkSection from "./session-card/MeetingLinkSection";
import CompletionSection from "./session-card/CompletionSection";
import CancelledNotice from "./session-card/CancelledNotice";
import SessionActions from "./session-card/SessionActions";

const SessionCard = ({
  slot,
  slotIndex,
  viewerRole,
  otherName,
  savingSlots,
  onSetLink,
  onMarkComplete,
  onSessionComplete,
  onCancelSlot,
  onRescheduleSlot,
  allSlots,
  connectRequestId,
}) => {
  const saving = [...savingSlots].includes(slotIndex);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const cancelled = slot?.status === "cancelled";
  const bothDone = slot?.menteeMarked && slot?.mentorMarked;
  const canCancel = !cancelled && !bothDone;

  const { label: statusLabel, className: statusClass } = getSessionStatus(
    slot,
    cancelled,
    bothDone,
  );

  const handleCancel = async (idx, reason) => {
    const result = await onCancelSlot(idx, reason);
    if (result?.success) setShowCancelModal(false);
  };

  const handleReschedule = async (idx, newSlot) => {
    const result = await onRescheduleSlot(idx, newSlot);
    if (result?.success) setShowRescheduleModal(false);
  };

  return (
    <>
      <div
        className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 transition-opacity
        ${getCardBorderClass(cancelled, bothDone)}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Session {slotIndex + 1}
              </p>
              {slot?.isRescheduled && !cancelled && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 uppercase tracking-wide">
                  Rescheduled
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-slate-800">
              {formatSlotDate(slot)}
            </p>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">
              {formatTime(slot?.startTime)} – {formatTime(slot?.endTime)}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        {cancelled ? (
          <CancelledNotice
            slot={slot}
            viewerRole={viewerRole}
            otherName={otherName}
          />
        ) : (
          <>
            {!bothDone && (
              <MeetingLinkSection
                slot={slot}
                viewerRole={viewerRole}
                onSetLink={(link) => onSetLink(slotIndex, link)}
                saving={saving}
              />
            )}

            <CompletionSection
              slot={slot}
              viewerRole={viewerRole}
              otherName={otherName}
              slotIndex={slotIndex}
              onMarkComplete={onMarkComplete}
              onSessionComplete={onSessionComplete}
            />
          </>
        )}

        {canCancel && (
          <SessionActions
            withinRescheduleWindow={isMoreThan12HrsAway(slot)}
            saving={saving}
            onRescheduleClick={() => setShowRescheduleModal(true)}
            onCancelClick={() => setShowCancelModal(true)}
          />
        )}
      </div>

      {showCancelModal && (
        <CancelModal
          slot={slot}
          slotIndex={slotIndex}
          onConfirm={handleCancel}
          onClose={() => setShowCancelModal(false)}
          saving={saving}
        />
      )}

      {showRescheduleModal && (
        <RescheduleModal
          slot={slot}
          slotIndex={slotIndex}
          connectRequestId={connectRequestId}
          existingSlots={allSlots}
          onConfirm={handleReschedule}
          onClose={() => setShowRescheduleModal(false)}
          saving={saving}
        />
      )}
    </>
  );
};

SessionCard.propTypes = {
  slot: slotShape.isRequired,
  slotIndex: PropTypes.number.isRequired,
  viewerRole: PropTypes.string.isRequired,
  otherName: PropTypes.string.isRequired,
  savingSlots: PropTypes.oneOfType([PropTypes.array, PropTypes.instanceOf(Set)])
    .isRequired,
  onSetLink: PropTypes.func.isRequired,
  onMarkComplete: PropTypes.func.isRequired,
  onSessionComplete: PropTypes.func,
  onCancelSlot: PropTypes.func.isRequired,
  onRescheduleSlot: PropTypes.func.isRequired,
  allSlots: PropTypes.array.isRequired,
  connectRequestId: PropTypes.string.isRequired,
};

export default SessionCard;
