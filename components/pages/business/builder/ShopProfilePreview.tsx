import React, { useEffect, useMemo, useState } from 'react';
import ProfileHeader from '@/components/pages/public/ShopProfile/ProfileHeader';
import TabRenderer from '@/components/pages/public/ShopProfile/TabRenderer';
import ProfileFooter from '@/components/pages/public/ShopProfile/ProfileFooter';
import ProductPagePreview from './ProductPagePreview';
import { coerceBoolean } from '@/components/pages/public/ShopProfile/utils';

type Props = {
  page: 'home' | 'product' | 'gallery' | 'info';
  config: any;
  shop: any;
  logoDataUrl: string;
  isPreviewHeaderMenuOpen: boolean;
  setIsPreviewHeaderMenuOpen: (val: boolean) => void;
  isMobilePreview?: boolean;
  onProductClick?: () => void;
};

const ShopProfilePreview: React.FC<Props> = ({
  page,
  config,
  shop,
  logoDataUrl,
  isPreviewHeaderMenuOpen,
  setIsPreviewHeaderMenuOpen,
  isMobilePreview,
  onProductClick,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'gallery' | 'info'>(() => {
    if (page === 'gallery') return 'gallery';
    if (page === 'info') return 'info';
    return 'products';
  });

  useEffect(() => {
    if (page === 'gallery') {
      setActiveTab('gallery');
      return;
    }
    if (page === 'info') {
      setActiveTab('info');
      return;
    }
    setActiveTab('products');
  }, [page]);

  const currentDesign = useMemo(() => ({
    layout: 'modern',
    primaryColor: '#00E5FF',
    secondaryColor: '#BD00FF',
    ...config,
  }), [config]);

  const previewShop = useMemo(() => ({
    ...(shop && typeof shop === 'object' ? shop : {}),
    name: (shop && (shop as any).name) ? (shop as any).name : 'معاينة المتجر',
    description: (shop && (shop as any).description) ? (shop as any).description : 'وصف بسيط للمتجر يظهر للعملاء',
    logoUrl: logoDataUrl || (shop as any)?.logoUrl || (shop as any)?.logo_url || '',
  }), [shop, logoDataUrl]);

  const isVisible = useMemo(() => {
    const elementsVisibility = (currentDesign as any)?.elementsVisibility || {};
    return (key: string, fallback: boolean = true) => {
      if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
      if (!(key in elementsVisibility)) return fallback;
      return coerceBoolean((elementsVisibility as any)[key], fallback);
    };
  }, [currentDesign]);

  const headerBg = (currentDesign as any)?.headerTransparent
    ? `rgba(255,255,255,${Number((currentDesign as any)?.headerOpacity ?? 60) / 100})`
    : String((currentDesign as any)?.headerBackgroundColor || '#FFFFFF');

  const headerTextColor = String((currentDesign as any)?.headerTextColor || '#0F172A');

  const footerBg = (currentDesign as any)?.footerTransparent
    ? `rgba(255,255,255,${Number((currentDesign as any)?.footerOpacity ?? 90) / 100})`
    : String((currentDesign as any)?.footerBackgroundColor || '#FFFFFF');

  const footerTextColor = String((currentDesign as any)?.footerTextColor || '#0F172A');

  const isBold = String((currentDesign as any)?.layout || '').toLowerCase() === 'bold';

  const pageBgImageUrl = String((currentDesign as any)?.backgroundImageUrl || '').trim();

  const products = useMemo(() => ([
    {
      id: 'preview-1',
      name: 'منتج تجريبي 1',
      description: 'وصف تجريبي قابل للتخصيص',
      price: 129,
      imageUrl: '',
      stock: 12,
      category: 'منتجات',
    },
    {
      id: 'preview-2',
      name: 'منتج تجريبي 2',
      description: 'نموذج عرض للمعاينة',
      price: 199,
      imageUrl: '',
      stock: 7,
      category: 'تجربة',
    },
    {
      id: 'preview-3',
      name: 'منتج تجريبي 3',
      description: 'تفاصيل قصيرة للمنتج',
      price: 259,
      imageUrl: '',
      stock: 4,
      category: 'منتجات',
    },
    {
      id: 'preview-4',
      name: 'منتج تجريبي 4',
      description: 'خيار عرض متعدد الاستخدام',
      price: 319,
      imageUrl: '',
      stock: 9,
      category: 'تجربة',
    },
    {
      id: 'preview-5',
      name: 'منتج تجريبي 5',
      description: 'مناسب لأي نشاط تجاري',
      price: 89,
      imageUrl: '',
      stock: 14,
      category: 'عام',
    },
    {
      id: 'preview-6',
      name: 'منتج تجريبي 6',
      description: 'بيانات افتراضية للمعاينة',
      price: 149,
      imageUrl: '',
      stock: 6,
      category: 'عام',
    },
  ]), []);

  const offersByProductId = useMemo(() => new Map<string, any>(), []);

  const categories = useMemo(() => ['الكل', 'منتجات', 'تجربة', 'عام'], []);

  const prefersReducedMotion = true;

  return (
    <div
      className="min-h-full"
      dir="rtl"
      style={{
        backgroundColor: currentDesign?.pageBackgroundColor || '#FFFFFF',
        backgroundImage: pageBgImageUrl ? `url("${pageBgImageUrl}")` : undefined,
        backgroundSize: pageBgImageUrl ? 'cover' : undefined,
        backgroundPosition: pageBgImageUrl ? 'center' : undefined,
        backgroundRepeat: pageBgImageUrl ? 'no-repeat' : undefined,
      }}
    >
      {page === 'product' ? (
        <ProductPagePreview config={currentDesign} shop={previewShop} />
      ) : (
        <>
          <ProfileHeader
            shop={previewShop}
            currentDesign={currentDesign}
            activeTab={activeTab}
            setActiveTab={setActiveTab as any}
            isHeaderMenuOpen={isPreviewHeaderMenuOpen}
            setIsHeaderMenuOpen={setIsPreviewHeaderMenuOpen}
            hasFollowed={false}
            followLoading={false}
            handleFollow={() => {}}
            handleShare={() => {}}
            isVisible={isVisible as any}
            prefersReducedMotion={prefersReducedMotion}
            headerBg={headerBg}
            headerTextColor={headerTextColor}
            bannerReady={true}
            isBuilderPreview={true}
          />

      <main
        className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10"
      >
        <TabRenderer
          activeTab={activeTab}
          shop={previewShop}
          currentDesign={currentDesign}
          products={products}
          offersByProductId={offersByProductId}
          activeCategory={'الكل'}
          categories={categories}
          setActiveCategory={() => {}}
          productsTabLoading={false}
          productsTabError={null}
          retryProductsTab={() => {}}
          loadMoreProducts={() => {}}
          hasMoreProducts={false}
          loadingMoreProducts={false}
          handleAddToCart={() => {}}
          addedItemId={null}
          handleReserve={() => {}}
          disableCardMotion={true}
          galleryTabLoading={false}
          galleryTabError={null}
          galleryImages={[]}
          retryGalleryTab={() => {}}
          isVisible={isVisible as any}
          whatsappHref={''}
          isPreview={true}
          onProductClick={() => {
            if (onProductClick) {
              onProductClick();
            }
          }}
        />
      </main>

      <ProfileFooter
        shop={previewShop}
        currentDesign={currentDesign}
        footerBg={footerBg}
        footerTextColor={footerTextColor}
        isVisible={isVisible as any}
        isBold={isBold}
      />
        </>
      )}
    </div>
  );
};

export default React.memo(ShopProfilePreview);
