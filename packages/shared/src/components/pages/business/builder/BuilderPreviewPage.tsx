import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import ShopProfilePreview from '@/components/pages/business/builder/ShopProfilePreview';
import { useTranslation } from 'react-i18next';
import { getBookingActivityDefinition, isBookingActivityRoute, BOOKING_ACTIVITY_ROUTE_MAP } from '../bookings/config';

const ClinicPublicPreview = lazy(() => import('./ClinicPublicPreview'));

const { useLocation } = ReactRouterDOM as any;

const BuilderPreviewPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(String(location?.search || '')), [location?.search]);
  const pageParam = String(query.get('page') || 'home').trim();
  
  const cachedShop = useMemo(() => {
    try {
      const raw = localStorage.getItem('ray_last_shop');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  const [config, setConfig] = useState<any>({});

  const bookingActivityType = useMemo(() => {
    const isBookingActivity = isBookingActivityRoute(pageParam);
    if (isBookingActivity) {
      return BOOKING_ACTIVITY_ROUTE_MAP[pageParam as keyof typeof BOOKING_ACTIVITY_ROUTE_MAP];
    }
    return cachedShop?.pageDesign?.bookingActivityType || config?.bookingActivityType || (cachedShop?.category === 'SERVICE' ? 'general_appointments' : null);
  }, [pageParam, cachedShop, config]);

  const activityDefinition = useMemo(() => {
    if (!bookingActivityType) return null;
    try {
      return getBookingActivityDefinition(bookingActivityType);
    } catch {
      return null;
    }
  }, [bookingActivityType]);
  
  const page = ((): 'home' | 'product' | 'gallery' | 'info' => {
    if (pageParam === 'product' || pageParam === 'gallery' || pageParam === 'info') return pageParam as any;
    return 'home';
  })();

  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [isPreviewHeaderMenuOpen, setIsPreviewHeaderMenuOpen] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('ray_builder_preview_design');
        const parsed = raw ? JSON.parse(raw) : null;
        setConfig(parsed && typeof parsed === 'object' ? parsed : {});
      } catch {
        setConfig({});
      }
      try {
        const rawLogo = localStorage.getItem('ray_builder_preview_logo');
        setLogoDataUrl(String(rawLogo || '').trim());
      } catch {
        setLogoDataUrl('');
      }
    };

    load();
    const onUpdate = () => load();
    window.addEventListener('ray-builder-preview-update', onUpdate as any);

    const onStorage = (e: StorageEvent) => {
      if (!e) return;
      if (e.key === 'ray_builder_preview_design' || e.key === 'ray_builder_preview_logo') load();
    };
    window.addEventListener('storage', onStorage as any);

    return () => {
      window.removeEventListener('ray-builder-preview-update', onUpdate as any);
      window.removeEventListener('storage', onStorage as any);
    };
  }, []);

  const isClinic = cachedShop?.category === 'SERVICE';

  return (
    <div className="w-full h-full">
      <Suspense fallback={
        <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8">
          <div className="animate-spin text-cyan-500 w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      }>
        {isClinic ? (
          <ClinicPublicPreview
            config={config}
            logoDataUrl={logoDataUrl}
            shop={cachedShop}
          />
        ) : (
          <ShopProfilePreview
            page={page}
            config={config}
            shop={cachedShop || { id: 'preview', name: t('business.builder.previewPage.shopName') }}
            logoDataUrl={logoDataUrl}
            isPreviewHeaderMenuOpen={isPreviewHeaderMenuOpen}
            setIsPreviewHeaderMenuOpen={setIsPreviewHeaderMenuOpen}
            bookingActivityDefinition={activityDefinition}
          />
        )}
      </Suspense>
    </div>
  );
};

export default React.memo(BuilderPreviewPage);
