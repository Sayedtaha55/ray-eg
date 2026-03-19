import { BackendRequestError, backendGet, backendPatch, backendPost, disablePathPrefix } from '../httpClient';

export async function getBookingsViaBackend(shopId?: string) {
  try {
    if (shopId) {
      return await backendGet<any[]>(`/api/v1/bookings?shopId=${encodeURIComponent(shopId)}`);
    }
    return await backendGet<any[]>('/api/v1/bookings/me');
  } catch (e) {
    const status = typeof (e as any)?.status === 'number' ? (e as any).status : undefined;
    const name = String((e as any)?.name || '');
    if ((e instanceof BackendRequestError || name === 'BackendRequestError') && status === 404) {
      disablePathPrefix('/api/v1/bookings');
    }
    return [];
  }
}

export async function addBookingViaBackend(booking: any) {
  return backendPost<any>('/api/v1/bookings', {
    itemId: booking.itemId,
    itemName: booking.itemName,
    itemImage: booking.itemImage,
    itemPrice: booking.itemPrice,
    shopId: booking.shopId,
    addons: (booking as any)?.addons,
    variantSelection: (booking as any)?.variantSelection ?? (booking as any)?.variant_selection,
  });
}

export async function updateBookingStatusViaBackend(id: string, status: string) {
  return backendPatch<any>(`/api/v1/bookings/${encodeURIComponent(id)}/status`, { status });
}
