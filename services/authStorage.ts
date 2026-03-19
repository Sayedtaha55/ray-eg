import { ApiService } from '@/services/api.service';

const AUTH_CHANNEL_NAME = 'ray-auth';
const AUTH_SYNC_KEY = 'ray_auth_sync';
const USER_KEY = 'ray_user';
const TOKEN_KEY = 'ray_token';

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
    if (session?.persistBearer) {
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
  const hasUser = Boolean(getStoredUser());
  if (!opts?.force && hasUser) return getStoredUser();
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
      return response?.user || null;
    } catch {
      if (opts?.force) {
        clearSession('session-bootstrap-failed');
      }
      return null;
    } finally {
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
}
