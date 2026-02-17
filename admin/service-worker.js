/*
 * NLO admin disables service worker caching to avoid stale UI assets during local development.
 */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => {
        clients.forEach((client) => {
          try {
            client.navigate(client.url);
          } catch (_e) {
            // ignore navigation errors during unregister
          }
        });
      })
  );
});

self.addEventListener('fetch', () => {
  // no-op: SW caching is intentionally disabled
});
