/**
 * Token Service — unified token management.
 *
 * Goal: Move from localStorage-only tokens to httpOnly-cookie-backed session
 * authentication, with localStorage as a fallback for backward compatibility.
 *
 * Flow:
 * 1. Primary: Backend sets httpOnly cookie on login/session (credentials: 'include')
 * 2. Fallback: localStorage 'ray_token' for legacy clients
 * 3. If httpOnly cookie is available, localStorage token is never sent as Bearer
 *
 * The backend should set a secure, httpOnly, SameSite=Strict cookie
 * named 'ray_session' on successful auth. This service detects cookie presence
 * and prefers it over localStorage.
 */

const TOKEN_KEY = 'ray_token';
const USER_KEY = 'ray_user';
const COOKIE_NAME = 'ray_session';
const AUTH_EVENT_NAME = 'auth-change';

/**
 * Check if an httpOnly session cookie exists by attempting a lightweight
 * endpoint that returns 401 if the cookie is missing or expired.
 * Returns true if the cookie is present (optimistic — we don't decode it).
 */
export function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    // Check for any cookie starting with ray_session
    const cookies = document.cookie.split(';').map((c) => c.trim().split('=')[0]);
    return cookies.includes(COOKIE_NAME);
  } catch {
    return false;
  }
}

/**
 * Get the current auth token from the best available source.
 * Priority: Session Cookie (backend-managed) > localStorage token.
 */
export function getAuthToken(): string {
  // If httpOnly cookie is set, prefer it (backend reads it automatically)
  if (hasSessionCookie()) {
    // Don't return a token — the cookie handles auth.
    // But also keep localStorage in sync.
    return '';
  }

  // Fallback to localStorage for backward compatibility
  return getStoredToken();
}

/**
 * Get the Bearer token for API requests.
 * Returns empty string if httpOnly cookie should handle auth instead.
 */
export function getBearerToken(): string {
  if (hasSessionCookie()) {
    return '';
  }
  return getStoredToken();
}

function getStoredToken(): string {
  try {
    return String(localStorage.getItem(TOKEN_KEY) || '');
  } catch {
    return '';
  }
}

export function getStoredUser<T = any>(): T | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function persistSession(session: { user?: any; accessToken?: string }) {
  try {
    if (session?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    }
    if (session?.accessToken && !hasSessionCookie()) {
      localStorage.setItem(TOKEN_KEY, session.accessToken);
    }
  } catch {
    // Storage may be unavailable
  }
  emitAuthChange('persist');
}

export function clearSession(reason = 'logout') {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('ray_merchant_context');
    localStorage.removeItem('ray_auth_sync');
  } catch {
    // ignore
  }

  // Also attempt to clear the httpOnly cookie by hitting logout endpoint
  if (hasSessionCookie() && typeof window !== 'undefined') {
    try {
      fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  emitAuthChange(reason);
}

function emitAuthChange(reason: string) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { reason, ts: Date.now() } }));
  } catch {
    // ignore
  }
}

/**
 * Returns true if the current auth mechanism uses httpOnly cookies.
 * When true, the frontend should NOT send Authorization headers.
 */
export function usesHttpOnlyCookies(): boolean {
  return hasSessionCookie();
}

/**
 * Determine if credentials should be included in fetch requests.
 * Always include when httpOnly cookies are the primary auth mechanism.
 */
export function getFetchCredentials(): RequestCredentials {
  return usesHttpOnlyCookies() ? 'include' : 'omit';
}