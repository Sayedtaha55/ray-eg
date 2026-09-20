/**
 * مفاتيح جلسة اللوحة — مفصولة تماماً عن الماركت.
 * الماركت والداشبورد كانوا بيشاركوا نفس مفاتيح localStorage (ray_token/token)
 * فكل تسجيل دخول في تطبيق كان بيطرد الجلسة في التاني. دلوقتي كل تطبيق له
 * مفتاحه الخاص، والمفاتيح القديمة تُقرأ مرة واحدة للترحيل ثم تُمسح عند أول كتابة.
 */
export const TOKEN_KEY = 'ray_dashboard_token';
export const USER_KEY = 'ray_dashboard_user';

/** مفاتيح قديمة كانت مشتركة بين التطبيقين */
const LEGACY_TOKEN_KEYS = ['ray_token', 'token'] as const;
const LEGACY_USER_KEYS = ['ray_user'] as const;

/** يقرأ توكن اللوحة — ويرحّل مرة واحدة من المفاتيح القديمة لو موجودة */
export function readToken(): string {
  if (typeof window === 'undefined') return '';
  const scoped = localStorage.getItem(TOKEN_KEY);
  if (scoped) return scoped;
  for (const key of LEGACY_TOKEN_KEYS) {
    const legacy = localStorage.getItem(key);
    if (legacy) {
      localStorage.setItem(TOKEN_KEY, legacy);
      return legacy;
    }
  }
  return '';
}

/** يكتب توكن اللوحة — ويمسح المفاتيح القديمة المشتركة نهائياً */
export function writeToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  for (const key of LEGACY_TOKEN_KEYS) localStorage.removeItem(key);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  for (const key of LEGACY_TOKEN_KEYS) localStorage.removeItem(key);
}

/** يقرأ مستخدم اللوحة المخزّن (JSON نصي) — مع ترحيل من المفتاح القديم */
export function readUserJSON(): string | null {
  if (typeof window === 'undefined') return null;
  const scoped = localStorage.getItem(USER_KEY);
  if (scoped) return scoped;
  for (const key of LEGACY_USER_KEYS) {
    const legacy = localStorage.getItem(key);
    if (legacy) {
      localStorage.setItem(USER_KEY, legacy);
      return legacy;
    }
  }
  return null;
}

export function writeUserJSON(json: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, json);
  for (const key of LEGACY_USER_KEYS) localStorage.removeItem(key);
}

export function clearUserJSON() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  for (const key of LEGACY_USER_KEYS) localStorage.removeItem(key);
}
