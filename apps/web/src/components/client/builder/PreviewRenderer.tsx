'use client';

import React from 'react';

interface PreviewRendererProps {
  page: 'home' | 'product' | 'gallery' | 'info';
  config: any;
  shop: any;
  logoDataUrl: string;
  isPreviewHeaderMenuOpen: boolean;
  setIsPreviewHeaderMenuOpen: (val: boolean) => void;
  isMobilePreview?: boolean;
  onProductClick?: () => void;
  focusSection?: 'top' | 'middle' | 'shopping' | 'productPage' | 'footer' | null;
}

const PreviewFallback = () => (
  <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8">
    <div className="w-full h-20 mb-8 rounded-2xl bg-slate-100 animate-pulse" />
    <div className="w-full h-64 mb-8 rounded-[2.5rem] bg-slate-100 animate-pulse" />
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
      <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
    </div>
  </div>
);

const PreviewRenderer: React.FC<PreviewRendererProps> = (props) => {
  // Simplified preview - renders a basic shop profile layout based on config
  const { page, config, shop, logoDataUrl, isMobilePreview } = props;
  const shopName = shop?.name || 'متجر';

  return (
    <div className="w-full" style={{ backgroundColor: config.pageBackgroundColor || config.backgroundColor || '#FFFFFF' }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between" style={{ backgroundColor: config.headerBackgroundColor || '#FFFFFF', color: config.headerTextColor || '#0F172A', opacity: (config.headerOpacity ?? 60) / 100 }}>
        {logoDataUrl && <img src={logoDataUrl} alt="logo" className="w-10 h-10 rounded-xl object-cover" />}
        <span className="font-black text-sm">{shopName}</span>
      </div>

      {/* Banner */}
      {config.bannerUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img src={config.bannerUrl} alt="banner" className="w-full h-full object-cover" style={{ objectPosition: `${config.bannerPosX ?? 50}% ${config.bannerPosY ?? 50}%` }} />
        </div>
      )}

      {/* Content area based on page */}
      <div className="p-4 space-y-4">
        <h2 className={`font-black ${config.headingSize || 'text-4xl'}`} style={{ color: config.headerTextColor || '#0F172A' }}>
          {page === 'home' ? shopName : page === 'product' ? 'معاينة المنتج' : page === 'gallery' ? 'المعرض' : 'معلومات'}
        </h2>

        {/* Product grid preview */}
        <div className={`grid ${config.productsLayout === 'horizontal' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`rounded-xl overflow-hidden ${config.productDisplay === 'list' ? 'flex items-center gap-2 p-2' : ''}`} style={{ backgroundColor: config.productCardOverlayBgColor || '#0F172A' }}>
              <div className={`${config.imageAspectRatio === 'portrait' ? 'aspect-[2/3]' : config.imageAspectRatio === 'landscape' ? 'aspect-[3/2]' : 'aspect-square'} bg-slate-200 rounded-lg`}></div>
              {config.productDisplay !== 'minimal' && (
                <div className="p-2">
                  <div className="h-2 w-16 bg-white/40 rounded-full mb-1" />
                  <div className="h-2 w-10 bg-white/30 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 mt-4" style={{ backgroundColor: config.footerBackgroundColor || '#FFFFFF', color: config.footerTextColor || '#0F172A', opacity: (config.footerOpacity ?? 90) / 100 }}>
        <div className="text-center font-black text-xs">{shopName} © {new Date().getFullYear()}</div>
      </div>
    </div>
  );
};

export default React.memo(PreviewRenderer);
