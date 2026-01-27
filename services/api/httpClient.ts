const BACKEND_BASE_URL =
  ((import.meta as any)?.env?.VITE_BACKEND_URL as string) ||
  ((import.meta as any)?.env?.VITE_API_URL as string) ||
  `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4000`;

export class BackendRequestError extends Error {
  status?: number;
  path?: string;

  constructor(message: string, opts?: { status?: number; path?: string }) {
    super(message);
    this.name = 'BackendRequestError';
    this.status = opts?.status;
    this.path = opts?.path;
  }
}

const backendAvailability = {
  downUntil: 0,
  failures: 0,
};

const disabledBackendPathPrefixes = new Set<string>();

function isBackendTemporarilyDown() {
  return Date.now() < backendAvailability.downUntil;
}

function emitBackendStatus(detail: { status: 'up' | 'down'; downUntil: number; failures: number; lastPath?: string }) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('ray-backend-status', { detail }));
  } catch {
  }
}

function markBackendFailure(path?: string) {
  backendAvailability.failures += 1;
  const backoffMs = Math.min(60_000, 1500 * Math.pow(2, Math.max(0, backendAvailability.failures - 1)));
  backendAvailability.downUntil = Date.now() + backoffMs;
  emitBackendStatus({
    status: 'down',
    downUntil: backendAvailability.downUntil,
    failures: backendAvailability.failures,
    lastPath: path,
  });
}

function markBackendSuccess(path?: string) {
  backendAvailability.failures = 0;
  backendAvailability.downUntil = 0;
  emitBackendStatus({ status: 'up', downUntil: 0, failures: 0, lastPath: path });
}

if (typeof window !== 'undefined') {
  try {
    const w = window as any;
    if (!w.__ray_backend_retry_listener_added) {
      w.__ray_backend_retry_listener_added = true;
      window.addEventListener('ray-backend-retry', () => {
        backendAvailability.failures = 0;
        backendAvailability.downUntil = 0;
        emitBackendStatus({ status: 'up', downUntil: 0, failures: 0 });
      });
    }
  } catch {
  }
}

function isPathPrefixDisabled(path: string) {
  for (const prefix of disabledBackendPathPrefixes) {
    if (path.startsWith(prefix)) return true;
  }
  return false;
}

export function disablePathPrefix(prefix: string) {
  disabledBackendPathPrefixes.add(prefix);
}

export function toBackendUrl(url: string) {
  if (!url) return url;
  return url.startsWith('/') ? `${BACKEND_BASE_URL}${url}` : url;
}

function getAuthToken() {
  try {
    return localStorage.getItem('ray_token') || '';
  } catch {
    return '';
  }
}

function isAuthPublicEndpoint(path: string) {
  const p = String(path || '');
  return p.startsWith('/api/v1/auth/login') || p.startsWith('/api/v1/auth/signup');
}

function handleUnauthorized(path: string, token: string) {
  if (!token || isAuthPublicEndpoint(path)) return false;
  try {
    localStorage.removeItem('ray_token');
    localStorage.removeItem('ray_user');
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  return true;
}

export async function backendPost<T>(path: string, body: any): Promise<T> {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isFormData ? body : JSON.stringify(body),
    });
  } catch {
    markBackendFailure(path);
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      // ignore
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}

export async function backendDelete<T>(path: string): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    markBackendFailure(path);
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      // ignore
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}

export async function backendGet<T>(path: string): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    markBackendFailure(path);
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      // ignore
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}

export async function backendPatch<T>(path: string, body: any): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    markBackendFailure(path);
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      // ignore
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}

export async function backendPut<T>(path: string, body: any): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    markBackendFailure(path);
    throw new BackendRequestError(`تعذر الاتصال بالسيرفر. تأكد أن الباك إند شغال على ${BACKEND_BASE_URL}`, { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      // ignore
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}
