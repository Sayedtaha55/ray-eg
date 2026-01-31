
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, Save, Layout, Check, 
  Monitor, Smartphone, X, 
  Sliders, Loader2, Menu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components';
import * as ReactRouterDOM from 'react-router-dom';
import { BUILDER_SECTIONS } from './builder/registry';

const MotionDiv = motion.div as any;
const { useLocation } = ReactRouterDOM as any;

const isVideoUrl = (url: string) => {
  const u = String(url || '').toLowerCase();
  return u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov');
};

const coerceBoolean = (value: any, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

const coerceNumber = (value: any, fallback: number) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const DEFAULT_PAGE_DESIGN = {
  primaryColor: '#00E5FF',
  secondaryColor: '#BD00FF',
  layout: 'modern',
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
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
};

interface ShopDesign {
  primaryColor: string;
  secondaryColor: string;
  layout: string;
  bannerUrl: string;
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
  customCss?: string;
}

const PageBuilder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addToast } = useToast();
  const location = useLocation();
  const [shopId, setShopId] = useState<string>('');
  const [config, setConfig] = useState<ShopDesign>(DEFAULT_PAGE_DESIGN);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewPage, setPreviewPage] = useState<'home' | 'product' | 'gallery' | 'info'>('home');
  const [isPreviewHeaderMenuOpen, setIsPreviewHeaderMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState('colors');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');
  const [headerBackgroundFile, setHeaderBackgroundFile] = useState<File | null>(null);
  const [headerBackgroundPreview, setHeaderBackgroundPreview] = useState<string>('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSettingsMobile, setShowSettingsMobile] = useState(false);

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
          const shopLogoSrc = String(myShop?.logoUrl || myShop?.logo_url || '').trim();
          setLogoDataUrl(shopLogoSrc);
          setLogoFile(null);
          if (myShop && myShop.pageDesign) {
            const merged = { ...DEFAULT_PAGE_DESIGN, ...myShop.pageDesign } as any;
            const elementsVisibilityRaw = merged?.elementsVisibility;
            const elementsVisibilityNormalized = elementsVisibilityRaw && typeof elementsVisibilityRaw === 'object'
              ? Object.fromEntries(
                  Object.entries(elementsVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)])
                )
              : undefined;
            const customCssNormalized = typeof merged?.customCss === 'string' ? merged.customCss : '';
            setConfig({
              ...merged,
              headerTransparent: coerceBoolean(merged.headerTransparent, Boolean(DEFAULT_PAGE_DESIGN.headerTransparent)),
              footerTransparent: coerceBoolean(merged.footerTransparent, Boolean(DEFAULT_PAGE_DESIGN.footerTransparent)),
              headerOpacity: coerceNumber(merged.headerOpacity, Number(DEFAULT_PAGE_DESIGN.headerOpacity)),
              footerOpacity: coerceNumber(merged.footerOpacity, Number(DEFAULT_PAGE_DESIGN.footerOpacity)),
              elementsVisibility: elementsVisibilityNormalized,
              customCss: customCssNormalized,
            });
          } else {
            setConfig(DEFAULT_PAGE_DESIGN);
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
    if (!isDesktop) {
      setPreviewMode('mobile');
    }
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
    const onSave = () => {
      handleSave();
    };
    window.addEventListener('pagebuilder-save', onSave as any);
    return () => {
      window.removeEventListener('pagebuilder-save', onSave as any);
    };
  }, [shopId, config, logoDataUrl, logoFile, bannerFile, bannerPreview, backgroundFile, backgroundPreview, headerBackgroundFile, headerBackgroundPreview]);

  const handleSave = async () => {
    if (!shopId) return;
    setSaving(true);
    try {
      const uploadMedia = async (file: File, purpose: string) => {
        const uploaded = await ApiService.uploadMedia({ file, purpose, shopId });
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

      let uploadedHeaderBackgroundUrl = '';
      if (headerBackgroundFile) {
        try {
          uploadedHeaderBackgroundUrl = await uploadMedia(headerBackgroundFile, 'shop_header_background');
          try {
            if (headerBackgroundPreview && headerBackgroundPreview.startsWith('blob:')) {
              URL.revokeObjectURL(headerBackgroundPreview);
            }
          } catch {
          }
          setHeaderBackgroundPreview('');
          setHeaderBackgroundFile(null);
        } catch {
          addToast('فشل رفع خلفية الهيدر', 'error');
        }
      }

      // حفظ دائم في قاعدة البيانات
      const elementsVisibilityRaw = (config as any)?.elementsVisibility;
      const elementsVisibilityNormalized = elementsVisibilityRaw && typeof elementsVisibilityRaw === 'object'
        ? Object.fromEntries(
            Object.entries(elementsVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)])
          )
        : undefined;

      const normalized = {
        ...config,
        ...(uploadedBanner?.bannerUrl ? { bannerUrl: uploadedBanner.bannerUrl } : {}),
        ...(uploadedBanner?.bannerPosterUrl ? { bannerPosterUrl: uploadedBanner.bannerPosterUrl } : {}),
        ...(uploadedBackgroundUrl ? { backgroundImageUrl: uploadedBackgroundUrl } : {}),
        ...(uploadedHeaderBackgroundUrl ? { headerBackgroundImageUrl: uploadedHeaderBackgroundUrl } : {}),
        headerTransparent: Boolean(config.headerTransparent),
        footerTransparent: Boolean(config.footerTransparent),
        headerOpacity: coerceNumber(config.headerOpacity, Number(DEFAULT_PAGE_DESIGN.headerOpacity)),
        footerOpacity: coerceNumber(config.footerOpacity, Number(DEFAULT_PAGE_DESIGN.footerOpacity)),
        elementsVisibility: elementsVisibilityNormalized,
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

      if (uploadedHeaderBackgroundUrl) {
        setConfig((prev: any) => ({
          ...prev,
          headerBackgroundImageUrl: uploadedHeaderBackgroundUrl,
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

      if (headerBackgroundPreview && headerBackgroundPreview.startsWith('blob:')) {
        URL.revokeObjectURL(headerBackgroundPreview);
        setHeaderBackgroundPreview('');
        setHeaderBackgroundFile(null);
        setConfig({ ...config, headerBackgroundImageUrl: uploadedHeaderBackgroundUrl || (config as any)?.headerBackgroundImageUrl || '' });
      }
      
      setSaving(false);
      setSaved(true);
      addToast('تم حفظ تصميم المتجر بنجاح!', 'success');
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaving(false);
      addToast('فشل حفظ التصميم، حاول مرة أخرى', 'error');
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

  const setConfigAny = (next: any) => setConfig(next as any);

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
    const s = BUILDER_SECTIONS.find((x) => String(x.id) === String(activeBuilderTab));
    if (!s) return null;
    return s.render({
      config,
      setConfig: setConfigAny,
      logoDataUrl,
      setLogoDataUrl,
      logoFile,
      setLogoFile,
      bannerFile,
      setBannerFile,
      bannerPreview,
      setBannerPreview,
      backgroundFile,
      setBackgroundFile,
      backgroundPreview,
      setBackgroundPreview,
      headerBackgroundFile,
      setHeaderBackgroundFile,
      headerBackgroundPreview,
      setHeaderBackgroundPreview,
    });
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
                className="fixed bottom-0 left-0 right-0 md:relative md:w-[340px] lg:w-[380px] h-[80vh] md:h-full bg-white md:border-l border-slate-200 flex flex-col shadow-2xl z-[230] rounded-t-[2.5rem] md:rounded-none"
              >
                <header className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-30">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowSettingsMobile(false)} className="md:hidden p-2 bg-slate-50 rounded-full transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-95"><X size={20} /></button>
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

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
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
                    (() => {
                      const s = BUILDER_SECTIONS.find((x) => String(x.id) === String(activeBuilderTab));
                      if (!s) return null;
                      return (
                        <Section
                          key={s.id}
                          id={s.id}
                          title={s.title}
                          icon={s.icon}
                          render={() =>
                            s.render({
                              config,
                              setConfig: setConfigAny,
                              logoDataUrl,
                              setLogoDataUrl,
                              logoFile,
                              setLogoFile,
                              bannerFile,
                              setBannerFile,
                              bannerPreview,
                              setBannerPreview,
                              backgroundFile,
                              setBackgroundFile,
                              backgroundPreview,
                              setBackgroundPreview,
                              headerBackgroundFile,
                              setHeaderBackgroundFile,
                              headerBackgroundPreview,
                              setHeaderBackgroundPreview,
                            })
                          }
                        />
                      );
                    })()
                  ) : (
                    BUILDER_SECTIONS.map((s) => (
                      <Section
                        key={s.id}
                        id={s.id}
                        title={s.title}
                        icon={s.icon}
                        render={() =>
                          s.render({
                            config,
                            setConfig: setConfigAny,
                            logoDataUrl,
                            setLogoDataUrl,
                            logoFile,
                            setLogoFile,
                            bannerFile,
                            setBannerFile,
                            bannerPreview,
                            setBannerPreview,
                            backgroundFile,
                            setBackgroundFile,
                            backgroundPreview,
                            setBackgroundPreview,
                            headerBackgroundFile,
                            setHeaderBackgroundFile,
                            headerBackgroundPreview,
                            setHeaderBackgroundPreview,
                          })
                        }
                      />
                    ))
                  )}
                </div>
              </MotionDiv>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Live Preview */}
      <main className="flex-1 flex flex-col relative bg-[#F1F3F5] overflow-hidden">
        <header className="h-20 md:h-24 bg-white/60 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 md:px-12 sticky top-0 z-10">
           {!integratedMode && (
             <button onClick={onClose} className="p-3 bg-white rounded-xl shadow-sm text-slate-900 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98]"><ChevronLeft className="rotate-180" /></button>
           )}
           
           {isDesktop && (
             <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-inner border border-slate-100">
                <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewMode === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><Monitor size={18} /></button>
                <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewMode === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><Smartphone size={18} /></button>
             </div>
           )}
        </header>

        <div className={`flex-1 overflow-y-auto ${config.pagePadding || 'p-6 md:p-12'} ${integratedMode ? 'flex flex-col items-center gap-8' : 'flex items-start justify-center'}`}>
          <MotionDiv 
            layout
            className={`shadow-2xl overflow-hidden transition-all duration-700 flex flex-col relative ${
              previewMode === 'mobile' ? 'w-full max-w-[375px] min-h-[667px] rounded-[3rem] border-[10px] border-slate-900 box-border' : 'w-full max-w-5xl rounded-[3rem]'
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
            {(() => {
              const isBold = config.layout === 'bold';
              const isMinimal = config.layout === 'minimal';

              const headerTextColor = String(config.headerTextColor || '#0F172A');
              const headerBackgroundColor = String(config.headerBackgroundColor || '#FFFFFF');
              const headerBackgroundImage = Boolean(config.headerTransparent)
                ? ''
                : (headerBackgroundPreview || String((config as any)?.headerBackgroundImageUrl || ''));
              const headerBg = Boolean(config.headerTransparent)
                ? 'transparent'
                : headerBackgroundColor;

              const footerTextColor = String(config.footerTextColor || (isBold ? '#FFFFFF' : '#0F172A'));
              const footerBackgroundColor = String(
                config.footerBackgroundColor || (isBold ? '#0F172A' : isMinimal ? '#FFFFFF' : '#F8FAFC')
              );
              const footerBg = Boolean(config.footerTransparent)
                ? 'transparent'
                : footerBackgroundColor;

              return (
                <>
                  <header
                    className={`sticky top-0 z-[120] backdrop-blur-lg border-b transition-all duration-500 ${
                      Boolean(config.headerTransparent)
                        ? 'border-transparent bg-transparent'
                        : `backdrop-blur-lg ${isBold ? 'border-slate-200 bg-white/95' : isMinimal ? 'bg-white/90 border-slate-100' : 'bg-white/95 border-slate-100'}`
                    }`}
                    style={{
                      backgroundColor: headerBg,
                      color: headerTextColor,
                      backgroundImage: headerBackgroundImage ? `url("${headerBackgroundImage}")` : undefined,
                      backgroundSize: headerBackgroundImage ? 'cover' : undefined,
                      backgroundPosition: headerBackgroundImage ? 'center' : undefined,
                      backgroundRepeat: headerBackgroundImage ? 'no-repeat' : undefined,
                    }}
                  >
                    <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-3 md:py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-md bg-slate-100" />
                          <div>
                            <h3 className={`font-black ${isBold ? 'text-lg md:text-2xl' : 'text-sm md:text-lg'}`} style={{ color: config.primaryColor }}>
                              معاينة المتجر
                            </h3>
                            <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">
                              RETAIL • القاهرة
                            </p>
                          </div>
                        </div>

                        {isVisible('headerNav', true) && previewMode !== 'mobile' && (
                          <nav className="flex items-center gap-6 md:gap-8">
                            {isVisible('headerNavHome', true) && (
                              <button
                                type="button"
                                onClick={() => setPreviewPage('home')}
                                style={{ color: headerTextColor, opacity: previewPage === 'home' ? 1 : 0.6 }}
                                className="text-xs md:text-sm font-black transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2"
                              >
                                المعروضات
                              </button>
                            )}
                            {isVisible('headerNavGallery', true) && (
                              <button
                                type="button"
                                onClick={() => setPreviewPage('gallery')}
                                style={{ color: headerTextColor, opacity: previewPage === 'gallery' ? 1 : 0.6 }}
                                className="text-xs md:text-sm font-black transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2"
                              >
                                معرض الصور
                              </button>
                            )}
                            {isVisible('headerNavInfo', true) && (
                              <button
                                type="button"
                                onClick={() => setPreviewPage('info')}
                                style={{ color: headerTextColor, opacity: previewPage === 'info' ? 1 : 0.6 }}
                                className="text-xs md:text-sm font-black transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2"
                              >
                                معلومات المتجر
                              </button>
                            )}
                          </nav>
                        )}

                        <div className="flex items-center gap-2 md:gap-3">
                          {isVisible('headerNav', true) && previewMode === 'mobile' && (
                            <button
                              type="button"
                              onClick={() => setIsPreviewHeaderMenuOpen((v) => !v)}
                              className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm border active:scale-90 transition-transform"
                              style={{ borderColor: `${headerTextColor}15` }}
                              aria-label="القائمة"
                            >
                              {isPreviewHeaderMenuOpen ? <X size={16} /> : <Menu size={16} />}
                            </button>
                          )}
                          {previewMode !== 'mobile' && (
                            <>
                              <button
                                type="button"
                                className="p-2 md:p-2.5 rounded-full font-black text-[9px] md:text-xs transition-all shadow-sm border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.98]"
                                style={{ backgroundColor: config.primaryColor, color: '#000', borderColor: `${config.primaryColor}20` }}
                              />
                              <button
                                type="button"
                                className="p-2 md:p-2.5 bg-slate-900 text-white rounded-full font-black text-[9px] md:text-xs transition-all shadow-sm hover:bg-black hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98]"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </header>

                  {isVisible('floatingChatButton', true) && previewMode === 'mobile' && (
                    <div className="absolute bottom-6 right-4 z-40">
                      <button
                        type="button"
                        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all border-4 border-white"
                        style={{ backgroundColor: config.primaryColor, color: '#000' }}
                        aria-label="واتساب"
                      />
                    </div>
                  )}

                  {isVisible('headerNav', true) && previewMode === 'mobile' && isPreviewHeaderMenuOpen && (
                    <>
                      <div
                        className="absolute inset-0 z-[200]"
                        onClick={() => setIsPreviewHeaderMenuOpen(false)}
                      />
                      <div className="absolute top-20 left-0 right-0 z-[210] px-4">
                        <div className="rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md shadow-lg overflow-hidden">
                          {isVisible('headerNavHome', true) && (
                            <button
                              type="button"
                              onClick={() => { setPreviewPage('home'); setIsPreviewHeaderMenuOpen(false); }}
                              className={`w-full text-right px-4 py-3 font-black text-sm transition-colors ${previewPage === 'home' ? 'bg-slate-50' : 'bg-transparent'}`}
                              style={{ color: headerTextColor }}
                            >
                              المعروضات
                            </button>
                          )}
                          {isVisible('headerNavGallery', true) && (
                            <button
                              type="button"
                              onClick={() => { setPreviewPage('gallery'); setIsPreviewHeaderMenuOpen(false); }}
                              className={`w-full text-right px-4 py-3 font-black text-sm transition-colors ${previewPage === 'gallery' ? 'bg-slate-50' : 'bg-transparent'}`}
                              style={{ color: headerTextColor }}
                            >
                              معرض الصور
                            </button>
                          )}
                          {isVisible('headerNavInfo', true) && (
                            <button
                              type="button"
                              onClick={() => { setPreviewPage('info'); setIsPreviewHeaderMenuOpen(false); }}
                              className={`w-full text-right px-4 py-3 font-black text-sm transition-colors ${previewPage === 'info' ? 'bg-slate-50' : 'bg-transparent'}`}
                              style={{ color: headerTextColor }}
                            >
                              معلومات المتجر
                            </button>
                          )}
                          {isVisible('headerShareButton', true) && (
                            <button
                              type="button"
                              onClick={() => { handlePreviewShare(); setIsPreviewHeaderMenuOpen(false); }}
                              className="w-full text-right px-4 py-3 font-black text-sm transition-colors bg-transparent"
                              style={{ color: headerTextColor }}
                            >
                              مشاركة
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {previewPage === 'home' ? (
                    <>
                      <div className="h-40 md:h-64 relative shrink-0">
                        {(bannerPreview || config.bannerUrl) ? (
                          (bannerFile && bannerFile.type.startsWith('video/')) || isVideoUrl(bannerPreview || config.bannerUrl) ? (
                            <video
                              src={bannerPreview || config.bannerUrl}
                              className="w-full h-full object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                              poster={String((config as any)?.bannerPosterUrl || '') || undefined}
                            />
                          ) : (
                            <img src={bannerPreview || config.bannerUrl} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <p className="text-slate-400 font-black">لا توجد صورة بانر</p>
                          </div>
                        )}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-white via-transparent" />
                      </div>

                      <div className={`p-8 -mt-16 relative flex flex-col gap-6 flex-1 ${String(config.headerType || 'centered') === 'side' ? 'items-end text-right' : 'items-center text-center'}`}>
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2.5rem] shadow-xl p-2 border border-slate-50">
                          {logoDataUrl ? (
                            <img src={logoDataUrl} className="w-full h-full object-cover rounded-[2rem]" alt="logo" />
                          ) : (
                            <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center font-black text-slate-200 border-2 border-dashed border-slate-100 overflow-hidden text-[8px]">LOGO</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <h1 className={`font-black ${config.headingSize || 'text-4xl'}`} style={{ color: config.primaryColor }}>معاينة المتجر</h1>
                          <p className={`font-bold ${config.textSize || 'text-sm'} text-slate-500`}>وصف بسيط للمتجر يظهر للعملاء</p>
                        </div>
                        <button className={`${config.buttonPadding || 'px-6 py-3'} ${config.buttonShape || 'rounded-2xl'} text-white font-black text-sm shadow-xl transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98]`} style={{ backgroundColor: config.primaryColor }}>متابعة</button>

                        <div className={`w-full mt-10 space-y-6 ${config.itemGap || 'gap-4 md:gap-6'}`}>
                          {(config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined) || 'cards') === 'cards' ? (
                            <div className="grid grid-cols-2 gap-4">
                              {[1, 2].map(i => (
                                <div key={i} className={`p-3 rounded-2xl border ${config.layout === 'bold' ? 'border-2' : 'border-transparent'}`} style={{ borderColor: config.layout === 'bold' ? config.primaryColor + '22' : 'transparent' }}>
                                  <div className="aspect-square bg-slate-100 rounded-xl mb-2" />
                                  <div className="h-3 w-1/2 bg-slate-100 rounded-full mx-auto" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {[1, 2, 3].map(i => (
                                <div key={i} className={`flex flex-row-reverse items-center gap-3 ${((config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined) || 'cards') === 'minimal') ? 'border-b border-slate-100 py-3' : 'bg-white border border-slate-100 rounded-2xl p-3'}`}>
                                  <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                                  <div className="flex-1 space-y-2">
                                    <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                                    <div className="h-3 w-1/3 bg-slate-100 rounded-full" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : previewPage === 'product' ? (
                    <div className="p-6 md:p-10 space-y-6">
                      {isVisible('productTabs', true) && (
                        <div className="flex items-center justify-end">
                          <div className="inline-flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                            <button type="button" className="px-4 py-2 rounded-xl text-xs font-black text-white bg-slate-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98]">التفاصيل</button>
                            <button type="button" className="px-4 py-2 rounded-xl text-xs font-black text-slate-500 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98]">المواصفات</button>
                            <button type="button" className="px-4 py-2 rounded-xl text-xs font-black text-slate-500 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98]">الشحن</button>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-10">
                        <div className="w-full md:w-[420px]">
                          <div className="aspect-square rounded-[2rem] bg-slate-100 border border-slate-200 shadow-sm" />
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.primaryColor }} />
                              <span className="text-xs font-black text-slate-600">متوفر</span>
                            </div>
                            <span className="text-xs font-black text-slate-400">SKU: 0001</span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4 text-right">
                          <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-black" style={{ color: config.primaryColor }}>اسم المنتج</h1>
                            <p className="text-sm md:text-base font-bold text-slate-500">وصف مختصر للمنتج هنا، وبعد كدا هنضيف تفاصيل أكتر.</p>
                          </div>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="text-xl md:text-2xl font-black text-slate-900">EGP 249</span>
                            <span className="text-xs font-black text-slate-400 line-through">EGP 299</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                              type="button"
                              className={`${config.buttonPadding || 'px-6 py-3'} ${config.buttonShape || 'rounded-2xl'} text-white font-black text-sm shadow-xl transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98]`}
                              style={{ backgroundColor: config.primaryColor }}
                            >
                              إضافة للسلة
                            </button>
                            {isVisible('productShareButton', true) && (
                              <button
                                type="button"
                                className="px-6 py-3 rounded-2xl font-black text-sm border border-slate-200 bg-white text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98]"
                              >
                                مشاركة
                              </button>
                            )}
                          </div>

                          {isVisible('productQuickSpecs', true) && (
                            <div className="border border-slate-100 rounded-[1.5rem] bg-white p-5 space-y-3">
                              <h3 className="font-black text-sm text-slate-900">مواصفات سريعة</h3>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between flex-row-reverse text-sm">
                                  <span className="font-black text-slate-500">الخامة</span>
                                  <span className="font-bold text-slate-900">قطن</span>
                                </div>
                                <div className="flex items-center justify-between flex-row-reverse text-sm">
                                  <span className="font-black text-slate-500">اللون</span>
                                  <span className="font-bold text-slate-900">أسود</span>
                                </div>
                                <div className="flex items-center justify-between flex-row-reverse text-sm">
                                  <span className="font-black text-slate-500">المقاس</span>
                                  <span className="font-bold text-slate-900">M</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : previewPage === 'gallery' ? (
                    <div className="p-6 md:p-10 space-y-6">
                      <div className="flex items-center justify-between flex-row-reverse">
                        <h2 className="text-lg md:text-xl font-black text-slate-900">معرض الصور</h2>
                        <span className="text-xs font-black text-slate-400">PREVIEW</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 md:p-10 space-y-6">
                      <div className="flex items-center justify-between flex-row-reverse">
                        <h2 className="text-lg md:text-xl font-black text-slate-900">معلومات المتجر</h2>
                        <span className="text-xs font-black text-slate-400">PREVIEW</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl border border-slate-100 bg-white space-y-3 text-right">
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-black text-sm text-slate-900">العنوان</span>
                            <span className="text-xs font-bold text-slate-500">القاهرة، مصر</span>
                          </div>
                          <div className="h-px bg-slate-100" />
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-black text-sm text-slate-900">ساعات العمل</span>
                            <span className="text-xs font-bold text-slate-500">يوميًا 10ص - 10م</span>
                          </div>
                          <div className="h-px bg-slate-100" />
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-black text-sm text-slate-900">التواصل</span>
                            <span className="text-xs font-bold text-slate-500">0100 000 0000</span>
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                          <div className="aspect-video rounded-2xl bg-slate-100 border border-slate-200" />
                          <p className="mt-3 text-xs font-bold text-slate-400 text-right">مكان الخريطة هنا (معاينة)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <footer
                    className={`mt-16 md:mt-24 border-t transition-all duration-500 ${
                      Boolean(config.footerTransparent)
                        ? 'bg-transparent border-transparent'
                        : isBold ? 'bg-slate-900 border-slate-700' : isMinimal ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-200'
                    }`}
                    style={{ backgroundColor: footerBg, color: footerTextColor }}
                  >
                    <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8 md:py-12">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
                        <div className="text-center md:text-right">
                          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full border-2 border-white shadow-md bg-slate-100" />
                            <h4 className={`font-black ${isBold ? 'text-lg' : 'text-base'}`} style={{ color: footerTextColor }}>معاينة المتجر</h4>
                          </div>
                          <p className="text-xs md:text-sm font-bold leading-relaxed" style={{ opacity: 0.8 }}>
                            منصة متكاملة لتقديم أفضل الخدمات والمنتجات بجودة عالية.
                          </p>
                        </div>

                        <div className="text-center md:text-right">
                          <h5 className="font-black mb-3 text-sm md:text-base" style={{ color: footerTextColor }}>روابط سريعة</h5>
                          <div className="space-y-2">
                            <button type="button" className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80" style={{ color: footerTextColor, opacity: 0.8 }}>
                              المعروضات
                            </button>
                            <button type="button" className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80" style={{ color: footerTextColor, opacity: 0.8 }}>
                              معرض الصور
                            </button>
                            <button type="button" className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80" style={{ color: footerTextColor, opacity: 0.8 }}>
                              معلومات المتجر
                            </button>
                          </div>
                        </div>

                        <div className="text-center md:text-right">
                          <h5 className="font-black mb-3 text-sm md:text-base" style={{ color: footerTextColor }}>تواصل معنا</h5>
                          <div className="space-y-2">
                            <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>01000000000</p>
                            <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>جاري تحديث البريد الإلكتروني</p>
                            <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>القاهرة, مصر</p>
                          </div>
                        </div>
                      </div>

                      <div className={`pt-6 border-t text-center text-xs md:text-sm font-bold ${
                        isBold ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
                      }`} style={{ color: footerTextColor, opacity: 0.75 }}>
                        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} معاينة المتجر • تطوير بواسطة منصة تست</p>
                      </div>
                    </div>
                  </footer>
                </>
              );
            })()}
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
