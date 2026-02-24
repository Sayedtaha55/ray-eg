import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/common/ui';

// Lazy load actual page previews
const ShopProfilePreview = lazy(() => import('@/components/pages/business/builder/ShopProfilePreview'));

interface PreviewRendererProps {
  page: 'home' | 'product' | 'gallery' | 'info';
  config: any;
  shop: any;
  logoDataUrl: string;
  isPreviewHeaderMenuOpen: boolean;
  setIsPreviewHeaderMenuOpen: (val: boolean) => void;
  isMobilePreview?: boolean;
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
  return (
    <Suspense fallback={<PreviewFallback />}>
      <ShopProfilePreview
        page={props.page}
        config={props.config}
        shop={props.shop}
        logoDataUrl={props.logoDataUrl}
        isPreviewHeaderMenuOpen={props.isPreviewHeaderMenuOpen}
        setIsPreviewHeaderMenuOpen={props.setIsPreviewHeaderMenuOpen}
        isMobilePreview={props.isMobilePreview}
      />
    </Suspense>
  );
};

export default React.memo(PreviewRenderer);
