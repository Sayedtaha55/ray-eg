import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/common/ui';

// Lazy load actual page previews
const ShopProfilePreview = lazy(() => import('@/components/pages/business/builder/ShopProfilePreview'));
const ClinicPublicPreview = lazy(() => import('./ClinicPublicPreview'));

interface PreviewRendererProps {
  page: 'home' | 'products' | 'product' | 'gallery' | 'info';
  config: any;
  shop: any;
  logoDataUrl: string;
  isPreviewHeaderMenuOpen: boolean;
  setIsPreviewHeaderMenuOpen: (val: boolean) => void;
  isMobilePreview?: boolean;
  onProductClick?: () => void;
  focusSection?: 'top' | 'middle' | 'shopping' | 'productPage' | 'footer' | null;
  bannerPreview?: string;
  backgroundPreview?: string;
  bannerFile?: File | null;
}

const PreviewFallback = () => (
  <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8">
    <Skeleton className="w-full h-20 mb-8 rounded-2xl" />
    <Skeleton className="w-full h-64 mb-8 rounded-[2.5rem]" />
    <div className="grid grid-cols-2 gap-4 w-full">
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  </div>
);

const PreviewRenderer: React.FC<PreviewRendererProps> = (props) => {
  const isClinic = props.shop?.category === 'SERVICE';

  return (
    <Suspense fallback={<PreviewFallback />}>
      {isClinic ? (
        <ClinicPublicPreview
          config={props.config}
          logoDataUrl={props.logoDataUrl}
          shop={props.shop}
        />
      ) : (
        <ShopProfilePreview
          page={props.page}
          config={props.config}
          shop={props.shop}
          logoDataUrl={props.logoDataUrl}
          isPreviewHeaderMenuOpen={props.isPreviewHeaderMenuOpen}
          setIsPreviewHeaderMenuOpen={props.setIsPreviewHeaderMenuOpen}
          isMobilePreview={props.isMobilePreview}
          onProductClick={props.onProductClick}
          focusSection={props.focusSection}
          bannerPreview={props.bannerPreview}
          backgroundPreview={props.backgroundPreview}
          bannerFile={props.bannerFile}
        />
      )}
    </Suspense>
  );
};

export default React.memo(PreviewRenderer);
