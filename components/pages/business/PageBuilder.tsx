
import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, Save, Layout, Check, 
  Monitor, Smartphone, X, 
  Sliders, Loader2, Menu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api.service';
import { getAllowedTabIdsForCategory } from './merchant-dashboard/activities';
import { useToast } from '@/components/common/feedback/Toaster';
import { useLocation, useNavigate } from 'react-router-dom';
import { BUILDER_SECTIONS } from './builder/registry';
import SmartImage from '@/components/common/ui/SmartImage';
import { compressImage } from '@/lib/image-utils';
import { coerceBoolean, coerceNumber, isVideoUrl } from './utils';

const MotionDiv = motion.div as any;

// Lazy load heavy components
const PreviewRenderer = lazy(() => import('./builder/PreviewRenderer'));
const SectionRenderer = lazy(() => import('./builder/SectionRenderer'));

const PreviewRendererAny = PreviewRenderer as any;


const DEFAULT_PAGE_DESIGN = {
  primaryColor: '#00E5FF',
  secondaryColor: '#BD00FF',
  layout: 'modern',
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
  bannerPosX: 50,
  bannerPosY: 50,
  headerType: 'centered',
  headerBackgroundColor: '#FFFFFF',
  headerBackgroundImageUrl: '',
  headerTextColor: '#0F172A',
  headerTransparent: true,
  headerOpacity: 60,
  pageBackgroundColor: '#FFFFFF',
  backgroundImageUrl: '',
  productDisplay: 'cards',
  footerBackgroundColor: '#FFFFFF',
  footerTextColor: '#0F172A',
  footerTransparent: false,
  footerOpacity: 90,
  // Typography
  headingSize: 'text-4xl',
  textSize: 'text-sm',
  fontWeight: 'font-black',
  // Buttons
  buttonShape: 'rounded-2xl',
  buttonPadding: 'px-6 py-3',
  buttonHover: 'bg-slate-900',
  // Spacing
  pagePadding: 'p-6 md:p-12',
  itemGap: 'gap-4 md:gap-6',
  customCss: '',
  imageMapVisibility: {
    imageMapCardPrice: true,
    imageMapCardStock: true,
    imageMapCardAddToCart: true,
    imageMapCardDescription: true,
  },
};

interface ShopDesign {
  primaryColor: string;
  secondaryColor: string;
  layout: string;
  bannerUrl: string;
  bannerPosX?: number;
  bannerPosY?: number;
  headerType: string;
  headerBackgroundColor?: string;
  headerBackgroundImageUrl?: string;
  headerTextColor?: string;
  headerTransparent?: boolean;
  headerOpacity?: number;
  pageBackgroundColor: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  productDisplay: string;
  productDisplayStyle?: string;
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerTransparent?: boolean;
  footerOpacity?: number;
  headingSize: string;
  textSize: string;
  fontWeight: string;
  buttonShape: string;
  buttonPadding: string;
  buttonHover: string;
  pagePadding: string;
  itemGap: string;
  elementsVisibility?: Record<string, boolean>;
  productEditorVisibility?: Record<string, boolean>;
  imageMapVisibility?: Record<string, boolean>;
  customCss?: string;
}

