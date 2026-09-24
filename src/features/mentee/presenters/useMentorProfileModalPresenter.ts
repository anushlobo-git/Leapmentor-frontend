/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect, useRef } from "react";
import { getMentorAvailability } from "@features/mentee/models/mentee.api";
import useConnectRequest from "@features/connects/presenters/useConnectRequest";
import useSlotLock from "@features/sessions/presenters/useSlotLock";
import { HTTP_STATUS } from "@lib/http/httpStatus";
import { MENTOR_BADGES } from "@features/mentor/models/mentorBadges";

const BADGES = MENTOR_BADGES;
const MAX_SLOTS = 5;

export interface SlotObj {
  startTime: string;
  endTime: string;
  date?: string;
  day?: string;
  displayDate?: string;
  isBooked?: boolean;
}

export interface SlotGroup {
  date: string;
  day: string;
  displayDate: string;
  slots?: SlotObj[];
}

export interface MentorProfile {
  user?: { _id?: string; name?: string };
  currentRole?: string;
  company?: string;
  industry?: string;
  bio?: string;
  hourlyRate?: number;
  avgRating?: number | string;
  reviewCount?: number;
  yearsOfExperience?: number;
  profilePicture?: string;
  location?: string;
  totalSessions?: number;
}

export function useMentorProfileModalPresenter(
  mentor: MentorProfile,
  onClose: () => void,
) {
  const [groupedSlots, setGroupedSlots] = useState<SlotGroup[]>([]);
  const [availableDurations, setAvailableDurations] = useState<number[]>([60]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedSlots, setSelectedSlots] = useState<SlotObj[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [fetchingSlots, setFetchingSlots] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const sendingRef = useRef(false);

  const { sending, error, sendRequest, reset } = useConnectRequest();
  const { lockSlot, unlockSlot, unlockAll } = useSlotLock(mentor?.user?._id);
  const [lockError, setLockError] = useState("");
  const [imgError, setImgError] = useState(false);

  const {
    user,
    currentRole,
    company,
    industry,
    bio,
    hourlyRate,
    avgRating,
    reviewCount,
    yearsOfExperience,
    profilePicture,
    location,
    totalSessions,
  } = mentor;

  const badges = BADGES.map((badge) => ({
    ...badge,
    unlocked: badge.condition({ avgRating, totalSessions }),
  }));

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const fetchSlots = async (duration: number) => {
    try {
      setFetchingSlots(true);
      setSlotsError("");
      setSelectedSlots([]);
      setActiveDayIndex(0);
      const res = await getMentorAvailability(mentor.user._id, duration);
      setGroupedSlots(res.data.slots || []);
      if (res.data.sessionDurations?.length) {
        setAvailableDurations(res.data.sessionDurations);
        if (!res.data.sessionDurations.includes(selectedDuration)) {
          setSelectedDuration(res.data.sessionDurations[0]);
        }
      }
    } catch (err: any) {
      setSlotsError(
        err?.response?.status === HTTP_STATUS.NOT_FOUND
          ? "This mentor hasn't set their availability yet."
          : "Failed to load available slots.",
      );
      setGroupedSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  };

  useEffect(() => {
    if (!mentor?.user?._id) return;
    fetchSlots(selectedDuration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentor, selectedDuration]);

  const toggleSlot = async (slot: SlotObj, group: SlotGroup) => {
    setLockError("");
    const key = `${group.date}-${slot.startTime}`;
    const exists = selectedSlots.some(
      (s: SlotObj) => `${s.date}-${s.startTime}` === key,
    );
    if (exists) {
      await unlockSlot(group.date, slot.startTime, slot.endTime);
      setSelectedSlots((prev) =>
        prev.filter((s: SlotObj) => `${s.date}-${s.startTime}` !== key),
      );
      return;
    }
    if (selectedSlots.length >= MAX_SLOTS) return;
    const result = await lockSlot(group.date, slot.startTime, slot.endTime);
    if (!result.ok) {
      setLockError(
        result.code === "SLOT_BOOKED"
          ? "This slot was just booked by someone. Please choose another."
          : "This slot is temporarily held by someone. Please choose another.",
      );
      fetchSlots(selectedDuration);
      return;
    }
    const slotObj: SlotObj = {
      ...slot,
      date: group.date,
      day: group.day,
      displayDate: group.displayDate,
    };
    setSelectedSlots((prev) => [...prev, slotObj]);
  };

  const isSlotSelected = (date: string, startTime: string) =>
    selectedSlots.some((s: SlotObj) => s.date === date && s.startTime === startTime);

  const removeSlot = (index: number) =>
    setSelectedSlots((prev) => prev.filter((_, i: number) => i !== index));

  const handleSend = async () => {
    if (sendingRef.current || selectedSlots.length === 0) return;
    sendingRef.current = true;
    const ok = await sendRequest({
      mentorId: mentor.user._id,
      message,
      selectedSlots: selectedSlots.map(({ day, date, startTime, endTime }: SlotObj) => ({
        day,
        date,
        startTime,
        endTime,
      })),
    });
    sendingRef.current = false;
    if (ok) setShowSuccess(true);
  };

  const handleClose = () => {
    unlockAll();
    onClose();
  };

  const handleBackToDashboard = () => {
    reset();
    setShowSuccess(false);
    onClose();
  };

  const totalAvailable = groupedSlots.reduce(
    (acc, g) => acc + (g.slots?.filter((s) => !s.isBooked).length ?? 0),
    0,
  );
  const availableGroups = groupedSlots.filter((g) =>
    g.slots?.some((s) => !s.isBooked),
  );
  const activeGroup = availableGroups[activeDayIndex] || null;
  const activeFreeSlots = activeGroup
    ? activeGroup.slots?.filter((s) => !s.isBooked) ?? []
    : [];
  const selectedCountForDay = (date: string) =>
    selectedSlots.filter((s) => s.date === date).length;

  return {
    MAX_SLOTS,
    // profile fields
    user,
    currentRole,
    company,
    industry,
    bio,
    hourlyRate,
    avgRating,
    reviewCount,
    yearsOfExperience,
    profilePicture,
    location,
    badges,
    initials,
    imgError,
    setImgError,
    // slot/duration state
    availableDurations,
    selectedDuration,
    setSelectedDuration,
    groupedSlots,
    fetchingSlots,
    slotsError,
    selectedSlots,
    setSelectedSlots,
    activeDayIndex,
    setActiveDayIndex,
    totalAvailable,
    availableGroups,
    activeGroup,
    activeFreeSlots,
    selectedCountForDay,
    isSlotSelected,
    toggleSlot,
    removeSlot,
    // message
    message,
    setMessage,
    // send/lock state
    sending,
    error,
    lockError,
    handleSend,
    handleClose,
    handleBackToDashboard,
    // success view
    showSuccess,
  };
}

export default useMentorProfileModalPresenter;
