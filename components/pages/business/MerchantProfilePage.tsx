
import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';

// Lazy load sub-components
const ProfileSummary = lazy(() => import('./merchant-profile/ProfileSummary'));
const ShopDetailsCard = lazy(() => import('./merchant-profile/ShopDetailsCard'));
const QuickLinksCard = lazy(() => import('./merchant-profile/QuickLinksCard'));

const { useLocation, useNavigate } = ReactRouterDOM as any;


const MerchantProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const impersonateShopId = useMemo(() => new URLSearchParams(String(location?.search || '')).get('impersonateShopId'), [location?.search]);

  const buildDashboardUrl = (tab?: string) => {
    const params = new URLSearchParams(String(location?.search || ''));
    if (!tab || tab === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const savedUserStr = localStorage.getItem('ray_user');
        if (!savedUserStr) {
          navigate('/login');
          return;
        }

        const savedUser = JSON.parse(savedUserStr);
        setUser(savedUser);

        const role = String(savedUser?.role || '').toLowerCase();
        if (role !== 'merchant' && !(role === 'admin' && impersonateShopId)) {
          addToast('هذه الصفحة للتجار فقط', 'error');
          navigate('/login');
          return;
        }

        const effectiveShop =
          savedUser?.role === 'admin' && impersonateShopId
            ? await ApiService.getShopAdminById(String(impersonateShopId))
            : await ApiService.getMyShop();

        if (!cancelled) {
          setShop(effectiveShop);
        }
      } catch (e) {
        const message = (e as any)?.message || 'حدث خطأ أثناء تحميل بيانات البروفايل';
        addToast(message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [addToast, impersonateShopId, navigate]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-black text-slate-400">تحميل ملف التاجر...</p>
      </div>
    );
  }

  if (!user) return null;

  const shopSlug = String(shop?.slug || '');
  const shopName = String(shop?.name || '');
  const shopCity = String(shop?.city || '');
  const shopCategory = String(shop?.category || '');
  const shopStatus = String(shop?.status || '');

  return (
    <div className="max-w-[1200px] mx-auto text-right font-sans" dir="rtl">
      <Suspense fallback={<div className="h-20 flex justify-center"><Loader2 className="animate-spin text-[#00E5FF]" /></div>}>
        <ProfileSummary 
          user={user} 
          shopSlug={shopSlug} 
          buildDashboardUrl={buildDashboardUrl} 
        />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        <Suspense fallback={<div className="lg:col-span-7 h-64 bg-white rounded-[3rem] animate-pulse" />}>
          <ShopDetailsCard 
            shopName={shopName}
            shopCity={shopCity}
            shopStatus={shopStatus}
            shopCategory={shopCategory}
          />
        </Suspense>

        <Suspense fallback={<div className="lg:col-span-5 h-64 bg-white rounded-[3rem] animate-pulse" />}>
          <QuickLinksCard 
            buildDashboardUrl={buildDashboardUrl} 
          />
        </Suspense>
      </div>
    </div>
  );
};

export default MerchantProfilePage;
