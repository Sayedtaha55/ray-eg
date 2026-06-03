export type PublicFeedbackItem = {
  id: string;
  text: string;
  type?: string;
  userName?: string | null;
  userEmail?: string | null;
  status?: string;
  createdAt: string;
  source?: 'backend' | 'local';
};

const STORAGE_KEY = 'ray_public_feedback_submissions';

function safeParseList(value: string | null): PublicFeedbackItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: String(item?.id || '').trim(),
        text: String(item?.text || item?.comment || '').trim(),
        type: String(item?.type || '').trim() || undefined,
        userName: item?.userName ? String(item.userName).trim() : null,
        userEmail: item?.userEmail ? String(item.userEmail).trim() : null,
        status: String(item?.status || 'PENDING').trim() || 'PENDING',
        createdAt: String(item?.createdAt || '').trim(),
        source: item?.source === 'backend' ? 'backend' : 'local',
      }))
      .filter((item) => item.id && item.text && item.createdAt);
  } catch {
    return [];
  }
}

export function getLocalPublicFeedback(): PublicFeedbackItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return safeParseList(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveLocalPublicFeedback(item: Omit<PublicFeedbackItem, 'id' | 'createdAt' | 'source'> & { id?: string; createdAt?: string }) {
  if (typeof window === 'undefined') return null;

  const next: PublicFeedbackItem = {
    id: String(item.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    text: String(item.text || '').trim(),
    type: String(item.type || '').trim() || undefined,
    userName: item.userName ? String(item.userName).trim() : null,
    userEmail: item.userEmail ? String(item.userEmail).trim() : null,
    status: String(item.status || 'PENDING').trim() || 'PENDING',
    createdAt: String(item.createdAt || new Date().toISOString()),
    source: 'local',
  };

  if (!next.text) return null;

  try {
    const current = getLocalPublicFeedback();
    const withoutDuplicate = current.filter((existing) => existing.id !== next.id && existing.text !== next.text);
    const merged = [next, ...withoutDuplicate].slice(0, 100);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('ray-public-feedback-updated', { detail: next }));
    return next;
  } catch {
    return null;
  }
}

export function mergePublicFeedback(remote: any[], local: PublicFeedbackItem[]) {
  const normalizedRemote: PublicFeedbackItem[] = (Array.isArray(remote) ? remote : [])
    .map((item) => ({
      id: String(item?.id || '').trim(),
      text: String(item?.text || item?.comment || '').trim(),
      type: String(item?.type || '').trim() || undefined,
      userName: item?.userName ? String(item.userName).trim() : null,
      userEmail: item?.userEmail ? String(item.userEmail).trim() : null,
      status: String(item?.status || 'PENDING').trim() || 'PENDING',
      createdAt: String(item?.createdAt || '').trim(),
      source: 'backend' as const,
    }))
    .filter((item) => item.id && item.text && item.createdAt);

  const seen = new Set<string>();
  return [...normalizedRemote, ...local]
    .filter((item) => {
      const key = `${item.id}|${item.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
