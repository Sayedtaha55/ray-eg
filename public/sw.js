const CACHE_NAME = 'mnmknk-v1';
const urlsToCache = [
  '/',
  '/shops',
  '/restaurants',
  '/map',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/brand/logo.png'
];

const DEV_HOST = (() => {
  try {
    const host = String(self?.location?.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
})();

if (DEV_HOST) {
  self.addEventListener('install', event => {
    self.skipWaiting();
  });

  self.addEventListener('activate', event => {
    event.waitUntil((async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
      }
      try {
        await self.registration.unregister();
      } catch {
      }
      try {
        const clients = await self.clients.matchAll({ type: 'window' });
        await Promise.all(clients.map((c) => c.navigate(c.url)));
      } catch {
      }
    })());
  });

  self.addEventListener('fetch', event => {
    return;
  });
} else {

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
}
