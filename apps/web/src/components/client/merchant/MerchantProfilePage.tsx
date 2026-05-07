'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';
import { useRouter, useSearchParams } from 'next/navigation';

import ProfileSummary from './merchant-profile/ProfileSummary';
import ShopDetailsCard from './merchant-profile/ShopDetailsCard';
import QuickLinksCard from './merchant-profile/QuickLinksCard';

const MerchantProfilePage: React.FC = () => {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const loadSeqRef = useRef(0);

  const impersonateShopId = searchParams?.get('impersonateShopId') ?? null;

  const buildDashboardUrl = useCallback((tab?: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (!tab || tab === 'overview') params.delete('tab');
    else params.set('tab', tab);
    const qs = params.toString();
    return `/dashboard${qs ? `?${qs}` : ''}`;
  }, [searchParams]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    const seq = ++loadSeqRef.current;
    if (!silent) setLoading(true);
    try {
      const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('ray_user') : null;
      if (!savedUserStr) { router.push('/login'); return; }
      const savedUser = JSON.parse(savedUserStr);
      if (loadSeqRef.current !== seq) return;
      setUser(savedUser);

      const role = String(savedUser?.role || '').toLowerCase();
      if (role !== 'merchant' && !(role === 'admin' && impersonateShopId)) { router.push('/login'); return; }

      let effectiveShop: any;
      if (savedUser?.role === 'admin' && impersonateShopId) {
        effectiveShop = await clientFetch<any>(`/v1/shops/${impersonateShopId}`);
      } else {
        effectiveShop = await clientFetch<any>('/v1/shops/mine');
      }
      if (loadSeqRef.current !== seq) return;
      setShop(effectiveShop);
    } catch {
      if (loadSeqRef.current !== seq) return;
    } finally {
      if (!silent && loadSeqRef.current === seq) setLoading(false);
    }
  }, [impersonateShopId, router]);

  useEffect(() => { load({ silent: false }); }, [load]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-black text-slate-400">{t('business.merchantProfilePage.loading', 'جاري التحميل')}</p>
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
        <ProfileSummary user={user} shopSlug={shopSlug} buildDashboardUrl={buildDashboardUrl} shop={shop} />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        <Suspense fallback={<div className="lg:col-span-7 h-64 bg-white rounded-[3rem] animate-pulse" />}>
          <ShopDetailsCard shopName={shopName} shopCity={shopCity} shopStatus={shopStatus} shopCategory={shopCategory} />
        </Suspense>
        <Suspense fallback={<div className="lg:col-span-5 h-64 bg-white rounded-[3rem] animate-pulse" />}>
          <QuickLinksCard buildDashboardUrl={buildDashboardUrl} shop={shop} />
        </Suspense>
      </div>
    </div>
  );
};

export default MerchantProfilePage;
