import { Layout, Palette, Sliders, ShoppingBag, Sparkles, Home, FileText, Rocket, Image as ImageIcon, Zap, MessageCircle, Link as LinkIcon, Users, Calendar } from 'lucide-react';
import React from 'react';
import i18n from '@/i18n';
import { isShopBookingActivity } from '../bookings/config';

import {
  BackgroundSection,
  BannerSection,
  ButtonsSection,
  CategorySection,
  ColorsSection,
  CustomCssSection,
  HeaderFooterSection,
  HeaderTypeSection,
  ProductCardSection,
  ProductEditorSection,
  LayoutSection,
  ProductPageSection,
  ProductsSection,
  TypographySection,
  VisibilitySection,
  ImageMapVisibilitySection,
  ImageShapeSection,
  ShoppingModeSection,
  StoreFooter,
  ThemesSection,
  HomeExperienceSection,
  CustomPagesSection,
  ClinicDoctorsSection,
  ClinicServicesSection,
  ClinicBookingSection,
  NavIconsSection,
  LandingThemeSection,
  LandingHeroSection,
  LandingFeaturesSection,
  LandingSectionsSection,
  LandingFaqSection,
  LandingStyleSection,
  LandingUrlSection,
} from './sections';

export type BuilderSectionId =
  | 'colors'
  | 'background'
  | 'banner'
  | 'header'
  | 'headerFooter'
  | 'productCard'
  | 'categories'
  | 'productEditor'
  | 'productPage'
  | 'imageShape'
  | 'layout'
  | 'typography'
  | 'buttons'
  | 'customCss'
  | 'shoppingMode'
  | 'footer'
  | 'themes'
  | 'homeExperience'
  | 'customPages'
  | 'bookingProviders'
  | 'bookingServices'
  | 'bookingSlots'
  // Legacy aliases kept for type compatibility
  | 'clinicDoctors'
  | 'clinicServices'
  | 'clinicBooking'
  | 'navIcons'
  | 'landingPage'
  | 'landingTheme'
  | 'landingHero'
  | 'landingFeatures'
  | 'landingSections'
  | 'landingFaq'
  | 'landingStyle'
  | 'landingUrl';

export type BuilderRenderCtx = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
  logoDataUrl: string;
  setLogoDataUrl: React.Dispatch<React.SetStateAction<string>>;
  logoFile: File | null;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  logoSaving: boolean;
  onSaveLogo: () => void;
  bannerFile: File | null;
  setBannerFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerPreview: string;
  setBannerPreview: React.Dispatch<React.SetStateAction<string>>;
  backgroundFile: File | null;
  setBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
  backgroundPreview: string;
  setBackgroundPreview: React.Dispatch<React.SetStateAction<string>>;
};

export type BuilderSectionConfig = {
  id: BuilderSectionId;
  title: string;
  icon: React.ReactNode;
  render: (ctx: BuilderRenderCtx) => React.ReactNode;
};

