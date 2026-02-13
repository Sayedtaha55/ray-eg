import { backendGet, backendPatch, backendPost } from '../httpClient';

export async function listMyInvoicesViaBackend(opts?: { from?: string; to?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (opts?.from) params.set('from', String(opts.from));
  if (opts?.to) params.set('to', String(opts.to));
  if (typeof opts?.page === 'number') params.set('page', String(opts.page));
  if (typeof opts?.limit === 'number') params.set('limit', String(opts.limit));
  const qs = params.toString();
  return await backendGet<{ items: any[]; total: number }>(`/api/v1/invoices/me${qs ? `?${qs}` : ''}`);
}

export async function getMyInvoiceSummaryViaBackend(opts?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (opts?.from) params.set('from', String(opts.from));
  if (opts?.to) params.set('to', String(opts.to));
  const qs = params.toString();
  return await backendGet<any>(`/api/v1/invoices/summary/me${qs ? `?${qs}` : ''}`);
}

export async function getInvoiceByIdViaBackend(id: string) {
  const invoiceId = String(id || '').trim();
  if (!invoiceId) throw new Error('Missing invoice id');
  return await backendGet<any>(`/api/v1/invoices/${encodeURIComponent(invoiceId)}`);
}

export async function createInvoiceViaBackend(payload: any) {
  return await backendPost<any>('/api/v1/invoices', payload);
}

export async function updateInvoiceViaBackend(id: string, payload: any) {
  const invoiceId = String(id || '').trim();
  if (!invoiceId) throw new Error('Missing invoice id');
  return await backendPatch<any>(`/api/v1/invoices/${encodeURIComponent(invoiceId)}`, payload);
}
