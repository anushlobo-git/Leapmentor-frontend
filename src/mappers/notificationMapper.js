const normalizeApiNotif = (notif) => ({
  id: notif._id,
  _id: notif._id,
  type: notif.type,
  read: notif.read,
  time: timeAgo(notif.createdAt),
  accent: notif.type === "upcoming_session" && !notif.read,
  title: notif.title,
  senderName: notif.senderName || "",
  body: notif.message,
  actions: [],
  isApi: true,
  metadata: notif.metadata || {},
});
