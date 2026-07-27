const CACHE_NAME = 'mnmknk-v7';
const API_CACHE_NAME = 'mnmknk-api-v2';
const APP_SHELL_CACHE = [
  '/',
  '/manifest.json',
  '/business-manifest.json',
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

async function apiCacheFirst(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    // Background refresh
    fetch(request).then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {});
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return cached error response or fallback
    const errorResponse = new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Offline', 
        message: 'لا يوجد اتصال بالإنترنت. البيانات المعروضة قد تكون قديمة.' 
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
    return errorResponse;
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
    const url = new URL(request.url);

    // Non-GET API requests: try network, store for background sync on failure
    if (request.method !== 'GET' && isApiRequest(url)) {
      event.respondWith((async () => {
        try {
          return await fetch(request);
        } catch {
          // Store failed request for background sync retry
          await storeFailedRequest(request);
          // Register background sync if supported
          try {
            if (self.registration && 'sync' in self.registration) {
              await self.registration.sync.register('retry-failed-requests');
            }
          } catch {
          }
          return new Response(
            JSON.stringify({ success: false, error: 'Offline', message: 'سيتم إعادة المحاولة تلقائياً عند عودة الاتصال' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } },
          );
        }
      })());
      return;
    }

    if (request.method !== 'GET') return;
    
    // Handle API requests with cache-first strategy
    if (isApiRequest(url)) {
      event.respondWith(apiCacheFirst(request));
      return;
    }
    
    if (url.origin !== self.location.origin && request.mode !== 'navigate') return;

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
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
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

      // Register periodic background sync if supported
      try {
        if (self.registration && 'periodicSync' in self.registration) {
          await self.registration.periodicSync.register('refresh-content', {
            minInterval: 12 * 60 * 60 * 1000, // 12 hours
          });
        }
      } catch {
      }
    })());
  });

  // ========== Background Sync ==========
  self.addEventListener('sync', (event) => {
    if (event.tag === 'retry-failed-requests') {
      event.waitUntil(retryFailedRequests());
    }
  });

  // ========== Periodic Background Sync ==========
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'refresh-content') {
      event.waitUntil(refreshContent());
    }
  });

  // Store failed requests for background sync retry
  const FAILED_REQUESTS_DB = 'failed-requests';
  const FAILED_REQUESTS_STORE = 'requests';

  async function openFailedRequestsDB() {
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(FAILED_REQUESTS_DB, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(FAILED_REQUESTS_STORE)) {
            db.createObjectStore(FAILED_REQUESTS_STORE, { keyPath: 'id', autoIncrement: true });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  async function storeFailedRequest(request) {
    try {
      const body = await request.clone().text();
      const db = await openFailedRequestsDB();
      const tx = db.transaction(FAILED_REQUESTS_STORE, 'readwrite');
      tx.objectStore(FAILED_REQUESTS_STORE).add({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: body || null,
        timestamp: Date.now(),
      });
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
    }
  }

  async function retryFailedRequests() {
    try {
      const db = await openFailedRequestsDB();
      const tx = db.transaction(FAILED_REQUESTS_STORE, 'readwrite');
      const store = tx.objectStore(FAILED_REQUESTS_STORE);
      const allReq = store.getAll();
      return new Promise((resolve) => {
        allReq.onsuccess = async () => {
          const failed = allReq.result || [];
          const toDelete = [];
          for (const item of failed) {
            try {
              const fetchOpts = {
                method: item.method,
                headers: item.headers,
              };
              if (item.body && item.method !== 'GET') {
                fetchOpts.body = item.body;
              }
              const resp = await fetch(item.url, fetchOpts);
              if (resp && resp.ok) {
                toDelete.push(item.id);
              }
            } catch {
            }
          }
          // Delete successfully retried requests
          for (const id of toDelete) {
            store.delete(id);
          }
          resolve();
        };
        allReq.onerror = () => resolve();
      });
    } catch {
    }
  }

  async function refreshContent() {
    try {
      const cache = await caches.open(CACHE_NAME);
      const apiCache = await caches.open(API_CACHE_NAME);
      // Refresh app shell
      await Promise.all(
        APP_SHELL_CACHE.map(async (url) => {
          try {
            const resp = await fetch(url);
            if (resp && resp.ok) {
              await cache.put(url, resp.clone());
            }
          } catch {
          }
        }),
      );
      // Notify clients that content has been refreshed
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.postMessage({ type: 'CONTENT_REFRESHED', timestamp: Date.now() });
      }
    } catch {
    }
  }
}
