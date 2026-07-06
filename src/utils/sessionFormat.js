export const formatSlotDate = (slot) => {
  if (!slot?.date) return "";
  return new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatSlotTime = (slot) => {
  if (!slot?.startTime || !slot?.endTime) return "";
  const fmt = (t) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };
  return `${fmt(slot.startTime)} – ${fmt(slot.endTime)}`;
};
