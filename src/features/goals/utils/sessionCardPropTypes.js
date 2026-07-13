/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/utils/sessionCardPropTypes.js
import PropTypes from "prop-types";

export const slotShape = PropTypes.shape({
  date: PropTypes.string,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
  status: PropTypes.string,
  meetingLink: PropTypes.string,
  menteeMarked: PropTypes.bool,
  mentorMarked: PropTypes.bool,
  isRescheduled: PropTypes.bool,
  cancelledBy: PropTypes.string,
  cancellationReason: PropTypes.string,
});
