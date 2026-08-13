// ============================================================================
// UNIFIED BUILDER SYSTEM - SECTION REGISTRY (MIGRATED FROM REACT LEGACY)
// ============================================================================

import React from 'react';
import { 
  Layout, Palette, Sliders, ShoppingBag, Sparkles, Home, FileText, Rocket,
  Image as ImageIcon, Zap, MessageCircle, Link as LinkIcon, Users, Calendar, Moon, Eye
} from 'lucide-react';
import { BuilderSectionConfig, ActivityType } from '@/types/builder';

// Import existing sections
import HeaderFooterSection from '@/components/builder/sections/design/HeaderFooterSection';
import ColorsSectionEnhanced from '@/components/builder/sections/design/ColorsSectionEnhanced';
import TypographySection from '@/components/builder/sections/design/TypographySection';
import BannerPositionEditor from '@/components/builder/sections/design/BannerPositionEditor';
import BackgroundManager from '@/components/builder/sections/design/BackgroundManager';
import ProductCardSection from '@/components/builder/sections/commercial/ProductCardSection';
import ProductsSection from '@/components/builder/sections/commercial/ProductsSection';
import ProvidersSection from '@/components/builder/sections/reservations/ProvidersSection';
import ServicesSectionEnhanced from '@/components/builder/sections/reservations/ServicesSectionEnhanced';
import ServicesSection from '@/components/builder/sections/reservations/ServicesSection';

// Import newly migrated sections
import ThemesSection from '@/components/builder/sections/store-identity/ThemesSection';
import PageSwitcherSection from '@/components/builder/sections/preview-pages/PageSwitcherSection';
import ButtonsSection from '@/components/builder/sections/styling/ButtonsSection';
import LayoutSection from '@/components/builder/sections/styling/LayoutSection';
import NavIconsSection from '@/components/builder/sections/styling/NavIconsSection';
import CustomCssSection from '@/components/builder/sections/advanced/CustomCssSection';
import HomeExperienceSection from '@/components/builder/sections/home-page/HomeExperienceSection';
import HeaderSection from '@/components/builder/sections/home-page/HeaderSection';
import ImageShapeSection from '@/components/builder/sections/commercial/ImageShapeSection';
import CategorySection from '@/components/builder/sections/products/CategorySection';
import ProductEditorSection from '@/components/builder/sections/products/ProductEditorSection';
import ProductPageSection from '@/components/builder/sections/products/ProductPageSection';
import LandingThemeSection from '@/components/builder/sections/landing/LandingThemeSection';
import LandingHeroSection from '@/components/builder/sections/landing/LandingHeroSection';
import LandingFeaturesSection from '@/components/builder/sections/landing/LandingFeaturesSection';
import LandingFaqSection from '@/components/builder/sections/landing/LandingFaqSection';
import LandingSectionsSection from '@/components/builder/sections/landing/LandingSectionsSection';
import LandingStyleSection from '@/components/builder/sections/landing/LandingStyleSection';
import LandingUrlSection from '@/components/builder/sections/landing/LandingUrlSection';
import FooterSection from '@/components/builder/sections/design/FooterSection';
import DarkModeSection from '@/components/builder/sections/advanced/DarkModeSection';
import CustomPagesSection from '@/components/builder/sections/advanced/CustomPagesSection';
import ShoppingModeSection from '@/components/builder/sections/products/ShoppingModeSection';
import BookingSlotsSection from '@/components/builder/sections/reservations/BookingSlotsSection';

// ============================================================================
// BUILDER SECTIONS REGISTRY (من React القديم)
// ============================================================================

