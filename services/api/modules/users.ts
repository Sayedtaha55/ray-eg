import { backendGet, backendPatch, backendPost } from '../httpClient';

export function getAllUsersViaMock(mockDb: any) {
  return mockDb.getAllUsers();
}

export function deleteUserViaMock(mockDb: any, id: string) {
  return mockDb.deleteUser(id);
}

export function updateUserRoleViaMock(mockDb: any, userId: string, role: string) {
  return mockDb.updateUserRole(userId, role);
}

export async function getCouriersViaBackend() {
  return await backendGet<any[]>(`/api/v1/users/couriers`);
}

export async function createCourierViaBackend(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}) {
  return await backendPost<any>(`/api/v1/users/couriers`, payload);
}

export async function getPendingCouriersViaBackend() {
  return await backendGet<any[]>(`/api/v1/users/couriers/pending`);
}

export async function approveCourierViaBackend(id: string) {
  return await backendPatch<any>(`/api/v1/users/couriers/${encodeURIComponent(id)}/approve`, {});
}

export async function rejectCourierViaBackend(id: string) {
  return await backendPatch<any>(`/api/v1/users/couriers/${encodeURIComponent(id)}/reject`, {});
}

export async function updateMyProfileViaBackend(payload: { name?: string; phone?: string | null }) {
  return await backendPatch<any>(`/api/v1/users/me`, payload);
}
