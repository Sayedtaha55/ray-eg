import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ShopImageMapPurchaseView = React.lazy(() => import('@/src/features/shop-image-map/components/ShopImageMapPurchaseView'));

export const AppLoadingFallback: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
        <div className="text-slate-500 font-bold text-sm">{t('common.loading')}</div>
      </div>
    </div>
  );
};

export const suspense = (element: React.ReactElement) => (
  <React.Suspense fallback={<AppLoadingFallback />}>{element}</React.Suspense>
);

export const RedirectSShop: React.FC = () => {
  const { slug } = useParams();
  return <Navigate to={`/shop/${slug}`} replace />;
};

export const RedirectSShopProduct: React.FC = () => {
  const { slug, id } = useParams();
  return <Navigate to={`/shop/${slug}/product/${id}`} replace />;
};

export const RedirectShopImageMapToShopProfile: React.FC = () => {
  return suspense(<ShopImageMapPurchaseView />);
};
