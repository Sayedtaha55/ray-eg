const SESSION_KEY = 'ray_cart_sid';

export function getCartSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
  } catch {}
  const sid = `cs_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  try {
    sessionStorage.setItem(SESSION_KEY, sid);
  } catch {}
  return sid;
}
