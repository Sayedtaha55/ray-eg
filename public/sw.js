const CACHE_NAME = 'mnmknk-v5';
const APP_SHELL_CACHE = [
  '/',
  '/manifest.json',
  '/courier-manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/brand/logo.png',
  '/offline.html'
];

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizePushPayload(payload) {
  const p = payload && typeof payload === 'object' ? payload : {};
  const title = String(p.title || p.notification?.title || 'إشعار جديد').trim() || 'إشعار جديد';
  const body = String(p.body || p.message || p.notification?.body || '').trim();
  const url = String(p.url || p.data?.url || p.notification?.data?.url || '/business/dashboard').trim() || '/business/dashboard';
  const tag = String(p.tag || p.notification?.tag || '').trim();
  return { title, body, url, tag };
}

async function showPushNotification(payload) {
  try {
    const { title, body, url, tag } = normalizePushPayload(payload);
    await self.registration.showNotification(title, {
      body,
      icon: '/favicon-32x32.png',
      badge: '/favicon-32x32.png',
      ...(tag ? { tag } : {}),
      data: { url },
    });
  } catch {
  }
}

async function focusOrOpenUrl(url) {
  try {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      try {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin) {
          await client.focus();
          try {
            await client.navigate(url);
          } catch {
          }
          return;
        }
      } catch {
      }
    }
    await self.clients.openWindow(url);
  } catch {
  }
}

function isLocalDevHost() {
  try {
    const host = String(self?.location?.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

function isApiRequest(requestUrl) {
  return requestUrl.pathname.startsWith('/api/') || requestUrl.hostname === 'api.mnmknk.com';
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    /\.(?:css|js|mjs|woff2?|ttf|png|jpg|jpeg|webp|avif|svg|gif|ico)$/i.test(url.pathname)
  );
}

async function networkFirst(request, fallbackUrl = '/offline.html') {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return (await caches.match(fallbackUrl)) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
}

if (isLocalDevHost()) {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
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
    })());
  });
} else {
  self.addEventListener('push', (event) => {
    event.waitUntil((async () => {
      let payload = null;
      try {
        if (event?.data) {
          try {
            payload = event.data.json();
          } catch {
            const text = event.data.text();
            payload = safeParseJson(text) || { body: text };
          }
        }
      } catch {
      }
      await showPushNotification(payload);
    })());
  });

  self.addEventListener('notificationclick', (event) => {
    event.waitUntil((async () => {
      try {
        event.notification?.close?.();
      } catch {
      }
      const url = String(event?.notification?.data?.url || '/business/dashboard');
      await focusOrOpenUrl(url);
    })());
  });

  self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_CACHE)));
  });

  self.addEventListener('message', (event) => {
    if (event?.data?.type === 'SKIP_WAITING') {
      try {
        self.skipWaiting();
      } catch {
      }
    }
  });

  self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin && request.mode !== 'navigate') return;
    if (isApiRequest(url)) return;

    const isNavigation = request.mode === 'navigate' || request.destination === 'document';
    if (isNavigation) {
      event.respondWith(networkFirst(request));
      return;
    }

    if (isStaticAsset(request)) {
      event.respondWith(staleWhileRevalidate(request));
    }
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return Promise.resolve(false);
          }),
        );
      } catch {
      }

      try {
        await self.clients.claim();
      } catch {
      }
    })());
  });
}
