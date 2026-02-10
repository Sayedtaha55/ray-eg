import { toBackendUrl } from '@/services/api/httpClient';

export function resolveBackendMediaUrl(url: any) {
  const raw = typeof url === 'string' ? url.trim() : String(url ?? '').trim();
  return toBackendUrl(raw);
}
