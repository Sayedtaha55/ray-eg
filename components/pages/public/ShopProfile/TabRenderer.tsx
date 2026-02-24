import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/common/ui';

interface TabRendererProps {
  activeTab: 'products' | 'gallery' | 'info';
  shop: any;
  currentDesign: any;
  products: any[];
  offersByProductId: Map<string, any>;
  activeCategory: string;
  categories: string[];
  setActiveCategory: (cat: string) => void;
  productsTabLoading: boolean;
  productsTabError: string | null;
  retryProductsTab: () => void;
  loadMoreProducts: () => void;
  hasMoreProducts: boolean;
  loadingMoreProducts: boolean;
  handleAddToCart: (prod: any, price: number) => void;
  addedItemId: string | null;
  handleReserve: (data: any) => void;
  disableCardMotion: boolean;
  allowAddToCart?: boolean;
  galleryTabLoading: boolean;
  galleryTabError: string | null;
  galleryImages: any[];
  retryGalleryTab: () => void;
  isVisible: (key: string, fallback?: boolean) => boolean;
  whatsappHref: string;
}

const ProductTab = lazy(() => import('./ProductTab'));
const InfoTab = lazy(() => import('./InfoTab'));
const ShopGalleryComponent = lazy(() => import('@/components/features/shop/ShopGallery'));

const TabFallback = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div key={idx} className="bg-white border border-slate-100 rounded-[1.5rem] p-4">
        <Skeleton className="aspect-[4/3] rounded-2xl mb-4" />
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-28 mb-4" />
        <Skeleton className="h-11 w-full rounded-2xl" />
      </div>
    ))}
  </div>
);

const GalleryFallback = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, idx) => (
      <Skeleton key={idx} className="aspect-square rounded-2xl" />
    ))}
  </div>
);

const TabRenderer: React.FC<TabRendererProps> = (props) => {
  const { activeTab } = props;

  const primaryColor = String(props.currentDesign?.primaryColor || '').trim() || '#00E5FF';
  const buttonShape = String((props.currentDesign as any)?.buttonShape || '').trim() || 'rounded-full';
  const buttonPadding = String((props.currentDesign as any)?.buttonPadding || '').trim() || 'px-6 py-2.5';

  return (
    <Suspense fallback={activeTab === 'gallery' ? <GalleryFallback /> : <TabFallback />}>
      {activeTab === 'products' && (
        <ProductTab 
          products={props.products}
          offersByProductId={props.offersByProductId}
          activeCategory={props.activeCategory}
          categories={props.categories}
          setActiveCategory={props.setActiveCategory}
          productsTabLoading={props.productsTabLoading}
          productsTabError={props.productsTabError}
          retryProductsTab={props.retryProductsTab}
          loadMoreProducts={props.loadMoreProducts}
          hasMoreProducts={props.hasMoreProducts}
          loadingMoreProducts={props.loadingMoreProducts}
          currentDesign={props.currentDesign}
          shop={props.shop}
          handleAddToCart={props.handleAddToCart}
          addedItemId={props.addedItemId}
          handleReserve={props.handleReserve}
          disableCardMotion={props.disableCardMotion}
          allowAddToCart={props.allowAddToCart}
        />
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-8">
          {props.galleryTabLoading && props.galleryImages.length === 0 ? (
            <GalleryFallback />
          ) : props.galleryTabError && props.galleryImages.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-500 mb-4">{props.galleryTabError}</p>
              <button
                onClick={props.retryGalleryTab}
                className={`${buttonPadding} ${buttonShape} text-white font-black transition-opacity hover:opacity-90`}
                style={{ backgroundColor: primaryColor }}
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <ShopGalleryComponent 
              images={props.galleryImages} 
              shopName={props.shop?.name}
              primaryColor={props.currentDesign?.primaryColor}
              layout={props.currentDesign?.layout}
            />
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <InfoTab 
          shop={props.shop}
          currentDesign={props.currentDesign}
          isVisible={props.isVisible}
          whatsappHref={props.whatsappHref}
        />
      )}
    </Suspense>
  );
};

export default React.memo(TabRenderer);
