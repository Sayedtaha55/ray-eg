import { backendDelete, backendGet, backendPatch, backendPost } from '../httpClient';

export function getFeedbackViaMock(mockDb: any) {
  return mockDb.getFeedback();
}

export async function saveFeedbackViaMock(_feedbackData: any) {
  return { error: null };
}

export async function listFeedbackAdminViaBackend(opts?: { take?: number; skip?: number; status?: string; q?: string }) {
  const params = new URLSearchParams();
  if (typeof opts?.take === 'number') params.set('take', String(opts.take));
  if (typeof opts?.skip === 'number') params.set('skip', String(opts.skip));
  if (typeof opts?.status === 'string' && opts.status.trim()) params.set('status', String(opts.status).trim());
  if (typeof opts?.q === 'string' && opts.q.trim()) params.set('q', String(opts.q).trim());
  const qs = params.toString();
  return await backendGet<any[]>(`/api/v1/feedback/admin${qs ? `?${qs}` : ''}`);
}

export async function updateFeedbackStatusAdminViaBackend(id: string, status: string) {
  return await backendPatch<any>(`/api/v1/feedback/admin/${encodeURIComponent(id)}/status`, {
    status: String(status || '').trim(),
  });
}

export async function deleteFeedbackAdminViaBackend(id: string) {
  return await backendDelete<any>(`/api/v1/feedback/admin/${encodeURIComponent(id)}`);
}

export async function createFeedbackViaBackend(payload: { text?: string; comment?: string; rating?: number; shopId?: string; productId?: string }) {
  return await backendPost<any>(`/api/v1/feedback/public`, payload);
}
