import React, { useEffect, useState } from 'react';
import { HashRouter, BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import {
  bootstrapSessionFromBackend,
  getStoredMerchantContext,
  getStoredUser,
  startAuthSync,
} from './services/authStorage';
import RouteSeoManager from './components/seo/RouteSeoManager';
import AppRoutes from './app/AppRoutes';
import { shouldWarmupRoutes, warmupRouteChunks } from './app/routeWarmup';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

const RoleRedirector: React.FC<{ authReady: boolean }> = ({ authReady }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    const onAuthChange = () => setAuthTick((t) => t + 1);
    try {
      window.addEventListener('auth-change', onAuthChange as any);
    } catch {
    }
    return () => {
      try {
        window.removeEventListener('auth-change', onAuthChange as any);
      } catch {
      }
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    try {
      const user = getStoredUser<any>() || {};
      const role = String(user?.role || '').toLowerCase();
      const pathname = String(location?.pathname || '');
      const isRootLike = pathname === '/' || pathname === '/login' || pathname === '/signup';
      const isBusinessAuth = pathname === '/business' || pathname === '/business/' || pathname.startsWith('/business/login');

      if (role === 'courier' && !pathname.startsWith('/courier')) {
        navigate('/courier/orders', { replace: true });
        return;
      }

      if (role === 'admin' && (isRootLike || pathname.startsWith('/admin/gate') || pathname.startsWith('/login'))) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      if (role === 'merchant') {
        const merchantContext = getStoredMerchantContext();
        const preferredRoute = String(merchantContext?.preferredRoute || '/business/dashboard');

        if (isRootLike || isBusinessAuth) {
          navigate(preferredRoute, { replace: true });
          return;
        }

        if (pathname === '/business' || pathname === '/business/landing') {
          navigate(preferredRoute, { replace: true });
        }
      }
    } catch {
    }
  }, [authReady, location?.pathname, authTick, navigate]);

  return null;
};

const OfflineOrBackendDownRedirector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backendDownUntil, setBackendDownUntil] = useState<number>(0);

  useEffect(() => {
    const handleBackendStatus = (evt: Event) => {
      const detail = (evt as CustomEvent<{ status?: 'up' | 'down'; downUntil?: number }>)?.detail;
      if (!detail) return;
      if (detail.status === 'up') setBackendDownUntil(0);
      if (typeof detail.downUntil === 'number') setBackendDownUntil(detail.downUntil);
    };

    window.addEventListener('ray-backend-status', handleBackendStatus as any);
    return () => {
      window.removeEventListener('ray-backend-status', handleBackendStatus as any);
    };
  }, []);

  useEffect(() => {
    const isOn404 = String(location?.pathname || '') === '/404';
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      if (!isOn404) navigate('/404?reason=offline', { replace: true });
      return;
    }

    const isBackendDown = backendDownUntil > Date.now();
    if (isBackendDown && !isOn404) {
      navigate('/404?reason=service', { replace: true });
    }
  }, [backendDownUntil, location?.pathname, navigate]);

  useEffect(() => {
    const handleOffline = () => {
      const isOn404 = String(window.location?.pathname || '') === '/404';
      if (!isOn404) navigate('/404?reason=offline', { replace: true });
    };
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  const routerMode = String(((import.meta as any)?.env?.VITE_ROUTER_MODE as string) || '').trim().toLowerCase();
  const Router = routerMode === 'browser' ? BrowserRouter : HashRouter;
  const shouldStoreBearerToken =
    String(((import.meta as any)?.env?.VITE_ENABLE_BEARER_TOKEN as any) || '').trim().toLowerCase() === 'true';
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    startAuthSync();

    (async () => {
      try {
        await bootstrapSessionFromBackend({ force: true, persistBearer: shouldStoreBearerToken });
      } finally {
        if (active) setAuthReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [shouldStoreBearerToken]);

  useEffect(() => {
    if (!shouldWarmupRoutes()) return;

    let warmed = false;
    const triggerWarmup = () => {
      if (warmed) return;
      warmed = true;
      window.removeEventListener('pointerdown', triggerWarmup);
      window.removeEventListener('keydown', triggerWarmup);
      const idle = (window as any)?.requestIdleCallback as undefined | ((cb: () => void, options?: { timeout?: number }) => number);
      if (typeof idle === 'function') {
        idle(() => warmupRouteChunks(), { timeout: 1500 });
        return;
      }
      window.setTimeout(() => warmupRouteChunks(), 800);
    };

    window.addEventListener('pointerdown', triggerWarmup, { passive: true, once: true });
    window.addEventListener('keydown', triggerWarmup, { once: true });
    return () => {
      window.removeEventListener('pointerdown', triggerWarmup);
      window.removeEventListener('keydown', triggerWarmup);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <RoleRedirector authReady={authReady} />
      <OfflineOrBackendDownRedirector />
      <RouteSeoManager />
      <AppRoutes />
    </Router>
  );
};

export default App;
