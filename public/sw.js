const CACHE_NAME = 'mnmknk-v3';
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('message', (event) => {
  if (event?.data?.type === 'SKIP_WAITING') {
    try {
      self.skipWaiting();
    } catch {
    }
  }
});

// Fetch event
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || (await caches.match('/'));
        }),
    );
    return;
  }

  const url = new URL(event.request.url);
  const isImageAsset = event.request.destination === 'image' ||
                    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|gif)$/i) ||
                    url.pathname.startsWith('/uploads/');

  // Image caching strategy: Cache First, then Network
  if (isImageAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    }),
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      } catch {
      }

      try {
        await self.clients.claim();
      } catch {
      }
    })()
  );
});
}