export const BUILDER_SECTIONS: BuilderSectionConfig[] = [
  
  // ========== صفحات المعاينة (Preview Pages) ==========
  {
    id: 'page-switcher',
    title: 'تغيير الصفحة',
    icon: React.createElement(Eye, { size: 16, className: 'text-indigo-500' }),
    category: 'preview-pages',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: (ctx) => React.createElement(PageSwitcherSection, { 
      currentValue: ctx.state.previewPage, 
      onChange: (pg: any) => ctx.setState({ ...ctx.state, previewPage: pg }) 
    }),
  },

  // ========== هوية المتجر (Store Identity) ==========
  {
    id: 'themes',
    title: 'الثيمات',
    icon: React.createElement(Sparkles, { size: 16, className: 'text-amber-500' }),
    category: 'store-identity',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(ThemesSection, { config, onChange: setConfig, activityType: config.activityType }),
  },
  {
    id: 'colors',
    title: 'الألوان',
    icon: React.createElement(Palette, { size: 16, className: 'text-[#00E5FF]' }),
    category: 'store-identity',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(ColorsSectionEnhanced, { config, onChange: setConfig }),
  },
  {
    id: 'background',
    title: 'الخلفية',
    icon: React.createElement(Palette, { size: 16, className: 'text-slate-900' }),
    category: 'store-identity',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig, backgroundFile, setBackgroundFile, backgroundPreview, setBackgroundPreview }) =>
      React.createElement(BackgroundManager as any, {
        config: config.pageBackgroundColor || config.backgroundImageUrl,
        onChange: (value: any) => setConfig({ pageBackgroundColor: value }),
        backgroundFile,
        setBackgroundFile,
        backgroundPreview,
        setBackgroundPreview,
      }),
  },
  
  // ========== الصفحة الرئيسية (Home Page) ==========
  {
    id: 'homeExperience',
    title: 'الهوم',
    icon: React.createElement(Home, { size: 16, className: 'text-sky-500' }),
    category: 'home-page',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(HomeExperienceSection, { config, onChange: setConfig, activityType: config.activityType }),
  },
  {
    id: 'banner',
    title: 'البانر',
    icon: React.createElement(Layout, { size: 16, className: 'text-slate-900' }),
    category: 'home-page',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig, bannerFile, setBannerFile, bannerPreview, setBannerPreview }) =>
      React.createElement(BannerPositionEditor as any, {
        config: { posX: config.bannerPosX, posY: config.bannerPosY },
        onChange: (value: any) => setConfig({ bannerPosX: value.posX, bannerPosY: value.posY }),
        bannerFile,
        setBannerFile,
        bannerPreview,
        setBannerPreview,
      }),
  },
  {
    id: 'header',
    title: 'الشعار',
    icon: React.createElement(Layout, { size: 16, className: 'text-[#BD00FF]' }),
    category: 'home-page',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(HeaderSection, { config, onChange: setConfig }),
  },
  {
    id: 'headerFooter',
    title: 'أعلى الصفحة',
    icon: React.createElement(Layout, { size: 16, className: 'text-slate-600' }),
    category: 'home-page',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(HeaderFooterSection as any, {
      config: {
        headerType: config.headerType,
        headerBackgroundColor: config.headerBackgroundColor,
        headerBackgroundImageUrl: config.headerBackgroundImageUrl,
        headerTextColor: config.headerTextColor,
        headerTransparent: config.headerTransparent,
        headerOverlayBanner: config.headerOverlayBanner,
        headerOpacity: config.headerOpacity,
        footerBackgroundColor: config.footerBackgroundColor,
        footerTextColor: config.footerTextColor,
        footerTransparent: config.footerTransparent,
        footerOpacity: config.footerOpacity,
      },
      onChange: (value: any) => setConfig(value),
    }),
  },
  
  // ========== المنتجات (Products) ==========
  {
    id: 'productCard',
    title: 'بطاقة المنتج',
    icon: React.createElement(Palette, { size: 16, className: 'text-slate-600' }),
    category: 'products',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(ProductCardSection as any, {
      config: {
        overlayBgColor: config.productCardOverlayBgColor,
        overlayOpacity: config.productCardOverlayOpacity,
        titleColor: config.productCardTitleColor,
        priceColor: config.productCardPriceColor,
      },
      onChange: (value: any) => setConfig({
        productCardOverlayBgColor: value.overlayBgColor,
        productCardOverlayOpacity: value.overlayOpacity,
        productCardTitleColor: value.titleColor,
        productCardPriceColor: value.priceColor,
      }),
    }),
  },
  {
    id: 'categories',
    title: 'الأقسام',
    icon: React.createElement(ShoppingBag, { size: 16, className: 'text-slate-600' }),
    category: 'products',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(CategorySection, { config, onChange: setConfig }),
  },
  {
    id: 'imageShape',
    title: 'أشكال الصور',
    icon: React.createElement(Layout, { size: 16, className: 'text-[#00E5FF]' }),
    category: 'products',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(ImageShapeSection, { config, onChange: setConfig }),
  },
  {
    id: 'productEditor',
    title: 'محرر المنتج',
    icon: React.createElement(ShoppingBag, { size: 16, className: 'text-slate-900' }),
    category: 'products',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(ProductEditorSection, { config, onChange: setConfig }),
  },
  {
    id: 'productPage',
    title: 'صفحة المنتج',
    icon: React.createElement(ShoppingBag, { size: 16, className: 'text-slate-600' }),
    category: 'products',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(ProductPageSection, { config, onChange: setConfig }),
  },
  {
    id: 'shoppingMode',
    title: 'وضع التسوق',
    icon: React.createElement(ShoppingBag, { size: 16, className: 'text-[#00E5FF]' }),
    category: 'products',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(ShoppingModeSection, { config, onChange: setConfig }),
  },
  
  // ========== صفحات الهبوط (Landing Pages) ==========
  {
    id: 'landingTheme',
    title: 'تصميم الهبوط',
    icon: React.createElement(Rocket, { size: 16, className: 'text-rose-500' }),
    category: 'landing-pages',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(LandingThemeSection, { config, onChange: setConfig }),
  },
  {
    id: 'landingHero',
    title: 'القسم الرئيسي',
    icon: React.createElement(ImageIcon, { size: 16, className: 'text-rose-400' }),
    category: 'landing-pages',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(LandingHeroSection, { config, onChange: setConfig }),
  },
  {
    id: 'landingFeatures',
    title: 'المميزات',
    icon: React.createElement(Zap, { size: 16, className: 'text-amber-500' }),
    category: 'landing-pages',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(LandingFeaturesSection, { config, onChange: setConfig }),
  },
  {
    id: 'landingSections',
    title: 'الأقسام الظاهرة',
    icon: React.createElement(Layout, { size: 16, className: 'text-slate-600' }),
    category: 'landing-pages',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(LandingSectionsSection, { config, onChange: setConfig }),
  },
  {
    id: 'landingFaq',
    title: 'الأسئلة الشائعة',
    icon: React.createElement(MessageCircle, { size: 16, className: 'text-sky-500' }),
    category: 'landing-pages',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(LandingFaqSection, { config, onChange: setConfig }),
  },
  {
    id: 'landingStyle',
    title: 'الألوان والتصميم',
    icon: React.createElement(Palette, { size: 16, className: 'text-[#00E5FF]' }),
    category: 'landing-pages',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(LandingStyleSection, { config, onChange: setConfig }),
  },
  {
    id: 'landingUrl',
    title: 'رابط الهبوط',
    icon: React.createElement(LinkIcon, { size: 16, className: 'text-rose-500' }),
    category: 'landing-pages',
    activityTypes: ['COMMERCIAL'],
    render: ({ config, setConfig }) => React.createElement(LandingUrlSection, { config, onChange: setConfig }),
  },
  
  // ========== التصميم والتنسيق (Styling) ==========
  {
    id: 'layout',
    title: 'التخطيط',
    icon: React.createElement(Layout, { size: 16, className: 'text-[#BD00FF]' }),
    category: 'styling',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(LayoutSection, { config, onChange: setConfig }),
  },
  {
    id: 'typography',
    title: 'الخطوط',
    icon: React.createElement(Layout, { size: 16, className: 'text-[#00E5FF]' }),
    category: 'styling',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(TypographySection as any, {
      config: config.typography || {},
      onChange: (value: any) => setConfig({ typography: value }),
    }),
  },
  {
    id: 'buttons',
    title: 'الأزرار',
    icon: React.createElement(Layout, { size: 16, className: 'text-[#BD00FF]' }),
    category: 'styling',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(ButtonsSection, { config, onChange: setConfig }),
  },
  {
    id: 'navIcons',
    title: 'الأيقونات',
    icon: React.createElement(Sparkles, { size: 16, className: 'text-indigo-500' }),
    category: 'styling',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(NavIconsSection, { config, onChange: setConfig }),
  },
  
  // ========== إعدادات إضافية (Advanced) ==========
  {
    id: 'footer',
    title: 'الفوتر',
    icon: React.createElement(Layout, { size: 16, className: 'text-slate-600' }),
    category: 'advanced',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(FooterSection, { config, onChange: setConfig }),
  },
  {
    id: 'customPages',
    title: 'صفحات مخصصة',
    icon: React.createElement(FileText, { size: 16, className: 'text-violet-500' }),
    category: 'advanced',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(CustomPagesSection, { config, onChange: setConfig }),
  },
  {
    id: 'customCss',
    title: 'CSS مخصص',
    icon: React.createElement(Sliders, { size: 16, className: 'text-[#BD00FF]' }),
    category: 'advanced',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(CustomCssSection, { config, onChange: setConfig }),
  },
  {
    id: 'darkMode',
    title: 'الوضع الليلي',
    icon: React.createElement(Moon, { size: 16, className: 'text-slate-700' }),
    category: 'advanced',
    activityTypes: ['COMMERCIAL', 'RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(DarkModeSection, { config, onChange: setConfig }),
  },
  
  // ========== الحجوزات (Reservations) ==========
  {
    id: 'bookingProviders',
    title: 'مقدمي الخدمة',
    icon: React.createElement(Users, { size: 16, className: 'text-sky-500' }),
    category: 'reservations',
    activityTypes: ['RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(ProvidersSection as any, {
      config: { providers: config.clinicDoctorsList || [] },
      onChange: (value: any) => setConfig({ clinicDoctorsList: value.providers }),
    }),
  },
  {
    id: 'bookingServices',
    title: 'الخدمات',
    icon: React.createElement(Zap, { size: 16, className: 'text-amber-500' }),
    category: 'reservations',
    activityTypes: ['RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(ServicesSectionEnhanced as any, {
      config: { services: config.clinicSpecialtiesList || [] },
      onChange: (value: any) => setConfig({ clinicSpecialtiesList: value.services }),
      activityType: config.activityType,
    }),
  },
  {
    id: 'bookingSlots',
    title: 'الحجز',
    icon: React.createElement(Calendar, { size: 16, className: 'text-rose-500' }),
    category: 'reservations',
    activityTypes: ['RESERVATIONS', 'HYBRID'],
    render: ({ config, setConfig }) => React.createElement(BookingSlotsSection, { config, onChange: setConfig }),
  },
];

