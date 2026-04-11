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
import { getDeferredDelay, isMobileViewportLike } from './utils/performanceProfile';
import BackendStatusBanner from './components/common/feedback/BackendStatusBanner';

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

const App: React.FC = () => {
  const routerMode = String(((import.meta as any)?.env?.VITE_ROUTER_MODE as string) || '').trim().toLowerCase();
  const Router = routerMode === 'browser' ? BrowserRouter : HashRouter;
  const shouldStoreBearerToken =
    String(((import.meta as any)?.env?.VITE_ENABLE_BEARER_TOKEN as any) || '').trim().toLowerCase() === 'true';
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    startAuthSync();
    setAuthReady(true);

    const hasStoredSession = Boolean(getStoredUser()) || Boolean(
      typeof window !== 'undefined' ? window.localStorage.getItem('ray_token') : '',
    );

    const cancelScheduledBootstrap = () => {
      if (idleHandle !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleHandle);
        idleHandle = null;
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
    };

    const runBootstrap = async () => {
      if (!active) return;
      try {
        await bootstrapSessionFromBackend({
          force: hasStoredSession,
          persistBearer: shouldStoreBearerToken,
        });
      } catch {
      } finally {
        cancelScheduledBootstrap();
      }
    };

    const scheduleBootstrap = (delayMs: number) => {
      if (!active) return;
      cancelScheduledBootstrap();
      const idle = (window as any)?.requestIdleCallback as undefined | ((cb: () => void, options?: { timeout?: number }) => number);
      if (typeof idle === 'function') {
        idleHandle = idle(() => {
          idleHandle = null;
          void runBootstrap();
        }, { timeout: delayMs });
        return;
      }

      timeoutHandle = window.setTimeout(() => {
        timeoutHandle = null;
        void runBootstrap();
      }, delayMs);
    };

    if (!hasStoredSession) {
      return () => {
        active = false;
        cancelScheduledBootstrap();
      };
    }

    scheduleBootstrap(getDeferredDelay(1200, 2500));

    return () => {
      active = false;
      cancelScheduledBootstrap();
    };
  }, [shouldStoreBearerToken]);

  useEffect(() => {
    if (!shouldWarmupRoutes()) return;

    let warmed = false;
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;
    let loadHandler: (() => void) | null = null;

    const cancelWarmup = () => {
      if (idleHandle !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleHandle);
        idleHandle = null;
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
    };

    const runWarmup = () => {
      if (warmed || document.visibilityState === 'hidden') return;
      warmed = true;
      cancelWarmup();
      warmupRouteChunks();
    };

    const scheduleWarmup = () => {
      if (warmed) return;
      cancelWarmup();
      const idle = (window as any)?.requestIdleCallback as undefined | ((cb: () => void, options?: { timeout?: number }) => number);
      if (typeof idle === 'function') {
        idleHandle = idle(() => {
          idleHandle = null;
          runWarmup();
        }, { timeout: 2500 });
        return;
      }

      timeoutHandle = window.setTimeout(() => {
        timeoutHandle = null;
        runWarmup();
      }, 1800);
    };

    const triggerWarmup = () => {
      window.removeEventListener('pointerdown', triggerWarmup);
      window.removeEventListener('keydown', triggerWarmup);

      if (document.readyState === 'complete') {
        scheduleWarmup();
        return;
      }

      loadHandler = () => {
        if (loadHandler) {
          window.removeEventListener('load', loadHandler);
          loadHandler = null;
        }
        scheduleWarmup();
      };

      window.addEventListener('load', loadHandler, { once: true });
    };

    window.addEventListener('pointerdown', triggerWarmup, { passive: true, once: true });
    window.addEventListener('keydown', triggerWarmup, { once: true });

    return () => {
      window.removeEventListener('pointerdown', triggerWarmup);
      window.removeEventListener('keydown', triggerWarmup);
      if (loadHandler) {
        window.removeEventListener('load', loadHandler);
        loadHandler = null;
      }
      cancelWarmup();
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <RoleRedirector authReady={authReady} />
      <BackendStatusBanner />
      <RouteSeoManager />
      <AppRoutes />
    </Router>
  );
};

export default App;
