import { backendGet, backendPatch, backendPost } from '../httpClient';

export async function getReservationsViaBackend(shopId?: string) {
  if (shopId) {
    return backendGet<any[]>(`/api/v1/reservations?shopId=${encodeURIComponent(shopId)}`);
  }
  return backendGet<any[]>('/api/v1/reservations/me');
}

export async function addReservationViaBackend(reservation: any) {
  return backendPost<any>('/api/v1/reservations', {
    itemId: reservation.itemId,
    itemName: reservation.itemName,
    itemImage: reservation.itemImage,
    itemPrice: reservation.itemPrice,
    shopId: reservation.shopId,
    addons: (reservation as any)?.addons,
    variantSelection: (reservation as any)?.variantSelection ?? (reservation as any)?.variant_selection,
  });
}

export async function updateReservationStatusViaBackend(id: string, status: string) {
  return backendPatch<any>(`/api/v1/reservations/${encodeURIComponent(id)}/status`, { status });
}
