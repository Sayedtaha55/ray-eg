/**
 * Admin API helpers – client-side wrappers around /api/v1/admin/*
 * Uses clientFetch which attaches the Bearer token from localStorage.
 */
import { clientFetch } from './client';

/* ── Users ─────────────────────────────────────────── */
export const adminGetUsers = () => clientFetch<any[]>('/v1/admin/users');
export const adminDeleteUser = (id: string) => clientFetch<any>(`/v1/admin/users/${id}`, { method: 'DELETE' });
export const adminUpdateUserRole = (id: string, role: string) =>
  clientFetch<any>(`/v1/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });

/* ── Shops ─────────────────────────────────────────── */
export const adminGetShops = (status?: string) =>
  clientFetch<any[]>(`/v1/admin/shops${status && status !== 'all' ? `?status=${status}` : ''}`);
export const adminGetPendingShops = () => clientFetch<any[]>('/v1/admin/shops/pending');
export const adminGetShopById = (id: string) => clientFetch<any>(`/v1/admin/shops/${id}`);
export const adminUpdateShopStatus = (id: string, status: string) =>
  clientFetch<any>(`/v1/admin/shops/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const adminUpdateShop = (id: string, data: Record<string, unknown>) =>
  clientFetch<any>(`/v1/admin/shops/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

/* ── Orders ─────────────────────────────────────────── */
export const adminGetOrders = () => clientFetch<any[]>('/v1/admin/orders');
export const adminUpdateOrder = (id: string, data: Record<string, unknown>) =>
  clientFetch<any>(`/v1/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const adminAssignCourier = (orderId: string, courierId: string) =>
  clientFetch<any>(`/v1/admin/orders/${orderId}/courier`, { method: 'PATCH', body: JSON.stringify({ courierId }) });
export const adminGetCouriers = () => clientFetch<any[]>('/v1/admin/couriers');

/* ── Approvals ─────────────────────────────────────── */
export const adminGetPendingMapListings = (limit = 100) =>
  clientFetch<any>(`/v1/admin/map-listings/pending?limit=${limit}`);
export const adminApproveMapListing = (id: string) =>
  clientFetch<any>(`/v1/admin/map-listings/${id}/approve`, { method: 'PATCH' });
export const adminRejectMapListing = (id: string, note?: string) =>
  clientFetch<any>(`/v1/admin/map-listings/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ note }) });
export const adminListModuleUpgradeRequests = (params?: { status?: string; take?: number }) =>
  clientFetch<any[]>('/v1/admin/module-upgrade-requests?' + new URLSearchParams(params as Record<string, string>).toString());
export const adminApproveModuleUpgradeRequest = (id: string) =>
  clientFetch<any>(`/v1/admin/module-upgrade-requests/${id}/approve`, { method: 'PATCH' });
export const adminRejectModuleUpgradeRequest = (id: string, data?: { note?: string | null }) =>
  clientFetch<any>(`/v1/admin/module-upgrade-requests/${id}/reject`, { method: 'PATCH', body: JSON.stringify(data) });

/* ── Dashboard / Analytics ──────────────────────────── */
export const adminGetDashboardStats = () => clientFetch<any>('/v1/admin/dashboard/stats');
export const adminGetRecentActivity = () => clientFetch<any[]>('/v1/admin/dashboard/activity');

/* ── Settings ──────────────────────────────────────── */
export const adminUpgradeDashboardConfig = (data: { dryRun: boolean }) =>
  clientFetch<any>('/v1/admin/settings/upgrade-dashboard-config', { method: 'POST', body: JSON.stringify(data) });