// ============================================================================
// CATEGORY GROUPINGS (المجموعات كما في React القديم)
// ============================================================================

export const SECTION_CATEGORIES = {
  'preview-pages': {
    title: 'صفحات المعاينة',
    sections: ['page-switcher'],
    order: 0,
  },
  'store-identity': {
    title: 'هوية المتجر',
    sections: ['themes', 'colors', 'background'],
    order: 1,
  },
  'home-page': {
    title: 'الصفحة الرئيسية',
    sections: ['homeExperience', 'banner', 'header', 'headerFooter'],
    order: 2,
  },
  'products': {
    title: 'المنتجات',
    sections: ['productCard', 'categories', 'imageShape', 'productEditor', 'productPage', 'shoppingMode'],
    order: 3,
  },
  'landing-pages': {
    title: 'صفحات الهبوط',
    sections: ['landingTheme', 'landingHero', 'landingFeatures', 'landingSections', 'landingFaq', 'landingStyle', 'landingUrl'],
    order: 4,
  },
  'styling': {
    title: 'التصميم والتنسيق',
    sections: ['layout', 'typography', 'buttons', 'navIcons'],
    order: 5,
  },
  'advanced': {
    title: 'إعدادات إضافية',
    sections: ['footer', 'customPages', 'customCss', 'darkMode'],
    order: 6,
  },
  'reservations': {
    title: 'الحجوزات',
    sections: ['bookingProviders', 'bookingServices', 'bookingSlots'],
    order: 7,
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getSectionsByActivityType = (activityType: ActivityType): BuilderSectionConfig[] => {
  return BUILDER_SECTIONS.filter(section =>
    section.activityTypes.includes(activityType)
  );
};

export const getSectionsByCategory = (
  activityType: ActivityType,
  category: keyof typeof SECTION_CATEGORIES
): BuilderSectionConfig[] => {
  const categoryConfig = SECTION_CATEGORIES[category];
  if (!categoryConfig) return [];
  
  return categoryConfig.sections
    .map(sectionId => BUILDER_SECTIONS.find(s => s.id === sectionId))
    .filter((section): section is BuilderSectionConfig => 
      section !== undefined && section.activityTypes.includes(activityType)
    );
};

export const getGroupedSections = (activityType: ActivityType) => {
  const categories = Object.entries(SECTION_CATEGORIES)
    .filter(([_, config]) => 
      config.sections.some(sectionId => {
        const section = BUILDER_SECTIONS.find(s => s.id === sectionId);
        return section?.activityTypes.includes(activityType);
      })
    )
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([categoryId, config]) => ({
      id: categoryId,
      title: config.title,
      sections: getSectionsByCategory(activityType, categoryId as keyof typeof SECTION_CATEGORIES),
    }));
  
  return categories;
};
