
import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, Save, Layout, Check, 
  Monitor, Smartphone, X, 
  Sliders, Loader2, Menu, PanelLeftClose, PanelRightClose,
  Sparkles, Users, Calendar, Home, FileText, Palette, ShoppingBag, Rocket,
  Eye, SlidersHorizontal, ExternalLink,
  Image as ImageIcon, Zap, MessageCircle, Link as LinkIcon, MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api.service';
import { getAllowedTabIdsForCategory } from './merchant-dashboard/activities';
import { isShopBookingActivity, getShopBookingActivityType, getVocabulary } from './bookings/config';
import { useToast } from '@/components/common/feedback/Toaster';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BUILDER_SECTIONS } from './builder/registry';
import SmartImage from '@/components/common/ui/SmartImage';
import { compressImage } from '@/lib/image-utils';
import { coerceBoolean, coerceNumber, isVideoUrl } from './utils';
import { useSmartRefreshListener } from '@/hooks/useSmartRefresh';
import { applyDevActivityContext } from '@/utils/devActivityContext';

const MotionDiv = motion.div as any;

// Lazy load heavy components
const PreviewRenderer = lazy(() => import('./builder/PreviewRenderer'));
const SectionRenderer = lazy(() => import('./builder/SectionRenderer'));
const PreviewSectionOverlay = lazy(() => import('./builder/PreviewSectionOverlay'));

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
  headerOverlayBanner: false,
  headerOpacity: 60,
  pageBackgroundColor: '#FFFFFF',
  backgroundImageUrl: '',
  productDisplay: 'cards' as const,
  productsLayout: 'vertical' as const,
  imageAspectRatio: 'square' as const,
  rowsConfig: [
    { id: 'row-1', imageShape: 'portrait' as const, displayMode: 'cards' as const, itemsPerRow: 2 },
    { id: 'row-2', imageShape: 'square' as const, displayMode: 'cards' as const, itemsPerRow: 3 },
  ],
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
  buttonPreset: 'primary' as const,
  buttonHover: 'bg-slate-900',
  // Product Card
  productCardOverlayBgColor: '#0F172A',
  productCardOverlayOpacity: 70,
  productCardTitleColor: '#FFFFFF',
  productCardPriceColor: '#FFFFFF',
  // Categories
  categoryIconShape: 'circular' as const, // circular, square, large
  categoryIconSize: 'medium' as const, // small, medium, large
  showProductsInCategories: false,
  categoryIconImage: '',
  categoryImages: {} as Record<string, string>, // per-category images
  // Spacing
  pagePadding: 'p-6 md:p-12',
  itemGap: 'gap-4 md:gap-6',
  customCss: '',
  navIcons: {} as Record<string, string>,
  productPageMode: 'standard' as 'standard' | 'landing',
  landingPage: {} as Record<string, any>,
  imageMapVisibility: {
    imageMapCardPrice: true,
    imageMapCardStock: true,
    imageMapCardAddToCart: true,
    imageMapCardDescription: true,
  },
  quickTheme: 'catalog_clean',
  homeLayoutMode: 'banner_products',
  homeRightAdTitle: '',
  homeLeftAdTitle: '',
  homeIntroText: '',
  homeStoryText: '',
  customPages: [] as Array<{ id: string; title: string; content: string; showStandalone?: boolean; showInHeader?: boolean; showInHome?: boolean }>,
  bannerSize: 'normal',
  bannerTitle: '',
  bannerSubtitle: '',
  bannerTextPosition: 'center',
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
  headerOverlayBanner?: boolean;
  headerOpacity?: number;
  pageBackgroundColor: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  productDisplay?: 'cards' | 'list' | 'minimal';
  productsLayout?: 'vertical' | 'horizontal';
  imageAspectRatio?: 'square' | 'portrait' | 'landscape';
  rowsConfig?: Array<{
    id: string;
    imageShape: 'square' | 'portrait' | 'landscape';
    displayMode: 'cards' | 'list' | 'minimal';
    itemsPerRow: number;
  }>;
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerTransparent?: boolean;
  footerOpacity?: number;
  headingSize: string;
  textSize: string;
  fontWeight: string;
  buttonShape: string;
  buttonPadding: string;
  buttonPreset?: 'primary' | 'ghost' | 'premium' | 'urgent';
  buttonHover: string;
  productCardOverlayBgColor?: string;
  productCardOverlayOpacity?: number;
  productCardTitleColor?: string;
  productCardPriceColor?: string;
  productPageBackgroundColor?: string;
  productPageTextColor?: string;
  productPagePriceColor?: string;
  productPageButtonColor?: string;
  categoryIconShape?: 'circular' | 'square' | 'large';
  categoryIconSize?: 'small' | 'medium' | 'large';
  showProductsInCategories?: boolean;
  categoryIconImage?: string;
  categoryImages?: Record<string, string>; // per-category images
  pagePadding: string;
  itemGap: string;
  elementsVisibility?: Record<string, boolean>;
  productEditorVisibility?: Record<string, boolean>;
  imageMapVisibility?: Record<string, boolean>;
  customCss?: string;
  quickTheme?: string;
  homeLayoutMode?: string;
  homeRightAdTitle?: string;
  homeLeftAdTitle?: string;
  homeIntroText?: string;
  homeStoryText?: string;
  customPages?: Array<{ id: string; title: string; content: string; showStandalone?: boolean; showInHeader?: boolean; showInHome?: boolean }>;
  homePageName?: string;
  allProductsPageName?: string;
  bannerSize?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerTextPosition?: string;
}

