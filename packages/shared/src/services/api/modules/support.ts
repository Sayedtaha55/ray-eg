import { backendGet, backendPatch, backendPost, backendDelete } from '../httpClient';

export async function createSupportTicketPublicViaBackend(payload: {
  type?: string;
  subject?: string;
  message?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  shopId?: string;
  orderId?: string;
}) {
  return await backendPost<any>(`/api/v1/support/public`, payload);
}

export async function createSupportTicketViaBackend(payload: {
  type?: string;
  subject?: string;
  message?: string;
  shopId?: string;
  orderId?: string;
}) {
  return await backendPost<any>(`/api/v1/support`, payload);
}

export async function listMySupportTicketsViaBackend(opts?: { take?: number; skip?: number }) {
  const params = new URLSearchParams();
  if (typeof opts?.take === 'number') params.set('take', String(opts.take));
  if (typeof opts?.skip === 'number') params.set('skip', String(opts.skip));
  const qs = params.toString();
  return await backendGet<any[]>(`/api/v1/support/mine${qs ? `?${qs}` : ''}`);
}

export async function listSupportTicketsAdminViaBackend(opts?: {
  take?: number;
  skip?: number;
  status?: string;
  type?: string;
  q?: string;
}) {
  const params = new URLSearchParams();
  if (typeof opts?.take === 'number') params.set('take', String(opts.take));
  if (typeof opts?.skip === 'number') params.set('skip', String(opts.skip));
  if (typeof opts?.status === 'string' && opts.status.trim()) params.set('status', opts.status.trim());
  if (typeof opts?.type === 'string' && opts.type.trim()) params.set('type', opts.type.trim());
  if (typeof opts?.q === 'string' && opts.q.trim()) params.set('q', opts.q.trim());
  const qs = params.toString();
  return await backendGet<{ rows: any[]; total: number }>(`/api/v1/support/admin${qs ? `?${qs}` : ''}`);
}

export async function getSupportStatsAdminViaBackend() {
  return await backendGet<any>(`/api/v1/support/admin/stats`);
}

export async function replySupportTicketAdminViaBackend(id: string, reply: string) {
  return await backendPatch<any>(`/api/v1/support/admin/${encodeURIComponent(id)}/reply`, { reply });
}

export async function updateSupportTicketStatusAdminViaBackend(id: string, status: string) {
  return await backendPatch<any>(`/api/v1/support/admin/${encodeURIComponent(id)}/status`, { status });
}

export async function updateSupportTicketPriorityAdminViaBackend(id: string, priority: string) {
  return await backendPatch<any>(`/api/v1/support/admin/${encodeURIComponent(id)}/priority`, { priority });
}

export async function deleteSupportTicketAdminViaBackend(id: string) {
  return await backendDelete<any>(`/api/v1/support/admin/${encodeURIComponent(id)}`);
}
