import { backendGet, backendPatch } from '../httpClient';

export type NotificationSubscription = {
  unsubscribe: () => void;
};

export function subscribeToNotificationsViaBackend(
  shopId: string,
  callback: (payload: any) => void,
): NotificationSubscription {
  let stopped = false;
  let lastId: string | null = null;

  const poll = async () => {
    if (stopped) return;
    const sid = String(shopId || '').trim();
    if (!sid) return;
    try {
      const data = await backendGet<any[]>(`/api/v1/notifications/shop/${encodeURIComponent(sid)}?take=1`);
      const first = Array.isArray(data) && data.length > 0 ? data[0] : null;
      const id = first?.id ? String(first.id) : null;
      if (id && id !== lastId) {
        lastId = id;
        callback({
          ...first,
          is_read: Boolean(first?.isRead ?? first?.is_read),
          created_at: first?.createdAt || first?.created_at,
          message: first?.content || first?.message,
        });
      }
    } catch {
      // ignore
    }
  };

  const timer = setInterval(() => {
    poll();
  }, 5000);

  poll();

  return {
    unsubscribe: () => {
      stopped = true;
      clearInterval(timer);
    },
  };
}

export async function getShopNotificationsViaBackend(shopId: string) {
  const sid = String(shopId || '').trim();
  if (!sid) return [];
  const data = await backendGet<any[]>(`/api/v1/notifications/shop/${encodeURIComponent(sid)}?take=50`);
  return (data || []).map((n: any) => ({
    ...n,
    is_read: Boolean(n?.isRead ?? n?.is_read),
    created_at: n?.createdAt || n?.created_at,
    message: n?.content || n?.message,
  }));
}

export async function markShopNotificationsReadViaBackend(shopId: string) {
  const sid = String(shopId || '').trim();
  if (!sid) return { ok: true } as any;
  return await backendPatch<any>(`/api/v1/notifications/shop/${encodeURIComponent(sid)}/read`, {});
}

export async function markShopNotificationReadViaBackend(shopId: string, id: string) {
  const sid = String(shopId || '').trim();
  const nid = String(id || '').trim();
  if (!sid || !nid) return { ok: true } as any;
  return await backendPatch<any>(
    `/api/v1/notifications/shop/${encodeURIComponent(sid)}/${encodeURIComponent(nid)}/read`,
    {},
  );
}

export async function getMyNotificationsViaBackend(opts?: { take?: number; skip?: number }) {
  const params = new URLSearchParams();
  if (typeof opts?.take === 'number') params.set('take', String(opts.take));
  if (typeof opts?.skip === 'number') params.set('skip', String(opts.skip));
  const qs = params.toString();
  return await backendGet<any[]>(`/api/v1/notifications/me${qs ? `?${qs}` : ''}`);
}

export async function getMyUnreadNotificationsCountViaBackend() {
  return await backendGet<{ count: number }>(`/api/v1/notifications/me/unread-count`);
}

export async function markMyNotificationsReadViaBackend() {
  return await backendPatch<any>(`/api/v1/notifications/me/read`, {});
}

export async function markMyNotificationReadViaBackend(id: string) {
  return await backendPatch<any>(`/api/v1/notifications/me/${encodeURIComponent(id)}/read`, {});
}