const PageBuilder: React.FC<{ onClose: () => void; integrated?: boolean; forceBookingMode?: boolean; bookingActivityType?: string }> = ({ onClose, integrated, forceBookingMode, bookingActivityType: bookingActivityTypeProp }) => {
  const { addToast } = useToast();
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const location = useLocation();
  const navigate = useNavigate();
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
  const [previewPage, setPreviewPage] = useState<'home' | 'products' | 'product' | 'gallery' | 'info' | 'custom' | 'landing'>('home');
  const [isPreviewHeaderMenuOpen, setIsPreviewHeaderMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState('themes');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSettingsMobile, setShowSettingsMobile] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'content'>('preview');
  const [aiOverlayActive, setAiOverlayActive] = useState(false);

  useEffect(() => {
    const handleAiModeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setAiOverlayActive(Boolean(detail?.active));
    };
    window.addEventListener('builder-ai-mode-change', handleAiModeChange);
    return () => window.removeEventListener('builder-ai-mode-change', handleAiModeChange);
  }, []);

  const savingRef = useRef(false);
  const logoSavingRef = useRef(false);
  const dirtyRef = useRef(false);
  const handleSaveRef = useRef<null | (() => void)>(null);
  const lastSavedDesignRef = useRef<string>('');

  const syncVisibilityWithModules = useCallback((current: any, shop: any) => {
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
  }, []);

  const query = new URLSearchParams(String(location?.search || ''));
  const requestedBuilderTabRaw = String(query.get('builderTab') || '').trim();
  
  const bookingActivityType = bookingActivityTypeProp || getShopBookingActivityType(shop);
  const bookingVocab = bookingActivityType ? getVocabulary(bookingActivityType as any) : undefined;
  const isBookingActivity = forceBookingMode || Boolean(bookingActivityType) || isShopBookingActivity(shop);

  // Backward-compatible mapping for legacy builder tab IDs (historical clinic* names).
  const BUILDER_TAB_ID_COMPAT: Record<string, string> = {
    clinicDoctors: 'bookingProviders',
    clinicServices: 'bookingServices',
    clinicBooking: 'bookingSlots',
  };
  const normalizedRequestedBuilderTabRaw = BUILDER_TAB_ID_COMPAT[requestedBuilderTabRaw] || requestedBuilderTabRaw;

  const visibleSections = BUILDER_SECTIONS.filter((s) => {
    if (isBookingActivity) {
      return [
        'themes',
        'colors',
        'headerFooter',
        'bookingProviders',
        'bookingSlots',
        'bookingServices',
        'homeExperience',
        'footer',
        'customPages',
        'navIcons',
        'landingTheme', 'landingHero', 'landingFeatures', 'landingSections', 'landingFaq', 'landingStyle', 'landingUrl',
      ].includes(s.id);
    }
    return ![
      'bookingProviders',
      'bookingSlots',
      'bookingServices',
      'clinicDoctors',
      'clinicBooking',
      'clinicServices',
    ].includes(s.id);
  });

  const allowedBuilderTabs = new Set(visibleSections.map((s) => String(s.id)));
  const defaultTab = isBookingActivity ? 'themes' : 'colors';
  const activeBuilderTab = allowedBuilderTabs.has(normalizedRequestedBuilderTabRaw) ? normalizedRequestedBuilderTabRaw : defaultTab;
  const sidebarMode = allowedBuilderTabs.has(normalizedRequestedBuilderTabRaw);
  const integratedMode = integrated || String(query.get('tab') || '').trim() === 'builder';
  const desktopIntegratedAccordionMode = integratedMode && isDesktop;

  // ─── Focus section for zoom preview ────────────────────────────────────
  const focusSection: 'top' | 'middle' | 'shopping' | 'productPage' | 'footer' | null = (() => {
    if (!sidebarMode) return null;
    const tab = activeBuilderTab;
    if (['colors', 'background', 'banner', 'header', 'headerFooter'].includes(tab)) return 'top';
    if (['productCard', 'imageShape', 'categories', 'layout', 'typography', 'buttons'].includes(tab)) return 'middle';
    if (tab === 'shoppingMode') return 'shopping';
    if (['productEditor', 'productPage'].includes(tab)) return 'productPage';
    if (['landingTheme', 'landingHero', 'landingFeatures', 'landingSections', 'landingFaq', 'landingStyle', 'landingUrl'].includes(tab)) return 'productPage';
    if (['footer', 'customCss'].includes(tab)) return 'footer';
    return null;
  })();

  // Auto-switch preview page based on focus section
  useEffect(() => {
    if (focusSection === 'shopping') setPreviewPage('home');
    else if (focusSection === 'productPage') {
      if (currentActiveTab.startsWith('landing')) setPreviewPage('landing');
      else setPreviewPage('product');
    } else if (focusSection === 'top' || focusSection === 'middle' || focusSection === 'footer') {
      setPreviewPage('home');
    }
  }, [focusSection, activeBuilderTab]);

  // Auto-switch preview in accordion mode (non-sidebar)
  useEffect(() => {
    if (sidebarMode) return;
    if (String(openSection).startsWith('landing')) setPreviewPage('landing');
    else if (openSection === 'productPage' || openSection === 'productEditor') setPreviewPage('product');
    else if (openSection === 'shoppingMode') setPreviewPage('home');
    else if (openSection && openSection !== '') setPreviewPage('home');
  }, [openSection, sidebarMode]);

  useEffect(() => {
    if (!sidebarMode) return;
    setOpenSection(activeBuilderTab);
  }, [activeBuilderTab, sidebarMode]);

  // Sync openSection when entering content mode
  useEffect(() => {
    if (viewMode !== 'content') return;
    if (sidebarMode) return;
    if (!openSection || !allowedBuilderTabs.has(openSection)) {
      setOpenSection(defaultTab);
    }
  }, [viewMode, sidebarMode, openSection, allowedBuilderTabs, defaultTab]);

  useEffect(() => {
    if (!integratedMode) return;
    if (!sidebarMode) return;
    if (isDesktop) return;
    setShowSettingsMobile(true);
  }, [integratedMode, isDesktop, sidebarMode]);


  const openBuilderTab = useCallback((tabId: string) => {
    if (viewMode === 'content') {
      setOpenSection(tabId);
      if (sidebarMode) {
        const nextQuery = new URLSearchParams(String(location?.search || ''));
        nextQuery.set('builderTab', tabId);
        if (String(nextQuery.get('tab') || '').trim() !== 'builder') nextQuery.set('tab', 'builder');
        navigate({ search: `?${nextQuery.toString()}` }, { replace: true });
      }
      return;
    }
    if (sidebarMode) {
      const nextQuery = new URLSearchParams(String(location?.search || ''));
      nextQuery.set('builderTab', tabId);
      if (String(nextQuery.get('tab') || '').trim() !== 'builder') nextQuery.set('tab', 'builder');
      navigate({ search: `?${nextQuery.toString()}` }, { replace: true });
      return;
    }
    setOpenSection(tabId);
  }, [location?.search, navigate, sidebarMode, viewMode]);

  const loadCurrentDesign = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    const savedUser = localStorage.getItem('ray_user');
    if (!savedUser) return;

    try {
      const user = JSON.parse(savedUser);
      if (user?.shopId != null) setShopId(String(user.shopId));
    } catch {
    }

    try {
      const myShop = await ApiService.getMyShop();

      const shouldSkipApplyingRemoteDesign = dirtyRef.current || savingRef.current || logoSavingRef.current;
      const contextualShop = applyDevActivityContext(myShop);
      setShop(contextualShop);

      if (shouldSkipApplyingRemoteDesign) {
        return;
      }

      const shopLogoSrc = String(myShop?.logoUrl || myShop?.logo_url || '').trim();
      setLogoDataUrl(shopLogoSrc);
      setLogoFile(null);

      const baseDesign = myShop && (myShop as any).pageDesign ? (myShop as any).pageDesign : {};
      const merged = { ...DEFAULT_PAGE_DESIGN, ...(baseDesign || {}) } as any;

      const elementsVisibilityRaw = merged?.elementsVisibility;
      const elementsVisibilityNormalized = elementsVisibilityRaw && typeof elementsVisibilityRaw === 'object'
        ? Object.fromEntries(Object.entries(elementsVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)]))
        : undefined;
      const elementsVisibilitySynced = syncVisibilityWithModules(elementsVisibilityNormalized, contextualShop);

      const imageMapVisibilityRaw = merged?.imageMapVisibility;
      const imageMapVisibilityNormalized = imageMapVisibilityRaw && typeof imageMapVisibilityRaw === 'object'
        ? Object.fromEntries(Object.entries(imageMapVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)]))
        : (DEFAULT_PAGE_DESIGN as any).imageMapVisibility;

      const productEditorVisibilityRaw = merged?.productEditorVisibility;
      const productEditorVisibilityNormalized = (() => {
        if (productEditorVisibilityRaw && typeof productEditorVisibilityRaw === 'object') {
          return Object.fromEntries(Object.entries(productEditorVisibilityRaw).map(([k, v]) => [k, coerceBoolean(v, true)]));
        }

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
        elementsVisibility: elementsVisibilitySynced,
        productEditorVisibility: productEditorVisibilityNormalized,
        imageMapVisibility: imageMapVisibilityNormalized,
        customCss: customCssNormalized,
      } as any);
      try {
        lastSavedDesignRef.current = JSON.stringify({
          ...merged,
          elementsVisibility: elementsVisibilitySynced,
          productEditorVisibility: productEditorVisibilityNormalized,
          imageMapVisibility: imageMapVisibilityNormalized,
          customCss: customCssNormalized,
        });
      } catch {
        lastSavedDesignRef.current = '';
      }
      dirtyRef.current = false;
    } catch {
      if (!silent) {
        // ignore
      }
    }
  }, [syncVisibilityWithModules]);

  useEffect(() => {
    loadCurrentDesign({ silent: false });
  }, [loadCurrentDesign]);

  // Smart event-driven refresh
  useSmartRefreshListener(['shop', 'all'], () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    if (savingRef.current || logoSavingRef.current) return;
    if (dirtyRef.current) return;
    loadCurrentDesign({ silent: true });
  });

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
      addToast(t('business.pageBuilder.linkCopied'), 'info');
    } catch {
      addToast(t('business.pageBuilder.linkCopied'), 'info');
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
    const hasMediaChanges = Boolean(bannerFile || backgroundFile || logoFile);
    const designSnapshot = (() => {
      try {
        return JSON.stringify(config || {});
      } catch {
        return '';
      }
    })();
    if (!hasMediaChanges && designSnapshot && designSnapshot === lastSavedDesignRef.current) {
      dirtyRef.current = false;
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      addToast(t('business.pageBuilder.noChangesToSave'), 'info');
      return;
    }
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
            bannerIsVideo: isVideo,
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
          addToast(t('business.pageBuilder.uploadBannerFailed'), 'error');
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
          addToast(t('business.pageBuilder.uploadBackgroundFailed'), 'error');
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
        ...(uploadedBanner?.bannerIsVideo !== undefined ? { bannerIsVideo: uploadedBanner.bannerIsVideo } : {}),
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
        productDisplay: config.productDisplay || 'cards',
        productsLayout: config.productsLayout || 'vertical',
      };
      await ApiService.updateShopDesign(shopId, normalized);
      setConfig(normalized as any);

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
        addToast(t('business.pageBuilder.updateLogoFailed'), 'error');
      }
      
      // Clear blob URL after successful save
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview);
        setBannerPreview('');
      }

      if (backgroundPreview && backgroundPreview.startsWith('blob:')) {
        URL.revokeObjectURL(backgroundPreview);
        setBackgroundPreview('');
        setBackgroundFile(null);
      }
      
      setSaving(false);
      setSaved(true);
      dirtyRef.current = false;
      try {
        lastSavedDesignRef.current = JSON.stringify(normalized || {});
      } catch {
        lastSavedDesignRef.current = designSnapshot || '';
      }
      addToast(t('business.pageBuilder.saved'), 'success');
      try {
        window.dispatchEvent(new CustomEvent('ray-shop-updated', { detail: { shopId } }));
      } catch {
      }
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaving(false);
      addToast(t('business.pageBuilder.saveFailed'), 'error');
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
        dirtyRef.current = true;
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
    dirtyRef.current = true;
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
      addToast(t('business.pageBuilder.logoSaved'), 'success');
      try {
        window.dispatchEvent(new CustomEvent('ray-shop-updated', { detail: { shopId } }));
      } catch {
      }
    } catch {
      addToast(t('business.pageBuilder.logoSaveFailed'), 'error');
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
          forceBookingMode={forceBookingMode}
          bookingActivityType={bookingActivityType}
        />
      </Suspense>
    );
  })();

  const allSectionsNode = (() => {
    if (!desktopIntegratedAccordionMode) return null;
    return (
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
          forceBookingMode={forceBookingMode}
          bookingActivityType={bookingActivityType}
        />
      </Suspense>
    );
  })();

  const desktopAccordionSlot = desktopIntegratedAccordionMode
    ? document.getElementById('builder-accordion-all')
    : null;
  const contentModeSidebarSlot = viewMode === 'content'
    ? document.getElementById('builder-accordion-all')
    : null;
  const shouldRenderSidebar = !isDesktop && viewMode !== 'content';

  const currentActiveTab = viewMode === 'content' ? openSection : (sidebarMode ? activeBuilderTab : openSection);
  const freePreview = integratedMode && viewMode === 'preview';

  return (
    <div className={`w-full bg-[#F8F9FA] flex flex-col ${isArabic ? 'md:flex-row-reverse text-right' : 'md:flex-row text-left'} font-sans ${freePreview ? '' : 'overflow-hidden'} ${integratedMode ? 'rounded-2xl border border-slate-200' : ''}`} dir={isArabic ? 'rtl' : 'ltr'} style={integratedMode && !freePreview ? { height: 'calc(100vh - 200px)', minHeight: '500px' } : undefined}>

      {desktopAccordionSlot && allSectionsNode && viewMode !== 'content'
        ? createPortal(
            <div className="w-full" data-component-name="PageBuilder">
              {allSectionsNode}
            </div>,
            desktopAccordionSlot
          )
        : null}

      {contentModeSidebarSlot
        ? createPortal(
            <div className="w-full" data-component-name="PageBuilder">
              {isBookingActivity ? (
                <div className="space-y-1">
                  <button type="button" onClick={() => openBuilderTab('themes')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'themes' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Sparkles size={14} className="text-amber-500" />الثيمات</button>
                  <button type="button" onClick={() => openBuilderTab('colors')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'colors' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Palette size={14} className="text-[#00E5FF]" />الألوان</button>
                  <button type="button" onClick={() => openBuilderTab('headerFooter')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'headerFooter' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-600" />أعلى الصفحة</button>
                  <button type="button" onClick={() => openBuilderTab('bookingProviders')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'bookingProviders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Users size={14} className="text-indigo-500" />{bookingVocab?.providerPlural || 'مقدمو الخدمة'}</button>
                  <button type="button" onClick={() => openBuilderTab('bookingServices')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'bookingServices' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Sparkles size={14} className="text-emerald-500" />{bookingVocab?.servicePlural || 'الخدمات'}</button>
                  <button type="button" onClick={() => openBuilderTab('bookingSlots')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'bookingSlots' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Calendar size={14} className="text-rose-500" />الحجز</button>
                  <button type="button" onClick={() => openBuilderTab('homeExperience')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'homeExperience' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Home size={14} className="text-sky-500" />الهوم</button>
                  <button type="button" onClick={() => openBuilderTab('footer')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'footer' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-600" />الفوتر</button>
                  <button type="button" onClick={() => openBuilderTab('customPages')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'customPages' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><FileText size={14} className="text-violet-500" />صفحات مخصصة</button>
                  <button type="button" onClick={() => openBuilderTab('navIcons')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'navIcons' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Sparkles size={14} className="text-indigo-500" />الأيقونات</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Group 1: هوية المتجر */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black tracking-wider uppercase text-slate-300">هوية المتجر</div>
                    <button type="button" onClick={() => openBuilderTab('themes')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'themes' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Sparkles size={14} className="text-amber-500" />الثيمات</button>
                    <button type="button" onClick={() => openBuilderTab('colors')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'colors' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Palette size={14} className="text-[#00E5FF]" />الألوان</button>
                    <button type="button" onClick={() => openBuilderTab('background')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'background' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Palette size={14} className="text-slate-900" />الخلفية</button>
                  </div>

                  {/* Group 2: الصفحة الرئيسية */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black tracking-wider uppercase text-slate-300">الصفحة الرئيسية</div>
                    <button type="button" onClick={() => openBuilderTab('homeExperience')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'homeExperience' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Home size={14} className="text-sky-500" />الهوم</button>
                    <button type="button" onClick={() => openBuilderTab('banner')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'banner' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-900" />البانر</button>
                    <button type="button" onClick={() => openBuilderTab('header')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'header' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-[#BD00FF]" />الشعار</button>
                    <button type="button" onClick={() => openBuilderTab('headerFooter')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'headerFooter' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-600" />أعلى الصفحة</button>
                  </div>

                  {/* Group 3: المنتجات */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black tracking-wider uppercase text-slate-300">المنتجات</div>
                    <button type="button" onClick={() => openBuilderTab('productCard')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'productCard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Palette size={14} className="text-slate-600" />بطاقة المنتج</button>
                    <button type="button" onClick={() => openBuilderTab('categories')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'categories' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><ShoppingBag size={14} className="text-slate-600" />الأقسام</button>
                    <button type="button" onClick={() => openBuilderTab('imageShape')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'imageShape' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-[#00E5FF]" />أشكال الصور</button>
                    <button type="button" onClick={() => openBuilderTab('productEditor')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'productEditor' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><ShoppingBag size={14} className="text-slate-900" />محرر المنتج</button>
                    <button type="button" onClick={() => openBuilderTab('productPage')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'productPage' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-900" />صفحة المنتج</button>
                    <button type="button" onClick={() => openBuilderTab('shoppingMode')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'shoppingMode' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><ShoppingBag size={14} className="text-[#00E5FF]" />وضع التسوق</button>
                  </div>

                  {/* Group 4: صفحات الهبوط - individual buttons */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black tracking-wider uppercase text-slate-300">صفحات الهبوط</div>
                    <button type="button" onClick={() => openBuilderTab('landingTheme')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'landingTheme' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Rocket size={14} className="text-rose-500" />تصميم الهبوط</button>
                    <button type="button" onClick={() => openBuilderTab('landingHero')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'landingHero' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><ImageIcon size={14} className="text-rose-400" />القسم الرئيسي</button>
                    <button type="button" onClick={() => openBuilderTab('landingFeatures')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'landingFeatures' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Zap size={14} className="text-amber-500" />المميزات</button>
                    <button type="button" onClick={() => openBuilderTab('landingSections')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'landingSections' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-600" />الأقسام الظاهرة</button>
                    <button type="button" onClick={() => openBuilderTab('landingFaq')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'landingFaq' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><MessageCircle size={14} className="text-sky-500" />الأسئلة الشائعة</button>
                    <button type="button" onClick={() => openBuilderTab('landingStyle')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'landingStyle' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Palette size={14} className="text-[#00E5FF]" />الألوان والتصميم</button>
                    <button type="button" onClick={() => openBuilderTab('landingUrl')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'landingUrl' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><LinkIcon size={14} className="text-rose-500" />رابط الهبوط</button>
                  </div>

                  {/* Group 5: التصميم والتنسيق */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black tracking-wider uppercase text-slate-300">التصميم والتنسيق</div>
                    <button type="button" onClick={() => openBuilderTab('layout')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'layout' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-[#BD00FF]" />التخطيط</button>
                    <button type="button" onClick={() => openBuilderTab('typography')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'typography' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-[#00E5FF]" />الخطوط</button>
                    <button type="button" onClick={() => openBuilderTab('buttons')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'buttons' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-[#BD00FF]" />الأزرار</button>
                    <button type="button" onClick={() => openBuilderTab('navIcons')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'navIcons' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Sparkles size={14} className="text-indigo-500" />الأيقونات</button>
                  </div>

                  {/* Group 6: إعدادات إضافية */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black tracking-wider uppercase text-slate-300">إعدادات إضافية</div>
                    <button type="button" onClick={() => openBuilderTab('footer')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'footer' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-600" />الفوتر</button>
                    <button type="button" onClick={() => openBuilderTab('customPages')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'customPages' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><FileText size={14} className="text-violet-500" />صفحات مخصصة</button>
                    <button type="button" onClick={() => openBuilderTab('customCss')} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'customCss' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Sliders size={14} className="text-[#BD00FF]" />CSS مخصص</button>
                  </div>
                </div>
              )}
            </div>,
            contentModeSidebarSlot
          )
        : null}

      {shouldRenderSidebar && (
        <AnimatePresence>
          {(showSettingsMobile || isDesktop) && (
            <>
              <MotionDiv 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowSettingsMobile(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[220] md:hidden"
              />
              
              <MotionDiv
                initial={!isDesktop ? { y: '100%' } : { x: isArabic ? '100%' : '-100%' }}
                animate={!isDesktop ? { y: 0 } : { x: 0 }}
                exit={!isDesktop ? { y: '100%' } : { x: isArabic ? '100%' : '-100%' }}
                className={`fixed bottom-0 left-0 right-0 md:relative ${isDesktop && desktopSidebarCollapsed ? 'md:w-[88px]' : 'md:w-[340px] lg:w-[380px]'} h-[80vh] md:h-full bg-white ${isArabic ? 'md:border-l' : 'md:border-r'} border-slate-200 flex flex-col shadow-2xl z-[230] rounded-t-[2rem] sm:rounded-t-[2.5rem] md:rounded-none`}
              >
                <header className="p-4 sm:p-6 md:p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-30">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowSettingsMobile(false)} className="md:hidden p-2 bg-slate-50 rounded-full transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-95"><X size={18} className="sm:w-5 sm:h-5" /></button>
                    {!desktopSidebarCollapsed && <h2 className="font-black text-xl md:text-3xl tracking-tighter">{t('business.pageBuilder.designTitle')}</h2>}
                  </div>
                  <div className="flex items-center gap-2">
                    {isDesktop && (
                      <button
                        type="button"
                        onClick={() => setDesktopSidebarCollapsed((prev) => !prev)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
                        aria-label={desktopSidebarCollapsed ? (isArabic ? 'توسيع القائمة' : 'Expand menu') : (isArabic ? 'طي القائمة' : 'Collapse menu')}
                        title={desktopSidebarCollapsed ? (isArabic ? 'توسيع القائمة' : 'Expand menu') : (isArabic ? 'طي القائمة' : 'Collapse menu')}
                      >
                        {isArabic ? <PanelRightClose size={18} /> : <PanelLeftClose size={18} />}
                      </button>
                    )}
                    {!desktopSidebarCollapsed && (
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none ${
                          saved ? 'bg-green-500 text-white' : 'bg-slate-900 text-white shadow-xl hover:bg-black'
                        }`}
                      >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                        <span>{saved ? t('business.pageBuilder.savedShort') : t('business.pageBuilder.saveDesign')}</span>
                      </button>
                    )}
                  </div>
                </header>

                <div className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 ${desktopSidebarCollapsed ? 'hidden md:hidden' : ''}`}>
                  {!isBookingActivity && (
                    <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white">
                      <div className="px-4 py-3 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <span className="font-black text-sm text-slate-900">{t('business.pageBuilder.previewTitle')}</span>
                        <div className="inline-flex flex-wrap items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => setPreviewPage('home')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'home' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            {String(config.homePageName || 'الرئيسية')}
                          </button>
                          {String(config.homeLayoutMode || '') === 'banner_ads_story' && (
                            <button
                              type="button"
                              onClick={() => setPreviewPage('products')}
                              className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'products' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                              {String(config.allProductsPageName || 'جميع المنتجات')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setPreviewPage('gallery')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'gallery' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            {t('business.pageBuilder.previewTabs.gallery')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewPage('info')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'info' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            {t('business.pageBuilder.previewTabs.info')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewPage('product')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'product' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            {t('business.pageBuilder.previewTabs.product')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewPage('landing')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewPage === 'landing' ? 'text-white bg-rose-600' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            <Rocket size={12} className="inline ml-1" /> هبوط
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white p-4">
                    <div className="text-xs font-black text-slate-500 mb-3">وصول سريع</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {isBookingActivity ? (
                        <>
                          <button type="button" onClick={() => openBuilderTab('themes')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'themes' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Sparkles size={14} className="text-amber-500" />الثيمات</button>
                          <button type="button" onClick={() => openBuilderTab('bookingProviders')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'bookingProviders' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Users size={14} className="text-indigo-500" />{bookingVocab?.providerPlural || 'مقدمو الخدمة'}</button>
                          <button type="button" onClick={() => openBuilderTab('bookingServices')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'bookingServices' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Sparkles size={14} className="text-emerald-500" />{bookingVocab?.servicePlural || 'الخدمات'}</button>
                          <button type="button" onClick={() => openBuilderTab('bookingSlots')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'bookingSlots' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Calendar size={14} className="text-rose-500" />الحجز</button>
                          <button type="button" onClick={() => openBuilderTab('homeExperience')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'homeExperience' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Home size={14} className="text-sky-500" />الهوم</button>
                          <button type="button" onClick={() => openBuilderTab('footer')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'footer' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-600" />الفوتر</button>
                          <button type="button" onClick={() => openBuilderTab('customPages')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'customPages' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><FileText size={14} className="text-violet-500" />صفحات مخصصة</button>
                          <button type="button" onClick={() => openBuilderTab('navIcons')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'navIcons' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Sparkles size={14} className="text-indigo-500" />الأيقونات</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => openBuilderTab('themes')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'themes' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Sparkles size={14} className="text-amber-500" />الثيمات</button>
                          <button type="button" onClick={() => openBuilderTab('colors')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'colors' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Palette size={14} className="text-[#00E5FF]" />الألوان</button>
                          <button type="button" onClick={() => openBuilderTab('background')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'background' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Palette size={14} className="text-slate-900" />الخلفية</button>
                          <button type="button" onClick={() => openBuilderTab('homeExperience')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'homeExperience' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Home size={14} className="text-sky-500" />الهوم</button>
                          <button type="button" onClick={() => openBuilderTab('banner')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'banner' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-900" />البانر</button>
                          <button type="button" onClick={() => openBuilderTab('header')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'header' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-[#BD00FF]" />الشعار</button>
                          <button type="button" onClick={() => openBuilderTab('headerFooter')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'headerFooter' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-600" />أعلى الصفحة</button>
                          <button type="button" onClick={() => openBuilderTab('productCard')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'productCard' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Palette size={14} className="text-slate-600" />بطاقة المنتج</button>
                          <button type="button" onClick={() => openBuilderTab('categories')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'categories' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><ShoppingBag size={14} className="text-slate-600" />الأقسام</button>
                          <button type="button" onClick={() => openBuilderTab('imageShape')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'imageShape' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-[#00E5FF]" />أشكال الصور</button>
                          <button type="button" onClick={() => openBuilderTab('productEditor')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'productEditor' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><ShoppingBag size={14} className="text-slate-900" />محرر المنتج</button>
                          <button type="button" onClick={() => openBuilderTab('productPage')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'productPage' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-900" />صفحة المنتج</button>
                          <button type="button" onClick={() => openBuilderTab('shoppingMode')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'shoppingMode' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><ShoppingBag size={14} className="text-[#00E5FF]" />وضع التسوق</button>
                          <button type="button" onClick={() => openBuilderTab('landingTheme')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'landingTheme' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Rocket size={14} className="text-rose-500" />صفحة الهبوط</button>
                          <button type="button" onClick={() => openBuilderTab('layout')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'layout' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-[#BD00FF]" />التخطيط</button>
                          <button type="button" onClick={() => openBuilderTab('typography')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'typography' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-[#00E5FF]" />الخطوط</button>
                          <button type="button" onClick={() => openBuilderTab('buttons')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'buttons' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-[#BD00FF]" />الأزرار</button>
                          <button type="button" onClick={() => openBuilderTab('navIcons')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'navIcons' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Sparkles size={14} className="text-indigo-500" />الأيقونات</button>
                          <button type="button" onClick={() => openBuilderTab('footer')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'footer' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Layout size={14} className="text-slate-600" />الفوتر</button>
                          <button type="button" onClick={() => openBuilderTab('customPages')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'customPages' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><FileText size={14} className="text-violet-500" />صفحات مخصصة</button>
                          <button type="button" onClick={() => openBuilderTab('customCss')} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${currentActiveTab === 'customCss' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}><Sliders size={14} className="text-[#BD00FF]" />CSS مخصص</button>
                        </>
                      )}
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
                        forceBookingMode={forceBookingMode}
                        bookingActivityType={bookingActivityType}
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
      <main className={`flex-1 ${freePreview ? '' : 'min-h-0'} flex flex-col relative ${freePreview ? '' : 'overflow-hidden'} bg-gradient-to-br from-[#c8d6e5] via-[#b8c9e0] to-[#a8bdd0]`}>
        <header className="h-16 sm:h-20 md:h-24 bg-white/40 backdrop-blur-2xl border-b border-white/30 flex items-center justify-between px-4 sm:px-6 md:px-12 sticky top-0 z-10 gap-2 flex-wrap">
           {!integratedMode && (
             <button onClick={onClose} className="p-2 sm:p-3 bg-white rounded-xl shadow-sm text-slate-900 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] shrink-0"><ChevronLeft className="rotate-180" /></button>
           )}

           {/* View Mode Toggle: Preview / Content */}
           <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-inner border border-slate-100 shrink-0">
             <button
               onClick={() => setViewMode('preview')}
               className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all active:scale-[0.98] flex items-center gap-1.5 ${viewMode === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               <Eye size={14} /> معاينة
             </button>
             <button
               onClick={() => setViewMode('content')}
               className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all active:scale-[0.98] flex items-center gap-1.5 ${viewMode === 'content' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               <SlidersHorizontal size={14} /> محتوى
             </button>
           </div>

           {!isBookingActivity && viewMode === 'preview' && (
             <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-inner border border-slate-100 overflow-x-auto">
                <button onClick={() => setPreviewPage('home')} className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all active:scale-[0.98] ${previewPage === 'home' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <ShoppingBag size={14} className="inline ml-1" /> متجر
                </button>
                <button onClick={() => setPreviewPage('product')} className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all active:scale-[0.98] ${previewPage === 'product' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Layout size={14} className="inline ml-1" /> منتج
                </button>
                <button onClick={() => setPreviewPage('landing')} className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all active:scale-[0.98] ${previewPage === 'landing' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Rocket size={14} className="inline ml-1" /> هبوط
                </button>
             </div>
           )}

           <div className="flex items-center gap-2 ml-auto">
             {/* Live Preview in New Tab - Desktop Only */}
             {isDesktop && shop?.slug && (
               <button
                 onClick={() => {
                   const url = `${window.location.origin}/#/shop/${shop.slug}?builderPreview=1`;
                   window.open(url, '_blank');
                 }}
                 className="px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all active:scale-[0.98] flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
                 title="معاينة لايف في صفحة جديدة"
               >
                 <ExternalLink size={14} /> معاينة لايف
               </button>
             )}

             {isDesktop && viewMode === 'preview' && (
               <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-inner border border-slate-100 shrink-0">
                  <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewMode === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><Monitor size={18} /></button>
                  <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.98] ${previewMode === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><Smartphone size={18} /></button>
               </div>
             )}
           </div>
        </header>

        {aiOverlayActive && viewMode === 'preview' && (
          <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-xs font-black flex items-center gap-2 animate-pulse">
            <MousePointerClick className="w-4 h-4" />
            <span>اضغط على أي عنصر في المعاينة لتحديده والبدء في تعديله بالذكاء الاصطناعي</span>
          </div>
        )}


        {!isDesktop && !integratedMode && (
          isBookingActivity ? (
            <div className="sticky top-0 z-20 px-4 py-2 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-end">
              <button onClick={handleSave} disabled={saving} className="px-5 py-1.5 rounded-lg text-xs font-black bg-emerald-600 text-white disabled:opacity-60">حفظ</button>
            </div>
          ) : (
            <div className="sticky top-0 z-20 px-4 py-2 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
              <button onClick={() => setPreviewPage('home')} className={`px-3 py-1.5 rounded-lg text-xs font-black ${previewPage === 'home' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>{String(config.homePageName || 'الرئيسية')}</button>
              {String(config.homeLayoutMode || '') === 'banner_ads_story' && (
                <button onClick={() => setPreviewPage('products')} className={`px-3 py-1.5 rounded-lg text-xs font-black ${previewPage === 'products' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>{String(config.allProductsPageName || 'جميع المنتجات')}</button>
              )}
              <button onClick={() => setPreviewPage('gallery')} className={`px-3 py-1.5 rounded-lg text-xs font-black ${previewPage === 'gallery' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>المعرض</button>
              <button onClick={() => setPreviewPage('info')} className={`px-3 py-1.5 rounded-lg text-xs font-black ${previewPage === 'info' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>معلومات</button>
              <button onClick={() => setPreviewPage('product')} className={`px-3 py-1.5 rounded-lg text-xs font-black ${previewPage === 'product' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>منتج</button>
              <button onClick={() => setPreviewPage('landing')} className={`px-3 py-1.5 rounded-lg text-xs font-black ${previewPage === 'landing' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}`}>هبوط</button>
              <button onClick={handleSave} disabled={saving} className="ml-auto px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 text-white disabled:opacity-60">حفظ</button>
            </div>
          )
        )}
        <div className={`flex-1 ${freePreview ? '' : 'min-h-0'} ${viewMode === 'content' ? 'overflow-y-auto p-4 md:p-8' : 'p-0 md:p-0'} ${integratedMode && viewMode === 'preview' ? 'flex flex-col items-stretch' : viewMode === 'content' ? '' : 'flex flex-col items-stretch justify-center'}`}>
          {viewMode === 'content' ? (
            /* Content Mode: Show section settings in main area only */
            <div className="w-full max-w-4xl mx-auto space-y-4">
              {/* Section content */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
                <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#00E5FF]" /></div>}>
                  <SectionRenderer
                    activeBuilderTab={viewMode === 'content' ? openSection : (sidebarMode ? activeBuilderTab : openSection)}
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
                    forceBookingMode={forceBookingMode}
                    bookingActivityType={bookingActivityType}
                  />
                </Suspense>
              </div>

              {/* Save button */}
              <div className="flex justify-end gap-2 pb-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none ${saved ? 'bg-green-500 text-white' : 'bg-slate-900 text-white shadow-xl hover:bg-black'}`}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                  <span>{saved ? t('business.pageBuilder.savedShort') : t('business.pageBuilder.saveDesign')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Preview Mode: Show live preview */
            <MotionDiv 
              layout
              className={`${freePreview ? '' : 'overflow-hidden'} transition-all duration-700 flex flex-col relative ${freePreview ? '' : 'flex-1 min-h-0'} ${
                previewMode === 'mobile' ? 'shadow-2xl w-full max-w-[375px] min-h-[667px] rounded-[2.2rem] sm:rounded-[3rem] border-[8px] sm:border-[10px] border-slate-900 box-border mx-auto' : 'w-full max-w-full'
              }`}
              style={{
                backgroundColor: previewMode === 'mobile' ? (config.pageBackgroundColor || config.backgroundColor || '#FFFFFF') : (config.pageBackgroundColor || config.backgroundColor || '#FFFFFF'),
              }}
            >
              {previewMode === 'mobile' && (
                <div className="h-9 bg-gradient-to-b from-[#e0e0e0] to-[#d4d4d4] border-b border-slate-300/60 flex items-center px-4 gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[11px] font-bold text-slate-500 select-none">{shop?.name || 'معاينة المتجر'}</span>
                  </div>
                  <div className="w-12" />
                </div>
              )}
              <div className={`w-full preview-scroll-container ${freePreview ? '' : 'flex-1 min-h-0 overflow-y-auto'}`} style={{
                backgroundColor: config.pageBackgroundColor || config.backgroundColor || '#FFFFFF',
                backgroundImage: (backgroundPreview || String((config as any)?.backgroundImageUrl || ''))
                  ? `url("${backgroundPreview || String((config as any)?.backgroundImageUrl || '')}")`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}>
                <div className="relative w-full block">
                  <PreviewRendererAny
                    page={previewPage}
                    config={config}
                    shop={{ ...(shop && typeof shop === 'object' ? shop : {}), id: shopId, name: shop?.name || t('business.pageBuilder.previewShopName'), category: shop?.category }}
                    logoDataUrl={logoDataUrl}
                    isPreviewHeaderMenuOpen={isPreviewHeaderMenuOpen}
                    setIsPreviewHeaderMenuOpen={setIsPreviewHeaderMenuOpen}
                    isMobilePreview={previewMode === 'mobile'}
                    onProductClick={() => setPreviewPage('product')}
                    focusSection={focusSection}
                    bannerPreview={bannerPreview}
                    backgroundPreview={backgroundPreview}
                    bannerFile={bannerFile}
                    isBookingActivity={isBookingActivity}
                  />
                  <Suspense fallback={null}>
                    <PreviewSectionOverlay
                      containerSelector=".preview-scroll-container"
                      isBookingActivity={isBookingActivity}
                      active={aiOverlayActive && viewMode === 'preview'}
                    />
                  </Suspense>
                </div>
              </div>
            </MotionDiv>
          )}
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
