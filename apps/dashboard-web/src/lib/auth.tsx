'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type User = {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  shopId?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

const USER_KEY = 'ray_user';
const TOKEN_KEY = 'ray_token';
const LEGACY_TOKEN_KEY = 'token';

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || '';
}

function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

let refreshInFlight: Promise<string | null> | null = null;

// Silently exchange the ray_session refresh cookie for a fresh access token.
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        const accessToken = data?.data?.token?.accessToken || data?.token?.accessToken;
        if (!accessToken) return null;
        storeToken(accessToken);
        const user = data?.data?.user || data?.user;
        if (user && typeof window !== 'undefined') {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          window.dispatchEvent(new Event('ray-user-refreshed'));
        }
        return accessToken as string;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function apiRequest(path: string, options: RequestInit = {}, _retried = false) {
  const token = getStoredToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = new Headers(options.headers);
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // access token lives only 15 min — on expiry, exchange the refresh cookie
    // silently and retry the original request exactly once
    const msg = String(data?.message || data?.error || '');
    if (res.status === 401 && !_retried && /expired|invalid token|invalid_token/i.test(msg)) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiRequest(path, options, true);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ray-session-expired'));
      }
      throw { status: 401, message: 'انتهت الجلسة، من فضلك سجل الدخول من جديد' };
    }
    throw { status: res.status, message: data?.message || data?.error || 'Request failed' };
  }
  return data?.data !== undefined ? data.data : data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    // Read from localStorage first for instant mount
    const stored = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);

    // Then try to validate with backend in background
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`/api/v1/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : {}),
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json().catch(() => null);
      const fetchedUser = data?.data || data?.user || (data?.id ? data : null);
      if (fetchedUser) {
        setUser(fetchedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(fetchedUser));
      }
    } catch {
      // Backend not reachable — keep localStorage user
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const onSessionExpired = () => {
      clearStoredToken();
      if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
      setUser(null);
    };
    const onUserRefreshed = () => {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
        if (stored) setUser(JSON.parse(stored));
      } catch { /* keep current user */ }
    };
    window.addEventListener('ray-session-expired', onSessionExpired);
    window.addEventListener('ray-user-refreshed', onUserRefreshed);
    return () => {
      window.removeEventListener('ray-session-expired', onSessionExpired);
      window.removeEventListener('ray-user-refreshed', onUserRefreshed);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const user = data?.user || data?.data?.user || {
      id: data?.id,
      email: data?.email,
      name: data?.name,
      role: data?.role,
    };
    const token =
      data?.token?.accessToken ||
      data?.access_token ||
      data?.accessToken ||
      (typeof data?.token === 'string' ? data.token : null) ||
      data?.session?.access_token;
    if (user && user.id) {
      setUser(user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (token) {
        storeToken(token);
      }
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    clearStoredToken();
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { apiRequest };
