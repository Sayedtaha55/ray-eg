'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, Save, Monitor, Smartphone, X, Sliders, Sparkles, Eye, Settings, Loader2, Search, ChevronDown } from 'lucide-react';
import { UnifiedBuilderConfig, BuilderState, ActivityType, BuilderRenderCtx } from '@/types/builder';
import { BUILDER_SECTIONS, getGroupedSections } from '@/components/builder/registry';
import { useBuilderConfig } from '@/hooks/useBuilderConfig';
import LivePreview from '@/components/builder/preview/LivePreview';
import { BuilderThemeProvider, useBuilderTheme } from '@/contexts/BuilderThemeContext';

interface UnifiedBuilderProps {
  shopId: string;
  activityType: ActivityType;
  initialConfig?: Partial<UnifiedBuilderConfig>;
  onSave?: (config: UnifiedBuilderConfig) => Promise<void>;
  onPublish?: (config: UnifiedBuilderConfig) => Promise<void>;
  onClose?: () => void;
  integrated?: boolean;
}

const DEFAULT_CONFIG: UnifiedBuilderConfig = {
  activityType: 'COMMERCIAL',
  
  // Store Identity (هوية المتجر)
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
  
  // Home Page (الصفحة الرئيسية)
  homeLayoutMode: 'banner_products',
  homeRightAdTitle: '',
  homeLeftAdTitle: '',
  homeIntroText: '',
  homeStoryText: '',
  bannerSize: 'normal',
  bannerTitle: '',
  bannerSubtitle: '',
  bannerTextPosition: 'center',
  
  // Products (المنتجات)
  productDisplay: 'cards',
  productsLayout: 'vertical',
  imageAspectRatio: 'square',
  rowsConfig: [
    { id: 'row-1', imageShape: 'portrait', displayMode: 'cards', itemsPerRow: 2 },
    { id: 'row-2', imageShape: 'square', displayMode: 'cards', itemsPerRow: 3 },
  ],
  
  // Product Card (بطاقة المنتج)
  productCardOverlayBgColor: '#0F172A',
  productCardOverlayOpacity: 70,
  productCardTitleColor: '#FFFFFF',
  productCardPriceColor: '#FFFFFF',
  
  // Categories (الأقسام)
  categoryIconShape: 'circular',
  categoryIconSize: 'medium',
  showProductsInCategories: false,
  categoryIconImage: '',
  categoryImages: {},
  
  // Typography (الخطوط)
  headingSize: 'text-4xl',
  textSize: 'text-sm',
  fontWeight: 'font-black',
  
  // Buttons (الأزرار)
  buttonShape: 'rounded-2xl',
  buttonPadding: 'px-6 py-3',
  buttonPreset: 'primary',
  buttonHover: 'bg-slate-900',
  
  // Footer (الفوتر)
  footerBackgroundColor: '#FFFFFF',
  footerTextColor: '#0F172A',
  footerTransparent: false,
  footerOpacity: 90,
  
  // Spacing (المسافات)
  pagePadding: 'p-6 md:p-12',
  itemGap: 'gap-4 md:gap-6',
  
  // Advanced (إعدادات إضافية)
  customCss: '',
  elementsVisibility: {},
  productEditorVisibility: {},
  imageMapVisibility: {
    imageMapCardPrice: true,
    imageMapCardStock: true,
    imageMapCardAddToCart: true,
    imageMapCardDescription: true,
  },
  navIcons: {},
  
  // Product Page (صفحة المنتج)
  productPageMode: 'standard',
  productPageBackgroundColor: '#FFFFFF',
  productPageTextColor: '#0F172A',
  productPagePriceColor: '#00E5FF',
  productPageButtonColor: '#00E5FF',
  landingPage: {},
  
  // Custom Pages (صفحات مخصصة)
  customPages: [],
  
  // Quick Theme (الثيم السريع)
  quickTheme: 'catalog_clean',
  
  // Landing Pages (صفحات الهبوط)
  homePageName: '',
  allProductsPageName: '',
  
  // Theme (الثيم)
  theme: {
    id: 'default',
    name: 'Default Theme',
    variant: 'light',
  },
  colors: {
    primary: '#00E5FF',
    secondary: '#BD00FF',
    accent: '#FF6B6B',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: {
      primary: '#1A1A1A',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    fontFamily: {
      heading: 'Inter',
      body: 'Inter',
      arabic: 'Cairo',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },
  layoutConfig: {
    containerWidth: '1200px',
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
    header: {
      height: '64px',
      position: 'sticky',
      transparent: false,
    },
    footer: {
      position: 'static',
      transparent: false,
    },
  },
};

export default function UnifiedBuilder({
  shopId,
  activityType,
  initialConfig,
  onSave,
  onPublish,
  onClose,
  integrated = false,
}: UnifiedBuilderProps) {
  // Use builder config hook for API integration
  const { config: apiConfig, loading: apiLoading, error: apiError, updateConfig: apiUpdateConfig, publishConfig, refetch } = useBuilderConfig({
    shopId,
    autoLoad: true,
  });

  const [state, setState] = useState<BuilderState>({
    config: apiConfig || {
      ...DEFAULT_CONFIG,
      activityType,
      ...initialConfig,
    },
    previewMode: 'desktop',
    previewPage: 'home',
    openSection: 'themes',
    isDirty: false,
    isSaving: false,
    lastSaved: null,
  });

  // Update local state when API config changes
  useEffect(() => {
    if (apiConfig) {
      setState(prev => ({
        ...prev,
        config: apiConfig,
        isDirty: false,
      }));
    }
  }, [apiConfig]);

  // Force mobile preview mode on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setState(prev => ({ ...prev, previewMode: 'mobile' }));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'content'>('preview');
  const [sectionSearch, setSectionSearch] = useState('');
  const [aiOverlayActive, setAiOverlayActive] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // File states
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');

  const savingRef = useRef(false);
  const dirtyRef = useRef(false);

  // Detect desktop mode
  useEffect(() => {
    const checkDesktop = () => {
      try {
        const mql = window.matchMedia('(min-width: 1024px)');
        setIsDesktop(mql.matches);
      } catch {
        setIsDesktop(false);
      }
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (state.isDirty && !state.isSaving && !savingRef.current) {
        handleSave();
      }
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [state.isDirty, state.isSaving]);

  const handleSave = useCallback(async () => {
    if (state.isSaving || savingRef.current) return;
    
    savingRef.current = true;
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      // Use API to save config
      await apiUpdateConfig(state.config);
      
      // Also call onSave if provided (for backward compatibility)
      if (onSave) {
        await onSave(state.config);
      }
      
      setState(prev => ({
        ...prev,
        isDirty: false,
        isSaving: false,
        lastSaved: new Date(),
      }));
      dirtyRef.current = false;
    } catch (error) {
      console.error('Save failed:', error);
      setState(prev => ({ ...prev, isSaving: false }));
    } finally {
      savingRef.current = false;
    }
  }, [state.config, state.isSaving, apiUpdateConfig, onSave]);

  const handlePublish = useCallback(async () => {
    try {
      // Save first if dirty
      if (state.isDirty) {
        await handleSave();
      }
      
      // Use API to publish
      await publishConfig();
      
      // Also call onPublish if provided (for backward compatibility)
      if (onPublish) {
        await onPublish(state.config);
      }
    } catch (error) {
      console.error('Publish failed:', error);
      throw error;
    }
  }, [state.isDirty, handleSave, publishConfig, onPublish]);

  const updateConfig = useCallback((updates: Partial<UnifiedBuilderConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
      isDirty: true,
    }));
    dirtyRef.current = true;
  }, []);

  // Get filtered and grouped sections from registry
  const groupedSections = useMemo(() => {
    const categories = getGroupedSections(activityType);
    if (!sectionSearch.trim()) return categories;

    const search = sectionSearch.toLowerCase().trim();
    return categories
      .map(cat => ({
        ...cat,
        sections: cat.sections.filter(s => 
          s.title.toLowerCase().includes(search) || 
          cat.title.toLowerCase().includes(search)
        )
      }))
      .filter(cat => cat.sections.length > 0);
  }, [activityType, sectionSearch]);

  // Handle logo save
  const handleSaveLogo = useCallback(async () => {
    if (!logoFile) return;
    setLogoSaving(true);
    try {
      // TODO: Implement logo upload logic
      console.log('Saving logo:', logoFile);
      setLogoSaving(false);
    } catch (error) {
      console.error('Logo save failed:', error);
      setLogoSaving(false);
    }
  }, [logoFile]);

  // Create render context
  const renderContext: BuilderRenderCtx = {
    config: state.config,
    setConfig: updateConfig,
    state,
    setState: setState as any,
    logoDataUrl,
    setLogoDataUrl,
    logoFile,
    setLogoFile,
    logoSaving,
    onSaveLogo: handleSaveLogo,
    bannerFile,
    setBannerFile,
    bannerPreview,
    setBannerPreview,
    backgroundFile,
    setBackgroundFile,
    backgroundPreview,
    setBackgroundPreview,
  };

  // Get current section
  const currentSection = BUILDER_SECTIONS.find(s => s.id === state.openSection);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Loading overlay */}
      {apiLoading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
            <span className="text-sm font-bold text-slate-600">جاري التحميل...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {apiError && (
        <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-50">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
            <p className="text-red-600 font-bold mb-3">{apiError}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[900] md:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: Fixed, Mobile: Drawer */}
      <aside
        className={`fixed md:relative top-0 bottom-0 right-0 z-[1000] transition-transform duration-500 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-80'
        } bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl md:shadow-none
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-20 flex flex-col justify-center px-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between w-full">
            {!sidebarCollapsed && (
              <h1 className="font-black text-sm text-slate-800 truncate">
                {activityType === 'COMMERCIAL' ? 'بولدر المتجر' : 'بولدر الحجوزات'}
              </h1>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:block p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-slate-100"
              >
                {sidebarCollapsed ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                )}
              </button>
              {/* Mobile close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-2 bg-white hover:bg-slate-50 text-slate-900 rounded-xl shadow-sm border border-slate-200 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Mobile Current Page Indicator inside Sidebar */}
          <div className="md:hidden mt-2 flex items-center gap-2">
            <div className="flex-1 px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black flex items-center justify-between">
              <span>الصفحة الحالية:</span>
              <span className="text-brand-cyan">
                {state.previewPage === 'home' && 'الرئيسية'}
                {state.previewPage === 'products' && 'المنتجات'}
                {state.previewPage === 'landing' && 'صفحة الهبوط'}
                {String(state.previewPage) === 'clinic' && 'العيادة'}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Search */}
        {!sidebarCollapsed && (
          <div className="p-4 space-y-4 border-b border-slate-200 shrink-0">
            {/* View Mode Toggle - Only on Desktop (Mobile has it in header) */}
            <div className="hidden md:flex gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  viewMode === 'preview'
                    ? 'bg-white text-brand-cyan shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Eye size={16} />
                معاينة
              </button>
              <button
                onClick={() => setViewMode('content')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  viewMode === 'content'
                    ? 'bg-white text-brand-cyan shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sliders size={16} />
                المحتوى
              </button>
            </div>

            {/* Section Search */}
            <div className="relative group">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-cyan transition-colors">
                <Search size={14} />
              </div>
              <input
                type="text"
                value={sectionSearch}
                onChange={(e) => setSectionSearch(e.target.value)}
                placeholder="ابحث عن إعداد..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-cyan focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none"
              />
            </div>
          </div>
        )}

        {/* Sections List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {!sidebarCollapsed && (
            <div className="space-y-6">
              {groupedSections.map((category) => (
                <div key={category.id} className="space-y-2">
                  {/* Category Header */}
                  <div className="px-3 py-1 text-[10px] font-black tracking-widest uppercase text-slate-400 bg-slate-50/50 rounded-lg">
                    {category.title}
                  </div>
                  
                  {/* Category Sections */}
                  <div className="grid grid-cols-1 gap-1">
                    {category.sections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => {
                          setState(prev => ({ ...prev, openSection: section.id }));
                          setMobileMenuOpen(false); // Close menu on mobile after selection
                          setViewMode('content'); // Switch to content mode on mobile to edit immediately
                        }}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-xs font-black transition-all active:scale-[0.97] ${
                          state.openSection === section.id
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={state.openSection === section.id ? 'text-brand-cyan' : ''}>
                            {section.icon}
                          </span>
                          {section.title}
                        </div>
                        {state.openSection === section.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs mb-2">
              {state.isDirty && (
                <span className="text-orange-500 font-bold">غير محفوظ</span>
              )}
              {state.lastSaved && (
                <span className="text-slate-400">
                  {new Date(state.lastSaved).toLocaleTimeString('ar-EG')}
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={state.isSaving || !state.isDirty}
              className="w-full py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              {state.isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-brand-cyan rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ التغييرات
                </>
              )}
            </button>
            <button
              onClick={handlePublish}
              className="w-full py-2 px-4 rounded-xl bg-brand-gradient text-white font-bold text-sm hover:shadow-glow-cyan transition-all"
            >
              نشر
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Preview Header */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-2 md:px-4 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-1 md:gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Mobile View Mode Toggle (Compact) */}
            <div className="flex md:hidden bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'preview' ? 'bg-white shadow-sm text-brand-cyan' : 'text-slate-400'}`}
                title="معاينة"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => setViewMode('content')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'content' ? 'bg-white shadow-sm text-brand-cyan' : 'text-slate-400'}`}
                title="المحتوى"
              >
                <Sliders size={18} />
              </button>
            </div>

            <h2 className="hidden sm:block font-black text-xs md:text-sm text-slate-800 line-clamp-1">
              {currentSection?.title || 'معاينة'}
            </h2>
          </div>

          {/* Device Toggles - Visible only on desktop */}
          <div className="hidden md:flex items-center gap-0.5 bg-slate-100 rounded-xl p-1 shadow-inner">
            {[
              { id: 'desktop', icon: <Monitor size={16} />, label: '🖥️' },
              { id: 'tablet', icon: <Smartphone size={16} />, label: '📱' },
              { id: 'mobile', icon: <Smartphone size={14} />, label: '📲' },
            ].map((device) => (
              <button
                key={device.id}
                onClick={() => setState(prev => ({ ...prev, previewMode: device.id as any }))}
                className={`w-10 h-8 rounded-lg flex items-center justify-center transition-all ${
                  state.previewMode === device.id
                    ? 'bg-white shadow-sm text-brand-cyan'
                    : 'text-slate-400 hover:bg-white/50'
                }`}
                title={device.id}
              >
                {state.previewMode === device.id ? (device.icon as any) : <span className="grayscale opacity-50">{device.label}</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* AI Assist Button */}
            <button
              onClick={() => setAiOverlayActive(!aiOverlayActive)}
              className={`flex items-center gap-2 p-2.5 md:px-4 md:py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm ${
                aiOverlayActive
                  ? 'bg-brand-cyan text-white shadow-brand-cyan/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${aiOverlayActive ? 'animate-pulse' : 'text-amber-500'}`} />
              <span className="hidden lg:inline">مساعد ذكي</span>
            </button>
            
            {/* Settings Button - Opens sidebar on mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl transition-all shadow-sm hover:bg-slate-50 active:scale-95"
              title="الإعدادات"
            >
              <Settings size={18} />
            </button>
            
            {/* Mobile Action Buttons Bar (Icons only in header) */}
            <div className="flex md:hidden gap-1">
              <button
                onClick={handleSave}
                disabled={state.isSaving || !state.isDirty}
                className={`p-2.5 rounded-xl transition-all shadow-sm border ${
                  state.isDirty 
                    ? 'bg-orange-50 border-orange-200 text-orange-600 animate-pulse' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {state.isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'content' && currentSection ? (
          <div className="flex-1 bg-slate-50 p-2 sm:p-4 md:p-6 overflow-auto scrollbar-hide">
            <div className="max-w-4xl mx-auto pb-32 md:pb-12">
              {/* Mobile Section Back/Header */}
              <div className="flex items-center justify-between mb-4 md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-[10px] font-black text-slate-600"
                >
                  <ChevronLeft size={14} className="rotate-180" />
                  كل الإعدادات
                </button>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10 text-[10px] font-black">
                  {currentSection.icon}
                  {currentSection.title}
                </div>
              </div>

              <div className="bg-white rounded-[32px] shadow-sm p-5 sm:p-8 md:p-10 border border-slate-100 min-h-[calc(100vh-14rem)]">
                <div className="hidden md:flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                  <div className="p-3 bg-slate-50 rounded-2xl text-brand-cyan">
                    {React.cloneElement(currentSection.icon as any, { size: 24 })}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{currentSection.title}</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">قم بتخصيص إعدادات {currentSection.title} لمتجرك</p>
                  </div>
                </div>
                
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {currentSection.render(renderContext)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Live Preview Area */
          <div className="flex-1 bg-slate-100 flex justify-center p-0 sm:p-2 md:p-4 overflow-auto scrollbar-hide">
            <div
              className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden relative
                ${state.previewMode === 'mobile' ? 'my-2 sm:my-4 md:my-8 rounded-[40px] border-[6px] md:border-[10px] border-slate-900 shadow-slate-900/20' : ''}
              `}
              style={{
                width: state.previewMode === 'desktop' ? '100%' : 
                       state.previewMode === 'tablet' ? '768px' : '375px',
                height: state.previewMode === 'mobile' ? '667px' : '100%',
                minHeight: state.previewMode === 'mobile' ? '667px' : '100%',
              }}
            >
              {/* Phone Mockup Camera Notch */}
              {state.previewMode === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-[60]" />
              )}
              
              <BuilderThemeProvider 
                initialConfig={state.config}
                onConfigChange={(newConfig) => {
                  setState(prev => ({ ...prev, config: newConfig, isDirty: true }));
                }}
              >
                <div className="h-full overflow-y-auto overflow-x-hidden">
                  <LivePreview 
                    config={state.config}
                    previewMode={state.previewMode}
                    previewPage={state.previewPage}
                  />
                </div>
              </BuilderThemeProvider>
            </div>
          </div>
        )}

        {/* Mobile Fixed Action Bar */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center justify-between gap-3 z-40 shadow-2xl shadow-slate-900/40 transform transition-transform duration-300">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              {state.isDirty ? (
                <span className="text-[10px] font-black text-amber-400 whitespace-nowrap">لديك تعديلات</span>
              ) : (
                <span className="text-[10px] font-black text-emerald-400 whitespace-nowrap">تم الحفظ</span>
              )}
              {state.lastSaved && (
                <span className="text-[8px] text-slate-400 whitespace-nowrap font-bold">
                  {new Date(state.lastSaved).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={state.isSaving || !state.isDirty}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 ${
                state.isDirty 
                  ? 'bg-white text-slate-900 shadow-lg' 
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {state.isSaving ? 'جاري...' : 'حفظ'}
            </button>
            <button
              onClick={handlePublish}
              className="px-6 py-2.5 rounded-xl bg-brand-gradient text-white font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 whitespace-nowrap"
            >
              نشر الموقع
            </button>
          </div>
        </div>
      </main>

      {/* AI Overlay */}
      {aiOverlayActive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">المساعد الذكي</h3>
              <button
                onClick={() => setAiOverlayActive(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              كيف يمكنني مساعدتك في تصميم {activityType === 'COMMERCIAL' ? 'المتجر' : 'موقع الحجوزات'}؟
            </p>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors text-right">
                اقتراح ألوان احترافية
              </button>
              <button className="w-full py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors text-right">
                تحسين التصميم
              </button>
              <button className="w-full py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors text-right">
                كتابة محتوى
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}