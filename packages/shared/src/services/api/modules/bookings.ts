import { BackendRequestError, backendGet, backendPatch, backendPost, disablePathPrefix } from '../httpClient';

const getLocalBookings = (): any[] => {
  try {
    const raw = localStorage.getItem('ray_local_bookings');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveLocalBookings = (list: any[]) => {
  try {
    localStorage.setItem('ray_local_bookings', JSON.stringify(list));
  } catch {}
};

export async function getBookingsViaBackend(shopId?: string) {
  let backendData: any[] = [];
  try {
    if (shopId) {
      backendData = await backendGet<any[]>(`/api/v1/bookings?shopId=${encodeURIComponent(shopId)}`);
    } else {
      backendData = await backendGet<any[]>('/api/v1/bookings/me');
    }
  } catch (e) {
    const status = typeof (e as any)?.status === 'number' ? (e as any).status : undefined;
    const name = String((e as any)?.name || '');
    if ((e instanceof BackendRequestError || name === 'BackendRequestError') && status === 404) {
      disablePathPrefix('/api/v1/bookings');
    }
  }

  const localData = getLocalBookings();
  const filteredLocal = shopId
    ? localData.filter((b) => String(b.shopId) === String(shopId))
    : localData;

  const seenIds = new Set(backendData.map((b) => String(b.id)));
  const merged = [...backendData];
  for (const b of filteredLocal) {
    if (!seenIds.has(String(b.id))) {
      seenIds.add(String(b.id));
      merged.push(b);
    }
  }

  return merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export async function addBookingViaBackend(booking: any) {
  const newBooking = {
    id: booking.id || `booking-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    itemId: booking.itemId,
    itemName: booking.itemName,
    itemImage: booking.itemImage,
    itemPrice: booking.itemPrice ?? 300,
    shopId: booking.shopId,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail || '',
    bookingDate: booking.bookingDate || new Date().toISOString().split('T')[0],
    bookingTime: booking.bookingTime || '10:00',
    status: booking.status || 'PENDING',
    createdAt: booking.createdAt || new Date().toISOString(),
    __recordType: 'booking',
    bookingActivityType: booking.bookingActivityType ?? booking.metadata?.bookingActivityType,
    bookingActivityRoute: booking.bookingActivityRoute ?? booking.metadata?.bookingActivityRoute,
    metadata: booking.metadata,
    addons: booking.addons,
    variantSelection: booking.variantSelection ?? booking.variant_selection,
  };

  try {
    return await backendPost<any>('/api/v1/bookings', newBooking);
  } catch (e) {
    const current = getLocalBookings();
    current.push({ ...newBooking, __recordType: 'booking' });
    saveLocalBookings(current);
    return { ...newBooking, __recordType: 'booking' };
  }
}

export async function updateBookingStatusViaBackend(id: string, status: string) {
  const current = getLocalBookings();
  const idx = current.findIndex((b) => String(b.id) === String(id));
  if (idx !== -1) {
    current[idx].status = status.toUpperCase();
    saveLocalBookings(current);
  }

  try {
    return await backendPatch<any>(`/api/v1/bookings/${encodeURIComponent(id)}/status`, { status });
  } catch (e) {
    return { id, status };
  }
}

