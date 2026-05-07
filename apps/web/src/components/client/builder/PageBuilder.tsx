'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, Save, Layout, Check, Monitor, Smartphone, X, Sliders, Loader2, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { useBuilderSections, BUILDER_SECTION_IDS } from './registry';
import { coerceBoolean, coerceNumber } from './utils';
import SectionRenderer from './SectionRenderer';
import PreviewRenderer from './PreviewRenderer';

const MotionDiv = motion.div as any;

const DEFAULT_PAGE_DESIGN: any = {
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
  headerOverlayBanner: false,
  headerOpacity: 60,
  pageBackgroundColor: '#FFFFFF',
  backgroundImageUrl: '',
  productDisplay: 'cards',
  productsLayout: 'vertical',
  imageAspectRatio: 'square',
  rowsConfig: [
    { id: 'row-1', imageShape: 'portrait', displayMode: 'cards', itemsPerRow: 2 },
    { id: 'row-2', imageShape: 'square', displayMode: 'cards', itemsPerRow: 3 },
  ],
  footerBackgroundColor: '#FFFFFF',
  footerTextColor: '#0F172A',
  footerTransparent: false,
  footerOpacity: 90,
  headingSize: 'text-4xl',
  textSize: 'text-sm',
  fontWeight: 'font-black',
  buttonShape: 'rounded-2xl',
  buttonPadding: 'px-6 py-3',
  buttonPreset: 'primary',
  buttonHover: 'bg-slate-900',
  productCardOverlayBgColor: '#0F172A',
  productCardOverlayOpacity: 70,
  productCardTitleColor: '#FFFFFF',
  productCardPriceColor: '#FFFFFF',
  categoryIconShape: 'circular',
  categoryIconSize: 'medium',
  showProductsInCategories: false,
  categoryIconImage: '',
  categoryImages: {},
  pagePadding: 'p-6 md:p-12',
  itemGap: 'gap-4 md:gap-6',
  customCss: '',
  imageMapVisibility: { imageMapCardPrice: true, imageMapCardStock: true, imageMapCardAddToCart: true, imageMapCardDescription: true },
};

