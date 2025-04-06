const CACHE_NAME = 'parkease-v9.' + new Date().toISOString();
const urlsToCache = [
  '/app.html',
  '/manifest.json',
  'https://cdn.glitch.global/cbdf53ed-1d1e-441b-8c47-ff223e3a04c8/android-launchericon-192-192.png?v=1741136144106',
  'https://cdn.glitch.global/cbdf53ed-1d1e-441b-8c47-ff223e3a04c8/android-launchericon-512-512.png?v=1741136142113'
];

self.addEventListener('install', (event) => {
  // Skip waiting ensures the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Always fetch fresh from network during development
        return fetch(event.request).catch(() => {
          // Fallback to cache if network fails
          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Immediately take control of all pages
      return self.clients.claim();
    })
  );
});