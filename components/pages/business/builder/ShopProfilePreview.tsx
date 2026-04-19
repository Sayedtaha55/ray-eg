import React, { useEffect, useMemo, useState } from 'react';
import ProfileHeader from '@/components/pages/public/ShopProfile/ProfileHeader';
import TabRenderer from '@/components/pages/public/ShopProfile/TabRenderer';
import ProfileFooter from '@/components/pages/public/ShopProfile/ProfileFooter';
import ProductPagePreview from './ProductPagePreview';
import { coerceBoolean } from '@/components/pages/public/ShopProfile/utils';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    name: (shop && (shop as any).name) ? (shop as any).name : t('business.builder.shopPreview.defaultShopName'),
    description: (shop && (shop as any).description) ? (shop as any).description : t('business.builder.shopPreview.defaultShopDescription'),
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
      name: t('business.builder.shopPreview.products.p1.name'),
      description: t('business.builder.shopPreview.products.p1.description'),
      price: 129,
      imageUrl: '',
      stock: 12,
      category: t('business.builder.shopPreview.categories.products'),
    },
    {
      id: 'preview-2',
      name: t('business.builder.shopPreview.products.p2.name'),
      description: t('business.builder.shopPreview.products.p2.description'),
      price: 199,
      imageUrl: '',
      stock: 7,
      category: t('business.builder.shopPreview.categories.trial'),
    },
    {
      id: 'preview-3',
      name: t('business.builder.shopPreview.products.p3.name'),
      description: t('business.builder.shopPreview.products.p3.description'),
      price: 259,
      imageUrl: '',
      stock: 4,
      category: t('business.builder.shopPreview.categories.products'),
    },
    {
      id: 'preview-4',
      name: t('business.builder.shopPreview.products.p4.name'),
      description: t('business.builder.shopPreview.products.p4.description'),
      price: 319,
      imageUrl: '',
      stock: 9,
      category: t('business.builder.shopPreview.categories.trial'),
    },
    {
      id: 'preview-5',
      name: t('business.builder.shopPreview.products.p5.name'),
      description: t('business.builder.shopPreview.products.p5.description'),
      price: 89,
      imageUrl: '',
      stock: 14,
      category: t('business.builder.shopPreview.categories.general'),
    },
    {
      id: 'preview-6',
      name: t('business.builder.shopPreview.products.p6.name'),
      description: t('business.builder.shopPreview.products.p6.description'),
      price: 149,
      imageUrl: '',
      stock: 6,
      category: t('business.builder.shopPreview.categories.general'),
    },
  ]), [t]);

  const offersByProductId = useMemo(() => new Map<string, any>(), []);

  const categories = useMemo(() => [t('business.builder.shopPreview.categories.all'), t('business.builder.shopPreview.categories.products'), t('business.builder.shopPreview.categories.trial'), t('business.builder.shopPreview.categories.general')], [t]);

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
          activeCategory={t('business.builder.shopPreview.categories.all')}
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
