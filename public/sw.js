self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  console.log("🔔 SW received push:", data); // ✅ check if push arrives

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        console.log("🔔 SW clients found:", clientList.length); // ✅ check if tab is detected

        const appOpen = clientList.some((client) =>
          client.url.includes(self.location.origin),
        );
        console.log("🔔 SW app is open:", appOpen); // ✅ check if app detected as open

        if (appOpen) {
          clientList.forEach((client) => {
            if (client.url.includes(self.location.origin)) {
              console.log("🔔 SW posting message to client:", client.url);
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
      }),
  );
});
