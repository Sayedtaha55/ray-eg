import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { persistSession } from '@/services/authStorage';

const { useNavigate, useLocation } = ReactRouterDOM as any;

const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');

  const shouldStoreBearerToken =
    String(((import.meta as any)?.env?.VITE_ENABLE_BEARER_TOKEN as any) || '').trim().toLowerCase() === 'true';

  const normalizeReturnTo = (value: any) => {
    const rt = String(value || '').trim();
    if (!rt) return undefined;
    if (!rt.startsWith('/')) return undefined;
    if (rt.startsWith('//')) return undefined;
    return rt;
  };

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const returnTo = normalizeReturnTo(params.get('returnTo'));
        const followShopId = params.get('followShopId');

        const response = await ApiService.session();
        persistSession({
          user: response.user,
          accessToken: response.session?.access_token,
          persistBearer: shouldStoreBearerToken,
        }, 'google-callback');

        if (returnTo) {
          try {
            if (followShopId) {
              await ApiService.followShop(followShopId);
              window.dispatchEvent(new Event('ray-db-update'));
            }
          } catch {
            // ignore
          }
          navigate(returnTo);
          return;
        }

        const role = String(response.user?.role || '').toLowerCase();
        
        // Radical fix: Explicit role-based routing that cannot be bypassed
        const ROUTES: Record<string, string> = {
          admin: '/admin/dashboard',
          merchant: '/business/dashboard',
          courier: '/courier/orders',
          customer: '/profile',
          user: '/profile',
        };
        
        // Get the target route based on role, fallback to /profile
        const targetRoute = ROUTES[role] || '/profile';
        
        // Special handling for merchant - check shop approval status
        if (role === 'merchant') {
          try {
            const myShop = await ApiService.getMyShop();
            const status = String(myShop?.status || '').toLowerCase();
            if (status !== 'approved') {
              navigate('/business/pending');
              return;
            }
          } catch {
            navigate('/business/pending');
            return;
          }
        }
        
        // Navigate to the appropriate dashboard
        navigate(targetRoute);
      } catch (err: any) {
        setError(err?.message || 'فشل تسجيل الدخول عبر Google');
      }
    };

    run();
  }, [location.search, navigate]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-xl bg-white border border-slate-100 p-10 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] text-right">
        <h1 className="text-2xl font-black tracking-tight mb-2">جاري تسجيل الدخول...</h1>
        <p className="text-slate-400 font-bold text-sm">من فضلك انتظر لحظات.</p>
        {error ? (
          <div className="mt-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 font-bold text-sm">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
