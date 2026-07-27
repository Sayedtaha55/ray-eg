export function parseOptionalNumber(value: any): number | undefined {
  if (value == null) return undefined;
  const n = Number(String(value));
  return Number.isFinite(n) ? n : undefined;
}

export function normalizeBookingStatus(status?: string): string {
  const s = String(status || '').trim().toUpperCase();
  if (s === 'COMPLETED') return 'COMPLETED';
  if (s === 'CANCELLED' || s === 'CANCELED' || s === 'EXPIRED') return 'CANCELLED';
  if (s === 'CONFIRMED') return 'CONFIRMED';
  return 'PENDING';
}

export function getPagination(paging?: { page?: number; limit?: number }) {
  const page = typeof paging?.page === 'number' ? paging.page : undefined;
  const limit = typeof paging?.limit === 'number' ? paging.limit : undefined;
  if (page == null && limit == null) return null;

  const safeLimitRaw = limit == null ? 20 : limit;
  const safeLimit = Math.min(Math.max(Math.floor(safeLimitRaw), 1), 100);
  const safePage = Math.max(Math.floor(page == null ? 1 : page), 1);
  const skip = (safePage - 1) * safeLimit;

  return { take: safeLimit, skip };
}
