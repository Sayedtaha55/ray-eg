/**
 * Cross-app URLs for the merchant acquisition app (business).
 *
 * This app hands a brand-new merchant over to the dashboard after signup or
 * login, so a wrong value here drops them on a dead origin — the old
 * `|| 'http://localhost:3000'` fallback did exactly that in production.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_DASHBOARD_URL when the deployment defines it;
 *   2. localhost while running `next dev`, so local work still targets the
 *      locally running dashboard;
 *   3. the live production dashboard deployment.
 */

/** Strips paste artifacts (BOM, zero-width, RTL marks), newlines and trailing slashes. */
function sanitizeUrl(raw: string | undefined, fallback: string): string {
  const cleaned = (raw || '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g, '')
    .replace(/[\r\n]/g, '')
    .trim()
    .replace(/\/+$/, '');
  return cleaned || fallback;
}

const IS_DEV = process.env.NODE_ENV === 'development';

/** Live dashboard-web deployment reachable from the browser. */
export const DASHBOARD_URL = sanitizeUrl(
  process.env.NEXT_PUBLIC_DASHBOARD_URL,
  IS_DEV ? 'http://localhost:3000' : 'https://dashboard-web-three-kappa.vercel.app'
);

/** Dashboard route that owns the merchant workspace. */
export const DASHBOARD_APP_PATH = '/dashboard';

/**
 * Builds the dashboard auth-callback URL that bootstraps the merchant session
 * (the access token travels in the query string, exactly as dashboard-web's
 * /auth/callback expects). An explicit returnTo always wins.
 */
export function dashboardAuthCallbackUrl(params: {
  accessToken?: string | null;
  user?: unknown;
  returnTo?: string | null;
}): string {
  const returnTo = (params.returnTo || '').trim();
  if (returnTo) return returnTo;

  const query = new URLSearchParams();
  if (params.accessToken) query.set('token', params.accessToken);
  if (params.user) query.set('user', JSON.stringify(params.user));
  const qs = query.toString();
  return `${DASHBOARD_URL}/auth/callback${qs ? `?${qs}` : ''}`;
}
