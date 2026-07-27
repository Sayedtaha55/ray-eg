import { ApiService } from './api.service';

const AUTH_CHANNEL_NAME = 'ray-auth';
const AUTH_SYNC_KEY = 'ray_auth_sync';
const USER_KEY = 'ray_user';
const TOKEN_KEY = 'ray_token';
const MERCHANT_CONTEXT_KEY = 'ray_merchant_context';

export type MerchantSessionContext = {
  shopId?: string;
  status?: string;
  preferredRoute?: string;
  lastValidatedAt?: number;
};

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getStoredUser<T = any>(): T | null {
  try {
    return safeJsonParse<T>(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function getStoredToken(): string {
  try {
    return String(localStorage.getItem(TOKEN_KEY) || '');
  } catch {
    return '';
  }
}

export function getStoredMerchantContext(): MerchantSessionContext | null {
  try {
    return safeJsonParse<MerchantSessionContext>(localStorage.getItem(MERCHANT_CONTEXT_KEY));
  } catch {
    return null;
  }
}

export function persistMerchantContext(context?: MerchantSessionContext | null) {
  try {
    if (!context) {
      localStorage.removeItem(MERCHANT_CONTEXT_KEY);
      return;
    }

    const status = String(context.status || '').trim().toLowerCase();
    const preferredRoute = status === 'approved' ? '/business/dashboard' : '/business/pending';
    localStorage.setItem(
      MERCHANT_CONTEXT_KEY,
      JSON.stringify({
        ...context,
        status,
        preferredRoute,
        lastValidatedAt: typeof context.lastValidatedAt === 'number' ? context.lastValidatedAt : Date.now(),
      }),
    );
  } catch {
  }
}

export async function syncMerchantContextFromBackend(user?: any) {
  const role = String(user?.role || '').trim().toLowerCase();
  if (role !== 'merchant') {
    persistMerchantContext(null);
    return null;
  }

  try {
    const shop = await ApiService.getMyShop();
    const status = String(shop?.status || '').trim().toLowerCase() || 'pending';
    const context: MerchantSessionContext = {
      shopId: shop?.id ? String(shop.id) : undefined,
      status,
      preferredRoute: status === 'approved' ? '/business/dashboard' : '/business/pending',
      lastValidatedAt: Date.now(),
    };
    persistMerchantContext(context);
    return context;
  } catch (error: any) {
    const status = typeof error?.status === 'number' ? error.status : undefined;
    if (status === 403) {
      const context: MerchantSessionContext = {
        status: 'pending',
        preferredRoute: '/business/pending',
        lastValidatedAt: Date.now(),
      };
      persistMerchantContext(context);
      return context;
    }
    return getStoredMerchantContext();
  }
}

export async function resolveMerchantLandingPath(user?: any) {
  const role = String(user?.role || '').trim().toLowerCase();
  if (role !== 'merchant') return '/';
  const context = (await syncMerchantContextFromBackend(user)) || getStoredMerchantContext();
  return String(context?.preferredRoute || '/business/dashboard');
}

function emitAuthChange(reason: string) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { reason, ts: Date.now() } }));
  } catch {
  }
}

function broadcastAuthPayload(payload: Record<string, any>) {
  try {
    localStorage.setItem(AUTH_SYNC_KEY, JSON.stringify({ ...payload, ts: Date.now() }));
  } catch {
  }

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(AUTH_CHANNEL_NAME);
      bc.postMessage({ ...payload, ts: Date.now() });
      bc.close();
    }
  } catch {
  }
}

export function persistSession(session: { user?: any; accessToken?: string; persistBearer?: boolean }, reason = 'login') {
  try {
    if (session?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    }
    if (session?.accessToken) {
      localStorage.setItem(TOKEN_KEY, String(session?.accessToken || ''));
    }
  } catch {
  }

  broadcastAuthPayload({ type: 'set', reason, user: session?.user || null });
  emitAuthChange(reason);
}

export function clearSession(reason = 'logout') {
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MERCHANT_CONTEXT_KEY);
  } catch {
  }

  broadcastAuthPayload({ type: 'clear', reason });
  emitAuthChange(reason);
}

let authSyncStarted = false;

export function startAuthSync() {
  if (typeof window === 'undefined' || authSyncStarted) return;
  authSyncStarted = true;

  window.addEventListener('storage', (event) => {
    if (event.key === USER_KEY || event.key === TOKEN_KEY || event.key === AUTH_SYNC_KEY) {
      emitAuthChange('storage-sync');
    }
  });

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(AUTH_CHANNEL_NAME);
      bc.addEventListener('message', () => emitAuthChange('broadcast-sync'));
    }
  } catch {
  }
}

let bootstrapPromise: Promise<any> | null = null;

export async function bootstrapSessionFromBackend(opts?: { force?: boolean; persistBearer?: boolean }) {
  const storedUser = getStoredUser();
  const hasUser = Boolean(storedUser);
  if (!opts?.force && hasUser) return storedUser;
  if (bootstrapPromise && !opts?.force) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const response = await ApiService.session();
      persistSession(
        {
          user: response?.user,
          accessToken: response?.session?.access_token,
          persistBearer: Boolean(opts?.persistBearer),
        },
        'session-bootstrap',
      );
      await syncMerchantContextFromBackend(response?.user);
      return response?.user || null;
    } catch (error: any) {
      const status = typeof error?.status === 'number' ? error.status : undefined;
      if (status === 401) {
        clearSession(opts?.force ? 'session-bootstrap-unauthorized-force' : 'session-bootstrap-unauthorized');
        return null;
      }

      if (opts?.force) {
        // Do not clear local session on transient errors; keep UX stable.
        return storedUser || null;
      }

      return storedUser || null;
    } finally {
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
}