const PageBuilder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addToast } = useToast();
  const location = useLocation();
  const [shopId, setShopId] = useState<string>('');
  const [shop, setShop] = useState<any>(null);
  const [config, setConfig] = useState<ShopDesign>(DEFAULT_PAGE_DESIGN);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(() => {
    try {
      if (typeof window === 'undefined') return 'desktop';
      const mql = window.matchMedia('(min-width: 768px)');
      return mql.matches ? 'desktop' : 'mobile';
    } catch {
      return 'desktop';
    }
  });
  const [previewPage, setPreviewPage] = useState<'home' | 'product' | 'gallery' | 'info'>('home');
  const [isPreviewHeaderMenuOpen, setIsPreviewHeaderMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState('colors');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSettingsMobile, setShowSettingsMobile] = useState(false);

  const savingRef = useRef(false);
  const logoSavingRef = useRef(false);
  const handleSaveRef = useRef<null | (() => void)>(null);

  const syncVisibilityWithModules = (current: any, shop: any) => {
    const next = { ...(current && typeof current === 'object' ? current : {}) } as Record<string, boolean>;

    const allowedByActivity = getAllowedTabIdsForCategory(shop?.category);

    const enabled = (() => {
      const layout = shop?.layoutConfig;
      const raw = layout && typeof layout === 'object' ? (layout as any).enabledModules : undefined;

      const core = ['overview', 'products', 'promotions', 'builder', 'settings'];
      const base = new Set<string>(core);

      if (!Array.isArray(raw)) return base;

      for (const x of raw) {
        const id = String(x || '').trim();
        if (!id) continue;
        base.add(id);
      }

      return base;
    })();

    const isEnabled = (id: string) => enabled.has(id) && allowedByActivity.has(id as any);

    const hasSales = isEnabled('sales');
    const hasReservations = isEnabled('reservations');
    const hasGallery = isEnabled('gallery');

    // Only force-hide features when their module is not enabled.
    // If a module is enabled, keep the user's visibility toggle as-is.
    if (!hasSales) {
      delete (next as any).productCardAddToCart;
      delete (next as any).mobileBottomNavCart;
    }

    if (!hasReservations) {
      delete (next as any).productCardReserve;
    }

    if (!hasGallery) {
      next.headerNavGallery = false;
    }

    return next;
  };

  const query = new URLSearchParams(String(location?.search || ''));
  const requestedBuilderTabRaw = String(query.get('builderTab') || '').trim();
  const allowedBuilderTabs = new Set(BUILDER_SECTIONS.map((s) => String(s.id)));
  const activeBuilderTab = allowedBuilderTabs.has(requestedBuilderTabRaw) ? requestedBuilderTabRaw : 'colors';
  const sidebarMode = allowedBuilderTabs.has(requestedBuilderTabRaw);
  const integratedMode = String(query.get('tab') || '').trim() === 'builder';
  const desktopIntegratedAccordionMode = integratedMode && isDesktop;

  useEffect(() => {
    if (!sidebarMode) return;
    setOpenSection(activeBuilderTab);
  }, [activeBuilderTab, sidebarMode]);

  useEffect(() => {
    const loadCurrentDesign = async () => {
      const savedUser = localStorage.getItem('ray_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setShopId(user.shopId);
        try {
          const myShop = await ApiService.getMyShop();
          setShop(myShop);
          const shopLogoSrc = String(myShop?.logoUrl || myShop?.logo_url || '').trim();
          setLogoDataUrl(shopLogoSrc);
          setLogoFile(null);
          if (myShop && myShop.pageDesign) {
            const merged = { ...DEFAULT_PAGE_DESIGN, ...myShop.pageDesign } as any;
            const bannerPosX = coerceNumber(merged?.bannerPosX, Number((DEFAULT_PAGE_DESIGN as any).bannerPosX));
            const bannerPosY = coerceNumber(merged?.bannerPosY, Number((DEFAULT_PAGE_DESIGN as any).bannerPosY));
            const elementsVisibilityRaw = merged?.elementsVisibility;
            const elementsVisibilityNormalized = elementsVisibilityRaw && typeof elementsVisibilityRaw === 'object'
              ? Object.fromEntries(
                  Object.entries(elementsVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)])
                )
              : undefined;
            const elementsVisibilitySynced = syncVisibilityWithModules(elementsVisibilityNormalized, myShop);

            const imageMapVisibilityRaw = merged?.imageMapVisibility;
            const imageMapVisibilityNormalized = imageMapVisibilityRaw && typeof imageMapVisibilityRaw === 'object'
              ? Object.fromEntries(
                  Object.entries(imageMapVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)])
                )
              : (DEFAULT_PAGE_DESIGN as any).imageMapVisibility;

            const productEditorVisibilityRaw = merged?.productEditorVisibility;
            const productEditorVisibilityNormalized = (() => {
              if (productEditorVisibilityRaw && typeof productEditorVisibilityRaw === 'object') {
                return Object.fromEntries(
                  Object.entries(productEditorVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)])
                );
              }

              // Migration: older builds stored editor-related toggles inside elementsVisibility.
              // We copy only the productCard* keys once to keep the settings independent going forward.
              const base = elementsVisibilityNormalized && typeof elementsVisibilityNormalized === 'object'
                ? (elementsVisibilityNormalized as Record<string, any>)
                : ({} as Record<string, any>);

              const keys = ['productCardPrice', 'productCardStock', 'productCardAddToCart', 'productCardReserve'];
              const picked: Record<string, any> = {};
              let hasAny = false;
              for (const k of keys) {
                if (base[k] !== undefined && base[k] !== null) {
                  picked[k] = coerceBoolean(base[k], true);
                  hasAny = true;
                }
              }
              return hasAny ? picked : undefined;
            })();
            const customCssNormalized = typeof merged?.customCss === 'string' ? merged.customCss : '';
            setConfig({
              ...merged,
              headerTransparent: coerceBoolean(merged.headerTransparent, Boolean(DEFAULT_PAGE_DESIGN.headerTransparent)),
              footerTransparent: coerceBoolean(merged.footerTransparent, Boolean(DEFAULT_PAGE_DESIGN.footerTransparent)),
              headerOpacity: coerceNumber(merged.headerOpacity, Number(DEFAULT_PAGE_DESIGN.headerOpacity)),
              footerOpacity: coerceNumber(merged.footerOpacity, Number(DEFAULT_PAGE_DESIGN.footerOpacity)),
              bannerPosX,
              bannerPosY,
              elementsVisibility: elementsVisibilitySynced,
              productEditorVisibility: productEditorVisibilityNormalized,
              imageMapVisibility: imageMapVisibilityNormalized,
              customCss: customCssNormalized,
            });
          } else {
            setConfig({
              ...DEFAULT_PAGE_DESIGN,
              elementsVisibility: syncVisibilityWithModules((DEFAULT_PAGE_DESIGN as any).elementsVisibility, myShop),
            } as any);
          }
        } catch {
          setConfig(DEFAULT_PAGE_DESIGN);
        }
      }
    };
    loadCurrentDesign();
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const apply = () => setIsDesktop(mql.matches);
    apply();

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }

    const legacyMql = mql as any;
    if (typeof legacyMql.addListener === 'function') legacyMql.addListener(apply);
    return () => {
      if (typeof legacyMql.removeListener === 'function') legacyMql.removeListener(apply);
    };
  }, []);

  useEffect(() => {
    setPreviewMode(isDesktop ? 'desktop' : 'mobile');
  }, [isDesktop]);

  useEffect(() => {
    setIsPreviewHeaderMenuOpen(false);
  }, [previewMode, previewPage]);

  const handlePreviewShare = () => {
    try {
      const href = window.location.href;
      const clipboard = (navigator as any)?.clipboard;
      if (clipboard?.writeText) clipboard.writeText(href);
      addToast('تم نسخ الرابط لمشاركته!', 'info');
    } catch {
      addToast('تم نسخ الرابط لمشاركته!', 'info');
    }
  };

  useEffect(() => {
    handleSaveRef.current = () => {
      handleSave();
    };
  }, [shopId, config, logoDataUrl, logoFile, bannerFile, bannerPreview, backgroundFile, backgroundPreview]);

  useEffect(() => {
    const onSave = () => {
      try {
        handleSaveRef.current?.();
      } catch {
      }
    };
    window.addEventListener('pagebuilder-save', onSave as any);
    return () => {
      window.removeEventListener('pagebuilder-save', onSave as any);
    };
  }, []);

  const handleSave = async () => {
    if (!shopId) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const uploadMedia = async (file: File, purpose: string) => {
        // Compress image before upload
        const isImage = file.type.startsWith('image/') && !file.type.includes('gif');
        const fileToUpload = isImage ? await compressImage(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1600 }) : file;
        
        const uploaded = await ApiService.uploadMediaRobust({ file: fileToUpload as File, purpose, shopId });
        return String(uploaded?.url || '').trim();
      };

      let uploadedBanner: any = null;
      if (bannerFile) {
        try {
          const bannerUrl = await uploadMedia(bannerFile, 'shop_banner');
          const isVideo = String(bannerFile?.type || '').toLowerCase().startsWith('video/');
          uploadedBanner = {
            bannerUrl,
            ...(isVideo ? {} : { bannerPosterUrl: bannerUrl }),
          };
          try {
            if (bannerPreview && bannerPreview.startsWith('blob:')) {
              URL.revokeObjectURL(bannerPreview);
            }
          } catch {
          }
          setBannerPreview('');
          setBannerFile(null);
        } catch {
          addToast('فشل رفع بانر المتجر', 'error');
        }
      }

      let uploadedBackgroundUrl = '';
      if (backgroundFile) {
        try {
          uploadedBackgroundUrl = await uploadMedia(backgroundFile, 'shop_background');
          try {
            if (backgroundPreview && backgroundPreview.startsWith('blob:')) {
              URL.revokeObjectURL(backgroundPreview);
            }
          } catch {
          }
          setBackgroundPreview('');
          setBackgroundFile(null);
        } catch {
          addToast('فشل رفع خلفية الصفحة', 'error');
        }
      }

      // حفظ دائم في قاعدة البيانات
      const elementsVisibilityRaw = config?.elementsVisibility;
      const elementsVisibilityNormalized = elementsVisibilityRaw && typeof elementsVisibilityRaw === 'object'
        ? Object.fromEntries(
            Object.entries(elementsVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)])
          )
        : undefined;

      const productEditorVisibilityRaw = config?.productEditorVisibility;
      const productEditorVisibilityNormalized = (() => {
        if (productEditorVisibilityRaw && typeof productEditorVisibilityRaw === 'object') {
          return Object.fromEntries(
            Object.entries(productEditorVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)])
          );
        }

        // Migration: sync productEditorVisibility with elementsVisibility for consistency
        // This ensures that if user only changes elementsVisibility, productEditorVisibility stays in sync
        const base = elementsVisibilityNormalized && typeof elementsVisibilityNormalized === 'object'
          ? (elementsVisibilityNormalized as Record<string, any>)
          : ({} as Record<string, any>);

        const keys = ['productCardPrice', 'productCardStock', 'productCardAddToCart', 'productCardReserve'];
        const picked: Record<string, any> = {};
        let hasAny = false;
        for (const k of keys) {
          if (base[k] !== undefined && base[k] !== null) {
            picked[k] = coerceBoolean(base[k], true);
            hasAny = true;
          }
        }
        return hasAny ? picked : undefined;
      })();

      const imageMapVisibilityRaw = config?.imageMapVisibility;
      const imageMapVisibilityNormalized = imageMapVisibilityRaw && typeof imageMapVisibilityRaw === 'object'
        ? Object.fromEntries(
            Object.entries(imageMapVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)])
          )
        : undefined;

      const normalized = {
        ...config,
        ...(uploadedBanner?.bannerUrl ? { bannerUrl: uploadedBanner.bannerUrl } : {}),
        ...(uploadedBanner?.bannerPosterUrl ? { bannerPosterUrl: uploadedBanner.bannerPosterUrl } : {}),
        ...(uploadedBackgroundUrl ? { backgroundImageUrl: uploadedBackgroundUrl } : {}),
        bannerPosX: coerceNumber((config as any)?.bannerPosX, Number((DEFAULT_PAGE_DESIGN as any).bannerPosX)),
        bannerPosY: coerceNumber((config as any)?.bannerPosY, Number((DEFAULT_PAGE_DESIGN as any).bannerPosY)),
        headerTransparent: Boolean(config.headerTransparent),
        footerTransparent: Boolean(config.footerTransparent),
        headerOpacity: coerceNumber(config.headerOpacity, Number(DEFAULT_PAGE_DESIGN.headerOpacity)),
        footerOpacity: coerceNumber(config.footerOpacity, Number(DEFAULT_PAGE_DESIGN.footerOpacity)),
        elementsVisibility: elementsVisibilityNormalized,
        productEditorVisibility: productEditorVisibilityNormalized,
        imageMapVisibility: imageMapVisibilityNormalized,
        customCss: typeof (config as any)?.customCss === 'string' ? (config as any).customCss : undefined,
        pageBackgroundColor: config.pageBackgroundColor || config.backgroundColor,
        backgroundColor: config.backgroundColor || config.pageBackgroundColor,
        productDisplay: config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined),
        productDisplayStyle: config.productDisplayStyle || (config.productDisplay === 'list' ? 'list' : undefined),
      };
      await ApiService.updateShopDesign(shopId, normalized);

      if (uploadedBanner?.bannerUrl) {
        setConfig((prev: any) => ({
          ...prev,
          bannerUrl: uploadedBanner.bannerUrl,
          bannerPosterUrl: uploadedBanner?.bannerPosterUrl || (prev as any)?.bannerPosterUrl,
        }));
      }

      if (uploadedBackgroundUrl) {
        setConfig((prev: any) => ({
          ...prev,
          backgroundImageUrl: uploadedBackgroundUrl,
        }));
      }

      try {
        if (logoFile) {
          const nextLogoUrl = await uploadMedia(logoFile, 'shop_logo');
          await ApiService.updateMyShop({ logoUrl: nextLogoUrl });
          try {
            if (logoDataUrl && logoDataUrl.startsWith('blob:')) {
              URL.revokeObjectURL(logoDataUrl);
            }
          } catch {
          }
          setLogoDataUrl(nextLogoUrl);
          setLogoFile(null);
        } else if (!logoDataUrl) {
          await ApiService.updateMyShop({ logoUrl: '' });
        }
      } catch {
        addToast('فشل تحديث لوجو المتجر', 'error');
      }
      
      // Clear blob URL after successful save
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview);
        setBannerPreview('');
        // Keep the server URL in config
        setConfig({ ...config, bannerUrl: uploadedBanner?.bannerUrl || config.bannerUrl || '' });
      }

      if (backgroundPreview && backgroundPreview.startsWith('blob:')) {
        URL.revokeObjectURL(backgroundPreview);
        setBackgroundPreview('');
        setBackgroundFile(null);
        setConfig({ ...config, backgroundImageUrl: uploadedBackgroundUrl || (config as any)?.backgroundImageUrl || '' });
      }
      
      setSaving(false);
      setSaved(true);
      addToast('تم حفظ تصميم المتجر بنجاح!', 'success');
      try {
        window.dispatchEvent(new CustomEvent('ray-shop-updated', { detail: { shopId } }));
      } catch {
      }
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaving(false);
      addToast('فشل حفظ التصميم، حاول مرة أخرى', 'error');
    } finally {
      savingRef.current = false;
    }
  };

  if (!config) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00E5FF]" /></div>;

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  const isVisible = (key: string, fallback = true) => {
    const current = ((config as any)?.elementsVisibility || {}) as Record<string, any>;
    if (current[key] === undefined || current[key] === null) return fallback;
    return Boolean(current[key]);
  };

  const setConfigAny = (next: any) => {
    if (typeof next === 'function') {
      setConfig((prev: any) => {
        const computed = next(prev);
        try {
          localStorage.setItem('ray_builder_preview_design', JSON.stringify(computed));
          localStorage.setItem('ray_builder_preview_logo', String(logoDataUrl || ''));
          window.dispatchEvent(new Event('ray-builder-preview-update'));
        } catch {
        }
        return computed;
      });
      return;
    }

    setConfig(next as any);
    try {
      localStorage.setItem('ray_builder_preview_design', JSON.stringify(next));
      localStorage.setItem('ray_builder_preview_logo', String(logoDataUrl || ''));
      window.dispatchEvent(new Event('ray-builder-preview-update'));
    } catch {
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('ray_builder_preview_design', JSON.stringify(config));
      localStorage.setItem('ray_builder_preview_logo', String(logoDataUrl || ''));
      window.dispatchEvent(new Event('ray-builder-preview-update'));
    } catch {
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem('ray_builder_preview_logo', String(logoDataUrl || ''));
      window.dispatchEvent(new Event('ray-builder-preview-update'));
    } catch {
    }
  }, [logoDataUrl]);

  const handleSaveLogo = async () => {
    if (!shopId) return;
    if (!logoFile) return;
    if (logoSavingRef.current) return;
    logoSavingRef.current = true;
    setLogoSaving(true);
    try {
      const isImage = logoFile.type.startsWith('image/') && !logoFile.type.includes('gif');
      const fileToUpload = isImage
        ? await compressImage(logoFile, { maxSizeMB: 0.5, maxWidthOrHeight: 1600 })
        : logoFile;

      const uploaded = await ApiService.uploadMediaRobust({ file: fileToUpload as File, purpose: 'shop_logo', shopId });
      const nextLogoUrl = String(uploaded?.url || '').trim();
      if (!nextLogoUrl) throw new Error('Upload failed');

      await ApiService.updateMyShop({ logoUrl: nextLogoUrl });

      try {
        if (logoDataUrl && logoDataUrl.startsWith('blob:')) {
          URL.revokeObjectURL(logoDataUrl);
        }
      } catch {
      }

      setLogoDataUrl(nextLogoUrl);
      setLogoFile(null);
      addToast('تم حفظ اللوجو بنجاح!', 'success');
      try {
        window.dispatchEvent(new CustomEvent('ray-shop-updated', { detail: { shopId } }));
      } catch {
      }
    } catch {
      addToast('فشل حفظ اللوجو، حاول مرة أخرى', 'error');
    } finally {
      setLogoSaving(false);
      logoSavingRef.current = false;
    }
  };

  const Section = ({ id, title, icon, render }: any) => (
    <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full px-5 py-4 flex items-center justify-between transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 flex-row-reverse">
          {icon}
          <span className="font-black text-sm">{title}</span>
        </div>
        <ChevronLeft className={`w-5 h-5 transition-transform ${openSection === id ? 'rotate-90' : 'rotate-180'}`} />
      </button>
      <AnimatePresence initial={false}>
        {openSection === id && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 overflow-hidden"
          >
            {typeof render === 'function' ? render() : null}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );

  const activeSectionNode = (() => {
    if (!sidebarMode) return null;
    return (
      <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#00E5FF]" /></div>}>
        <SectionRenderer
          activeBuilderTab={activeBuilderTab}
          config={config}
          setConfig={setConfigAny}
          shop={shop}
          logoDataUrl={logoDataUrl}
          setLogoDataUrl={setLogoDataUrl}
          logoFile={logoFile}
          setLogoFile={setLogoFile}
          logoSaving={logoSaving}
          onSaveLogo={handleSaveLogo}
          bannerFile={bannerFile}
          setBannerFile={setBannerFile}
          bannerPreview={bannerPreview}
          setBannerPreview={setBannerPreview}
          backgroundFile={backgroundFile}
          setBackgroundFile={setBackgroundFile}
          backgroundPreview={backgroundPreview}
          setBackgroundPreview={setBackgroundPreview}
        />
      </Suspense>
    );
  })();

  const desktopAccordionSlot = desktopIntegratedAccordionMode && sidebarMode
    ? document.getElementById(`builder-accordion-${String(activeBuilderTab)}`)
    : null;

  return (
    <div className="w-full bg-[#F8F9FA] flex flex-col md:flex-row-reverse text-right font-sans overflow-hidden" dir="rtl">

      {desktopAccordionSlot && activeSectionNode
        ? createPortal(
            <div className="w-full" data-component-name="PageBuilder">
              {activeSectionNode}
            </div>,
            desktopAccordionSlot
          )
        : null}

      {(!integratedMode || !isDesktop) && (
        <AnimatePresence>
          {(showSettingsMobile || isDesktop) && (
            <>
              <MotionDiv 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowSettingsMobile(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[220] md:hidden"
              />
              
              <MotionDiv 
                initial={!isDesktop ? { y: '100%' } : { x: '100%' }}
                animate={!isDesktop ? { y: 0 } : { x: 0 }}
                exit={!isDesktop ? { y: '100%' } : { x: '100%' }}
                className="fixed bottom-0 left-0 right-0 md:relative md:w-[340px] lg:w-[380px] h-[80vh] md:h-full bg-white md:border-l border-slate-200 flex flex-col shadow-2xl z-[230] rounded-t-[2rem] sm:rounded-t-[2.5rem] md:rounded-none"
              >
                <header className="p-4 sm:p-6 md:p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-30">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowSettingsMobile(false)} className="md:hidden p-2 bg-slate-50 rounded-full transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-95"><X size={18} className="sm:w-5 sm:h-5" /></button>
                    <h2 className="font-black text-xl md:text-3xl tracking-tighter">التصميم</h2>
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none ${
                      saved ? 'bg-green-500 text-white' : 'bg-slate-900 text-white shadow-xl hover:bg-black'
                    }`}
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                    <span>{saved ? 'تم الحفظ' : 'حفظ التصميم'}</span>
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4">
                  <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white">
                    <div className="px-5 py-4 flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900">معاينة الصفحة</span>
                      <div className="inline-flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setPreviewPage('home')}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'home' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          الرئيسية
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPage('gallery')}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'gallery' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          معرض الصور
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPage('info')}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'info' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          معلومات
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPage('product')}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'product' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          المنتج
                        </button>
                      </div>
                    </div>
                  </div>
                  {sidebarMode ? (
                    activeSectionNode
                  ) : (
                    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#00E5FF]" /></div>}>
                      <SectionRenderer
                        config={config}
                        setConfig={setConfigAny}
                        shop={shop}
                        logoDataUrl={logoDataUrl}
                        setLogoDataUrl={setLogoDataUrl}
                        logoFile={logoFile}
                        setLogoFile={setLogoFile}
                        logoSaving={logoSaving}
                        onSaveLogo={handleSaveLogo}
                        bannerFile={bannerFile}
                        setBannerFile={setBannerFile}
                        bannerPreview={bannerPreview}
                        setBannerPreview={setBannerPreview}
                        backgroundFile={backgroundFile}
                        setBackgroundFile={setBackgroundFile}
                        backgroundPreview={backgroundPreview}
                        setBackgroundPreview={setBackgroundPreview}
                        toggleSection={toggleSection}
                        openSection={openSection}
                      />
                    </Suspense>
                  )}
                </div>
              </MotionDiv>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Live Preview */}
      <main className="flex-1 flex flex-col relative bg-[#F1F3F5] overflow-hidden">
        <header className="h-16 sm:h-20 md:h-24 bg-white/60 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 md:px-12 sticky top-0 z-10">
           {!integratedMode && (
             <button onClick={onClose} className="p-2 sm:p-3 bg-white rounded-xl shadow-sm text-slate-900 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98]"><ChevronLeft className="rotate-180" /></button>
           )}
           
           {isDesktop && (
             <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-inner border border-slate-100">
                <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewMode === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><Monitor size={18} /></button>
                <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewMode === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><Smartphone size={18} /></button>
             </div>
           )}
        </header>

        <div className={`flex-1 overflow-y-auto p-6 md:p-12 ${integratedMode ? 'flex flex-col items-center gap-8' : 'flex items-start justify-center'}`}>
          <MotionDiv 
            layout
            className={`shadow-2xl overflow-hidden transition-all duration-700 flex flex-col relative ${
              previewMode === 'mobile' ? 'w-full max-w-[375px] min-h-[667px] rounded-[2.2rem] sm:rounded-[3rem] border-[8px] sm:border-[10px] border-slate-900 box-border' : 'w-full max-w-5xl rounded-[3rem]'
            }`}
            style={{
              backgroundColor: config.pageBackgroundColor || config.backgroundColor || '#FFFFFF',
              backgroundImage: (backgroundPreview || String((config as any)?.backgroundImageUrl || ''))
                ? `url("${backgroundPreview || String((config as any)?.backgroundImageUrl || '')}")`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="w-full">
              <PreviewRendererAny
                page={previewPage}
                config={config}
                shop={{ id: shopId, name: 'معاينة المتجر' }}
                logoDataUrl={logoDataUrl}
                isPreviewHeaderMenuOpen={isPreviewHeaderMenuOpen}
                setIsPreviewHeaderMenuOpen={setIsPreviewHeaderMenuOpen}
                isMobilePreview={previewMode === 'mobile'}
              />
            </div>
          </MotionDiv>
        </div>

        <button 
          onClick={() => setShowSettingsMobile(true)}
          className="md:hidden fixed bottom-6 left-6 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl z-[210] active:scale-90 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
        >
           <Sliders size={24} />
        </button>
      </main>
    </div>
  );
};

export default PageBuilder;
