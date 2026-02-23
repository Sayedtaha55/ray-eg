import { BackendRequestError, backendGet, backendPatch, backendPost, disablePathPrefix } from '../httpClient';

export async function getReservationsViaBackend(shopId?: string) {
  try {
    if (shopId) {
      return await backendGet<any[]>(`/api/v1/reservations?shopId=${encodeURIComponent(shopId)}`);
    }
    return await backendGet<any[]>('/api/v1/reservations/me');
  } catch (e) {
    const status = typeof (e as any)?.status === 'number' ? (e as any).status : undefined;
    const name = String((e as any)?.name || '');
    if ((e instanceof BackendRequestError || name === 'BackendRequestError') && status === 404) {
      disablePathPrefix('/api/v1/reservations');
    }
    return [];
  }
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
