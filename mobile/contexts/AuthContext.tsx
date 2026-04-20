import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { isAuthenticated, getUser, clearSession, saveUser, saveTokens } from '@/services/authStorage';
import { ApiService } from '@/services/api';

type AuthState = {
  isReady: boolean;
  isLoggedIn: boolean;
  user: any | null;
  shop: any | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshShop: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isReady: false,
    isLoggedIn: false,
    user: null,
    shop: null,
  });

  const loadAuth = useCallback(async () => {
    let loggedIn = false;
    let user = null;
    let shop = null;
    try {
      loggedIn = await isAuthenticated();
      user = loggedIn ? await getUser() : null;
      if (loggedIn && user?.role === 'merchant') {
        try { shop = await ApiService.getMyShop(); } catch {}
      }
    } catch {}
    setState({ isReady: true, isLoggedIn: loggedIn, user, shop });
  }, []);

  useEffect(() => { loadAuth(); }, [loadAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await ApiService.login(email, password);
    if (data?.session?.access_token) {
      await saveTokens(data.session.access_token, data.session.refresh_token);
    }
    if (data?.user) {
      await saveUser(data.user);
    }
    let shop = null;
    if (data?.user?.role === 'merchant') {
      try { shop = await ApiService.getMyShop(); } catch {}
    }
    setState({ isReady: true, isLoggedIn: true, user: data?.user, shop });
  }, []);

  const logout = useCallback(async () => {
    await ApiService.logout();
    await clearSession();
    setState({ isReady: true, isLoggedIn: false, user: null, shop: null });
  }, []);

  const refreshShop = useCallback(async () => {
    try {
      const shop = await ApiService.getMyShop();
      setState(s => ({ ...s, shop }));
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshShop }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