const PageBuilder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const t = useT();
  const { locale } = useLocale();
  const isArabic = String(locale || '').toLowerCase().startsWith('ar');
  const BUILDER_SECTIONS = useBuilderSections();

  const [shopId, setShopId] = useState<string>('');
  const [shop, setShop] = useState<any>(null);
  const [config, setConfig] = useState<any>(DEFAULT_PAGE_DESIGN);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(() => {
    try { if (typeof window === 'undefined') return 'desktop'; return window.matchMedia('(min-width: 768px)').matches ? 'desktop' : 'mobile'; } catch { return 'desktop'; }
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
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const savingRef = useRef(false);
  const logoSavingRef = useRef(false);
  const dirtyRef = useRef(false);
  const handleSaveRef = useRef<null | (() => void)>(null);
  const lastSavedDesignRef = useRef<string>('');

  const toggleSection = (id: string) => { setOpenSection(prev => prev === id ? '' : id); };

  const syncVisibilityWithModules = useCallback((current: any, shop: any) => {
    const next = { ...(current && typeof current === 'object' ? current : {}) } as Record<string, boolean>;
    const enabled = (() => {
      const layout = shop?.layoutConfig;
      const raw = layout && typeof layout === 'object' ? (layout as any).enabledModules : undefined;
      const core = ['overview', 'products', 'promotions', 'builder', 'settings'];
      const base = new Set<string>(core);
      if (!Array.isArray(raw)) return base;
      for (const x of raw) { const id = String(x || '').trim(); if (id) base.add(id); }
      return base;
    })();
    const hasSales = enabled.has('sales');
    const hasReservations = enabled.has('reservations');
    const hasGallery = enabled.has('gallery');
    if (!hasSales) { delete (next as any).productCardAddToCart; delete (next as any).mobileBottomNavCart; }
    if (!hasReservations) { delete (next as any).productCardReserve; }
    if (!hasGallery) { next.headerNavGallery = false; }
    return next;
  }, []);

  const loadCurrentDesign = useCallback(async (opts?: { silent?: boolean }) => {
    const savedUser = localStorage.getItem('ray_user');
    if (!savedUser) return;
    try { const user = JSON.parse(savedUser); if (user?.shopId != null) setShopId(String(user.shopId)); } catch {}
    try {
      const myShop = await clientFetch<any>('/v1/shops/mine');
      const shouldSkip = dirtyRef.current || savingRef.current || logoSavingRef.current;
      setShop(myShop);
      if (shouldSkip) return;

      const shopLogoSrc = String(myShop?.logoUrl || myShop?.logo_url || '').trim();
      setLogoDataUrl(shopLogoSrc);
      setLogoFile(null);

      const baseDesign = myShop && (myShop as any).pageDesign ? (myShop as any).pageDesign : {};
      const merged = { ...DEFAULT_PAGE_DESIGN, ...(baseDesign || {}) };

      const evRaw = merged?.elementsVisibility;
      const evNorm = evRaw && typeof evRaw === 'object' ? Object.fromEntries(Object.entries(evRaw).map(([k, v]) => [k, coerceBoolean(v, true)])) : undefined;
      const evSynced = syncVisibilityWithModules(evNorm, myShop);

      const imvRaw = merged?.imageMapVisibility;
      const imvNorm = imvRaw && typeof imvRaw === 'object' ? Object.fromEntries(Object.entries(imvRaw).map(([k, v]) => [k, coerceBoolean(v, true)])) : DEFAULT_PAGE_DESIGN.imageMapVisibility;

      const pevRaw = merged?.productEditorVisibility;
      const pevNorm = (() => {
        if (pevRaw && typeof pevRaw === 'object') return Object.fromEntries(Object.entries(pevRaw).map(([k, v]) => [k, coerceBoolean(v, true)]));
        const base = evNorm && typeof evNorm === 'object' ? evNorm as Record<string, any> : {} as Record<string, any>;
        const keys = ['productCardPrice', 'productCardStock', 'productCardAddToCart', 'productCardReserve'];
        const picked: Record<string, any> = {}; let hasAny = false;
        for (const k of keys) { if (base[k] !== undefined && base[k] !== null) { picked[k] = coerceBoolean(base[k], true); hasAny = true; } }
        return hasAny ? picked : undefined;
      })();

      const cssNorm = typeof merged?.customCss === 'string' ? merged.customCss : '';
      const normalized = { ...merged, elementsVisibility: evSynced, productEditorVisibility: pevNorm, imageMapVisibility: imvNorm, customCss: cssNorm };
      setConfig(normalized as any);
      try { lastSavedDesignRef.current = JSON.stringify(normalized); } catch { lastSavedDesignRef.current = ''; }
      dirtyRef.current = false;
    } catch {}
  }, [syncVisibilityWithModules]);

  useEffect(() => { loadCurrentDesign({ silent: false }); }, [loadCurrentDesign]);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const apply = () => setIsDesktop(mql.matches);
    apply();
    if (typeof mql.addEventListener === 'function') { mql.addEventListener('change', apply); return () => mql.removeEventListener('change', apply); }
    return () => {};
  }, []);

  useEffect(() => { setPreviewMode(isDesktop ? 'desktop' : 'mobile'); }, [isDesktop]);
  useEffect(() => { setIsPreviewHeaderMenuOpen(false); }, [previewMode, previewPage]);

  useEffect(() => {
    handleSaveRef.current = () => { handleSave(); };
  });

  useEffect(() => {
    const onSave = () => { try { handleSaveRef.current?.(); } catch {} };
    window.addEventListener('pagebuilder-save', onSave as any);
    return () => { window.removeEventListener('pagebuilder-save', onSave as any); };
  }, []);

  const handleSave = async () => {
    if (!shopId) return;
    if (savingRef.current) return;
    const hasMediaChanges = Boolean(bannerFile || backgroundFile || logoFile);
    const designSnapshot = (() => { try { return JSON.stringify(config || {}); } catch { return ''; } })();
    if (!hasMediaChanges && designSnapshot && designSnapshot === lastSavedDesignRef.current) {
      dirtyRef.current = false; setSaved(true); setTimeout(() => setSaved(false), 1200); return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const uploadMedia = async (file: File, purpose: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);
        formData.append('shopId', shopId);
        const result = await clientFetch<any>(`/v1/media/upload`, { method: 'POST', body: formData as any, headers: {} as any });
        return String(result?.url || '').trim();
      };

      let uploadedBanner: any = null;
      if (bannerFile) {
        try {
          const bannerUrl = await uploadMedia(bannerFile, 'shop_banner');
          uploadedBanner = { bannerUrl };
          try { if (bannerPreview && bannerPreview.startsWith('blob:')) URL.revokeObjectURL(bannerPreview); } catch {}
          setBannerPreview(''); setBannerFile(null);
        } catch {}
      }

      let uploadedBackgroundUrl = '';
      if (backgroundFile) {
        try {
          uploadedBackgroundUrl = await uploadMedia(backgroundFile, 'shop_background');
          try { if (backgroundPreview && backgroundPreview.startsWith('blob:')) URL.revokeObjectURL(backgroundPreview); } catch {}
          setBackgroundPreview(''); setBackgroundFile(null);
        } catch {}
      }

      const evRaw = config?.elementsVisibility;
      const evNorm = evRaw && typeof evRaw === 'object' ? Object.fromEntries(Object.entries(evRaw).map(([k, v]) => [k, coerceBoolean(v, true)])) : undefined;
      const pevRaw = config?.productEditorVisibility;
      const pevNorm = pevRaw && typeof pevRaw === 'object' ? Object.fromEntries(Object.entries(pevRaw).map(([k, v]) => [k, coerceBoolean(v, true)])) : undefined;
      const imvRaw = config?.imageMapVisibility;
      const imvNorm = imvRaw && typeof imvRaw === 'object' ? Object.fromEntries(Object.entries(imvRaw).map(([k, v]) => [k, coerceBoolean(v, true)])) : undefined;

      const normalized = {
        ...config,
        ...(uploadedBanner?.bannerUrl ? { bannerUrl: uploadedBanner.bannerUrl } : {}),
        ...(uploadedBackgroundUrl ? { backgroundImageUrl: uploadedBackgroundUrl } : {}),
        bannerPosX: coerceNumber((config as any)?.bannerPosX, 50),
        bannerPosY: coerceNumber((config as any)?.bannerPosY, 50),
        headerTransparent: Boolean(config.headerTransparent),
        footerTransparent: Boolean(config.footerTransparent),
        headerOpacity: coerceNumber(config.headerOpacity, 60),
        footerOpacity: coerceNumber(config.footerOpacity, 90),
        elementsVisibility: evNorm,
        productEditorVisibility: pevNorm,
        imageMapVisibility: imvNorm,
        customCss: typeof config?.customCss === 'string' ? config.customCss : undefined,
        pageBackgroundColor: config.pageBackgroundColor || config.backgroundColor,
        backgroundColor: config.backgroundColor || config.pageBackgroundColor,
        productDisplay: config.productDisplay || 'cards',
        productsLayout: config.productsLayout || 'vertical',
      };

      await clientFetch<any>(`/v1/shops/${shopId}/design`, { method: 'PUT', body: JSON.stringify(normalized) });
      setConfig(normalized as any);

      if (logoFile) {
        try {
          const nextLogoUrl = await uploadMedia(logoFile, 'shop_logo');
          await clientFetch<any>('/v1/shops/mine', { method: 'PATCH', body: JSON.stringify({ logoUrl: nextLogoUrl }) });
          try { if (logoDataUrl && logoDataUrl.startsWith('blob:')) URL.revokeObjectURL(logoDataUrl); } catch {}
          setLogoDataUrl(nextLogoUrl); setLogoFile(null);
        } catch {}
      }

      setSaving(false); setSaved(true); dirtyRef.current = false;
      try { lastSavedDesignRef.current = JSON.stringify(normalized || {}); } catch {}
      try { window.dispatchEvent(new CustomEvent('ray-shop-updated', { detail: { shopId } })); } catch {}
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaving(false);
    } finally {
      savingRef.current = false;
    }
  };

  const handleSaveLogo = async () => {
    if (!shopId || !logoFile || logoSavingRef.current) return;
    logoSavingRef.current = true;
    setLogoSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', logoFile);
      formData.append('purpose', 'shop_logo');
      formData.append('shopId', shopId);
      const result = await clientFetch<any>('/v1/media/upload', { method: 'POST', body: formData as any, headers: {} as any });
      const nextLogoUrl = String(result?.url || '').trim();
      if (!nextLogoUrl) throw new Error('Upload failed');
      await clientFetch<any>('/v1/shops/mine', { method: 'PATCH', body: JSON.stringify({ logoUrl: nextLogoUrl }) });
      try { if (logoDataUrl && logoDataUrl.startsWith('blob:')) URL.revokeObjectURL(logoDataUrl); } catch {}
      setLogoDataUrl(nextLogoUrl); setLogoFile(null);
    } catch {} finally { setLogoSaving(false); logoSavingRef.current = false; }
  };

  const setConfigAny = (next: any) => {
    if (typeof next === 'function') {
      setConfig((prev: any) => {
        const computed = next(prev);
        dirtyRef.current = true;
        try { localStorage.setItem('ray_builder_preview_design', JSON.stringify(computed)); localStorage.setItem('ray_builder_preview_logo', String(logoDataUrl || '')); window.dispatchEvent(new Event('ray-builder-preview-update')); } catch {}
        return computed;
      });
      return;
    }
    setConfig(next as any);
    dirtyRef.current = true;
    try { localStorage.setItem('ray_builder_preview_design', JSON.stringify(next)); localStorage.setItem('ray_builder_preview_logo', String(logoDataUrl || '')); window.dispatchEvent(new Event('ray-builder-preview-update')); } catch {}
  };

  useEffect(() => {
    try { localStorage.setItem('ray_builder_preview_design', JSON.stringify(config)); localStorage.setItem('ray_builder_preview_logo', String(logoDataUrl || '')); window.dispatchEvent(new Event('ray-builder-preview-update')); } catch {}
  }, [config]);

  useEffect(() => {
    try { localStorage.setItem('ray_builder_preview_logo', String(logoDataUrl || '')); window.dispatchEvent(new Event('ray-builder-preview-update')); } catch {}
  }, [logoDataUrl]);

  if (!config) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00E5FF]" /></div>;

  const renderCtx = { config, setConfig: setConfigAny, shop, logoDataUrl, setLogoDataUrl, logoFile, setLogoFile, logoSaving, onSaveLogo: handleSaveLogo, bannerFile, setBannerFile, bannerPreview, setBannerPreview, backgroundFile, setBackgroundFile, backgroundPreview, setBackgroundPreview };

  return (
    <div className={`w-full bg-[#F8F9FA] flex flex-col ${isArabic ? 'md:flex-row-reverse text-right' : 'md:flex-row text-left'} font-sans overflow-hidden`} dir={isArabic ? 'rtl' : 'ltr'}>
      {(!isDesktop || true) && (
        <AnimatePresence>
          {(showSettingsMobile || isDesktop) && (
            <>
              <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettingsMobile(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[220] md:hidden" />
              <MotionDiv
                initial={!isDesktop ? { y: '100%' } : { x: isArabic ? '100%' : '-100%' }}
                animate={!isDesktop ? { y: 0 } : { x: 0 }}
                exit={!isDesktop ? { y: '100%' } : { x: isArabic ? '100%' : '-100%' }}
                className={`fixed bottom-0 left-0 right-0 md:relative ${isDesktop && desktopSidebarCollapsed ? 'md:w-[88px]' : 'md:w-[340px] lg:w-[380px]'} h-[80vh] md:h-full bg-white ${isArabic ? 'md:border-l' : 'md:border-r'} border-slate-200 flex flex-col shadow-2xl z-[230] rounded-t-[2rem] sm:rounded-t-[2.5rem] md:rounded-none`}
              >
                <header className="p-4 sm:p-6 md:p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-30">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowSettingsMobile(false)} className="md:hidden p-2 bg-slate-50 rounded-full transition-all hover:bg-slate-100 active:scale-95"><X size={18} className="sm:w-5 sm:h-5" /></button>
                    {!desktopSidebarCollapsed && <h2 className="font-black text-xl md:text-3xl tracking-tighter">{t('business.pageBuilder.designTitle', 'تصميم الصفحة')}</h2>}
                  </div>
                  <div className="flex items-center gap-2">
                    {isDesktop && (
                      <button type="button" onClick={() => setDesktopSidebarCollapsed(prev => !prev)} className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors">
                        {isArabic ? <PanelRightClose size={18} /> : <PanelLeftClose size={18} />}
                      </button>
                    )}
                    {!desktopSidebarCollapsed && (
                      <button onClick={handleSave} disabled={saving} className={`px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm transition-all flex items-center gap-2 active:scale-[0.98] disabled:opacity-60 ${saved ? 'bg-green-500 text-white' : 'bg-slate-900 text-white shadow-xl hover:bg-black'}`}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                        <span>{saved ? t('business.pageBuilder.savedShort', 'تم الحفظ') : t('business.pageBuilder.saveDesign', 'حفظ التصميم')}</span>
                      </button>
                    )}
                  </div>
                </header>

                <div className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 ${desktopSidebarCollapsed ? 'hidden md:hidden' : ''}`}>
                  <div className="hidden md:block border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white">
                    <div className="px-5 py-4 flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900">{t('business.pageBuilder.previewTitle', 'معاينة')}</span>
                      <div className="inline-flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                        {(['home', 'gallery', 'info', 'product'] as const).map(p => (
                          <button key={p} type="button" onClick={() => setPreviewPage(p)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-[0.98] ${previewPage === p ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>{t(`business.pageBuilder.previewTabs.${p}`, p)}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <SectionRenderer {...renderCtx} toggleSection={toggleSection} openSection={openSection} />
                </div>
              </MotionDiv>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Live Preview */}
      <main className="flex-1 flex flex-col relative bg-[#F1F3F5] overflow-hidden">
        <header className="h-16 sm:h-20 md:h-24 bg-white/60 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 md:px-12 sticky top-0 z-10">
          <button onClick={onClose} className="p-2 sm:p-3 bg-white rounded-xl shadow-sm text-slate-900 transition-all hover:shadow-md active:scale-[0.98]"><ChevronLeft className="rotate-180" /></button>
          {isDesktop && (
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-inner border border-slate-100">
              <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-all active:scale-[0.98] ${previewMode === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><Monitor size={18} /></button>
              <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-all active:scale-[0.98] ${previewMode === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><Smartphone size={18} /></button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 flex items-start justify-center">
          <MotionDiv
            layout
            className={`shadow-2xl overflow-hidden transition-all duration-700 flex flex-col relative ${
              previewMode === 'mobile' ? 'w-full max-w-[375px] min-h-[667px] rounded-[2.2rem] sm:rounded-[3rem] border-[8px] sm:border-[10px] border-slate-900 box-border' : 'w-full max-w-5xl rounded-[3rem]'
            }`}
            style={{
              backgroundColor: config.pageBackgroundColor || config.backgroundColor || '#FFFFFF',
              backgroundImage: (backgroundPreview || String(config?.backgroundImageUrl || '')) ? `url("${backgroundPreview || String(config?.backgroundImageUrl || '')}")` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="w-full">
              <PreviewRenderer
                page={previewPage}
                config={config}
                shop={{ id: shopId, name: t('business.pageBuilder.previewShopName', 'متجر تجريبي') }}
                logoDataUrl={logoDataUrl}
                isPreviewHeaderMenuOpen={isPreviewHeaderMenuOpen}
                setIsPreviewHeaderMenuOpen={setIsPreviewHeaderMenuOpen}
                isMobilePreview={previewMode === 'mobile'}
                onProductClick={() => setPreviewPage('product')}
              />
            </div>
          </MotionDiv>
        </div>

        <button onClick={() => setShowSettingsMobile(true)} className="md:hidden fixed bottom-6 left-6 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl z-[210] active:scale-90 transition-transform">
          <Sliders size={24} />
        </button>
      </main>
    </div>
  );
};

export default PageBuilder;