export const BUILDER_SECTIONS: BuilderSectionConfig[] = [

  {
    id: 'themes',
    title: i18n.t('business.builder.sections.themes'),
    icon: React.createElement(Sparkles as any, { size: 16, className: 'text-amber-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(ThemesSection as any, { config, setConfig, shop, isBookingActivity: isShopBookingActivity(shop) }),
  },
  {
    id: 'colors',
    title: i18n.t('business.builder.sections.colors'),
    icon: React.createElement(Palette as any, { size: 16, className: 'text-[#00E5FF]' }),
    render: ({ config, setConfig }) => React.createElement(ColorsSection as any, { config, setConfig }),
  },
  {
    id: 'headerFooter',
    title: i18n.t('business.builder.sections.headerTop'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig, shop }) => React.createElement(HeaderFooterSection as any, { config, setConfig, shop }),
  },
  {
    id: 'homeExperience',
    title: i18n.t('business.builder.sections.homeExperience'),
    icon: React.createElement(Home as any, { size: 16, className: 'text-sky-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(HomeExperienceSection as any, { config, setConfig, shop, isBookingActivity: isShopBookingActivity(shop) }),
  },
  {
    id: 'footer',
    title: i18n.t('business.builder.sections.footer'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig }) => React.createElement(StoreFooter as any, { config, setConfig }),
  },
  {
    id: 'customPages',
    title: i18n.t('business.builder.sections.customPages'),
    icon: React.createElement(FileText as any, { size: 16, className: 'text-violet-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(CustomPagesSection as any, { config, setConfig, shop }),
  },
  {
    id: 'background',
    title: i18n.t('business.builder.sections.background'),
    icon: React.createElement(Palette as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig, backgroundFile, setBackgroundFile, backgroundPreview, setBackgroundPreview }) =>
      React.createElement(BackgroundSection as any, {
        config,
        setConfig,
        backgroundFile,
        setBackgroundFile,
        backgroundPreview,
        setBackgroundPreview,
      }),
  },
  {
    id: 'banner',
    title: i18n.t('business.builder.sections.banner'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig, bannerFile, setBannerFile, bannerPreview, setBannerPreview }) =>
      React.createElement(BannerSection as any, {
        config,
        setConfig,
        bannerFile,
        setBannerFile,
        bannerPreview,
        setBannerPreview,
      }),
  },
  {
    id: 'header',
    title: i18n.t('business.builder.sections.logo'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#BD00FF]' }),
    render: ({
      config,
      setConfig,
      logoDataUrl,
      setLogoDataUrl,
      logoFile,
      setLogoFile,
      logoSaving,
      onSaveLogo,
      shop,
    }) =>
      React.createElement(HeaderTypeSection as any, {
        config,
        setConfig,
        logoDataUrl,
        setLogoDataUrl,
        logoFile,
        setLogoFile,
        logoSaving,
        onSaveLogo,
        shop,
      }),
  },
  {
    id: 'productCard',
    title: i18n.t('business.builder.sections.productCard'),
    icon: React.createElement(Palette as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig, shop }) => React.createElement(ProductCardSection as any, { config, setConfig, shop }),
  },
  {
    id: 'categories',
    title: i18n.t('business.builder.sections.categories'),
    icon: React.createElement(ShoppingBag as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig, shop }) => React.createElement(CategorySection as any, { config, setConfig, shopId: shop?.id }),
  },
  {
    id: 'productEditor',
    title: i18n.t('business.builder.sections.productEditor'),
    icon: React.createElement(ShoppingBag as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig }) => React.createElement(ProductEditorSection as any, { config, setConfig }),
  },
  {
    id: 'productPage',
    title: i18n.t('business.builder.sections.productPage'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-900' }),
    render: ({ config, setConfig }) => React.createElement(ProductPageSection as any, { config, setConfig }),
  },
  {
    id: 'imageShape',
    title: i18n.t('business.builder.sections.imageShape'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#00E5FF]' }),
    render: ({ config, setConfig }) => React.createElement(ImageShapeSection as any, { config, setConfig }),
  },
  {
    id: 'layout',
    title: i18n.t('business.builder.sections.layout'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#BD00FF]' }),
    render: ({ config, setConfig }) => React.createElement(LayoutSection as any, { config, setConfig }),
  },
  {
    id: 'typography',
    title: i18n.t('business.builder.sections.typography'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#00E5FF]' }),
    render: ({ config, setConfig }) => React.createElement(TypographySection as any, { config, setConfig }),
  },
  {
    id: 'buttons',
    title: i18n.t('business.builder.sections.buttons'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-[#BD00FF]' }),
    render: ({ config, setConfig }) => React.createElement(ButtonsSection as any, { config, setConfig }),
  },
  {
    id: 'customCss',
    title: i18n.t('business.builder.sections.customCss'),
    icon: React.createElement(Sliders as any, { size: 16, className: 'text-[#BD00FF]' }),
    render: ({ config, setConfig }) => React.createElement(CustomCssSection as any, { config, setConfig }),
  },
  {
    id: 'shoppingMode',
    title: i18n.t('business.builder.sections.shoppingMode'),
    icon: React.createElement(ShoppingBag as any, { size: 16, className: 'text-[#00E5FF]' }),
    render: ({ config, setConfig }) => React.createElement(ShoppingModeSection as any, { config, setConfig }),
  },
  {
    id: 'bookingProviders',
    title: i18n.t('business.builder.sections.bookingProviders'),
    icon: React.createElement(Users as any, { size: 16, className: 'text-indigo-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(ClinicDoctorsSection as any, { config, setConfig, shop }),
  },
  {
    id: 'bookingServices',
    title: i18n.t('business.builder.sections.bookingServices'),
    icon: React.createElement(Sparkles as any, { size: 16, className: 'text-emerald-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(ClinicServicesSection as any, { config, setConfig, shop }),
  },
  {
    id: 'bookingSlots',
    title: i18n.t('business.builder.sections.bookingSlots'),
    icon: React.createElement(Calendar as any, { size: 16, className: 'text-rose-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(ClinicBookingSection as any, { config, setConfig, shop }),
  },
  {
    id: 'navIcons',
    title: i18n.t('business.builder.sections.navIcons'),
    icon: React.createElement(Sparkles as any, { size: 16, className: 'text-indigo-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(NavIconsSection as any, { config, setConfig, shop }),
  },
  {
    id: 'landingTheme',
    title: i18n.t('business.builder.sections.landingTheme'),
    icon: React.createElement(Rocket as any, { size: 16, className: 'text-rose-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(LandingThemeSection as any, { config, setConfig, shop }),
  },
  {
    id: 'landingHero',
    title: i18n.t('business.builder.sections.landingHero'),
    icon: React.createElement(ImageIcon as any, { size: 16, className: 'text-rose-400' }),
    render: ({ config, setConfig, shop }) => React.createElement(LandingHeroSection as any, { config, setConfig, shop }),
  },
  {
    id: 'landingFeatures',
    title: i18n.t('business.builder.sections.landingFeatures'),
    icon: React.createElement(Zap as any, { size: 16, className: 'text-amber-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(LandingFeaturesSection as any, { config, setConfig, shop }),
  },
  {
    id: 'landingSections',
    title: i18n.t('business.builder.sections.landingSections'),
    icon: React.createElement(Layout as any, { size: 16, className: 'text-slate-600' }),
    render: ({ config, setConfig, shop }) => React.createElement(LandingSectionsSection as any, { config, setConfig, shop }),
  },
  {
    id: 'landingFaq',
    title: i18n.t('business.builder.sections.landingFaq'),
    icon: React.createElement(MessageCircle as any, { size: 16, className: 'text-sky-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(LandingFaqSection as any, { config, setConfig, shop }),
  },
  {
    id: 'landingStyle',
    title: i18n.t('business.builder.sections.landingStyle'),
    icon: React.createElement(Palette as any, { size: 16, className: 'text-[#00E5FF]' }),
    render: ({ config, setConfig, shop }) => React.createElement(LandingStyleSection as any, { config, setConfig, shop }),
  },
  {
    id: 'landingUrl',
    title: i18n.t('business.builder.sections.landingUrl'),
    icon: React.createElement(LinkIcon as any, { size: 16, className: 'text-rose-500' }),
    render: ({ config, setConfig, shop }) => React.createElement(LandingUrlSection as any, { config, setConfig, shop }),
  },

];
