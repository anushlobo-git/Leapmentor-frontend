const logger = {
  info: (...args) => console.info("[SW]", ...args),
  warn: (...args) => console.warn("[SW]", ...args),
  error: (...args) => console.error("[SW]", ...args),
};

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  logger.info("🔔 SW received push", data); // ✅ check if push arrives

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        logger.info("🔔 SW clients found", clientList.length); // ✅ check if tab is detected

        const appOpen = clientList.some((client) =>
          client.url.includes(self.location.origin),
        );
        logger.info("🔔 SW app is open", appOpen); // ✅ check if app detected as open

        if (appOpen) {
          clientList.forEach((client) => {
            if (client.url.includes(self.location.origin)) {
              logger.info("🔔 SW posting message to client", client.url);
              client.postMessage({ type: "SHOW_TOAST", payload: data });
            }
          });
          return;
        }

        return self.registration.showNotification(data.title, {
          body: data.message,
          icon: "/logo.png",
          badge: "/logo.png",
          data: { url: data.url || "/" },
          vibrate: [200, 100, 200],
        });
      })
      .catch((error) => {
        logger.error("🔔 SW push handling failed", error);
      }),
  );
});
