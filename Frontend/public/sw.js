// Minimal service worker: no caching, so the app always loads the latest build.
// It exists so the app is installable and so notifications can be shown from it.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {}); // network passthrough

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const w = list.find((c) => 'focus' in c);
      return w ? w.focus() : self.clients.openWindow('/');
    })
  );
});
