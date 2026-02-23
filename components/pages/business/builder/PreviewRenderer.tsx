import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/common/ui';

// Lazy load actual page previews
const HomePreview = lazy(() => import('@/components/pages/business/builder/HomePreview'));
const ProductPreview = lazy(() => import('@/components/pages/business/builder/ProductPreview'));
const GalleryPreview = lazy(() => import('@/components/pages/business/builder/GalleryPreview'));
const InfoPreview = lazy(() => import('@/components/pages/business/builder/InfoPreview'));

interface PreviewRendererProps {
  page: 'home' | 'product' | 'gallery' | 'info';
  config: any;
  shop: any;
  logoDataUrl: string;
  isPreviewHeaderMenuOpen: boolean;
  setIsPreviewHeaderMenuOpen: (val: boolean) => void;
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
      {props.page === 'home' && (
        <HomePreview 
          config={props.config} 
          shop={props.shop} 
          logoDataUrl={props.logoDataUrl}
          isMenuOpen={props.isPreviewHeaderMenuOpen}
          setIsMenuOpen={props.setIsPreviewHeaderMenuOpen}
        />
      )}
      {props.page === 'product' && (
        <ProductPreview 
          config={props.config} 
          shop={props.shop} 
          logoDataUrl={props.logoDataUrl}
        />
      )}
      {props.page === 'gallery' && (
        <GalleryPreview 
          config={props.config} 
          shop={props.shop} 
          logoDataUrl={props.logoDataUrl}
        />
      )}
      {props.page === 'info' && (
        <InfoPreview 
          config={props.config} 
          shop={props.shop} 
          logoDataUrl={props.logoDataUrl}
        />
      )}
    </Suspense>
  );
};

export default React.memo(PreviewRenderer);
